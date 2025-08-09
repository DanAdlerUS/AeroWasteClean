from db.mongo import litter_images, mission_events

# Index for 2D geolocation queries
litter_images.create_index([("location", "2dsphere")])
litter_images.create_index("mission_id")
litter_images.create_index("classification.label")
litter_images.create_index("review_status")

mission_events.create_index("mission_id")
mission_events.create_index("event_type")
