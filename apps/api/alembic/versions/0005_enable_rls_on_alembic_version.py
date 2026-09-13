"""enable rls on alembic_version table

Revision ID: 0005_enable_rls_alembic_version
Revises: 0004_enable_rls_security
Create Date: 2026-09-13 23:55:00.000000

"""

from collections.abc import Sequence
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0005_enable_rls_alembic_version"
down_revision: str | None = "0004_enable_rls_security"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Enable Row Level Security on the migration tracking table
    op.execute("ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY")

    # 2. Revoke permissions from public pseudo-role
    op.execute("REVOKE ALL ON TABLE public.alembic_version FROM public")

    # 3. Revoke permissions from Supabase PostgREST roles (anon, authenticated) if present
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
                REVOKE ALL ON TABLE public.alembic_version FROM anon;
            END IF;
            IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
                REVOKE ALL ON TABLE public.alembic_version FROM authenticated;
            END IF;
        END
        $$;
    """)


def downgrade() -> None:
    # Disable Row Level Security on alembic_version
    op.execute("ALTER TABLE public.alembic_version DISABLE ROW LEVEL SECURITY")
