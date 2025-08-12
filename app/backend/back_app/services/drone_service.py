from db.mongo import drones
from ..models.drone_models import DroneCreate, DroneUpdate, DroneInDB

class DroneService:
    @staticmethod
    async def get_drones():
        cursor = drones.find({})
        return [DroneInDB(**drone) for drone in cursor]

    @staticmethod
    async def get_drone(drone_id: str):
        if (drone := drones.find_one({"id": drone_id})):
            return DroneInDB(**drone)
        return None

    @staticmethod
    async def create_drone(drone: DroneCreate):
        drone_dict = drone.dict()
        drone_dict["id"] = f"D{str(drones.count_documents({}) + 1).zfill(3)}"
        
        drones.insert_one(drone_dict)
        return DroneInDB(**drone_dict)

    @staticmethod
    async def update_drone(drone_id: str, drone: DroneUpdate):
        update_data = drone.dict(exclude_unset=True)
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