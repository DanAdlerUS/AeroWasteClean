from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BaseStationBase(BaseModel):
    name: str
    servicing_address: str
    what3words: str
    drones_assigned: List[str] = []
    routes_assigned: List[str] = []
    litter_capacity_percent: int = 0  # 0-100%
    status: str = "Available"  # Available, Maintenance, Full, Offline

class BaseStationCreate(BaseStationBase):
    pass

class BaseStationUpdate(BaseModel):
    name: Optional[str] = None
    servicing_address: Optional[str] = None
    what3words: Optional[str] = None
    drones_assigned: Optional[List[str]] = None
    routes_assigned: Optional[List[str]] = None
    litter_capacity_percent: Optional[int] = None
    status: Optional[str] = None

class BaseStationInDB(BaseStationBase):
    id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

# Route Models
class RouteBase(BaseModel):
    name: str
    distance: str  # e.g., "750m"
    base_assigned: str
    drone_assigned: Optional[str] = None
    mission_frequency: str = "Daily"  # Daily, Weekly, Bi-weekly
    litter_capacity: str = "15 litres"  # 15 litres, 50 litres, 75 litres
    status: str = "Active"  # Active, Inactive, Maintenance

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    name: Optional[str] = None
    distance: Optional[str] = None
    base_assigned: Optional[str] = None
    drone_assigned: Optional[str] = None
    mission_frequency: Optional[str] = None
    litter_capacity: Optional[str] = None
    status: Optional[str] = None

class RouteInDB(RouteBase):
    id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()