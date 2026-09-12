"""enable rls and harden security

Revision ID: 0004_enable_rls_security
Revises: 0003_add_performance_indexes
Create Date: 2026-09-12 21:10:00.000000

"""

from collections.abc import Sequence
from alembic import op

revision: str = "0004_enable_rls_security"
down_revision: str | None = "0003_add_performance_indexes"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

APPLICATION_TABLES = [
    "organizations",
    "users",
    "organization_memberships",
    "resources",
    "resource_versions",
    "research_papers",
    "policies",
    "spatial_layers",
    "spatial_features",
    "provenance_activities",
    "provenance_edges",
    "evidence_claims",
    "evidence_links",
]


def upgrade() -> None:
    # 1. Ensure extensions schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS extensions")

    # 2. Enable Row Level Security (RLS) on all application tables
    for table in APPLICATION_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")

    # 3. Move relocatable extensions to extensions schema
    op.execute("ALTER EXTENSION citext SET SCHEMA extensions")
    op.execute("ALTER EXTENSION pg_trgm SET SCHEMA extensions")

    # 4. Move postgis extension to extensions schema
    op.execute("ALTER TABLE spatial_layers DROP COLUMN IF EXISTS bounding_box CASCADE")
    op.execute("ALTER TABLE spatial_features DROP COLUMN IF EXISTS geom CASCADE")
    op.execute("DROP EXTENSION IF EXISTS postgis")
    op.execute("CREATE EXTENSION postgis SCHEMA extensions")
    op.execute("ALTER TABLE spatial_layers ADD COLUMN bounding_box geometry(Polygon, 4326)")
    op.execute("CREATE INDEX ix_spatial_layers_bbox_gist ON spatial_layers USING gist(bounding_box)")
    op.execute("ALTER TABLE spatial_features ADD COLUMN geom geometry(Geometry, 4326) NOT NULL")
    op.execute("CREATE INDEX ix_spatial_features_geom_gist ON spatial_features USING gist(geom)")

    # 5. Revoke EXECUTE on st_estimatedextent from anon and public (Security Definer hardening)
    op.execute("REVOKE ALL ON FUNCTION extensions.st_estimatedextent(text, text, text, boolean) FROM anon, public")
    op.execute("REVOKE ALL ON FUNCTION extensions.st_estimatedextent(text, text, text) FROM anon, public")
    op.execute("REVOKE ALL ON FUNCTION extensions.st_estimatedextent(text, text) FROM anon, public")


def downgrade() -> None:
    # 1. Disable RLS on application tables
    for table in reversed(APPLICATION_TABLES):
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")

    # 2. Revert postgis extension to public schema
    op.execute("ALTER TABLE spatial_layers DROP COLUMN IF EXISTS bounding_box CASCADE")
    op.execute("ALTER TABLE spatial_features DROP COLUMN IF EXISTS geom CASCADE")
    op.execute("DROP EXTENSION IF EXISTS postgis")
    op.execute("CREATE EXTENSION postgis SCHEMA public")
    op.execute("ALTER TABLE spatial_layers ADD COLUMN bounding_box geometry(Polygon, 4326)")
    op.execute("CREATE INDEX ix_spatial_layers_bbox_gist ON spatial_layers USING gist(bounding_box)")
    op.execute("ALTER TABLE spatial_features ADD COLUMN geom geometry(Geometry, 4326) NOT NULL")
    op.execute("CREATE INDEX ix_spatial_features_geom_gist ON spatial_features USING gist(geom)")

    # 3. Move citext & pg_trgm back to public
    op.execute("ALTER EXTENSION citext SET SCHEMA public")
    op.execute("ALTER EXTENSION pg_trgm SET SCHEMA public")
