from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DroneBase(BaseModel):
    name: str
    model: str = "DJI Mini 4 Pro"  # Default DJI model
    base_assigned: str
    route_assigned: Optional[str] = None
    status: str = "Inactive"  # Inactive, Active, On Mission, Maintenance, etc.
    battery: int = 100
    litter_capacity: int = 0
    camera_status: str = "OK"
    signal_strength: str = "Strong"
    last_maintenance: Optional[datetime] = None
    total_missions: int = 0
    total_litter_collected: float = 0.0  # in kg

class DroneCreate(DroneBase):
    pass

class DroneUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    base_assigned: Optional[str] = None
    route_assigned: Optional[str] = None
    status: Optional[str] = None
    battery: Optional[int] = None
    litter_capacity: Optional[int] = None
    camera_status: Optional[str] = None
    signal_strength: Optional[str] = None
    last_maintenance: Optional[datetime] = None
    total_missions: Optional[int] = None
    total_litter_collected: Optional[float] = None

class DroneInDB(DroneBase):
    id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()