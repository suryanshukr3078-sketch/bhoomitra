"""move vector extension to extensions schema

Revision ID: 0008_move_vector_to_extensions
Revises: 0007_add_pgvector_and_embedding
Create Date: 2026-09-22 00:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0008_move_vector_to_extensions"
down_revision: str | None = "0007_add_pgvector_and_embedding"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Ensure the extensions schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS extensions;")

    # 2. Relocate vector extension out of public schema to extensions schema
    op.execute("ALTER EXTENSION vector SET SCHEMA extensions;")


def downgrade() -> None:
    # Revert vector extension back to public schema if rolled back
    op.execute("ALTER EXTENSION vector SET SCHEMA public;")
