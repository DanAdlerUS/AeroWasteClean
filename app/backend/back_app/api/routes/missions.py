from fastapi import APIRouter
from ..controllers import mission_controller

router = APIRouter(prefix="/missions", tags=["missions"])

@router.get("/")
async def list_missions():
    return mission_controller.list_missions()