from pydantic import BaseModel
from typing import List, Optional

class BaseStationBase(BaseModel):
    name: str
    servicing_address: str
    what3words: str
    drones_assigned: List[str] = []
    routes_assigned: List[str] = []

class BaseStationCreate(BaseStationBase):
    pass

class BaseStationUpdate(BaseStationBase):
    pass

class BaseStationInDB(BaseStationBase):
    id: str
    current_operation: Optional[str] = None
    litter_capacity: Optional[int] = 0