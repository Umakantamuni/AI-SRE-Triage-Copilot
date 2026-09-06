from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.dependencies import require_roles
from app.integrations.servicenow_client import (
    ServiceNowError,
)
from app.services.servicenow_service import (
    ServiceNowService,
)

router = APIRouter(
    prefix="/api/v1/integrations/servicenow",
    tags=["ServiceNow"],
)


class ServiceNowCreateRequest(BaseModel):
    short_description: str = Field(
        ...,
        min_length=1,
        max_length=160,
    )
    description: str = ""
    impact: str = "3"
    urgency: str = "3"
    category: str | None = None
    subcategory: str | None = None


class ServiceNowUpdateRequest(BaseModel):
    short_description: str | None = None
    description: str | None = None
    impact: str | None = None
    urgency: str | None = None
    state: str | None = None
    work_notes: str | None = None
    comments: str | None = None


def get_servicenow_service() -> ServiceNowService:
    return ServiceNowService()


@router.get(
    "/health",
)
def servicenow_health(
    current_user=Depends(
        require_roles(
            "operator",
            "sre",
            "admin",
        )
    ),
    service: ServiceNowService = Depends(
        get_servicenow_service
    ),
):
    try:
        return service.test_connection()
    except ServiceNowError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.get(
    "/incidents/{incident_number}",
)
def get_servicenow_incident(
    incident_number: str,
    current_user=Depends(
        require_roles(
            "viewer",
            "operator",
            "sre",
            "admin",
        )
    ),
    service: ServiceNowService = Depends(
        get_servicenow_service
    ),
):
    try:
        incident = service.fetch_incident(
            incident_number
        )

        return {
            "source": "servicenow",
            "incident": incident.model_dump(),
        }

    except ServiceNowError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post(
    "/incidents",
    status_code=status.HTTP_201_CREATED,
)
def create_servicenow_incident(
    payload: ServiceNowCreateRequest,
    current_user=Depends(
        require_roles(
            "operator",
            "sre",
            "admin",
        )
    ),
    service: ServiceNowService = Depends(
        get_servicenow_service
    ),
):
    servicenow_payload = {
        "short_description": (
            payload.short_description
        ),
        "description": payload.description,
        "impact": payload.impact,
        "urgency": payload.urgency,
    }

    if payload.category:
        servicenow_payload["category"] = (
            payload.category
        )

    if payload.subcategory:
        servicenow_payload["subcategory"] = (
            payload.subcategory
        )

    try:
        incident = service.create_incident(
            servicenow_payload
        )

        return {
            "source": "servicenow",
            "incident": incident.model_dump(),
        }

    except ServiceNowError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


@router.patch(
    "/incidents/{sys_id}",
)
def update_servicenow_incident(
    sys_id: str,
    payload: ServiceNowUpdateRequest,
    current_user=Depends(
        require_roles(
            "operator",
            "sre",
            "admin",
        )
    ),
    service: ServiceNowService = Depends(
        get_servicenow_service
    ),
):
    update_payload = payload.model_dump(
        exclude_none=True
    )

    if not update_payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    try:
        incident = service.update_incident(
            sys_id,
            update_payload,
        )

        return {
            "source": "servicenow",
            "incident": incident.model_dump(),
        }

    except ServiceNowError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
