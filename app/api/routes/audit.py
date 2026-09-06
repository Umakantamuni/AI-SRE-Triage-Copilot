from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.db.models.audit_log import AuditLogDB


router = APIRouter(
    prefix="/api/v1/audit",
    tags=["Audit Logs"],
)


@router.get("")
def list_audit_logs(
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "admin",
            "sre",
        )
    ),
):
    audit_logs = (
        db.query(AuditLogDB)
        .order_by(
            AuditLogDB.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "outcome": log.outcome,
            "details": log.details,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at,
        }
        for log in audit_logs
    ]