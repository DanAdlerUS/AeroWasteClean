from fastapi import APIRouter
from ..controllers import drone_controller

router = APIRouter(prefix="/drones", tags=["drones"])

@router.get("/")
async def list_drones():
    return drone_controller.list_drones()