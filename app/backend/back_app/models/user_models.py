from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    access_rights: str
    start_date: str
    end_date: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: str
    last_login: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))