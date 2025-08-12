from fastapi import APIRouter, HTTPException
from ...models.role_models import RoleCreate, RoleUpdate, RoleInDB
from ...services.role_service import RoleService

router = APIRouter(
    prefix="/roles",
    tags=["roles"]
)

@router.get("/", response_model=list[RoleInDB])
async def get_roles():
    try:
        roles = await RoleService.get_roles()
        return roles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{role_id}", response_model=RoleInDB)
async def get_role(role_id: str):
    try:
        if role := await RoleService.get_role(role_id):
            return role
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=RoleInDB)
async def create_role(role: RoleCreate):
    try:
        return await RoleService.create_role(role)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{role_id}", response_model=RoleInDB)
async def update_role(role_id: str, role: RoleUpdate):
    try:
        if updated_role := await RoleService.update_role(role_id, role):
            return updated_role
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{role_id}")
async def delete_role(role_id: str):
    try:
        if await RoleService.delete_role(role_id):
            return {"message": "Role deleted successfully"}
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))