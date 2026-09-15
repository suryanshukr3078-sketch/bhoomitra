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
    effective_type = (
        resource_type
        if isinstance(resource_type, ResourceType)
        else (payload.resource_type if payload and isinstance(payload.resource_type, ResourceType) else None)
    )
    effective_limit = limit if isinstance(limit, int) else (payload.limit if payload and payload.limit else 10)

    if payload:
        search_text = (payload.query or payload.q or "").strip()
        if payload.limit:
            effective_limit = payload.limit

    if not search_text and isinstance(q, str):
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

            from app.services.embedding_service import get_effective_gemini_api_key

            has_gemini = bool(get_effective_gemini_api_key())

            if len(items) > 0:
                return {
                    "query": search_text,
                    "semantic": True,
                    "fallback": False,
                    "provider": "gemini" if has_gemini else "vector_index",
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
        "provider": "keyword_fallback",
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


class AssistantSearchRequest(BaseModel):
    question: str = Field(..., min_length=2, description="User question to answer using platform evidence")
    limit: int = Field(default=5, ge=1, le=10, description="Maximum number of context resources to retrieve")


class AssistantCitation(BaseModel):
    id: str
    title: str
    resource_type: str
    slug: str | None = None
    abstract: str | None = None
    publisher: str | None = None
    similarity_score: float | None = None


class AssistantSearchResponse(BaseModel):
    question: str
    answer: str
    sources: list[AssistantCitation]
    disclaimer: str
    provider: str


@router.post(
    "/assistant",
    summary="Evidence Search Assistant RAG endpoint with grounded citations & rate limiting",
)
@router.get(
    "/assistant",
    summary="Evidence Search Assistant RAG endpoint (GET alias)",
)
@limiter.limit("10/minute")
async def assistant_evidence_search(
    request: Request,
    response: Response,
    payload: AssistantSearchRequest | None = None,
    q: str = Query(default="", description="Question string for GET requests"),
    limit: int = Query(default=5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    question_text = ""
    effective_limit = limit

    if payload:
        question_text = (payload.question or "").strip()
        if payload.limit:
            effective_limit = payload.limit

    if not question_text:
        question_text = q.strip()

    if not question_text:
        from app.services.assistant_service import DISCLAIMER_TEXT, INSUFFICIENT_INFO_ANSWER

        return {
            "question": "",
            "answer": INSUFFICIENT_INFO_ANSWER,
            "sources": [],
            "disclaimer": DISCLAIMER_TEXT,
            "provider": "grounded_validation",
        }

    # 1. Retrieve relevant published resources via Hybrid Search (Vector + Keyword)
    retrieved_items = []
    seen_ids = set()

    # A. Keyword term retrieval to ensure exact domain matches (PostGIS, Maharashtra, Drone, etc.)
    import re
    stop_words = {
        "what", "when", "where", "which", "who", "whom", "this", "that", "these", "those",
        "have", "from", "with", "about", "into", "through", "during", "before", "after",
        "above", "below", "does", "help", "prevent", "tell", "give", "show", "need", "some",
        "more", "much", "many", "such", "there", "their", "they", "them", "then", "than"
    }
    tokens = [
        w for w in re.findall(r"[a-zA-Z0-9_-]+", question_text.lower())
        if len(w) >= 3 and w not in stop_words
    ]

    keyword_items = []
    if tokens:
        kw_conditions = []
        for tok in tokens[:6]:
            kw_conditions.append(Resource.title.ilike(f"%{tok}%"))
            kw_conditions.append(Resource.abstract.ilike(f"%{tok}%"))

        if kw_conditions:
            kw_stmt = (
                select(Resource)
                .where(
                    Resource.status == ResourceStatus.PUBLISHED,
                    Resource.visibility == ResourceVisibility.PUBLIC,
                    or_(*kw_conditions),
                )
                .order_by(Resource.created_at.desc())
                .limit(effective_limit)
            )
            try:
                kw_res = await db.execute(kw_stmt)
                for r in kw_res.scalars().all():
                    keyword_items.append({
                        "id": str(r.id),
                        "title": r.title,
                        "slug": r.slug,
                        "abstract": r.abstract,
                        "resource_type": r.resource_type.value,
                        "status": r.status.value,
                        "visibility": r.visibility.value,
                        "publisher": r.publisher,
                        "similarity_score": 0.88,
                        "created_at": r.created_at.isoformat() if r.created_at else None,
                        "is_demo": r.is_demo,
                    })
            except Exception as kw_err:
                import structlog
                structlog.get_logger(__name__).warning("Keyword search inside assistant failed", error=str(kw_err))

    # B. Semantic vector retrieval (timeout guarded to 3.0s max)
    try:
        import asyncio

        semantic_result = await asyncio.wait_for(
            semantic_search(
                request=request,
                response=response,
                payload=SemanticSearchRequest(query=question_text, limit=effective_limit * 2),
                resource_type=None,
                limit=effective_limit * 2,
                db=db,
            ),
            timeout=3.0,
        )
        vector_items = semantic_result.get("items", [])
    except Exception as search_err:
        import structlog
        structlog.get_logger(__name__).warning("Semantic search inside assistant skipped or timed out", error=str(search_err))
        vector_items = []

    # C. Merge items prioritizing keyword relevance then semantic similarity
    for item in keyword_items:
        if item["id"] not in seen_ids:
            seen_ids.add(item["id"])
            retrieved_items.append(item)
            if len(retrieved_items) >= effective_limit:
                break

    for item in vector_items:
        if item["id"] not in seen_ids:
            seen_ids.add(item["id"])
            retrieved_items.append(item)
            if len(retrieved_items) >= effective_limit:
                break

    # 2. Synthesize grounded answer with citations using Gemini RAG
    from app.services.assistant_service import generate_rag_answer

    return generate_rag_answer(
        question=question_text,
        resources=retrieved_items,
    )

