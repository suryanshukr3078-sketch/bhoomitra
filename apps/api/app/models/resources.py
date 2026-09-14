from datetime import date, datetime
from typing import Any
from uuid import UUID

from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    false,
    text,
)
from sqlalchemy import (
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.dialects.postgresql import (
    CITEXT,
    JSONB,
)
from sqlalchemy.dialects.postgresql import (
    UUID as PostgreSQLUUID,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import (
    CreatedAtMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
)
from app.models.enums import (
    PolicyLifecycleStatus,
    ResourceStatus,
    ResourceType,
    ResourceVisibility,
    SpatialStorageType,
    enum_values,
)


class Resource(
    UUIDPrimaryKeyMixin,
    TimestampMixin,
    Base,
):
    __tablename__ = "resources"

    resource_type: Mapped[ResourceType] = mapped_column(
        SQLAlchemyEnum(
            ResourceType,
            name="resource_type",
            values_callable=enum_values,
        ),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        unique=True,
    )

    abstract: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[ResourceStatus] = mapped_column(
        SQLAlchemyEnum(
            ResourceStatus,
            name="resource_status",
            values_callable=enum_values,
        ),
        nullable=False,
        default=ResourceStatus.DRAFT,
    )

    visibility: Mapped[ResourceVisibility] = mapped_column(
        SQLAlchemyEnum(
            ResourceVisibility,
            name="resource_visibility",
            values_callable=enum_values,
        ),
        nullable=False,
        default=ResourceVisibility.PUBLIC,
    )

    owner_organization_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "organizations.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    created_by_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    publisher: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_demo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )

    resource_metadata: Mapped[dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    versions: Mapped[list["ResourceVersion"]] = relationship(
        back_populates="resource",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ResourceVersion.version_number",
    )

    research_paper: Mapped["ResearchPaper | None"] = relationship(
        back_populates="resource",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    policy: Mapped["Policy | None"] = relationship(
        back_populates="resource",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    spatial_layer: Mapped["SpatialLayer | None"] = relationship(
        back_populates="resource",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        Index(
            "ix_resources_type_status",
            "resource_type",
            "status",
        ),
        Index(
            "ix_resources_owner_status",
            "owner_organization_id",
            "status",
        ),
        Index(
            "ix_resources_published_at",
            "published_at",
        ),
        Index(
            "ix_resources_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={
                "title": "gin_trgm_ops",
            },
        ),
        Index(
            "ix_resources_abstract_trgm",
            "abstract",
            postgresql_using="gin",
            postgresql_ops={
                "abstract": "gin_trgm_ops",
            },
        ),
        Index(
            "ix_resources_status_created_at_desc",
            "status",
            text("created_at DESC"),
        ),
    )


class ResourceVersion(
    UUIDPrimaryKeyMixin,
    CreatedAtMixin,
    Base,
):
    __tablename__ = "resource_versions"

    resource_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resources.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    version_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    version_label: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    changelog: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    document_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    language_code: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
        server_default="en",
    )

    original_filename: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    storage_uri: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    file_size_bytes: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    checksum_sha256: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    extracted_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(768),
        nullable=True,
    )

    version_metadata: Mapped[dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    created_by_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    resource: Mapped["Resource"] = relationship(
        back_populates="versions",
    )

    __table_args__ = (
        UniqueConstraint(
            "resource_id",
            "version_number",
            name="uq_resource_version_number",
        ),
        CheckConstraint(
            "version_number > 0",
            name="resource_version_number_positive",
        ),
        CheckConstraint(
            """
            file_size_bytes IS NULL
            OR file_size_bytes >= 0
            """,
            name="resource_file_size_non_negative",
        ),
        Index(
            "ix_resource_versions_resource_created",
            "resource_id",
            "created_at",
        ),
        Index(
            "ix_resource_versions_checksum",
            "checksum_sha256",
        ),
    )


class ResearchPaper(TimestampMixin, Base):
    __tablename__ = "research_papers"

    resource_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resources.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    doi: Mapped[str | None] = mapped_column(
        CITEXT(),
        nullable=True,
        unique=True,
    )

    journal: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    publisher: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    publication_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    publication_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    authors: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default=text("'[]'::jsonb"),
    )

    methodology: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    peer_reviewed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )

    resource: Mapped["Resource"] = relationship(
        back_populates="research_paper",
    )


class Policy(TimestampMixin, Base):
    __tablename__ = "policies"

    resource_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resources.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    policy_number: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    jurisdiction_code: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    issuing_authority: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    lifecycle_status: Mapped[PolicyLifecycleStatus] = mapped_column(
        SQLAlchemyEnum(
            PolicyLifecycleStatus,
            name="policy_lifecycle_status",
            values_callable=enum_values,
        ),
        nullable=False,
        default=PolicyLifecycleStatus.DRAFT,
    )

    effective_from: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    effective_until: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    legal_basis: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    resource: Mapped["Resource"] = relationship(
        back_populates="policy",
    )

    __table_args__ = (
        CheckConstraint(
            """
            effective_until IS NULL
            OR effective_from IS NULL
            OR effective_until >= effective_from
            """,
            name="policy_effective_date_range",
        ),
        Index(
            "ix_policies_jurisdiction_status",
            "jurisdiction_code",
            "lifecycle_status",
        ),
    )


class SpatialLayer(TimestampMixin, Base):
    __tablename__ = "spatial_layers"

    resource_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resources.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    geometry_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    srid: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=4326,
        server_default="4326",
    )

    storage_type: Mapped[SpatialStorageType] = mapped_column(
        SQLAlchemyEnum(
            SpatialStorageType,
            name="spatial_storage_type",
            values_callable=enum_values,
        ),
        nullable=False,
    )

    source_table: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
    )

    object_uri: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    service_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    tile_url_template: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    bounding_box: Mapped[Any | None] = mapped_column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326,
            spatial_index=False,
        ),
        nullable=True,
    )

    minimum_zoom: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    maximum_zoom: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    style_specification: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    resource: Mapped["Resource"] = relationship(
        back_populates="spatial_layer",
    )

    __table_args__ = (
        CheckConstraint(
            """
            minimum_zoom IS NULL
            OR maximum_zoom IS NULL
            OR maximum_zoom >= minimum_zoom
            """,
            name="spatial_layer_zoom_range",
        ),
        Index(
            "ix_spatial_layers_bbox_gist",
            "bounding_box",
            postgresql_using="gist",
        ),
    )


class SpatialFeature(CreatedAtMixin, Base):
    __tablename__ = "spatial_features"

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(),
        primary_key=True,
    )

    layer_version_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resource_versions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    external_id: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
    )

    geom: Mapped[Any] = mapped_column(
        Geometry(
            geometry_type="GEOMETRY",
            srid=4326,
            spatial_index=False,
        ),
        nullable=False,
    )

    properties: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    __table_args__ = (
        UniqueConstraint(
            "layer_version_id",
            "external_id",
            name="uq_spatial_feature_external_id",
        ),
        Index(
            "ix_spatial_features_layer_version",
            "layer_version_id",
        ),
        Index(
            "ix_spatial_features_geom_gist",
            "geom",
            postgresql_using="gist",
        ),
        Index(
            "ix_spatial_features_properties_gin",
            "properties",
            postgresql_using="gin",
        ),
    )
