import json
import os
import shutil
from collections import defaultdict

# === Always resolve base path from current script location ===
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Resolve the paths robustly
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', 'datasets', 'taco'))
ANNOTATION_FILE = os.path.join(BASE_DIR, 'annotations.json')
IMAGE_ROOT_DIR = os.path.join(BASE_DIR, 'data')
OUTPUT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', 'datasets', 'taco_yolo'))

# === Output folder structure ===
for folder in ["train/images", "train/labels", "val/images", "val/labels"]:
    os.makedirs(os.path.join(OUTPUT_DIR, folder), exist_ok=True)

# === Load TACO annotations ===
if not os.path.exists(ANNOTATION_FILE):
    raise FileNotFoundError(f"Could not find annotation file at: {ANNOTATION_FILE}")

with open(ANNOTATION_FILE, 'r') as f:
    data = json.load(f)

# === Create category mapping ===
categories = {c["id"]: c["name"] for c in data["categories"]}
category_map = {name: idx for idx, name in enumerate(sorted(set(categories.values())))}

# Save class list
with open(os.path.join(OUTPUT_DIR, "classes.txt"), "w") as f:
    for name in category_map:
        f.write(name + "\n")

# === Group annotations by image_id ===
annotations_by_image = defaultdict(list)
for ann in data["annotations"]:
    annotations_by_image[ann["image_id"]].append(ann)

# === Get list of image IDs and split into train/val sets ===
image_ids = list(set(img["id"] for img in data["images"]))
split_idx = int(len(image_ids) * 0.8)
train_ids = set(image_ids[:split_idx])
val_ids = set(image_ids[split_idx:])

# === Create image_id → path mapping ===
image_path_map = {}
for root, dirs, files in os.walk(IMAGE_ROOT_DIR):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            rel_path = os.path.relpath(os.path.join(root, file), IMAGE_ROOT_DIR)
            rel_path = rel_path.replace("\\", "/")  # Ensure forward slashes
            image_path_map[rel_path] = os.path.join(root, file)

# === Process each image ===
for img in data["images"]:
    img_id = img["id"]
    file_name = img["file_name"]
    width, height = img["width"], img["height"]
    anns = annotations_by_image[img_id]
    
    set_type = "train" if img_id in train_ids else "val"
    out_img_path = os.path.join(OUTPUT_DIR, set_type, "images", file_name)
    out_txt_path = os.path.join(
        OUTPUT_DIR, set_type, "labels",
        file_name.rsplit('.', 1)[0] + ".txt"
    )

    # === Copy image file from correct batch folder ===
    src_path = image_path_map.get(file_name)
    if not src_path:
        print(f"⚠️ Image file not found: {file_name} — skipping.")
        continue

    # Ensure the parent directory exists for the image file
    os.makedirs(os.path.dirname(out_img_path), exist_ok=True)
    shutil.copy(src_path, out_img_path)

    # Ensure the parent directory exists for the label file
    os.makedirs(os.path.dirname(out_txt_path), exist_ok=True)
    with open(out_txt_path, "w") as f:
        for ann in anns:
            cat_name = categories[ann["category_id"]]
            class_id = category_map[cat_name]

            bbox = ann["bbox"]  # [x, y, width, height]
            x_center = (bbox[0] + bbox[2] / 2) / width
            y_center = (bbox[1] + bbox[3] / 2) / height
            w = bbox[2] / width
            h = bbox[3] / height
            f.write(f"{class_id} {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}\n")

print("✅ TACO dataset converted to YOLO format.")