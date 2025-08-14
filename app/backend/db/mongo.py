from pymongo import MongoClient
from passlib.hash import bcrypt
from datetime import datetime

# Connect to the default local MongoDB instance
client = MongoClient("mongodb://localhost:27017")

# Define the database
mongo_db = client["AeroWaste"]

# Collections
litter_images = mongo_db["litter_images"]
detections_summary = mongo_db["detections_summary"]
mission_events = mongo_db["mission_events"]
ai_model_versions = mongo_db["ai_model_versions"]
users = mongo_db["users"]
roles = mongo_db["roles"]
bases = mongo_db["bases"]
drones = mongo_db["drones"]
routes = mongo_db["routes"]

def ensure_indexes():
    mongo_db.users.create_index("username", unique=True)
    mongo_db.users.create_index("email", unique=True, sparse=True)
    mongo_db.roles.create_index("name", unique=True)

def seed_admin():
    roles = mongo_db.roles
    users = mongo_db.users

    # ----- Create roles -----
    def upsert_role(name, description, permissions):
        if not roles.find_one({"name": name}):
            roles.insert_one({
                "name": name,
                "description": description,
                "permissions": permissions
            })

    upsert_role("Admin", "Full system access", ["all"])
    upsert_role("Operator", "Drone and user management access", ["drones:read", "users:read", "users:write"])
    upsert_role("Review", "AI queue review access", ["ai:review"])

    # ----- Create admin user -----
    admin_role = roles.find_one({"name": "Admin"})
    if not admin_role:
        raise RuntimeError("Admin role was not seeded correctly.")

    if not users.find_one({"username": "admin"}):
        users.insert_one({
            "username": "admin",
            "name": "Admin",
            "email": None,
            "role_id": admin_role["_id"],
            "access_rights": "Admin",
            "start_date": None,
            "end_date": None,
            "is_active": True,
            "hashed_password": bcrypt.hash("Testing123"),
            "last_login": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })