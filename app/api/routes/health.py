from fastapi import APIRouter

from app.config import settings


router = APIRouter(
    prefix="/api/v1",
    tags=["System"],
)


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }