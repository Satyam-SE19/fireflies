from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import meetings, action_items, soundbites, ai, notifications, workspaces, analytics, integrations, settings

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies.ai Web Application Backend API",
    description="Backend service providing meeting transcript processing, AI summaries, Ask Fred copilot, action items, soundbites, analytics, integrations, and workspace settings.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(soundbites.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(workspaces.router)
app.include_router(analytics.router)
app.include_router(integrations.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Fireflies.ai API",
        "docs": "/docs",
        "message": "Welcome to the Fireflies meeting assistant backend API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
