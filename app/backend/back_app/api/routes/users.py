from fastapi import APIRouter, HTTPException, Depends
from ...models.user_models import UserCreate, UserUpdate, UserInDB
from ...services.user_service import UserService
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserInDB])
async def get_users():
    """Get all users"""
    return await UserService.get_users()

@router.get("/{user_id}", response_model=UserInDB)
async def get_user(user_id: str):
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