from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", tags=["auth"])
def login(request: LoginRequest):
    if request.username == "admin" and request.password == "password123":
        return {"success": True, "token": "mock-token-abc123"}
    
    raise HTTPException(status_code=401, detail="Invalid credentials")
