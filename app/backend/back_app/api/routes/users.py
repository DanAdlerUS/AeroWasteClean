from fastapi import APIRouter, HTTPException, Depends
from back_app.models.user_models import UserCreate, UserUpdate, UserInDB
from back_app.services.user_service import UserService
from back_app.api.deps.auth import require_session
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserInDB])
async def get_users():
     """Get all users"""
     try:
         users = await UserService.get_users()
         return users
     except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserInDB)
async def get_user(user_id: str, _: str = Depends(require_session)):
    """Get a specific user by ID"""
    if user := await UserService.get_user(user_id):
        return user
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/", response_model=UserInDB)
async def create_user(user: UserCreate):
    """Create a new user"""
    try:
        return await UserService.create_user(user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{user_id}", response_model=UserInDB)
async def update_user(user_id: str, user: UserUpdate):
    """Update an existing user"""
    if updated_user := await UserService.update_user(user_id, user):
        return updated_user
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete a user"""
    if await UserService.delete_user(user_id):
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")