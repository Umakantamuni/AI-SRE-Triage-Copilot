from enum import Enum

from pydantic import BaseModel, Field


class TriageSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TriageResult(BaseModel):
    severity: TriageSeverity

    severity_reason: str

    probable_root_cause: str

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )

    evidence: list[str] = Field(
        default_factory=list
    )

    recommended_actions: list[str] = Field(
        default_factory=list
    )

    resolution_steps: list[str] = Field(
        default_factory=list
    )

    incident_summary: str