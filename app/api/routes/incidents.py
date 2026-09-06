from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_ai_triage_service,
    require_roles,
)
from app.db.database import get_db
from app.db.models.incident import IncidentDB
from app.db.repositories.incident_repository import (
    IncidentRepository,
)
from app.models.incident import (
    Incident,
    IncidentSeverity,
    IncidentStatus,
)
from app.models.triage import TriageResult
from app.services.ai_triage_service import (
    AITriageService,
)
from app.services.audit_service import AuditService
from app.services.triage_service import TriageService


router = APIRouter(
    prefix="/api/v1/incidents",
    tags=["Incidents"],
)


class CreateIncidentRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    description: str = ""

    severity: IncidentSeverity = (
        IncidentSeverity.medium
    )

    service: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    environment: str = "production"

    symptoms: list[str] = Field(
        default_factory=list
    )

    logs: list[str] = Field(
        default_factory=list
    )


class ResolveIncidentRequest(BaseModel):
    resolution_summary: str = Field(
        ...,
        min_length=1,
    )

    final_root_cause: str | None = None

    customer_impact: str | None = None

    preventive_actions: str | None = None

    resolution_remarks: str | None = None


class CloseIncidentRequest(BaseModel):
    final_root_cause: str = Field(
        ...,
        min_length=1,
    )

    final_verdict: str = Field(
        ...,
        min_length=1,
    )

    closure_remarks: str | None = None


def incident_db_to_model(
    incident_db: IncidentDB,
) -> Incident:
    return Incident(
        incident_id=incident_db.incident_id,
        title=incident_db.title,
        description=incident_db.description,

        initial_severity=(
            incident_db.initial_severity
        ),

        severity=incident_db.severity,

        severity_reason=(
            incident_db.severity_reason
        ),

        status=incident_db.status,

        service=incident_db.service,

        environment=incident_db.environment,

        symptoms=(
            incident_db.symptoms.splitlines()
            if incident_db.symptoms
            else []
        ),

        logs=(
            incident_db.logs.splitlines()
            if incident_db.logs
            else []
        ),

        probable_root_cause=(
            incident_db.probable_root_cause
        ),

        confidence=incident_db.confidence,

        evidence=(
            incident_db.evidence.splitlines()
            if incident_db.evidence
            else []
        ),

        recommended_actions=(
            incident_db.recommended_actions.splitlines()
            if incident_db.recommended_actions
            else []
        ),

        resolution_steps=(
            incident_db.resolution_steps.splitlines()
            if incident_db.resolution_steps
            else []
        ),

        incident_summary=(
            incident_db.incident_summary
        ),

        created_by=incident_db.created_by,

        resolved_by=incident_db.resolved_by,

        closed_by=incident_db.closed_by,

        final_root_cause=(
            incident_db.final_root_cause
        ),

        resolution_summary=(
            incident_db.resolution_summary
        ),

        customer_impact=(
            incident_db.customer_impact
        ),

        preventive_actions=(
            incident_db.preventive_actions
        ),

        resolution_remarks=(
            incident_db.resolution_remarks
        ),

        final_verdict=(
            incident_db.final_verdict
        ),

        closure_remarks=(
            incident_db.closure_remarks
        ),

        created_at=incident_db.created_at,

        updated_at=incident_db.updated_at,

        resolved_at=incident_db.resolved_at,

        closed_at=incident_db.closed_at,
    )


def persist_triage_result(
    incident_db: IncidentDB,
    triage_result: TriageResult,
) -> None:
    incident_db.severity = (
        triage_result.severity.value
    )

    incident_db.severity_reason = (
        triage_result.severity_reason
    )

    incident_db.status = (
        IncidentStatus.investigating.value
    )

    incident_db.probable_root_cause = (
        triage_result.probable_root_cause
    )

    incident_db.confidence = (
        triage_result.confidence
    )

    incident_db.evidence = "\n".join(
        triage_result.evidence
    )

    incident_db.recommended_actions = "\n".join(
        triage_result.recommended_actions
    )

    incident_db.resolution_steps = "\n".join(
        triage_result.resolution_steps
    )

    incident_db.incident_summary = (
        triage_result.incident_summary
    )


def generate_incident_id() -> str:
    return (
        f"INC-{uuid4().hex[:8].upper()}"
    )


@router.post(
    "",
    response_model=Incident,
    status_code=201,
)
def create_incident(
    incident: CreateIncidentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "operator",
            "sre",
            "admin",
        )
    ),
):
    repository = IncidentRepository(db)

    incident_id = generate_incident_id()

    while repository.get_by_incident_id(
        incident_id
    ):
        incident_id = generate_incident_id()

    incident_db = IncidentDB(
        incident_id=incident_id,

        title=incident.title,

        description=incident.description,

        initial_severity=(
            incident.severity.value
        ),

        severity=incident.severity.value,

        severity_reason=None,

        status=IncidentStatus.open.value,

        service=incident.service,

        environment=incident.environment,

        symptoms="\n".join(
            incident.symptoms
        ),

        logs="\n".join(
            incident.logs
        ),

        probable_root_cause=None,

        confidence=None,

        evidence="",

        recommended_actions="",

        resolution_steps="",

        incident_summary=None,

        created_by=current_user.id,

        resolved_by=None,

        closed_by=None,

        final_root_cause=None,

        resolution_summary=None,

        customer_impact=None,

        preventive_actions=None,

        resolution_remarks=None,

        final_verdict=None,

        closure_remarks=None,

        resolved_at=None,

        closed_at=None,
    )

    repository.create(
        incident_db
    )

    AuditService.log(
        db,
        user_id=current_user.id,
        action="incident.created",
        resource_type="incident",
        resource_id=incident_db.incident_id,
        outcome="success",
        details=(
            "Incident created successfully"
        ),
    )

    return incident_db_to_model(
        incident_db
    )


@router.get(
    "",
    response_model=list[Incident],
)
def list_incidents(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "viewer",
            "operator",
            "sre",
            "admin",
        )
    ),
):
    repository = IncidentRepository(db)

    incidents_db = repository.list_all()

    return [
        incident_db_to_model(item)
        for item in incidents_db
    ]


@router.get(
    "/{incident_id}",
    response_model=Incident,
)
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "viewer",
            "operator",
            "sre",
            "admin",
        )
    ),
):
    repository = IncidentRepository(db)

    incident_db = (
        repository.get_by_incident_id(
            incident_id
        )
    )

    if not incident_db:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident_db_to_model(
        incident_db
    )


@router.post(
    "/{incident_id}/triage"
)
def triage_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    ai_triage_service: AITriageService = Depends(
        get_ai_triage_service
    ),
    current_user=Depends(
        require_roles(
            "operator",
            "sre",
            "admin",
        )
    ),
):
    repository = IncidentRepository(db)

    incident_db = (
        repository.get_by_incident_id(
            incident_id
        )
    )

    if not incident_db:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    incident = incident_db_to_model(
        incident_db
    )

    try:
        triage_result = (
            ai_triage_service.analyze(
                incident
            )
        )

        triage_engine = "ai"

    except Exception as exc:
        print(
            "AI triage failed. "
            "Using deterministic fallback. "
            f"Reason: {exc}"
        )

        triage_service = TriageService()

        triage_result = (
            triage_service.analyze(
                incident
            )
        )

        triage_engine = (
            "deterministic_fallback"
        )

    try:
        previous_severity = (
            incident_db.severity
        )

        persist_triage_result(
            incident_db,
            triage_result,
        )

        db.commit()

        db.refresh(
            incident_db
        )

    except Exception:
        db.rollback()
        raise

    AuditService.log(
        db,
        user_id=current_user.id,
        action="incident.triaged",
        resource_type="incident",
        resource_id=incident_db.incident_id,
        outcome="success",
        details=(
            f"Triage completed using "
            f"{triage_engine}"
        ),
    )

    if (
        previous_severity
        != incident_db.severity
    ):
        AuditService.log(
            db,
            user_id=current_user.id,
            action="severity.changed",
            resource_type="incident",
            resource_id=incident_db.incident_id,
            outcome="success",
            details=(
                f"Severity changed from "
                f"{previous_severity} to "
                f"{incident_db.severity}"
            ),
        )

    return {
        "incident_id": incident_db.incident_id,
        "triage_engine": triage_engine,
        **triage_result.model_dump(),
    }


@router.post(
    "/{incident_id}/resolve",
    response_model=Incident,
)
def resolve_incident(
    incident_id: str,
    resolution: ResolveIncidentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "operator",
            "sre",
            "admin",
        )
    ),
):
    repository = IncidentRepository(db)

    incident_db = (
        repository.get_by_incident_id(
            incident_id
        )
    )

    if not incident_db:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    if incident_db.status != (
        IncidentStatus.investigating.value
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only investigating incidents "
                "can be resolved."
            ),
        )

    if not resolution.resolution_summary.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "Resolution summary is required."
            ),
        )

    now = datetime.now(timezone.utc)

    incident_db.status = (
        IncidentStatus.resolved.value
    )

    incident_db.final_root_cause = (
        resolution.final_root_cause.strip()
        if resolution.final_root_cause
        else incident_db.probable_root_cause
    )

    incident_db.resolution_summary = (
        resolution.resolution_summary.strip()
    )

    incident_db.customer_impact = (
        resolution.customer_impact.strip()
        if resolution.customer_impact
        else None
    )

    incident_db.preventive_actions = (
        resolution.preventive_actions.strip()
        if resolution.preventive_actions
        else None
    )

    incident_db.resolution_remarks = (
        resolution.resolution_remarks.strip()
        if resolution.resolution_remarks
        else None
    )

    incident_db.resolved_by = (
        current_user.id
    )

    incident_db.resolved_at = now

    incident_db.updated_at = now

    try:
        db.commit()

        db.refresh(
            incident_db
        )

    except Exception:
        db.rollback()
        raise

    AuditService.log(
        db,
        user_id=current_user.id,
        action="incident.resolved",
        resource_type="incident",
        resource_id=incident_db.incident_id,
        outcome="success",
        details=(
            "Incident resolved successfully"
        ),
    )

    if resolution.resolution_remarks:
        AuditService.log(
            db,
            user_id=current_user.id,
            action="resolution.remark.added",
            resource_type="incident",
            resource_id=incident_db.incident_id,
            outcome="success",
            details=(
                "Resolution remarks added"
            ),
        )

    return incident_db_to_model(
        incident_db
    )


@router.post(
    "/{incident_id}/close",
    response_model=Incident,
)
def close_incident(
    incident_id: str,
    closure: CloseIncidentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "sre",
            "admin",
        )
    ),
):
    repository = IncidentRepository(db)

    incident_db = (
        repository.get_by_incident_id(
            incident_id
        )
    )

    if not incident_db:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    if incident_db.status != (
        IncidentStatus.resolved.value
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only resolved incidents "
                "can be closed."
            ),
        )

    if not closure.final_root_cause.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "Final root cause is required."
            ),
        )

    if not closure.final_verdict.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "Final verdict is required."
            ),
        )

    allowed_verdicts = {
        "Confirmed Root Cause",
        "Probable Root Cause",
        "False Positive",
        "Duplicate Incident",
        "No Root Cause Identified",
        "External Dependency",
        "Configuration / User Error",
    }

    if closure.final_verdict.strip() not in (
        allowed_verdicts
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid final verdict. "
                "Please select a supported verdict."
            ),
        )

    now = datetime.now(timezone.utc)

    incident_db.status = (
        IncidentStatus.closed.value
    )

    incident_db.final_root_cause = (
        closure.final_root_cause.strip()
    )

    incident_db.final_verdict = (
        closure.final_verdict.strip()
    )

    incident_db.closure_remarks = (
        closure.closure_remarks.strip()
        if closure.closure_remarks
        else None
    )

    incident_db.closed_by = (
        current_user.id
    )

    incident_db.closed_at = now

    incident_db.updated_at = now

    try:
        db.commit()

        db.refresh(
            incident_db
        )

    except Exception:
        db.rollback()
        raise

    AuditService.log(
        db,
        user_id=current_user.id,
        action="incident.closed",
        resource_type="incident",
        resource_id=incident_db.incident_id,
        outcome="success",
        details=(
            "Incident closed successfully. "
            f"Final verdict: "
            f"{incident_db.final_verdict}"
        ),
    )

    if closure.closure_remarks:
        AuditService.log(
            db,
            user_id=current_user.id,
            action="closure.remark.added",
            resource_type="incident",
            resource_id=incident_db.incident_id,
            outcome="success",
            details=(
                "Closure remarks added"
            ),
        )

    return incident_db_to_model(
        incident_db
    )