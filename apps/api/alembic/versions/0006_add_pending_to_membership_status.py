"""add pending to membership_status enum

Revision ID: 0006_add_pending_membership
Revises: 0005_enable_rls_alembic_version
Create Date: 2026-09-14 12:00:00.000000

"""

from collections.abc import Sequence
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0006_add_pending_membership"
down_revision: str | None = "0005_enable_rls_alembic_version"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add 'pending' to the PostgreSQL enum type membership_status
    op.execute("ALTER TYPE membership_status ADD VALUE IF NOT EXISTS 'pending'")


def downgrade() -> None:
    # PostgreSQL does not natively support removing enum values without recreating the type
    pass
