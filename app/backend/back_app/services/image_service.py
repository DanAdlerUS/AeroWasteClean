import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile
from db.mongo import litter_images
from ..models.image_models import LitterImageCreate, LitterImageInDB

class ImageService:
    
    # Local storage path for images
    STORAGE_PATH = Path("C:/Users/flyin/AeroWaste/app/backend/back_app/ai/litter_images")
    
    @staticmethod
    def ensure_storage_directory():
        """Create storage directory if it doesn't exist"""
        ImageService.STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    async def upload_image(
        file: UploadFile, 
        mission_id: str = None,
        drone_id: str = None,
        location: dict = None
    ) -> LitterImageInDB:
        """
        Upload an image file and save metadata to MongoDB
        """
        # Ensure storage directory exists
        ImageService.ensure_storage_directory()
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ['.jpg', '.jpeg', '.png', '.bmp']:
            raise ValueError("Unsupported file format. Use JPG, PNG, or BMP.")
        
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = ImageService.STORAGE_PATH / unique_filename
        
        # Save file to local storage
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create image URL (relative to backend static serving)
        image_url = f"http://127.0.0.1:8001/static/litter_images/{unique_filename}"
        
        # Create database document
        image_doc = {
            "id": f"img_{uuid.uuid4().hex[:8]}",
            "mission_id": mission_id or f"mission_{uuid.uuid4().hex[:8]}",
            "drone_id": drone_id or f"drone_{uuid.uuid4().hex[:8]}",
            "image_url": image_url,
            "local_path": str(file_path),
            "original_filename": file.filename,
            "captured_at": datetime.utcnow().isoformat() + "Z",
            "location": location or {
                "type": "Point",
                "coordinates": [-0.12345, 51.56789]  # Default London coordinates
            },
            "classification": {
                "label": None,
                "confidence": None
            },
            "review_status": "pending",
            "bounding_boxes": [],
            "human_review": {
                "is_litter": None,
                "litter_class": None,
                "weight_grams": None,
                "reviewer": None,
                "reviewed_at": None
            },
            "vacuum": {
                "command_issued": False,
                "result": None
            },
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Insert into MongoDB
        result = litter_images.insert_one(image_doc)
        image_doc["_id"] = result.inserted_id
        
        return LitterImageInDB(**image_doc)
    
    @staticmethod
    async def get_pending_images(limit: int = 6, reviewer: str = "admin") -> List[dict]:
        """
        Get images pending review for the validation queue
        """
        cursor = litter_images.find(
            {"review_status": "pending"}
        ).limit(limit)
        
        images = []
        for doc in cursor:
            images.append({
                "id": doc["id"],
                "image_url": doc["image_url"],
                "ai_class": doc["classification"]["label"] or "unknown",
                "ai_conf": doc["classification"]["confidence"] or 0.0,
                "mission_id": doc["mission_id"],
                "ts": doc["captured_at"]
            })
        
        return images
    
    @staticmethod
    async def update_human_review(image_id: str, review_data: dict) -> bool:
        """
        Update human review data for an image
        """
        update_doc = {
            "human_review.is_litter": review_data.get("is_litter"),
            "human_review.litter_class": review_data.get("litter_class"),
            "human_review.weight_grams": review_data.get("weight_grams"),
            "human_review.reviewer": review_data.get("reviewer", "admin"),
            "human_review.reviewed_at": datetime.utcnow().isoformat() + "Z",
            "review_status": "reviewed",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        result = litter_images.update_one(
            {"id": image_id},
            {"$set": update_doc}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    async def get_review_history(limit: int = 20) -> List[dict]:
        """
        Get history of reviewed images
        """
        cursor = litter_images.find(
            {"review_status": "reviewed"}
        ).sort("human_review.reviewed_at", -1).limit(limit)
        
        history = []
        for doc in cursor:
            history.append({
                "id": doc["id"],
                "ts": doc["human_review"]["reviewed_at"],
                "mission_id": doc["mission_id"],
                "ai_result": f"{doc['classification']['label'] or 'unknown'}@{int((doc['classification']['confidence'] or 0) * 100)}%",
                "reviewer": doc["human_review"]["reviewer"],
                "decision": "approved" if doc["human_review"]["is_litter"] else "rejected"
            })
        
        return history
    
    @staticmethod
    async def update_bounding_boxes(image_id: str, bounding_boxes: List[dict]) -> bool:
        """
        Update bounding boxes for an image
        """
        result = litter_images.update_one(
            {"id": image_id},
            {
                "$set": {
                    "bounding_boxes": bounding_boxes,
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
        
        return result.modified_count > 0