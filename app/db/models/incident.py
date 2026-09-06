from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class IncidentDB(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    incident_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Original severity provided when the incident was created.
    initial_severity: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False,
    )

    # Current AI/human-assessed severity.
    severity: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False,
    )

    severity_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="open",
        nullable=False,
    )

    service: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    environment: Mapped[str] = mapped_column(
        String(50),
        default="production",
        nullable=False,
    )

    symptoms: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    logs: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    probable_root_cause: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    evidence: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    recommended_actions: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    resolution_steps: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    incident_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Ownership
    created_by: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    resolved_by: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    closed_by: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # Resolution
    final_root_cause: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    resolution_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    customer_impact: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    preventive_actions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    resolution_remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Closure
    final_verdict: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    closure_remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )