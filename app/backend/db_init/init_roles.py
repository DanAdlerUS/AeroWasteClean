import sys
import os
from pathlib import Path
from datetime import datetime

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parents[2]  # This goes up three levels to the backend directory
sys.path.append(str(backend_dir))

from db.mongo import client, mongo_db, roles

default_roles = [
    {
        "id": "R001",
        "name": "Admin",
        "description": "Full system access",
        "permissions": ["all"],
        "created_at": datetime.utcnow()
    },
    {
        "id": "R002",
        "name": "Operator",
        "description": "Drone operation access",
        "permissions": ["view", "execute_missions"],
        "created_at": datetime.utcnow()
    }
]

def init_roles():
    try:
        # Check if roles already exist
        existing_roles = list(roles.find({}))
        
        if not existing_roles:
            print("Initializing roles collection...")
            result = roles.insert_many(default_roles)
            print(f"✅ Successfully initialized {len(result.inserted_ids)} roles")
            
            # Verify insertion
            for role in default_roles:
                found_role = roles.find_one({"id": role["id"]})
                print(f"Role {role['name']} initialized with ID: {found_role['id']}")
        else:
            print(f"ℹ️ Found {len(existing_roles)} existing roles:")
            for role in existing_roles:
                print(f"- {role.get('name', 'Unknown')} (ID: {role.get('id', 'Unknown')})")
            
            # Option to reinitialize
            choice = input("\nDo you want to reinitialize roles? This will delete existing roles (y/N): ")
            if choice.lower() == 'y':
                roles.delete_many({})
                result = roles.insert_many(default_roles)
                print(f"✅ Successfully reinitialized {len(result.inserted_ids)} roles")
            else:
                print("Keeping existing roles")
                
    except Exception as e:
        print(f"❌ Error initializing roles: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("Testing MongoDB connection...")
    try:
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        # Initialize roles
        init_roles()
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        sys.exit(1)