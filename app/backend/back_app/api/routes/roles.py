from fastapi import APIRouter, HTTPException
from ...models.role_models import RoleCreate, RoleUpdate, RoleInDB
from ...services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("/", response_model=list[RoleInDB])
async def get_roles():
    """Get all roles"""
    return await RoleService.get_roles()

@router.get("/{role_id}", response_model=RoleInDB)
async def get_role(role_id: str):
    """Get a specific role by ID"""
    if role := await RoleService.get_role(role_id):
        return role
    raise HTTPException(status_code=404, detail="Role not found")

@router.post("/", response_model=RoleInDB)
async def create_role(role: RoleCreate):
    """Create a new role"""
    try:
        return await RoleService.create_role(role)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{role_id}", response_model=RoleInDB)
async def update_role(role_id: str, role: RoleUpdate):
    """Update an existing role"""
    if updated_role := await RoleService.update_role(role_id, role):
        return updated_role
    raise HTTPException(status_code=404, detail="Role not found")

@router.delete("/{role_id}")
async def delete_role(role_id: str):
    """Delete a role"""
    if await RoleService.delete_role(role_id):
        return {"message": "Role deleted successfully"}
    raise HTTPException(status_code=404, detail="Role not found")