import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from db.mongo import client, mongo_db, users, roles, ensure_indexes
from passlib.hash import bcrypt
from datetime import datetime

def check_database_status():
    """Check current database status"""
    try:
        print("📊 Current Database Status:")
        
        # Check roles
        role_count = roles.count_documents({})
        print(f"   Roles: {role_count}")
        if role_count > 0:
            print("   📋 Existing roles:")
            for role in roles.find({}):
                print(f"      - {role.get('name', 'N/A')}: {role.get('description', 'N/A')}")
        
        # Check users
        user_count = users.count_documents({})
        print(f"   Users: {user_count}")
        if user_count > 0:
            print("   📋 Existing users:")
            for user in users.find({}):
                print(f"      - {user.get('username', 'N/A')} ({user.get('name', 'N/A')})")
        else:
            print("   ⚠️  No users found - this is likely the problem!")
        
        return user_count, role_count
        
    except Exception as e:
        print(f"❌ Error checking database: {str(e)}")
        return 0, 0

def seed_missing_data():
    """Only seed missing data"""
    try:
        user_count, role_count = check_database_status()
        
        # Create indexes if needed
        print("\n🔧 Ensuring indexes exist...")
        ensure_indexes()
        print("✅ Indexes confirmed")
        
        # Add missing roles
        if role_count == 0:
            print("\n🌱 Creating roles...")
            roles.insert_many([
                {"name": "Admin", "description": "Full system access", "permissions": ["all"]},
                {"name": "Operator", "description": "Drone and user management access", "permissions": ["drones:read", "users:read", "users:write"]},
                {"name": "Review", "description": "AI queue review access", "permissions": ["ai:review"]}
            ])
            print("✅ Roles created")
        else:
            print(f"\n✅ Found {role_count} existing roles - skipping role creation")
        
        # Add admin user if no users exist
        if user_count == 0:
            print("\n🌱 Creating admin user...")
            admin_role = roles.find_one({"name": "Admin"})
            if admin_role:
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
                print("✅ Admin user created (username: admin, password: Testing123)")
            else:
                print("❌ Could not find Admin role to create user")
        else:
            print(f"\n✅ Found {user_count} existing users - skipping user creation")
        
        # Final status check
        print("\n📊 Final Database Status:")
        check_database_status()
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding data: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Checking AeroWaste Database Status...")
    
    try:
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        if seed_missing_data():
            print("\n✅ Database check and seeding completed successfully!")
        else:
            print("\n❌ Database seeding failed!")
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")