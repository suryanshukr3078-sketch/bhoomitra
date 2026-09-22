from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.models.enums import ResourceStatus, ResourceType, ResourceVisibility
from app.models.identity import User
from app.models.resources import Policy, PolicyFeedback, Resource
from app.schemas.policies import (
    PolicyFeedbackCreate,
    PolicyFeedbackItem,
    PolicyFeedbackListResponse,
)

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get(
    "",
    summary="List or search published policies",
)
@limiter.limit("60/minute")
async def list_policies(
    request: Request,
    response: Response,
    q: str = Query(default="", description="Search query string"),
    jurisdiction: str | None = Query(default=None, description="Jurisdiction filter"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    response.headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=300"
    query = (
        select(Resource)
        .where(
            Resource.resource_type == ResourceType.POLICY,
            Resource.status == ResourceStatus.PUBLISHED,
            Resource.visibility == ResourceVisibility.PUBLIC,
        )
    )

    if q.strip():
        search_pattern = f"%{q.strip()}%"
        query = query.where(
            or_(
                Resource.title.ilike(search_pattern),
                Resource.abstract.ilike(search_pattern),
            )
        )

    query = query.order_by(Resource.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "query": q,
        "resource_type": "policy",
        "count": len(items),
        "limit": limit,
        "offset": offset,
        "items": [
            {
                "id": str(item.id),
                "title": item.title,
                "slug": item.slug,
                "abstract": item.abstract,
                "resource_type": item.resource_type.value,
                "status": item.status.value,
                "visibility": item.visibility.value,
                "publisher": item.publisher,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "is_demo": item.is_demo,
            }
            for item in items
        ],
    }


@router.get(
    "/{policy_id}",
    summary="Get single policy details by ID or slug",
)
@limiter.limit("60/minute")
async def get_policy(
    policy_id: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    from app.api.v1.routes.resources import get_resource

    return await get_resource(
        resource_id=policy_id,
        request=request,
        response=response,
        db=db,
    )


@router.get(
    "/{policy_id}/view",
    summary="View policy document file inline in browser",
)
async def view_policy_file(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
):
    from app.api.v1.routes.resources import view_resource_file

    return await view_resource_file(resource_id=policy_id, db=db)


@router.get(
    "/{policy_id}/download",
    summary="Download the policy document file",
)
async def download_policy_file(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
):
    from app.api.v1.routes.resources import download_resource_file

    return await download_resource_file(resource_id=policy_id, db=db)


async def _resolve_policy_resource_id(policy_id: str, db: AsyncSession) -> UUID:
    target_uuid: UUID | None = None
    try:
        target_uuid = UUID(policy_id)
    except ValueError:
        pass

    if target_uuid:
        res = await db.execute(select(Policy).where(Policy.resource_id == target_uuid))
        if res.scalar_one_or_none():
            return target_uuid

    query = select(Resource).where(
        Resource.resource_type == ResourceType.POLICY,
    )
    if target_uuid:
        query = query.where(Resource.id == target_uuid)
    else:
        query = query.where(Resource.slug == policy_id)

    res = await db.execute(query)
    resource = res.scalar_one_or_none()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy '{policy_id}' not found.",
        )
    return resource.id


@router.get(
    "/{policy_id}/feedback",
    response_model=PolicyFeedbackListResponse,
    summary="List public consultation comments and discussion feedback on a policy",
)
@limiter.limit("60/minute")
async def list_policy_feedback(
    policy_id: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> Any:
    resolved_id = await _resolve_policy_resource_id(policy_id, db)

    query = (
        select(PolicyFeedback)
        .options(selectinload(PolicyFeedback.user))
        .where(
            PolicyFeedback.policy_id == resolved_id,
            PolicyFeedback.is_flagged == False,
        )
        .order_by(PolicyFeedback.created_at.asc())
    )
    result = await db.execute(query)
    all_feedbacks = result.scalars().all()

    feedback_map: dict[UUID, dict[str, Any]] = {}
    top_level: list[dict[str, Any]] = []

    for f in all_feedbacks:
        user_role = "Citizen"
        if f.user:
            if f.user.is_superuser:
                user_role = "Platform Administrator"
            elif isinstance(f.user.profile, dict):
                user_role = f.user.profile.get("role") or "Citizen"

        item = {
            "id": f.id,
            "policy_id": f.policy_id,
            "user_id": f.user_id,
            "user_name": f.user.full_name if f.user else "Verified Citizen",
            "user_email": f.user.email if f.user else "citizen@gov.in",
            "user_role": user_role,
            "parent_id": f.parent_id,
            "comment": f.comment,
            "created_at": f.created_at,
            "replies": [],
        }
        feedback_map[f.id] = item

    for f in all_feedbacks:
        item = feedback_map[f.id]
        if f.parent_id and f.parent_id in feedback_map:
            feedback_map[f.parent_id]["replies"].append(item)
        else:
            top_level.append(item)

    return {
        "policy_id": str(resolved_id),
        "total_comments": len(all_feedbacks),
        "items": top_level,
    }


@router.post(
    "/{policy_id}/feedback",
    response_model=PolicyFeedbackItem,
    status_code=status.HTTP_201_CREATED,
    summary="Submit public consultation comment or feedback on a policy",
)
@limiter.limit("20/minute")
async def create_policy_feedback(
    policy_id: str,
    payload: PolicyFeedbackCreate,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    resolved_id = await _resolve_policy_resource_id(policy_id, db)

    if payload.parent_id:
        parent_res = await db.execute(
            select(PolicyFeedback).where(
                PolicyFeedback.id == payload.parent_id,
                PolicyFeedback.policy_id == resolved_id,
            )
        )
        if not parent_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent feedback comment does not exist for this policy.",
            )

    feedback = PolicyFeedback(
        policy_id=resolved_id,
        user_id=current_user.id,
        parent_id=payload.parent_id,
        comment=payload.comment.strip(),
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    user_role = "Citizen"
    if current_user.is_superuser:
        user_role = "Platform Administrator"
    elif isinstance(current_user.profile, dict):
        user_role = current_user.profile.get("role") or "Citizen"

    return PolicyFeedbackItem(
        id=feedback.id,
        policy_id=feedback.policy_id,
        user_id=feedback.user_id,
        user_name=current_user.full_name,
        user_email=current_user.email,
        user_role=user_role,
        parent_id=feedback.parent_id,
        comment=feedback.comment,
        created_at=feedback.created_at,
        replies=[],
    )


