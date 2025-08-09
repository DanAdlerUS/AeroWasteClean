from fastapi import APIRouter
from ..controllers import analysis_controller

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/")
async def analyze():
    return analysis_controller.run_analysis()