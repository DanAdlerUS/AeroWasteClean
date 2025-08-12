from db.mongo import bases
from ..models.base_models import BaseStationCreate, BaseStationUpdate, BaseStationInDB

class BaseService:
    @staticmethod
    async def get_bases():
        cursor = bases.find({})
        return [BaseStationInDB(**base) for base in cursor]

    @staticmethod
    async def get_base(base_id: str):
        if (base := bases.find_one({"id": base_id})):
            return BaseStationInDB(**base)
        return None

    @staticmethod
    async def create_base(base: BaseStationCreate):
        base_dict = base.dict()
        base_dict["id"] = f"B{str(bases.count_documents({}) + 1).zfill(3)}"
        
        bases.insert_one(base_dict)
        return BaseStationInDB(**base_dict)

    @staticmethod
    async def update_base(base_id: str, base: BaseStationUpdate):
        update_data = base.dict(exclude_unset=True)
        result = bases.update_one(
            {"id": base_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await BaseService.get_base(base_id)
        return None

    @staticmethod
    async def delete_base(base_id: str):
        result = bases.delete_one({"id": base_id})
        return result.deleted_count > 0
    