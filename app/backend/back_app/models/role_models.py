from pydantic import BaseModel
from typing import List

class RoleBase(BaseModel):
    name: str
    description: str
    permissions: List[str]

class RoleCreate(RoleBase):
    pass

from typing import Optional, List
class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

class RoleInDB(RoleBase):
    id: str