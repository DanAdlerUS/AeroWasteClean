from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List

# ---- Roles ----
class RoleBase(BaseModel):
    name: str
    description: str
    permissions: List[str]  # CHANGED from str

class RoleInDB(RoleBase):
    id: str

class RoleCreate(RoleBase): ...
class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

# ---- Users ----
class UserBase(BaseModel):
    username: str
    name: str
    email: Optional[EmailStr] = None
    role_id: Optional[str] = None
    access_rights: Optional[str] = None  # keep for now to match FE table
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str  # plain on input only

class UserUpdate(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[str] = None
    access_rights: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None  # if present, re-hash

class UserInDB(UserBase):
    id: str
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
