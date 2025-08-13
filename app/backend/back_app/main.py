from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from starlette.staticfiles import StaticFiles
from back_app.api.routes import missions, drones, analysis, login, ai, users, roles
from db.mongo import ensure_indexes, seed_admin

BASE_DIR = Path(__file__).resolve().parent          # -> /app/backend/back_app
STATIC_DIR = BASE_DIR / "static"                    # -> /app/backend/back_app/static

app = FastAPI(title="AeroWaste Backend")

ALLOWED_ORIGINS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(missions.router)
app.include_router(drones.router)
app.include_router(analysis.router)
app.include_router(login.router)       
app.include_router(ai.router)
app.include_router(users.router)
app.include_router(roles.router)

@app.on_event("startup")
async def _startup():
    # Create indexes and seed the Admin/Testing123 user + Admin role on first boot
    ensure_indexes()
    seed_admin()

@app.get("/")
async def root():
    return {
        "message": "AeroWaste backend is up and running!",
        "current_time": "server time here",
        "current_user": "debug"
    }