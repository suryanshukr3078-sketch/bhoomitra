from collections.abc import Sequence

import geoalchemy2
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002_create_core_schema"
down_revision: str | None = "0001_enable_extensions"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:

    # ------------------------------------------------------------------ #
    # organizations                                                        #
    # ------------------------------------------------------------------ #
    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("name", sa.String(250), nullable=False),
        sa.Column("slug", sa.String(250), nullable=False),
        sa.Column(
            "organization_type",
            sa.Enum(
                "government",
                "academic",
                "research",
                "civil_society",
                "private",
                "international",
                "community",
                "other",
                name="organization_type",
            ),
            nullable=False,
        ),
        sa.Column("registration_number", sa.String(150), nullable=True),
        sa.Column(
            "country_code",
            sa.String(2),
            nullable=False,
            server_default="IN",
        ),
        sa.Column("state_name", sa.String(150), nullable=True),
        sa.Column("website", sa.Text(), nullable=True),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    # ------------------------------------------------------------------ #
    # users                                                                #
    # ------------------------------------------------------------------ #
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("email", postgresql.CITEXT(), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("password_hash", sa.String(500), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "active",
                "suspended",
                "disabled",
                name="user_status",
            ),
            nullable=False,
        ),
        sa.Column(
            "is_superuser",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("external_identity_subject", sa.String(300), nullable=True),
        sa.Column(
            "profile",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("external_identity_subject"),
    )
    op.create_index(
        "ix_users_status_created_at",
        "users",
        ["status", "created_at"],
    )

    # ------------------------------------------------------------------ #
    # organization_memberships                                             #
    # ------------------------------------------------------------------ #
    op.create_table(
        "organization_memberships",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(150), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "invited",
                "active",
                "suspended",
                "removed",
                name="membership_status",
            ),
            nullable=False,
        ),
        sa.Column(
            "permissions",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("user_id", "organization_id"),
        sa.UniqueConstraint(
            "user_id",
            "organization_id",
            name="uq_membership_user_organization",
        ),
    )

    # ------------------------------------------------------------------ #
    # resources                                                            #
    # ------------------------------------------------------------------ #
    op.create_table(
        "resources",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "resource_type",
            sa.Enum(
                "research_paper",
                "policy",
                "spatial_layer",
                "dataset",
                "report",
                "legal_document",
                "model",
                "case_study",
                name="resource_type",
            ),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("slug", sa.String(500), nullable=False),
        sa.Column("abstract", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "draft",
                "submitted",
                "under_review",
                "published",
                "rejected",
                "archived",
                name="resource_status",
            ),
            nullable=False,
        ),
        sa.Column(
            "visibility",
            sa.Enum(
                "public",
                "registered",
                "restricted",
                "confidential",
                name="resource_visibility",
            ),
            nullable=False,
        ),
        sa.Column(
            "owner_organization_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "is_demo",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["owner_organization_id"],
            ["organizations.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(
        "ix_resources_type_status",
        "resources",
        ["resource_type", "status"],
    )
    op.create_index(
        "ix_resources_owner_status",
        "resources",
        ["owner_organization_id", "status"],
    )
    op.create_index("ix_resources_published_at", "resources", ["published_at"])
    op.create_index(
        "ix_resources_title_trgm",
        "resources",
        ["title"],
        postgresql_using="gin",
        postgresql_ops={"title": "gin_trgm_ops"},
    )

    # ------------------------------------------------------------------ #
    # resource_versions                                                    #
    # ------------------------------------------------------------------ #
    op.create_table(
        "resource_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("version_label", sa.String(100), nullable=True),
        sa.Column("changelog", sa.Text(), nullable=True),
        sa.Column("document_date", sa.Date(), nullable=True),
        sa.Column(
            "language_code",
            sa.String(10),
            nullable=False,
            server_default="en",
        ),
        sa.Column("original_filename", sa.String(500), nullable=True),
        sa.Column("storage_uri", sa.Text(), nullable=True),
        sa.Column("mime_type", sa.String(200), nullable=True),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("checksum_sha256", sa.String(64), nullable=True),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.CheckConstraint(
            "version_number > 0",
            name="resource_version_number_positive",
        ),
        sa.CheckConstraint(
            "file_size_bytes IS NULL OR file_size_bytes >= 0",
            name="resource_file_size_non_negative",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["resource_id"],
            ["resources.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "resource_id",
            "version_number",
            name="uq_resource_version_number",
        ),
    )
    op.create_index(
        "ix_resource_versions_resource_created",
        "resource_versions",
        ["resource_id", "created_at"],
    )
    op.create_index(
        "ix_resource_versions_checksum",
        "resource_versions",
        ["checksum_sha256"],
    )

    # ------------------------------------------------------------------ #
    # research_papers                                                      #
    # ------------------------------------------------------------------ #
    op.create_table(
        "research_papers",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("doi", postgresql.CITEXT(), nullable=True),
        sa.Column("journal", sa.String(300), nullable=True),
        sa.Column("publication_date", sa.Date(), nullable=True),
        sa.Column("publication_type", sa.String(100), nullable=True),
        sa.Column(
            "authors",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("methodology", sa.Text(), nullable=True),
        sa.Column(
            "peer_reviewed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.ForeignKeyConstraint(
            ["resource_id"],
            ["resources.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("resource_id"),
        sa.UniqueConstraint("doi"),
    )

    # ------------------------------------------------------------------ #
    # policies                                                             #
    # ------------------------------------------------------------------ #
    op.create_table(
        "policies",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("policy_number", sa.String(150), nullable=True),
        sa.Column("jurisdiction_code", sa.String(150), nullable=False),
        sa.Column("issuing_authority", sa.String(300), nullable=True),
        sa.Column(
            "lifecycle_status",
            sa.Enum(
                "draft",
                "consultation",
                "active",
                "suspended",
                "superseded",
                "withdrawn",
                name="policy_lifecycle_status",
            ),
            nullable=False,
        ),
        sa.Column("effective_from", sa.Date(), nullable=True),
        sa.Column("effective_until", sa.Date(), nullable=True),
        sa.Column("legal_basis", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "effective_until IS NULL"
            " OR effective_from IS NULL"
            " OR effective_until >= effective_from",
            name="policy_effective_date_range",
        ),
        sa.ForeignKeyConstraint(
            ["resource_id"],
            ["resources.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("resource_id"),
    )
    op.create_index(
        "ix_policies_jurisdiction_status",
        "policies",
        ["jurisdiction_code", "lifecycle_status"],
    )

    # ------------------------------------------------------------------ #
    # spatial_layers                                                       #
    # ------------------------------------------------------------------ #
    op.create_table(
        "spatial_layers",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("geometry_type", sa.String(100), nullable=False),
        sa.Column(
            "srid",
            sa.Integer(),
            nullable=False,
            server_default="4326",
        ),
        sa.Column(
            "storage_type",
            sa.Enum(
                "postgis",
                "cloud_optimized_geotiff",
                "pmtiles",
                "wms",
                "wfs",
                "vector_tiles",
                "external",
                name="spatial_storage_type",
            ),
            nullable=False,
        ),
        sa.Column("source_table", sa.String(250), nullable=True),
        sa.Column("object_uri", sa.Text(), nullable=True),
        sa.Column("service_url", sa.Text(), nullable=True),
        sa.Column("tile_url_template", sa.Text(), nullable=True),
        sa.Column(
            "bounding_box",
            geoalchemy2.types.Geometry(
                geometry_type="POLYGON",
                srid=4326,
                spatial_index=False,
            ),
            nullable=True,
        ),
        sa.Column("minimum_zoom", sa.Integer(), nullable=True),
        sa.Column("maximum_zoom", sa.Integer(), nullable=True),
        sa.Column(
            "style_specification",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.CheckConstraint(
            "minimum_zoom IS NULL OR maximum_zoom IS NULL OR maximum_zoom >= minimum_zoom",
            name="spatial_layer_zoom_range",
        ),
        sa.ForeignKeyConstraint(
            ["resource_id"],
            ["resources.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("resource_id"),
    )
    op.create_index(
        "ix_spatial_layers_bbox_gist",
        "spatial_layers",
        ["bounding_box"],
        postgresql_using="gist",
    )

    # ------------------------------------------------------------------ #
    # spatial_features                                                     #
    # ------------------------------------------------------------------ #
    op.create_table(
        "spatial_features",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("layer_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("external_id", sa.String(250), nullable=True),
        sa.Column(
            "geom",
            geoalchemy2.types.Geometry(
                geometry_type="GEOMETRY",
                srid=4326,
                spatial_index=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "properties",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.ForeignKeyConstraint(
            ["layer_version_id"],
            ["resource_versions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "layer_version_id",
            "external_id",
            name="uq_spatial_feature_external_id",
        ),
    )
    op.create_index(
        "ix_spatial_features_layer_version",
        "spatial_features",
        ["layer_version_id"],
    )
    op.create_index(
        "ix_spatial_features_geom_gist",
        "spatial_features",
        ["geom"],
        postgresql_using="gist",
    )
    op.create_index(
        "ix_spatial_features_properties_gin",
        "spatial_features",
        ["properties"],
        postgresql_using="gin",
    )

    # ------------------------------------------------------------------ #
    # provenance_activities                                                #
    # ------------------------------------------------------------------ #
    op.create_table(
        "provenance_activities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("activity_type", sa.String(150), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "started",
                "completed",
                "failed",
                name="provenance_activity_status",
            ),
            nullable=False,
        ),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "actor_name",
            sa.String(200),
            nullable=False,
            server_default="system",
        ),
        sa.Column("software_name", sa.String(200), nullable=True),
        sa.Column("software_version", sa.String(100), nullable=True),
        sa.Column(
            "parameters",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "environment",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("request_id", sa.String(100), nullable=True),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["actor_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_provenance_activities_type_started",
        "provenance_activities",
        ["activity_type", "started_at"],
    )
    op.create_index(
        "ix_provenance_activities_request",
        "provenance_activities",
        ["request_id"],
    )

    # ------------------------------------------------------------------ #
    # provenance_edges                                                     #
    # ------------------------------------------------------------------ #
    op.create_table(
        "provenance_edges",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("source_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("target_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("activity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "relationship",
            sa.Enum(
                "cites",
                "uses_data",
                "uses_model",
                "derived_from",
                "transformed_from",
                "validates",
                "supersedes",
                name="provenance_relation",
            ),
            nullable=False,
        ),
        sa.Column(
            "source_locator",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint(
            "source_version_id <> target_version_id",
            name="provenance_versions_must_differ",
        ),
        sa.ForeignKeyConstraint(
            ["activity_id"],
            ["provenance_activities.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["source_version_id"],
            ["resource_versions.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["target_version_id"],
            ["resource_versions.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_provenance_edges_source",
        "provenance_edges",
        ["source_version_id"],
    )
    op.create_index(
        "ix_provenance_edges_target",
        "provenance_edges",
        ["target_version_id"],
    )
    op.create_index(
        "ix_provenance_edges_relationship",
        "provenance_edges",
        ["relationship"],
    )

    # ------------------------------------------------------------------ #
    # evidence_claims                                                      #
    # ------------------------------------------------------------------ #
    op.create_table(
        "evidence_claims",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "resource_version_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("claim_text", sa.Text(), nullable=False),
        sa.Column(
            "claim_type",
            sa.String(100),
            nullable=False,
            server_default="statement",
        ),
        sa.Column(
            "source_locator",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("extraction_method", sa.String(100), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["resource_version_id"],
            ["resource_versions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_evidence_claims_resource_version",
        "evidence_claims",
        ["resource_version_id"],
    )

    # ------------------------------------------------------------------ #
    # evidence_links                                                       #
    # ------------------------------------------------------------------ #
    op.create_table(
        "evidence_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("claim_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "evidence_version_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "relationship",
            sa.Enum(
                "supports",
                "contradicts",
                "contextualizes",
                "replicates",
                name="evidence_relation",
            ),
            nullable=False,
        ),
        sa.Column(
            "confidence",
            sa.Numeric(precision=4, scale=3),
            nullable=False,
        ),
        sa.Column(
            "evidence_locator",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="evidence_confidence_range",
        ),
        sa.ForeignKeyConstraint(
            ["claim_id"],
            ["evidence_claims.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["evidence_version_id"],
            ["resource_versions.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "claim_id",
            "evidence_version_id",
            "relationship",
            name="uq_evidence_claim_source_relation",
        ),
    )
    op.create_index(
        "ix_evidence_links_evidence_version",
        "evidence_links",
        ["evidence_version_id"],
    )


def downgrade() -> None:
    op.drop_table("evidence_links")
    op.drop_table("evidence_claims")
    op.drop_table("provenance_edges")
    op.drop_table("provenance_activities")
    op.drop_table("spatial_features")
    op.drop_table("spatial_layers")
    op.drop_table("policies")
    op.drop_table("research_papers")
    op.drop_table("resource_versions")
    op.drop_table("resources")
    op.drop_table("organization_memberships")
    op.drop_table("users")
    op.drop_table("organizations")

    op.execute("DROP TYPE IF EXISTS evidence_relation")
    op.execute("DROP TYPE IF EXISTS provenance_relation")
    op.execute("DROP TYPE IF EXISTS provenance_activity_status")
    op.execute("DROP TYPE IF EXISTS spatial_storage_type")
    op.execute("DROP TYPE IF EXISTS policy_lifecycle_status")
    op.execute("DROP TYPE IF EXISTS resource_visibility")
    op.execute("DROP TYPE IF EXISTS resource_status")
    op.execute("DROP TYPE IF EXISTS resource_type")
    op.execute("DROP TYPE IF EXISTS membership_status")
    op.execute("DROP TYPE IF EXISTS user_status")
    op.execute("DROP TYPE IF EXISTS organization_type")
