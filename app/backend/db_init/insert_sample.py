from db.mongo import litter_images

sample_doc = {
    "mission_id": "3b5c1cfa-f9ad-4ed2-93e9-650f17729a0c",
    "drone_id": "f7bb693e-19b6-43e2-b556-77bd91b83f30",
    "image_url": "https://your-storage/image123.jpg",
    "captured_at": "2025-08-01T12:00:00Z",
    "location": {
        "type": "Point",
        "coordinates": [-0.12345, 51.56789]
    },
    "classification": {
        "label": "plastic_bottle",
        "confidence": 0.82
    },
    "review_status": "pending",
    "bounding_boxes": [
        {
            "label": "bottle",
            "confidence": 0.83,
            "x": 140,
            "y": 220,
            "width": 60,
            "height": 100
        }
    ],
    "vacuum": {
        "command_issued": True,
        "result": "success"
    }
}

result = litter_images.insert_one(sample_doc)
print("Inserted sample image with ID:", result.inserted_id)
