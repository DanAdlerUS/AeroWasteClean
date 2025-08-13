from db.mongo import users
from ..models.user_models import UserCreate, UserUpdate, UserInDB
from datetime import datetime
from passlib.hash import bcrypt

class UserService:
    @staticmethod
    async def get_users():
        cursor = users.find({})
        docs = []
        for doc in cursor:
            # Map Mongo _id → id (string) if you want to expose it
            if "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])
            # Ensure datetimes are datetimes (not pre-formatted strings)
            docs.append(UserInDB(**doc))
        return docs

    @staticmethod
    async def get_user(user_id: str):
        user = users.find_one({"id": user_id})
        if user:
            if "_id" in user and "id" not in user:
                user["id"] = str(user["_id"])
            return UserInDB(**user)
        return None

    @staticmethod
    async def create_user(user: UserCreate):
        data = user.dict()
        plain = data.pop("password")          # remove plain password from payload
        data["hashed_password"] = bcrypt.hash(plain)
        # Optional: keep your custom string id, or let Mongo create _id and map later.
        data["id"] = f"U{str(users.count_documents({}) + 1).zfill(3)}"
        data["last_login"] = None
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()
        users.insert_one(data)
        return UserInDB(**data)

    @staticmethod
    async def update_user(user_id: str, user: UserUpdate):
        update_data = user.dict(exclude_unset=True)
        # If password present, re-hash into hashed_password
        if "password" in update_data:
            if update_data["password"]:
                update_data["hashed_password"] = bcrypt.hash(update_data.pop("password"))
            else:
                update_data.pop("password")  # empty string → ignore
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