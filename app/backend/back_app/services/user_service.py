from db.mongo import users, roles
from back_app.models.user_models import UserCreate, UserUpdate, UserInDB
from passlib.hash import bcrypt
from datetime import datetime

class UserService:
    @staticmethod
    async def get_users():
        cursor = users.find({})
        docs = []
        for doc in cursor:
            # Convert MongoDB _id to string id if needed
            if "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])
            # Convert role_id ObjectId to string if needed
            if "role_id" in doc and hasattr(doc["role_id"], "__str__"):
                doc["role_id"] = str(doc["role_id"])
            docs.append(UserInDB(**doc))
        return docs

    @staticmethod
    async def get_user(user_id: str):
        user = users.find_one({"id": user_id})
        if user:
            # Convert MongoDB _id to string id if needed
            if "_id" in user and "id" not in user:
                user["id"] = str(user["_id"])
            # Convert role_id ObjectId to string if needed
            if "role_id" in user and hasattr(user["role_id"], "__str__"):
                user["role_id"] = str(user["role_id"])
            return UserInDB(**user)
        return None

@staticmethod
async def create_user(user: UserCreate):
    data = user.dict()
    
    # Ensure password is provided for new users
    if "password" not in data or not data["password"]:
        raise ValueError("Password is required for new users")
    
    plain = data.pop("password")
    data["hashed_password"] = bcrypt.hash(plain)

    # Map access_rights to role_id
    if "access_rights" in data and data["access_rights"]:
        role = roles.find_one({"name": data["access_rights"]})
        if role:
            data["role_id"] = role["_id"]
        else:
            raise ValueError(f"Role '{data['access_rights']}' does not exist.")
    else:
        raise ValueError("access_rights is required to assign role")

    data["id"] = f"U{str(users.count_documents({}) + 1).zfill(3)}"
    data["last_login"] = None
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()

    users.insert_one(data)
    return UserInDB(**data)

    @staticmethod
    async def update_user(user_id: str, user: UserUpdate):
        update_data = user.dict(exclude_unset=True)

        if "password" in update_data:
            if update_data["password"]:
                update_data["hashed_password"] = bcrypt.hash(update_data.pop("password"))
            else:
                update_data.pop("password")

        # 🔁 Update role_id if access_rights is changing
        if "access_rights" in update_data and update_data["access_rights"]:
            role = roles.find_one({"name": update_data["access_rights"]})
            if role:
                update_data["role_id"] = role["_id"]
            else:
                raise ValueError(f"Role '{update_data['access_rights']}' does not exist.")

        update_data["updated_at"] = datetime.utcnow()

        result = users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await UserService.get_user(user_id)
        return None

    @staticmethod
    async def delete_user(user_id: str):
        result = users.delete_one({"id": user_id})
        return result.deleted_count > 0

    @staticmethod
    async def update_last_login(user_id: str):
        users.update_one(
            {"id": user_id},
            {"$set": {"last_login": datetime.utcnow()}}
        )
