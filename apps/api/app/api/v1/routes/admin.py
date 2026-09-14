import structlog
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies.auth import require_admin
from app.api.dependencies.db import get_db
from app.models.enums import MembershipStatus, UserStatus
from app.models.identity import Organization, OrganizationMembership, User
from app.schemas.admin import (
    AdminOrgItem,
    AdminOrgListResponse,
    AdminUserItem,
    AdminUserListResponse,
    MembershipActionResponse,
)

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/admin", tags=["Administration"])


def parse_uuid_safely(val: str) -> UUID | None:
    try:
        return UUID(val)
    except (ValueError, TypeError, AttributeError):
        return None


@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="List all registered users with organization details (Admin only)",
)
async def list_admin_users(
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Any:
    query = (
        select(User)
        .options(
            selectinload(User.memberships).selectinload(OrganizationMembership.organization)
        )
        .order_by(User.created_at.desc())
    )

    if status_filter and status_filter.lower() != "all":
        try:
            target_status = UserStatus(status_filter.lower())
            query = query.where(User.status == target_status)
        except ValueError:
            pass

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(User.full_name).like(term),
                func.lower(User.email).like(term),
            )
        )

    result = await db.execute(query)
    users = result.scalars().all()

    items: list[AdminUserItem] = []
    for user in users:
        primary_mem = None
        if user.memberships:
            pending_mems = [m for m in user.memberships if m.status == MembershipStatus.PENDING]
            primary_mem = pending_mems[0] if pending_mems else user.memberships[0]

        org_name = primary_mem.organization.name if primary_mem and primary_mem.organization else None
        org_id = primary_mem.organization_id if primary_mem else None
        org_type = (
            primary_mem.organization.organization_type.value
            if primary_mem and primary_mem.organization
            else None
        )
        cat = primary_mem.title if primary_mem and primary_mem.title else org_type

        if category and cat and category.lower() not in cat.lower():
            continue

        mem_status = primary_mem.status.value if primary_mem else None
        role_label = "admin" if user.is_superuser else "CITIZEN"

        items.append(
            AdminUserItem(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                organization_name=org_name,
                organization_id=org_id,
                organization_type=org_type,
                category=cat,
                membership_status=mem_status,
                user_status=user.status.value,
                role=role_label,
                is_superuser=user.is_superuser,
                created_at=getattr(user, "created_at", None),
            )
        )

    return AdminUserListResponse(users=items, total=len(items))


@router.get(
    "/organizations",
    response_model=AdminOrgListResponse,
    summary="List all registered organizations with member count (Admin only)",
)
async def list_admin_organizations(
    search: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Any:
    subq = (
        select(
            OrganizationMembership.organization_id,
            func.count(OrganizationMembership.user_id).label("member_count"),
        )
        .group_by(OrganizationMembership.organization_id)
        .subquery()
    )

    query = (
        select(Organization, func.coalesce(subq.c.member_count, 0))
        .outerjoin(subq, Organization.id == subq.c.organization_id)
        .order_by(Organization.created_at.desc())
    )

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(func.lower(Organization.name).like(term))

    result = await db.execute(query)
    rows = result.all()

    items: list[AdminOrgItem] = []
    for org, member_count in rows:
        items.append(
            AdminOrgItem(
                id=org.id,
                name=org.name,
                slug=org.slug,
                organization_type=org.organization_type.value,
                member_count=int(member_count),
                is_active=org.is_active,
                created_at=getattr(org, "created_at", None),
            )
        )

    return AdminOrgListResponse(organizations=items, total=len(items))


async def _resolve_membership(
    membership_id: str,
    db: AsyncSession,
) -> OrganizationMembership:
    # 1. Try parsing as direct UUID matching user_id
    parsed_id = parse_uuid_safely(membership_id)
    if parsed_id:
        stmt = (
            select(OrganizationMembership)
            .where(OrganizationMembership.user_id == parsed_id)
            .order_by(OrganizationMembership.created_at.desc())
        )
        result = await db.execute(stmt)
        mem = result.scalars().first()
        if mem:
            return mem

        stmt_org = (
            select(OrganizationMembership)
            .where(OrganizationMembership.organization_id == parsed_id)
            .order_by(OrganizationMembership.created_at.desc())
        )
        result_org = await db.execute(stmt_org)
        mem_org = result_org.scalars().first()
        if mem_org:
            return mem_org

    # 2. Try composite user_id:org_id or user_id_org_id
    parts = membership_id.replace(":", "_").split("_")
    if len(parts) >= 2:
        u_id = parse_uuid_safely(parts[0])
        o_id = parse_uuid_safely(parts[1])
        if u_id and o_id:
            stmt_comp = select(OrganizationMembership).where(
                OrganizationMembership.user_id == u_id,
                OrganizationMembership.organization_id == o_id,
            )
            res = await db.execute(stmt_comp)
            mem_comp = res.scalar_one_or_none()
            if mem_comp:
                return mem_comp

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Organization membership not found for identifier: {membership_id}",
    )


@router.patch(
    "/memberships/{membership_id}/approve",
    response_model=MembershipActionResponse,
    summary="Approve pending organization membership registration (Admin only)",
)
async def approve_membership(
    membership_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Any:
    membership = await _resolve_membership(membership_id, db)

    membership.status = MembershipStatus.ACTIVE

    # Also activate the user record so they can log in
    user = await db.get(User, membership.user_id)
    if user:
        user.status = UserStatus.ACTIVE

    await db.commit()

    # Log notification
    logger.info(
        "Admin approved organization membership",
        admin_id=str(admin_user.id),
        admin_email=admin_user.email,
        target_user_id=str(membership.user_id),
        target_organization_id=str(membership.organization_id),
        new_membership_status=MembershipStatus.ACTIVE.value,
        new_user_status=UserStatus.ACTIVE.value,
    )
    # TODO: Connect real email service / transactional notification dispatch

    return MembershipActionResponse(
        status="success",
        message="Membership and user account approved successfully.",
        user_id=membership.user_id,
        membership_status=MembershipStatus.ACTIVE.value,
        user_status=UserStatus.ACTIVE.value,
    )


@router.patch(
    "/memberships/{membership_id}/reject",
    response_model=MembershipActionResponse,
    summary="Reject pending organization membership registration (Admin only)",
)
async def reject_membership(
    membership_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Any:
    membership = await _resolve_membership(membership_id, db)

    membership.status = MembershipStatus.REMOVED

    # Prevent user from logging in or accessing role-restricted features
    user = await db.get(User, membership.user_id)
    if user:
        user.status = UserStatus.SUSPENDED

    await db.commit()

    # Log notification
    logger.info(
        "Admin rejected organization membership",
        admin_id=str(admin_user.id),
        admin_email=admin_user.email,
        target_user_id=str(membership.user_id),
        target_organization_id=str(membership.organization_id),
        new_membership_status=MembershipStatus.REMOVED.value,
        new_user_status=UserStatus.SUSPENDED.value,
    )

    return MembershipActionResponse(
        status="success",
        message="Membership rejected and user access suspended.",
        user_id=membership.user_id,
        membership_status=MembershipStatus.REMOVED.value,
        user_status=UserStatus.SUSPENDED.value,
    )
