from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.db.models.incident import IncidentDB


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


# ---------------------------------------------------------
# DASHBOARD OVERVIEW
# Viewer / Operator / SRE / Admin
# ---------------------------------------------------------

@router.get("/overview")
def dashboard_overview(
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
    incidents = (
        db.query(IncidentDB)
        .order_by(
            IncidentDB.created_at.desc()
        )
        .all()
    )

    total_incidents = len(incidents)

    status_counts = Counter(
        incident.status
        for incident in incidents
    )

    severity_counts = Counter(
        incident.severity
        for incident in incidents
    )

    service_counts = Counter(
        incident.service
        for incident in incidents
    )

    confidence_values = [
        incident.confidence
        for incident in incidents
        if incident.confidence is not None
    ]

    average_ai_confidence = (
        sum(confidence_values)
        / len(confidence_values)
        if confidence_values
        else 0.0
    )

    service_health = []

    for service, count in service_counts.items():
        service_incidents = [
            incident
            for incident in incidents
            if incident.service == service
        ]

        critical_count = sum(
            1
            for incident in service_incidents
            if incident.severity == "critical"
        )

        high_count = sum(
            1
            for incident in service_incidents
            if incident.severity == "high"
        )

        open_count = sum(
            1
            for incident in service_incidents
            if incident.status
            in {
                "open",
                "investigating",
            }
        )

        if critical_count > 0:
            health = "critical"

        elif high_count > 0:
            health = "degraded"

        elif open_count > 0:
            health = "warning"

        else:
            health = "healthy"

        service_health.append(
            {
                "service": service,
                "incident_count": count,
                "critical_incidents": critical_count,
                "high_incidents": high_count,
                "open_incidents": open_count,
                "health": health,
            }
        )

    recent_incidents = []

    for incident in incidents[:10]:
        recent_incidents.append(
            {
                "incident_id": (
                    incident.incident_id
                ),
                "title": incident.title,
                "service": incident.service,
                "severity": incident.severity,
                "status": incident.status,
                "confidence": (
                    incident.confidence
                ),
                "created_at": (
                    incident.created_at
                ),
            }
        )

    return {
        "summary": {
            "total_incidents": total_incidents,
            "open_incidents": (
                status_counts.get(
                    "open",
                    0,
                )
            ),
            "investigating_incidents": (
                status_counts.get(
                    "investigating",
                    0,
                )
            ),
            "resolved_incidents": (
                status_counts.get(
                    "resolved",
                    0,
                )
            ),
            "closed_incidents": (
                status_counts.get(
                    "closed",
                    0,
                )
            ),
            "critical_incidents": (
                severity_counts.get(
                    "critical",
                    0,
                )
            ),
            "high_incidents": (
                severity_counts.get(
                    "high",
                    0,
                )
            ),
            "medium_incidents": (
                severity_counts.get(
                    "medium",
                    0,
                )
            ),
            "low_incidents": (
                severity_counts.get(
                    "low",
                    0,
                )
            ),
            "average_ai_confidence": round(
                average_ai_confidence,
                3,
            ),
        },
        "service_health": service_health,
        "recent_incidents": recent_incidents,
    }