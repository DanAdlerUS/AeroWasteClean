# C:\Users\flyin\AeroWaste\app\backend\back_app\api\routes\login.py
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from datetime import datetime, timedelta
from db.mongo import mongo_db
from passlib.hash import bcrypt
import jwt

router = APIRouter(tags=["auth"])

SECRET = "dev-secret-change-me"   # TODO: move to env
ALGO = "HS256"
COOKIE_NAME = "aw_session"

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

def make_session(user_id: str):
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(hours=12)}
    return jwt.encode(payload, SECRET, algorithm=ALGO)

@router.post("/login")
def login(request: LoginRequest, response: Response):
    users = mongo_db.users
    user = users.find_one({
        "$or": [
            {"username": request.username_or_email},
            {"email": request.username_or_email.lower()}
        ]
    })
    if not user or not bcrypt.verify(request.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

    token = make_session(str(user["_id"]))
    # Important for cookies from React → FastAPI
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="Lax",  # OK if you use the SAME host in FE & API (see step 4)
        secure=False     # set True in production over HTTPS
    )
    return {"ok": True, "user": {"id": str(user["_id"]), "name": user.get("name", "User")}}
