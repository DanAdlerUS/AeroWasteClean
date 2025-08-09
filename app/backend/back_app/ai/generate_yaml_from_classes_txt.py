import os

# Build the absolute paths based on this script’s location
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../datasets/taco_yolo"))
classes_path = os.path.join(base_dir, "classes.txt")
yaml_path = os.path.join(base_dir, "taco.yaml")

with open(classes_path, "r") as f:
    class_names = [line.strip() for line in f.readlines()]

with open(yaml_path, "w") as f:
    f.write(f"path: {base_dir.replace(os.sep, '/')}\n")
    f.write("train: train/images\n")
    f.write("val: val/images\n")
    f.write("names:\n")
    for i, name in enumerate(class_names):
        f.write(f"  {i}: {name}\n")

print(f"✅ Updated taco.yaml with {len(class_names)} classes.")
