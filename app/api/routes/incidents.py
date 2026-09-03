from fastapi import APIRouter

from app.models.incident import Incident


router = APIRouter(
    prefix="/api/v1/incidents",
    tags=["Incidents"],
)


@router.post("", response_model=Incident)
def create_incident(incident: Incident):
    return incident