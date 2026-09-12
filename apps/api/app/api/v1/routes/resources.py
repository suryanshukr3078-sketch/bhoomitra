import re
from datetime import date, datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_optional_current_user
from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.models.enums import (
    OrganizationType,
    PolicyLifecycleStatus,
    ResourceStatus,
    ResourceType,
    ResourceVisibility,
    UserStatus,
)
from app.models.identity import Organization, User
from app.models.resources import Policy, ResearchPaper, Resource

router = APIRouter(prefix="/resources", tags=["Resources"])


class ResourceSubmission(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    abstract: str = Field(..., min_length=10)
    resource_type: ResourceType = ResourceType.RESEARCH_PAPER
    visibility: ResourceVisibility = ResourceVisibility.PUBLIC
    status: ResourceStatus = ResourceStatus.PUBLISHED
    jurisdiction: str | None = None
    journal: str | None = None
    doi: str | None = None
    publication_year: int | None = None
    source_url: str | None = None


def generate_slug(title: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", title.lower()).strip()
    slug_base = re.sub(r"[-\s]+", "-", cleaned)[:80]
    return f"{slug_base}-{uuid4().hex[:8]}"


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create or submit a new resource",
)
@limiter.limit("20/minute")
async def create_resource(
    payload: ResourceSubmission,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> dict[str, Any]:
    try:
        # 1. Resolve Creator User
        user_id = current_user.id if current_user else None
        if not user_id:
            user_res = await db.execute(select(User).limit(1))
            existing_user = user_res.scalars().first()
            if existing_user:
                user_id = existing_user.id
            else:
                new_user = User(
                    email="contributor@landgovernance.org",
                    full_name="Registry Contributor",
                    status=UserStatus.ACTIVE,
                    is_superuser=False,
                )
                db.add(new_user)
                await db.flush()
                user_id = new_user.id

        # 2. Resolve Owner Organization
        org_res = await db.execute(select(Organization).limit(1))
        existing_org = org_res.scalars().first()
        if existing_org:
            org_id = existing_org.id
        else:
            new_org = Organization(
                name="National Land Governance Observatory",
                slug=f"national-land-observatory-{uuid4().hex[:6]}",
                organization_type=OrganizationType.GOVERNMENT,
            )
            db.add(new_org)
            await db.flush()
            org_id = new_org.id

        # 3. Create Resource
        slug = generate_slug(payload.title)
        resource = Resource(
            title=payload.title,
            slug=slug,
            abstract=payload.abstract,
            resource_type=payload.resource_type,
            status=payload.status,
            visibility=payload.visibility,
            owner_organization_id=org_id,
            created_by_id=user_id,
            source_url=payload.source_url,
            published_at=datetime.now(timezone.utc) if payload.status == ResourceStatus.PUBLISHED else None,
            is_demo=False,
        )
        db.add(resource)
        await db.flush()

        # 4. Create child entity based on resource_type
        if payload.resource_type == ResourceType.RESEARCH_PAPER:
            paper = ResearchPaper(
                resource_id=resource.id,
                journal=payload.journal or "Land Governance Journal",
                doi=payload.doi,
                publication_date=date(
                    payload.publication_year or datetime.now(timezone.utc).year,
                    1,
                    1,
                ),
                publication_type="Journal Article",
                authors=[{"name": "Contributor", "affiliation": "Observatory"}],
                peer_reviewed=True,
            )
            db.add(paper)
        elif payload.resource_type == ResourceType.POLICY:
            policy = Policy(
                resource_id=resource.id,
                jurisdiction_code=payload.jurisdiction or "IN-MH",
                lifecycle_status=PolicyLifecycleStatus.IN_FORCE,
            )
            db.add(policy)

        await db.commit()
        await db.refresh(resource)

        return {
            "id": str(resource.id),
            "title": resource.title,
            "slug": resource.slug,
            "resource_type": resource.resource_type.value,
            "status": resource.status.value,
            "visibility": resource.visibility.value,
            "created_at": resource.created_at.isoformat(),
        }
    except Exception:
        await db.rollback()
        raise


@router.get(
    "",
    summary="List or query published resources",
)
@limiter.limit("60/minute")
async def list_resources(
    request: Request,
    response: Response,
    q: str = Query(default="", description="Search query string"),
    resource_type: ResourceType | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    query = select(Resource).where(
        Resource.status == ResourceStatus.PUBLISHED,
        Resource.visibility == ResourceVisibility.PUBLIC,
    )

    if resource_type:
        query = query.where(Resource.resource_type == resource_type)

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
        "resource_type": resource_type.value if resource_type else None,
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
                "created_at": item.created_at.isoformat(),
                "is_demo": item.is_demo,
            }
            for item in items
        ],
    }
