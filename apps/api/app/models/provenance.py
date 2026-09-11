from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy import (
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.dialects.postgresql import (
    JSONB,
)
from sqlalchemy.dialects.postgresql import (
    UUID as PostgreSQLUUID,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import CreatedAtMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    EvidenceRelation,
    ProvenanceActivityStatus,
    ProvenanceRelation,
    enum_values,
)


class ProvenanceActivity(
    UUIDPrimaryKeyMixin,
    CreatedAtMixin,
    Base,
):
    __tablename__ = "provenance_activities"

    activity_type: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    status: Mapped[ProvenanceActivityStatus] = mapped_column(
        SQLAlchemyEnum(
            ProvenanceActivityStatus,
            name="provenance_activity_status",
            values_callable=enum_values,
        ),
        nullable=False,
        default=ProvenanceActivityStatus.STARTED,
    )

    actor_user_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    actor_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        default="system",
        server_default="system",
    )

    software_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    software_version: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    parameters: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    environment: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    request_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    __table_args__ = (
        Index(
            "ix_provenance_activities_type_started",
            "activity_type",
            "started_at",
        ),
        Index(
            "ix_provenance_activities_request",
            "request_id",
        ),
    )


class ProvenanceEdge(
    UUIDPrimaryKeyMixin,
    CreatedAtMixin,
    Base,
):
    __tablename__ = "provenance_edges"

    source_version_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resource_versions.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    target_version_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resource_versions.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    activity_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "provenance_activities.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    relationship: Mapped[ProvenanceRelation] = mapped_column(
        SQLAlchemyEnum(
            ProvenanceRelation,
            name="provenance_relation",
            values_callable=enum_values,
        ),
        nullable=False,
    )

    source_locator: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "source_version_id <> target_version_id",
            name="provenance_versions_must_differ",
        ),
        Index(
            "ix_provenance_edges_source",
            "source_version_id",
        ),
        Index(
            "ix_provenance_edges_target",
            "target_version_id",
        ),
        Index(
            "ix_provenance_edges_relationship",
            "relationship",
        ),
    )


class EvidenceClaim(
    UUIDPrimaryKeyMixin,
    CreatedAtMixin,
    Base,
):
    __tablename__ = "evidence_claims"

    resource_version_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resource_versions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    claim_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    claim_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="statement",
        server_default="statement",
    )

    source_locator: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    extraction_method: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    created_by_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    __table_args__ = (
        Index(
            "ix_evidence_claims_resource_version",
            "resource_version_id",
        ),
    )


class EvidenceLink(
    UUIDPrimaryKeyMixin,
    CreatedAtMixin,
    Base,
):
    __tablename__ = "evidence_links"

    claim_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "evidence_claims.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    evidence_version_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "resource_versions.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    relationship: Mapped[EvidenceRelation] = mapped_column(
        SQLAlchemyEnum(
            EvidenceRelation,
            name="evidence_relation",
            values_callable=enum_values,
        ),
        nullable=False,
    )

    confidence: Mapped[Decimal] = mapped_column(
        Numeric(
            precision=4,
            scale=3,
        ),
        nullable=False,
        default=Decimal("1.000"),
    )

    evidence_locator: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "claim_id",
            "evidence_version_id",
            "relationship",
            name="uq_evidence_claim_source_relation",
        ),
        CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="evidence_confidence_range",
        ),
        Index(
            "ix_evidence_links_evidence_version",
            "evidence_version_id",
        ),
    )
