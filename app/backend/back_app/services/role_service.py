from db.mongo import roles
from back_app.models.role_models import RoleCreate, RoleUpdate, RoleInDB

class RoleService:
    @staticmethod
    async def get_roles():
        cursor = roles.find({})
        return [RoleInDB(**role) for role in cursor]

    @staticmethod
    async def get_role(role_id: str):
        if (role := roles.find_one({"id": role_id})):
            return RoleInDB(**role)
        return None

    @staticmethod
    async def create_role(role: RoleCreate):
        role_dict = role.dict()
        role_dict["id"] = f"R{str(roles.count_documents({}) + 1).zfill(3)}"
        
        roles.insert_one(role_dict)
        return RoleInDB(**role_dict)

    @staticmethod
    async def update_role(role_id: str, role: RoleUpdate):
        update_data = role.dict(exclude_unset=True)
        result = roles.update_one(
            {"id": role_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await RoleService.get_role(role_id)
        return None

    @staticmethod
    async def delete_role(role_id: str):
        result = roles.delete_one({"id": role_id})
        return result.deleted_count > 0