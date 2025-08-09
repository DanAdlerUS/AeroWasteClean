from pymongo import MongoClient

# Connect to the default local MongoDB instance
client = MongoClient("mongodb://localhost:27017")

# Define the database
mongo_db = client["aero_waste"]

# Collections
litter_images = mongo_db["litter_images"]
detections_summary = mongo_db["detections_summary"]
mission_events = mongo_db["mission_events"]
ai_model_versions = mongo_db["ai_model_versions"]
