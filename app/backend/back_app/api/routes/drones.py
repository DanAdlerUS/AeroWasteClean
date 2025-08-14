from fastapi import APIRouter, HTTPException, Depends
from back_app.models.drone_models import DroneCreate, DroneUpdate, DroneInDB
from back_app.services.drone_service import DroneService
from back_app.api.deps.auth import require_session

router = APIRouter(prefix="/drones", tags=["drones"])

@router.get("/", response_model=list[DroneInDB])
async def get_drones():  # Temporarily removing auth
    try:
        drones = await DroneService.get_drones()
        return drones
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{drone_id}", response_model=DroneInDB)
async def get_drone(drone_id: str):  # Temporarily removing auth
    try:
        if drone := await DroneService.get_drone(drone_id):
            return drone
        raise HTTPException(status_code=404, detail="Drone not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=DroneInDB)
async def create_drone(drone: DroneCreate):  # Temporarily removing auth
    try:
        return await DroneService.create_drone(drone)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{drone_id}", response_model=DroneInDB)
async def update_drone(drone_id: str, drone: DroneUpdate):  # Temporarily removing auth
    try:
        if updated_drone := await DroneService.update_drone(drone_id, drone):
            return updated_drone
        raise HTTPException(status_code=404, detail="Drone not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{drone_id}")
async def delete_drone(drone_id: str):  # Temporarily removing auth
    try:
        if await DroneService.delete_drone(drone_id):
            return {"message": "Drone deleted successfully"}
        raise HTTPException(status_code=404, detail="Drone not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))