"""add pgvector extension and embedding column to resource_versions

Revision ID: 0007_add_pgvector_and_embedding
Revises: 0006_add_pending_membership
Create Date: 2026-09-15 00:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0007_add_pgvector_and_embedding"
down_revision: str | None = "0006_add_pending_membership"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Enable pgvector extension on PostgreSQL / Supabase
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Add 768-dimensional embedding column matching Gemini text-embedding-004
    op.execute("ALTER TABLE resource_versions ADD COLUMN IF NOT EXISTS embedding vector(768);")

    # 3. Create HNSW index for high-performance cosine similarity searches (<=> operator)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_resource_versions_embedding_cosine "
        "ON resource_versions USING hnsw (embedding vector_cosine_ops);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_resource_versions_embedding_cosine;")
    op.execute("ALTER TABLE resource_versions DROP COLUMN IF EXISTS embedding;")
