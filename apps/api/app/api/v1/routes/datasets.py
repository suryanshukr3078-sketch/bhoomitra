from typing import Any

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.models.enums import ResourceStatus, ResourceType, ResourceVisibility
from app.models.resources import Resource

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get(
    "",
    summary="List or search published datasets",
)
@limiter.limit("60/minute")
async def list_datasets(
    request: Request,
    response: Response,
    q: str = Query(default="", description="Search query string"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    query = (
        select(Resource)
        .where(
            Resource.resource_type.in_([ResourceType.DATASET, ResourceType.SPATIAL_LAYER]),
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
        "resource_type": "dataset",
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


@router.get(
    "/{dataset_id}",
    summary="Get single dataset details by ID or slug",
)
@limiter.limit("60/minute")
async def get_dataset(
    dataset_id: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    from app.api.v1.routes.resources import get_resource

    return await get_resource(
        resource_id=dataset_id,
        request=request,
        response=response,
        db=db,
    )

