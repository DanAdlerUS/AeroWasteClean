from fastapi import Cookie, HTTPException
import jwt

SECRET = "dev-secret-change-me"
ALGO = "HS256"
COOKIE_NAME = "aw_session"

def require_session(session: str | None = Cookie(default=None, alias=COOKIE_NAME)):
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(session, SECRET, algorithms=[ALGO])
        return payload["sub"]  # user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
