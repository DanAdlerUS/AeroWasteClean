from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class BoundingBox(BaseModel):
    label: str
    confidence: float
    x: int
    y: int
    width: int
    height: int

class Classification(BaseModel):
    label: Optional[str] = None
    confidence: Optional[float] = None

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]

class HumanReview(BaseModel):
    is_litter: Optional[bool] = None
    litter_class: Optional[str] = None
    weight_grams: Optional[int] = None
    reviewer: Optional[str] = None
    reviewed_at: Optional[str] = None

class VacuumAction(BaseModel):
    command_issued: bool = False
    result: Optional[str] = None

class LitterImageCreate(BaseModel):
    mission_id: Optional[str] = None
    drone_id: Optional[str] = None
    location: Optional[Location] = None

class LitterImageUpdate(BaseModel):
    classification: Optional[Classification] = None
    review_status: Optional[str] = None
    bounding_boxes: Optional[List[BoundingBox]] = None
    human_review: Optional[HumanReview] = None
    vacuum: Optional[VacuumAction] = None

class LitterImageInDB(BaseModel):
    id: str
    mission_id: str
    drone_id: str
    image_url: str
    local_path: str
    original_filename: str
    captured_at: str
    location: Location
    classification: Classification
    review_status: str
    bounding_boxes: List[BoundingBox]
    human_review: HumanReview
    vacuum: VacuumAction
    created_at: str
    updated_at: str

    class Config:
        extra = "allow"

# Request/Response models for API
class ImageUploadResponse(BaseModel):
    success: bool
    message: str
    image_id: str
    image_url: str

class ReviewSubmission(BaseModel):
    id: str
    is_litter: bool
    litter_class: Optional[str] = None
    weight_grams: Optional[int] = None

class ReviewRequest(BaseModel):
    items: List[ReviewSubmission]

class BoundingBoxUpdate(BaseModel):
    image_id: str
    bounding_boxes: List[BoundingBox]