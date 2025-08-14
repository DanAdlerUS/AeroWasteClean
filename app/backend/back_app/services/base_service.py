from db.mongo import bases, routes
from back_app.models.base_models import (
    BaseStationCreate, BaseStationUpdate, BaseStationInDB,
    RouteCreate, RouteUpdate, RouteInDB
)
from datetime import datetime

class BaseService:
    @staticmethod
    async def get_bases():
        cursor = bases.find({})
        docs = []
        for doc in cursor:
            if "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])
            docs.append(BaseStationInDB(**doc))
        return docs

    @staticmethod
    async def get_base(base_id: str):
        if (base := bases.find_one({"id": base_id})):
            if "_id" in base and "id" not in base:
                base["id"] = str(base["_id"])
            return BaseStationInDB(**base)
        return None

    @staticmethod
    async def create_base(base: BaseStationCreate):
        base_dict = base.dict()
        base_dict["id"] = f"B_{str(bases.count_documents({}) + 1).zfill(3)}"
        base_dict["created_at"] = datetime.utcnow()
        base_dict["updated_at"] = datetime.utcnow()
        
        bases.insert_one(base_dict)
        return BaseStationInDB(**base_dict)

    @staticmethod
    async def update_base(base_id: str, base: BaseStationUpdate):
        update_data = base.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
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

class RouteService:
    @staticmethod
    async def get_routes():
        cursor = routes.find({})
        docs = []
        for doc in cursor:
            if "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])
            docs.append(RouteInDB(**doc))
        return docs

    @staticmethod
    async def get_route(route_id: str):
        if (route := routes.find_one({"id": route_id})):
            if "_id" in route and "id" not in route:
                route["id"] = str(route["_id"])
            return RouteInDB(**route)
        return None

    @staticmethod
    async def create_route(route: RouteCreate):
        route_dict = route.dict()
        route_dict["id"] = f"R_{str(routes.count_documents({}) + 1).zfill(3)}_N"
        route_dict["created_at"] = datetime.utcnow()
        route_dict["updated_at"] = datetime.utcnow()
        
        routes.insert_one(route_dict)
        return RouteInDB(**route_dict)

    @staticmethod
    async def update_route(route_id: str, route: RouteUpdate):
        update_data = route.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = routes.update_one(
            {"id": route_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await RouteService.get_route(route_id)
        return None

    @staticmethod
    async def delete_route(route_id: str):
        result = routes.delete_one({"id": route_id})
        return result.deleted_count > 0