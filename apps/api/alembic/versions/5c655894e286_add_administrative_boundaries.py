"""add administrative boundaries

Revision ID: 5c655894e286
Revises: 0002_create_core_schema
Create Date: 2026-09-11 13:49:14.095875

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "5c655894e286"
down_revision: str | None = "0002_create_core_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
