from fastapi import FastAPI

from app.config import settings
from app.api.routes.health import router as health_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise AI-powered SRE Incident Triage Copilot",
)


app.include_router(health_router)