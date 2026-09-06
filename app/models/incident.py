from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class IncidentSeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentStatus(str, Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"
    closed = "closed"


class Incident(BaseModel):
    incident_id: str
    title: str
    description: str

    severity: IncidentSeverity = IncidentSeverity.medium
    severity_reason: str | None = None

    status: IncidentStatus = IncidentStatus.open

    service: str
    environment: str = "production"

    symptoms: list[str] = Field(default_factory=list)
    logs: list[str] = Field(default_factory=list)

    probable_root_cause: str | None = None
    confidence: float | None = None

    evidence: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    resolution_steps: list[str] = Field(default_factory=list)

    incident_summary: str | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
