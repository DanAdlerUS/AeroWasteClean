from fastapi import APIRouter, HTTPException, Depends
from back_app.models.base_models import (
    BaseStationCreate, BaseStationUpdate, BaseStationInDB,
    RouteCreate, RouteUpdate, RouteInDB
)
from back_app.services.base_service import BaseService, RouteService
from back_app.api.deps.auth import require_session

router = APIRouter(prefix="/bases", tags=["bases"])

# Base Station endpoints
@router.get("/", response_model=list[BaseStationInDB])
async def get_bases():  # Temporarily removing auth
    try:
        bases = await BaseService.get_bases()
        return bases
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{base_id}", response_model=BaseStationInDB)
async def get_base(base_id: str):  # Temporarily removing auth
    try:
        if base := await BaseService.get_base(base_id):
            return base
        raise HTTPException(status_code=404, detail="Base not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=BaseStationInDB)
async def create_base(base: BaseStationCreate):  # Temporarily removing auth
    try:
        return await BaseService.create_base(base)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{base_id}", response_model=BaseStationInDB)
async def update_base(base_id: str, base: BaseStationUpdate):  # Temporarily removing auth
    try:
        if updated_base := await BaseService.update_base(base_id, base):
            return updated_base
        raise HTTPException(status_code=404, detail="Base not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{base_id}")
async def delete_base(base_id: str):  # Temporarily removing auth
    try:
        if await BaseService.delete_base(base_id):
            return {"message": "Base deleted successfully"}
        raise HTTPException(status_code=404, detail="Base not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Route endpoints
@router.get("/routes/", response_model=list[RouteInDB])
async def get_routes():  # Temporarily removing auth
    try:
        routes = await RouteService.get_routes()
        return routes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/routes/", response_model=RouteInDB)
async def create_route(route: RouteCreate):  # Temporarily removing auth
    try:
        return await RouteService.create_route(route)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/routes/{route_id}", response_model=RouteInDB)
async def update_route(route_id: str, route: RouteUpdate):  # Temporarily removing auth
    try:
        if updated_route := await RouteService.update_route(route_id, route):
            return updated_route
        raise HTTPException(status_code=404, detail="Route not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/routes/{route_id}")
async def delete_route(route_id: str):  # Temporarily removing auth
    try:
        if await RouteService.delete_route(route_id):
            return {"message": "Route deleted successfully"}
        raise HTTPException(status_code=404, detail="Route not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))