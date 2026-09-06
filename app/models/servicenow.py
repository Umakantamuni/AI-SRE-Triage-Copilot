from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ServiceNowIncident(BaseModel):
    """
    Normalized representation of a ServiceNow incident.

    ServiceNow returns many fields. We keep the important operational
    fields here and allow extra fields so the integration remains
    compatible with different ServiceNow configurations.
    """

    model_config = ConfigDict(
        extra="allow"
    )

    number: str = Field(
        ...,
        description="ServiceNow incident number",
    )

    sys_id: str | None = None

    short_description: str = ""

    description: str = ""

    priority: str | None = None

    impact: str | None = None

    urgency: str | None = None

    state: str | None = None

    category: str | None = None

    subcategory: str | None = None

    assignment_group: str | None = None

    assigned_to: str | None = None

    business_service: str | None = None

    cmdb_ci: str | None = None

    opened_at: str | None = None

    updated_at: str | None = None

    caller_id: str | None = None

    comments: str | None = None

    work_notes: str | None = None

    raw_data: dict[str, Any] = Field(
        default_factory=dict
    )


class ServiceNowIncidentResponse(BaseModel):
    """
    API response returned after importing a ServiceNow incident.
    """

    incident_id: str

    source: str = "servicenow"

    servicenow_number: str

    status: str

    message: str