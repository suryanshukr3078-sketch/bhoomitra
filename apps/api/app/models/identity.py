from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
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
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    MembershipStatus,
    OrganizationType,
    UserStatus,
    enum_values,
)


class Organization(
    UUIDPrimaryKeyMixin,
    TimestampMixin,
    Base,
):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
        unique=True,
    )

    organization_type: Mapped[OrganizationType] = mapped_column(
        SQLAlchemyEnum(
            OrganizationType,
            name="organization_type",
            values_callable=enum_values,
        ),
        nullable=False,
    )

    registration_number: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    country_code: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
        default="IN",
        server_default="IN",
    )

    state_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    extra_data: Mapped[dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    memberships: Mapped[list["OrganizationMembership"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class User(
    UUIDPrimaryKeyMixin,
    TimestampMixin,
    Base,
):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        CITEXT(),
        nullable=False,
        unique=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    status: Mapped[UserStatus] = mapped_column(
        SQLAlchemyEnum(
            UserStatus,
            name="user_status",
            values_callable=enum_values,
        ),
        nullable=False,
        default=UserStatus.PENDING,
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )

    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    external_identity_subject: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
        unique=True,
    )

    profile: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    memberships: Mapped[list["OrganizationMembership"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        Index(
            "ix_users_status_created_at",
            "status",
            "created_at",
        ),
    )


class OrganizationMembership(TimestampMixin, Base):
    __tablename__ = "organization_memberships"

    user_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    organization_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "organizations.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    title: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    status: Mapped[MembershipStatus] = mapped_column(
        SQLAlchemyEnum(
            MembershipStatus,
            name="membership_status",
            values_callable=enum_values,
        ),
        nullable=False,
        default=MembershipStatus.INVITED,
    )

    permissions: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )

    user: Mapped["User"] = relationship(
        back_populates="memberships",
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="memberships",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "organization_id",
            name="uq_membership_user_organization",
        ),
    )
