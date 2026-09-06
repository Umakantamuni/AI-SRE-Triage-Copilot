"""add incident lifecycle fields

Revision ID: d9e988f1381b
Revises: 26f5715fce54
Create Date: 2026-09-06 20:30:30.333339

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d9e988f1381b"
down_revision: Union[str, Sequence[str], None] = "26f5715fce54"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add as nullable first because existing incidents already exist.
    op.add_column(
        "incidents",
        sa.Column(
            "initial_severity",
            sa.String(length=20),
            nullable=True,
        ),
    )

    # Preserve the severity that existing incidents already have.
    op.execute(
        """
        UPDATE incidents
        SET initial_severity = severity
        WHERE initial_severity IS NULL
        """
    )

    # Existing and future rows must have an initial severity.
    op.alter_column(
        "incidents",
        "initial_severity",
        existing_type=sa.String(length=20),
        nullable=False,
    )

    op.add_column(
        "incidents",
        sa.Column(
            "created_by",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "resolved_by",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "closed_by",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "final_root_cause",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "resolution_summary",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "customer_impact",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "preventive_actions",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "resolution_remarks",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "final_verdict",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "closure_remarks",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "resolved_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "incidents",
        sa.Column(
            "closed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("incidents", "closed_at")
    op.drop_column("incidents", "resolved_at")
    op.drop_column("incidents", "closure_remarks")
    op.drop_column("incidents", "final_verdict")
    op.drop_column("incidents", "resolution_remarks")
    op.drop_column("incidents", "preventive_actions")
    op.drop_column("incidents", "customer_impact")
    op.drop_column("incidents", "resolution_summary")
    op.drop_column("incidents", "final_root_cause")
    op.drop_column("incidents", "closed_by")
    op.drop_column("incidents", "resolved_by")
    op.drop_column("incidents", "created_by")
    op.drop_column("incidents", "initial_severity")