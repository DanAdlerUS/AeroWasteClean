from pydantic import BaseModel
from typing import Optional

class DroneBase(BaseModel):
    name: str
    base_assigned: str
    status: str = "Inactive"
    battery: int = 100
    litter_capacity: int = 0
    camera_status: str = "OK"

class DroneCreate(DroneBase):
    pass

class DroneUpdate(DroneBase):
    pass

class DroneInDB(DroneBase):
    id: str
    route_assigned: Optional[str] = None