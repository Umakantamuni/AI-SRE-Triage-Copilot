from fastapi import APIRouter

from app.db.database import engine


router = APIRouter(
    tags=["Health"],
)


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI SRE Triage Copilot",
    }


@router.get("/ready")
def readiness_check():
    try:
        with engine.connect():
            database_status = "connected"

        return {
            "status": "ready",
            "database": database_status,
        }

    except Exception:
        return {
            "status": "not_ready",
            "database": "unavailable",
        }