from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["ai"])

# ----- Schemas -----
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

# ----- In-memory mock store (replace with DB later) -----
MOCK_QUEUE = [
  {"id":"img_1","image_url":"http://127.0.0.1:8000/static/mock/img1.jpg","ai_class":"plastic","ai_conf":0.91,"mission_id":"M_1","ts":"2025-08-07 12:01"},
  {"id":"img_2","image_url":"http://127.0.0.1:8000/static/mock/img2.jpg","ai_class":"paper","ai_conf":0.72,"mission_id":"M_1","ts":"2025-08-07 12:02"},
  {"id":"img_3","image_url":"http://127.0.0.1:8000/static/mock/img3.jpg","ai_class":"glass","ai_conf":0.83,"mission_id":"M_2","ts":"2025-08-07 10:18"},
]

MOCK_THRESHOLDS = {
  "classes": [{"class": "plastic", "conf": 0.85},{"class":"glass","conf":0.75},{"class":"paper","conf":0.65}],
  "rtb": {"battery_pct": 20, "hold_pct": 80}
}

MOCK_HISTORY = [
  {"id":"h_1","ts":"2025-08-06 15:22","mission_id":"M_1","ai_result":"plastic@90%","reviewer":"admin","decision":"approved"},
  {"id":"h_2","ts":"2025-08-06 15:24","mission_id":"M_1","ai_result":"paper@70%","reviewer":"admin","decision":"rejected"}
]

# ----- Endpoints -----
@router.get("/queue", response_model=QueueResponse)
def get_queue(reviewer: str = "admin", limit: int = 6):
  # TODO: assign per-reviewer queue from DB
  return {"items": MOCK_QUEUE[:limit]}

@router.post("/review")
def post_review(payload: ReviewRequest):
  # TODO: write to DB and training set
  # Move reviewed items to history with a decision
  for it in payload.items:
    decision = "approved" if it.is_litter else "not_litter"
    MOCK_HISTORY.append({
      "id": f"h_{len(MOCK_HISTORY)+1}",
      "ts": datetime.now().strftime("%Y-%m-%d %H:%M"),
      "mission_id": "M_1",
      "ai_result": "n/a",
      "reviewer": "admin",
      "decision": decision
    })
  return {"ok": True, "saved": len(payload.items)}

@router.get("/initiation", response_model=InitiationConfig)
def get_initiation():
  return MOCK_THRESHOLDS

@router.put("/initiation")
def put_initiation(body: InitiationConfig):
  # Save updated thresholds (mock)
  global MOCK_THRESHOLDS
  # normalize incoming Pydantic alias
  classes = [{"class": c.class_, "conf": c.conf} for c in body.classes]
  MOCK_THRESHOLDS = {"classes": classes, "rtb": body.rtb.dict()}
  return {"ok": True}

@router.get("/review/history", response_model=HistoryResponse)
def get_history(limit: int = 20):
  return {"items": MOCK_HISTORY[-limit:]}
