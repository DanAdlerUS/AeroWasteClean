from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    access_rights: str
    start_date: str
    end_date: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: str
    last_login: Optional[str] = None

class RoleBase(BaseModel):
    name: str
    description: str
    permissions: str

class Role(RoleBase):
    id: str