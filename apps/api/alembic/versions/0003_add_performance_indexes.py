"""add performance indexes

Revision ID: 0003_add_performance_indexes
Revises: 5c655894e286
Create Date: 2026-09-11 19:20:00.000000

"""

from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op

revision: str = "0003_add_performance_indexes"
down_revision: str | None = "5c655894e286"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "ix_resources_status_created_at_desc",
        "resources",
        ["status", sa.text("created_at DESC")],
    )
    op.create_index(
        "ix_resources_abstract_trgm",
        "resources",
        ["abstract"],
        postgresql_using="gin",
        postgresql_ops={"abstract": "gin_trgm_ops"},
    )


def downgrade() -> None:
    op.drop_index("ix_resources_abstract_trgm", table_name="resources")
    op.drop_index("ix_resources_status_created_at_desc", table_name="resources")
