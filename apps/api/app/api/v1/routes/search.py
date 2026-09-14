from typing import Any

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.models.enums import ResourceStatus, ResourceType, ResourceVisibility
from app.models.resources import Resource

router = APIRouter(prefix="/search", tags=["Search"])


@router.get(
    "",
    summary="Search resources with rate limiting and index optimization",
)
@limiter.limit("30/minute")
async def search_resources(
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
        if resource_type == ResourceType.DATASET:
            query = query.where(Resource.resource_type.in_([ResourceType.DATASET, ResourceType.SPATIAL_LAYER]))
        else:
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
                "publisher": item.publisher,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "is_demo": item.is_demo,
            }
            for item in items
        ],
    }


from pydantic import BaseModel, Field


class SemanticSearchRequest(BaseModel):
    query: str = Field(default="", description="Natural language search query")
    q: str | None = Field(default=None, description="Alias for query")
    resource_type: ResourceType | None = Field(default=None, description="Optional resource type filter")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of items to return")


@router.post(
    "/semantic",
    summary="Semantic AI vector search using Gemini embeddings & pgvector cosine similarity",
)
@router.get(
    "/semantic",
    summary="Semantic AI vector search using Gemini embeddings & pgvector cosine similarity (GET alias)",
)
@limiter.limit("30/minute")
async def semantic_search(
    request: Request,
    response: Response,
    payload: SemanticSearchRequest | None = None,
    q: str = Query(default="", description="Search query string for GET requests"),
    resource_type: ResourceType | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Resolve search text from JSON body or GET query parameter
    search_text = ""
    effective_type = resource_type
    effective_limit = limit

    if payload:
        search_text = (payload.query or payload.q or "").strip()
        if payload.resource_type:
            effective_type = payload.resource_type
        if payload.limit:
            effective_limit = payload.limit

    if not search_text:
        search_text = q.strip()

    if not search_text:
        return {
            "query": "",
            "semantic": True,
            "fallback": False,
            "count": 0,
            "limit": effective_limit,
            "items": [],
        }

    # 1. Attempt AI Semantic Search via Gemini embeddings and pgvector
    try:
        from app.models.resources import ResourceVersion
        from app.services.embedding_service import generate_embedding

        query_embedding = generate_embedding(search_text, allow_fallback=True)

        if query_embedding:
            from sqlalchemy import Float, cast

            # Cosine distance operator in pgvector: <=>
            # Cosine similarity: 1 - distance
            distance_expr = cast(ResourceVersion.embedding.op("<=>")(query_embedding), Float)

            stmt = (
                select(Resource, distance_expr.label("distance"))
                .join(ResourceVersion, Resource.id == ResourceVersion.resource_id)
                .where(
                    Resource.status == ResourceStatus.PUBLISHED,
                    Resource.visibility == ResourceVisibility.PUBLIC,
                    ResourceVersion.embedding.isnot(None),
                )
            )

            if effective_type:
                if effective_type == ResourceType.DATASET:
                    stmt = stmt.where(Resource.resource_type.in_([ResourceType.DATASET, ResourceType.SPATIAL_LAYER]))
                else:
                    stmt = stmt.where(Resource.resource_type == effective_type)

            stmt = stmt.order_by(distance_expr.asc()).limit(effective_limit * 2)
            res = await db.execute(stmt)
            rows = res.all()

            seen_ids = set()
            items = []
            for resource, dist in rows:
                if resource.id not in seen_ids:
                    seen_ids.add(resource.id)
                    sim_score = round(max(0.0, min(1.0, 1.0 - float(dist))), 4)
                    items.append(
                        {
                            "id": str(resource.id),
                            "title": resource.title,
                            "slug": resource.slug,
                            "abstract": resource.abstract,
                            "resource_type": resource.resource_type.value,
                            "status": resource.status.value,
                            "visibility": resource.visibility.value,
                            "publisher": resource.publisher,
                            "similarity_score": sim_score,
                            "created_at": resource.created_at.isoformat() if resource.created_at else None,
                            "is_demo": resource.is_demo,
                        }
                    )
                    if len(items) >= effective_limit:
                        break

            if len(items) > 0:
                return {
                    "query": search_text,
                    "semantic": True,
                    "fallback": False,
                    "count": len(items),
                    "limit": effective_limit,
                    "items": items,
                }
    except Exception as err:
        import structlog
        structlog.get_logger(__name__).warning("Semantic vector search failed, falling back to keyword search", error=str(err))

    # 2. Graceful Fallback to Keyword Search
    pattern = f"%{search_text}%"
    fallback_query = select(Resource).where(
        Resource.status == ResourceStatus.PUBLISHED,
        Resource.visibility == ResourceVisibility.PUBLIC,
        or_(
            Resource.title.ilike(pattern),
            Resource.abstract.ilike(pattern),
        ),
    )

    if effective_type:
        if effective_type == ResourceType.DATASET:
            fallback_query = fallback_query.where(Resource.resource_type.in_([ResourceType.DATASET, ResourceType.SPATIAL_LAYER]))
        else:
            fallback_query = fallback_query.where(Resource.resource_type == effective_type)

    fallback_query = fallback_query.order_by(Resource.created_at.desc()).limit(effective_limit)
    fallback_res = await db.execute(fallback_query)
    fallback_items = fallback_res.scalars().all()

    return {
        "query": search_text,
        "semantic": False,
        "fallback": True,
        "count": len(fallback_items),
        "limit": effective_limit,
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
                "similarity_score": 1.0,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "is_demo": item.is_demo,
            }
            for item in fallback_items
        ],
    }
