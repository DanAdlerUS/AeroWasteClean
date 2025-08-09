from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from back_app.api.routes import missions, drones, analysis
from back_app.api.routes import login  
from back_app.api.routes import ai

app = FastAPI(title="AeroWaste Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="app/backend/back_app/static"), name="static")

app.include_router(missions.router)
app.include_router(drones.router)
app.include_router(analysis.router)
app.include_router(login.router)       
app.include_router(ai.router)

@app.get("/")
async def root():
    return {"message": "AeroWaste backend is up and running!"}