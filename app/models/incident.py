from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Incident(BaseModel):
    incident_id: str = Field(..., description="Unique incident identifier")
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)

    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    status: IncidentStatus = IncidentStatus.OPEN

    service: str = Field(..., min_length=2)
    environment: str = Field(default="production")

    symptoms: list[str] = Field(default_factory=list)
    logs: list[str] = Field(default_factory=list)

    probable_root_cause: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)

    resolution_steps: list[str] = Field(default_factory=list)
    incident_summary: str | None = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)