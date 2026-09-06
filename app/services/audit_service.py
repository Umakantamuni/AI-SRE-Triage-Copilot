from sqlalchemy.orm import Session

from app.db.repositories.audit_repository import (
    AuditLogRepository,
)


class AuditService:

    @staticmethod
    def log(
        db: Session,
        *,
        user_id: int | None,
        action: str,
        resource_type: str,
        resource_id: str | None = None,
        outcome: str = "success",
        details: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ):

        repository = AuditLogRepository(db)

        return repository.create(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            outcome=outcome,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
        )