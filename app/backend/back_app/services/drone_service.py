from db.mongo import drones
from back_app.models.drone_models import DroneCreate, DroneUpdate, DroneInDB
from datetime import datetime

class DroneService:
    @staticmethod
    async def get_drones():
        cursor = drones.find({})
        docs = []
        for doc in cursor:
            # Convert MongoDB _id to string id if needed
            if "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])
            docs.append(DroneInDB(**doc))
        return docs

    @staticmethod
    async def get_drone(drone_id: str):
        if (drone := drones.find_one({"id": drone_id})):
            if "_id" in drone and "id" not in drone:
                drone["id"] = str(drone["_id"])
            return DroneInDB(**drone)
        return None

    @staticmethod
    async def create_drone(drone: DroneCreate):
        drone_dict = drone.dict()
        drone_dict["id"] = f"D{str(drones.count_documents({}) + 1).zfill(3)}"
        drone_dict["created_at"] = datetime.utcnow()
        drone_dict["updated_at"] = datetime.utcnow()
        
        drones.insert_one(drone_dict)
        return DroneInDB(**drone_dict)

    @staticmethod
    async def update_drone(drone_id: str, drone: DroneUpdate):
        update_data = drone.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = drones.update_one(
            {"id": drone_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await DroneService.get_drone(drone_id)
        return None

    @staticmethod
    async def delete_drone(drone_id: str):
        result = drones.delete_one({"id": drone_id})
        return result.deleted_count > 0