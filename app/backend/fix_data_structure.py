import sys
from pathlib import Path
from bson import ObjectId

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from db.mongo import client, users, roles

def fix_roles_data():
    """Add string ID field to roles that only have _id"""
    try:
        print("🔧 Fixing roles data structure...")
        
        # Find roles without an 'id' field
        roles_to_fix = roles.find({"id": {"$exists": False}})
        
        count = 0
        for role in roles_to_fix:
            # Create a string ID from the role name
            if role.get("name") == "Admin":
                string_id = "R001"
            elif role.get("name") == "Operator":
                string_id = "R002"
            elif role.get("name") == "Review":
                string_id = "R003"
            else:
                # Generate a new ID
                string_id = f"R{str(roles.count_documents({}) + 1).zfill(3)}"
            
            # Update the document with the string ID
            roles.update_one(
                {"_id": role["_id"]},
                {"$set": {"id": string_id}}
            )
            count += 1
            print(f"   ✅ Fixed role: {role.get('name')} -> ID: {string_id}")
        
        print(f"✅ Fixed {count} roles")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing roles: {str(e)}")
        return False

def fix_users_data():
    """Ensure users have proper string IDs"""
    try:
        print("🔧 Fixing users data structure...")
        
        # Find users without an 'id' field
        users_to_fix = users.find({"id": {"$exists": False}})
        
        count = 0
        for user in users_to_fix:
            # Generate a string ID
            string_id = f"U{str(users.count_documents({}) + 1).zfill(3)}"
            
            # Update the document with the string ID
            users.update_one(
                {"_id": user["_id"]},
                {"$set": {"id": string_id}}
            )
            count += 1
            print(f"   ✅ Fixed user: {user.get('username')} -> ID: {string_id}")
        
        print(f"✅ Fixed {count} users")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing users: {str(e)}")
        return False

def verify_data():
    """Verify the data structure is correct"""
    print("🔍 Verifying data structure...")
    
    # Check roles
    all_roles = list(roles.find({}))
    print(f"📊 Roles ({len(all_roles)}):")
    for role in all_roles:
        print(f"   - {role.get('name')}: id={role.get('id')}, _id={role.get('_id')}")
    
    # Check users
    all_users = list(users.find({}))
    print(f"📊 Users ({len(all_users)}):")
    for user in all_users:
        print(f"   - {user.get('username')}: id={user.get('id')}, role_id={user.get('role_id')} (type: {type(user.get('role_id'))})")

if __name__ == "__main__":
    print("🚀 Fixing AeroWaste Database Data Structure...")
    
    try:
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        # Fix data structure
        if fix_roles_data() and fix_users_data():
            verify_data()
            print("\n✅ Data structure fix completed successfully!")
        else:
            print("\n❌ Data structure fix failed!")
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")