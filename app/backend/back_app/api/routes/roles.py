from fastapi import APIRouter, HTTPException, Depends
from back_app.models.role_models import RoleCreate, RoleUpdate, RoleInDB
from back_app.services.role_service import RoleService
from back_app.api.deps.auth import require_session

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("/", response_model=list[RoleInDB])
async def get_roles(_: str = Depends(require_session)):
    try:
        roles = await RoleService.get_roles()
        return roles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{role_id}", response_model=RoleInDB)
async def get_role(role_id: str, _: str = Depends(require_session)):
    try:
        if role := await RoleService.get_role(role_id):
            return role
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=RoleInDB)
async def create_role(role: RoleCreate, _: str = Depends(require_session)):
    try:
        return await RoleService.create_role(role)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{role_id}", response_model=RoleInDB)
async def update_role(role_id: str, role: RoleUpdate, _: str = Depends(require_session)):
    try:
        if updated_role := await RoleService.update_role(role_id, role):
            return updated_role
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{role_id}")
async def delete_role(role_id: str, _: str = Depends(require_session)):
    try:
        if await RoleService.delete_role(role_id):
            return {"message": "Role deleted successfully"}
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))