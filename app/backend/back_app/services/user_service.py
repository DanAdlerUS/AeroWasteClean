from db.mongo import users
from ..models.user_models import UserCreate, UserUpdate, UserInDB
from datetime import datetime

class UserService:
    @staticmethod
    async def get_users():
        cursor = users.find({})
        return [UserInDB(**user) for user in cursor]

    @staticmethod
    async def get_user(user_id: str):
        if (user := users.find_one({"id": user_id})):
            return UserInDB(**user)
        return None

    @staticmethod
    async def create_user(user: UserCreate):
        user_dict = user.dict()
        user_dict["id"] = f"U{str(users.count_documents({}) + 1).zfill(3)}"
        user_dict["last_login"] = None
        user_dict["created_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        
        users.insert_one(user_dict)
        return UserInDB(**user_dict)

    @staticmethod
    async def update_user(user_id: str, user: UserUpdate):
        update_data = user.dict(exclude_unset=True)
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
            {"$set": {"last_login": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}}
        )