from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
from ..services.image_service import ImageService
from ..models.image_models import (
    ImageUploadResponse, 
    ReviewRequest, 
    BoundingBoxUpdate,
    BoundingBox
)

router = APIRouter(prefix="/ai", tags=["ai"])

# ----- Response Schemas (matching existing structure) -----
class QueueItem(BaseModel):
    id: str
    image_url: str
    ai_class: str
    ai_conf: float
    mission_id: str
    ts: str

class QueueResponse(BaseModel):
    items: List[QueueItem]

class ReviewItem(BaseModel):
    id: str
    is_litter: bool
    litter_class: Optional[str] = None
    weight_grams: Optional[int] = None

class ReviewRequest(BaseModel):
    items: List[ReviewItem]

class ThresholdClass(BaseModel):
    class_: str
    conf: float
    class Config:
        fields = {'class_': 'class'}

class RTB(BaseModel):
    battery_pct: int
    hold_pct: int

class InitiationConfig(BaseModel):
    classes: List[ThresholdClass]
    rtb: RTB

class HistoryItem(BaseModel):
    id: str
    ts: str
    mission_id: str
    ai_result: str
    reviewer: str
    decision: Literal["approved","rejected","not_litter"]

class HistoryResponse(BaseModel):
    items: List[HistoryItem]

# ----- Mock threshold data (expanded to match your existing structure) -----
MOCK_THRESHOLDS = {
    "classes": [
        {"class": "plastic", "conf": 0.85},
        {"class": "glass", "conf": 0.75},
        {"class": "paper", "conf": 0.65},
        {"class": "cardboard", "conf": 0.70},
        {"class": "cigarette", "conf": 0.80},
        {"class": "tyre", "conf": 0.75}
    ],
    "rtb": {"battery_pct": 20, "hold_pct": 80}
}

# ----- Image Upload Endpoints -----
@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    mission_id: Optional[str] = Form(None),
    drone_id: Optional[str] = Form(None),
    longitude: Optional[float] = Form(None),
    latitude: Optional[float] = Form(None)
):
    """
    Upload an image file for litter detection validation
    """
    try:
        # Prepare location data if coordinates provided
        location = None
        if longitude is not None and latitude is not None:
            location = {
                "type": "Point",
                "coordinates": [longitude, latitude]
            }
        
        # Upload and save image
        image_record = await ImageService.upload_image(
            file=file,
            mission_id=mission_id,
            drone_id=drone_id,
            location=location
        )
        
        return ImageUploadResponse(
            success=True,
            message="Image uploaded successfully",
            image_id=image_record.id,
            image_url=image_record.image_url
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ----- Validation Queue Endpoints -----
@router.get("/queue", response_model=QueueResponse)
async def get_queue(reviewer: str = "admin", limit: int = 6):
    """
    Get images pending review from MongoDB
    """
    try:
        items = await ImageService.get_pending_images(limit=limit, reviewer=reviewer)
        return QueueResponse(items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch queue: {str(e)}")

@router.post("/review")
async def submit_review(payload: ReviewRequest):
    """
    Submit human review for multiple images (preserving existing API structure)
    """
    try:
        success_count = 0
        
        # Process each review item
        for item in payload.items:
            review_data = {
                "is_litter": item.is_litter,
                "litter_class": item.litter_class,
                "weight_grams": item.weight_grams,  # ✅ Weight is preserved
                "reviewer": "admin"  # TODO: Get from authentication
            }
            
            success = await ImageService.update_human_review(item.id, review_data)
            if success:
                success_count += 1
        
        # Return format matching existing API
        return {"ok": True, "saved": success_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review submission failed: {str(e)}")

# ----- Bounding Box Endpoints -----
@router.post("/bounding-boxes")
async def update_bounding_boxes(request: BoundingBoxUpdate):
    """
    Update bounding boxes for an image
    """
    try:
        # Convert Pydantic models to dict for MongoDB
        boxes_data = [box.dict() for box in request.bounding_boxes]
        
        success = await ImageService.update_bounding_boxes(
            image_id=request.image_id,
            bounding_boxes=boxes_data
        )
        
        if success:
            return {"success": True, "message": "Bounding boxes updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Image not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update bounding boxes: {str(e)}")

@router.get("/image/{image_id}/bounding-boxes")
async def get_bounding_boxes(image_id: str):
    """
    Get bounding boxes for a specific image
    """
    try:
        from db.mongo import litter_images
        
        image_doc = litter_images.find_one({"id": image_id})
        if not image_doc:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return {
            "image_id": image_id,
            "bounding_boxes": image_doc.get("bounding_boxes", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get bounding boxes: {str(e)}")

# ----- Configuration Endpoints -----
@router.get("/initiation", response_model=InitiationConfig)
async def get_initiation_thresholds():
    """
    Get AI model initiation thresholds
    """
    return MOCK_THRESHOLDS

@router.put("/initiation")
async def update_initiation_thresholds(body: InitiationConfig):
    """
    Update AI model initiation thresholds (matching existing API structure)
    """
    global MOCK_THRESHOLDS
    # Normalize incoming Pydantic alias to match existing format
    classes = [{"class": c.class_, "conf": c.conf} for c in body.classes]
    MOCK_THRESHOLDS = {"classes": classes, "rtb": body.rtb.dict()}
    return {"ok": True}

# ----- Review History Endpoints -----
@router.get("/review/history", response_model=HistoryResponse)
async def get_review_history(limit: int = 20):
    """
    Get history of reviewed images from MongoDB
    """
    try:
        items = await ImageService.get_review_history(limit=limit)
        return HistoryResponse(items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

# ----- Batch Upload Endpoint -----
@router.post("/upload-batch")
async def upload_batch(files: List[UploadFile] = File(...)):
    """
    Upload multiple images at once
    """
    try:
        results = []
        
        for file in files:
            try:
                image_record = await ImageService.upload_image(file=file)
                results.append({
                    "filename": file.filename,
                    "success": True,
                    "image_id": image_record.id,
                    "image_url": image_record.image_url
                })
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": str(e)
                })
        
        success_count = sum(1 for r in results if r["success"])
        
        return {
            "success": True,
            "message": f"Uploaded {success_count}/{len(files)} images successfully",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch upload failed: {str(e)}")

# ----- YOLO Model Integration Placeholder -----
@router.post("/analyze/{image_id}")
async def analyze_image(image_id: str):
    """
    Run YOLO model analysis on a specific image
    TODO: Integrate with your YOLO model
    """
    try:
        from db.mongo import litter_images
        
        image_doc = litter_images.find_one({"id": image_id})
        if not image_doc:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # TODO: Replace this with actual YOLO model inference
        # For now, return placeholder results
        mock_classification = {
            "label": "plastic",
            "confidence": 0.85
        }
        
        mock_bounding_boxes = [
            {
                "label": "plastic_bottle",
                "confidence": 0.85,
                "x": 100,
                "y": 150,
                "width": 80,
                "height": 120
            }
        ]
        
        # Update image with AI results
        litter_images.update_one(
            {"id": image_id},
            {
                "$set": {
                    "classification": mock_classification,
                    "bounding_boxes": mock_bounding_boxes,
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
        
        return {
            "success": True,
            "image_id": image_id,
            "classification": mock_classification,
            "bounding_boxes": mock_bounding_boxes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# ----- Training Data Export Endpoint -----
@router.get("/export/training-data")
async def export_training_data(format: str = "yolo"):
    """
    Export validated images as training data in YOLO format
    TODO: Implement YOLO format export
    """
    try:
        from db.mongo import litter_images
        
        # Get all reviewed images
        reviewed_images = list(litter_images.find({"review_status": "reviewed"}))
        
        # TODO: Implement actual YOLO format export
        # This is a placeholder response
        return {
            "success": True,
            "message": f"Training data export ready",
            "format": format,
            "total_images": len(reviewed_images),
            "litter_images": len([img for img in reviewed_images if img["human_review"]["is_litter"]]),
            "non_litter_images": len([img for img in reviewed_images if not img["human_review"]["is_litter"]])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")