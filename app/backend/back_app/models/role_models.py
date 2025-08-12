from pydantic import BaseModel
from typing import List

class RoleBase(BaseModel):
    name: str
    description: str
    permissions: List[str]

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

class RoleInDB(RoleBase):
    id: str