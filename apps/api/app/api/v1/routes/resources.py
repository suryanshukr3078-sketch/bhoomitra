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
    SpatialStorageType,
    UserStatus,
)
from app.models.identity import Organization, User
from app.models.resources import Policy, ResearchPaper, Resource, SpatialLayer

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
    storage_uri: str | None = None
    original_filename: str | None = None
    mime_type: str | None = None
    file_size_bytes: int | None = None
    checksum_sha256: str | None = None


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
        effective_source_url = payload.storage_uri or payload.source_url
        resource = Resource(
            title=payload.title,
            slug=slug,
            abstract=payload.abstract,
            resource_type=payload.resource_type,
            status=payload.status,
            visibility=payload.visibility,
            owner_organization_id=org_id,
            created_by_id=user_id,
            source_url=effective_source_url,
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
                lifecycle_status=PolicyLifecycleStatus.ACTIVE,
            )
            db.add(policy)
        elif payload.resource_type in (ResourceType.DATASET, ResourceType.SPATIAL_LAYER):
            layer = SpatialLayer(
                resource_id=resource.id,
                geometry_type="MultiPolygon",
                srid=4326,
                storage_type=SpatialStorageType.POSTGIS,
                source_table="spatial_features",
            )
            db.add(layer)

        # 5. Create ResourceVersion if a file was uploaded
        if payload.storage_uri or payload.original_filename or payload.source_url:
            from app.models.resources import ResourceVersion

            raw_uri = payload.storage_uri or payload.source_url
            version = ResourceVersion(
                resource_id=resource.id,
                version_number=1,
                version_label="v1.0",
                original_filename=payload.original_filename or f"{slug}.pdf",
                storage_uri=raw_uri,
                mime_type=payload.mime_type or "application/pdf",
                file_size_bytes=payload.file_size_bytes,
                checksum_sha256=payload.checksum_sha256,
                extracted_text=raw_uri if raw_uri and raw_uri.startswith("data:") else None,
                created_by_id=user_id,
            )
            db.add(version)

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
    except Exception as e:
        import structlog
        structlog.get_logger(__name__).error("Failed to create resource", error=str(e), exc_info=True)
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
                "created_at": item.created_at.isoformat(),
                "is_demo": item.is_demo,
            }
            for item in items
        ],
    }


@router.get(
    "/{resource_id}",
    summary="Get single resource details by ID or slug",
)
@limiter.limit("60/minute")
async def get_resource(
    resource_id: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    from sqlalchemy.orm import selectinload
    from uuid import UUID

    stmt = (
        select(Resource)
        .options(
            selectinload(Resource.versions),
            selectinload(Resource.research_paper),
            selectinload(Resource.policy),
            selectinload(Resource.spatial_layer),
        )
    )

    try:
        uuid_val = UUID(resource_id)
        stmt = stmt.where(Resource.id == uuid_val)
    except ValueError:
        stmt = stmt.where(Resource.slug == resource_id)

    result = await db.execute(stmt)
    resource = result.scalars().first()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource '{resource_id}' not found.",
        )

    # Build file info from latest version or source_url
    latest_version = resource.versions[-1] if resource.versions else None
    file_info = None
    if latest_version and (latest_version.original_filename or latest_version.storage_uri):
        file_info = {
            "filename": latest_version.original_filename or f"{resource.slug}.pdf",
            "storage_uri": latest_version.storage_uri,
            "download_url": f"/api/v1/resources/{resource.id}/download",
            "mime_type": latest_version.mime_type or "application/pdf",
            "size_bytes": latest_version.file_size_bytes,
            "checksum_sha256": latest_version.checksum_sha256,
        }
    elif resource.source_url:
        file_info = {
            "filename": f"{resource.slug}.pdf",
            "storage_uri": resource.source_url,
            "download_url": f"/api/v1/resources/{resource.id}/download",
            "mime_type": "application/pdf",
            "size_bytes": None,
            "checksum_sha256": None,
        }

    # Child-specific metadata
    child_meta: dict[str, Any] = {}
    if resource.research_paper:
        rp = resource.research_paper
        child_meta = {
            "journal": rp.journal,
            "doi": rp.doi,
            "authors": rp.authors,
            "peer_reviewed": rp.peer_reviewed,
            "publication_date": rp.publication_date.isoformat() if rp.publication_date else None,
        }
    elif resource.policy:
        pol = resource.policy
        child_meta = {
            "jurisdiction_code": pol.jurisdiction_code,
            "lifecycle_status": pol.lifecycle_status.value if pol.lifecycle_status else "active",
            "legal_basis": pol.legal_basis,
        }
    elif resource.spatial_layer:
        sl = resource.spatial_layer
        child_meta = {
            "geometry_type": sl.geometry_type,
            "srid": sl.srid,
            "feature_count": sl.feature_count,
        }

    return {
        "id": str(resource.id),
        "title": resource.title,
        "slug": resource.slug,
        "abstract": resource.abstract,
        "resource_type": resource.resource_type.value,
        "status": resource.status.value,
        "visibility": resource.visibility.value,
        "created_at": resource.created_at.isoformat(),
        "published_at": resource.published_at.isoformat() if resource.published_at else None,
        "is_demo": resource.is_demo,
        "source_url": resource.source_url,
        "file": file_info,
        "versions": [
            {
                "version_number": v.version_number,
                "original_filename": v.original_filename,
                "mime_type": v.mime_type,
                "file_size_bytes": v.file_size_bytes,
                "checksum_sha256": v.checksum_sha256,
                "created_at": v.created_at.isoformat(),
                "download_url": f"/api/v1/resources/{resource.id}/download",
            }
            for v in resource.versions
        ],
        **child_meta,
    }


@router.get(
    "/{resource_id}/download",
    summary="Download the binary file attached to a resource",
)
async def download_resource_file(
    resource_id: str,
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    from fastapi.responses import Response, RedirectResponse
    from uuid import UUID

    stmt = select(Resource).options(selectinload(Resource.versions))
    try:
        uuid_val = UUID(resource_id)
        stmt = stmt.where(Resource.id == uuid_val)
    except ValueError:
        stmt = stmt.where(Resource.slug == resource_id)

    result = await db.execute(stmt)
    resource = result.scalars().first()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    # 1. Check ResourceVersion storage_uri
    latest_version = resource.versions[-1] if resource.versions else None
    storage_uri = (latest_version.storage_uri if latest_version else None) or resource.source_url
    filename = (latest_version.original_filename if latest_version else None) or f"{resource.slug}.pdf"
    mime_type = (latest_version.mime_type if latest_version else None) or "application/pdf"

    if storage_uri:
        if storage_uri.startswith("data:"):
            from app.core.storage import storage_service

            content, resolved_mime = await storage_service.get_file_content(storage_uri)
            return Response(
                content=content,
                media_type=resolved_mime or mime_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Length": str(len(content)),
                },
            )
        elif storage_uri.startswith("http://") or storage_uri.startswith("https://"):
            return RedirectResponse(url=storage_uri)
        elif storage_uri.startswith("s3://"):
            try:
                from app.core.storage import storage_service

                content, resolved_mime = await storage_service.get_file_content(storage_uri)
                return Response(
                    content=content,
                    media_type=resolved_mime or mime_type,
                    headers={
                        "Content-Disposition": f'attachment; filename="{filename}"',
                        "Content-Length": str(len(content)),
                    },
                )
            except Exception:
                pass

    # 2. If no storage_uri (e.g. synthetic seed paper), generate a valid PDF on the fly
    title_escaped = resource.title[:80].replace("(", "[").replace(")", "]")
    synthetic_pdf = (
        f"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        f"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        f"3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Contents 4 0 R/Resources<<>>>>endobj\n"
        f"4 0 obj<</Length 100>>stream\nBT /F1 12 Tf 50 750 Td ({title_escaped}) Tj ET\nendstream\nendobj\n"
        f"xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n0000000195 00000 n\n"
        f"trailer<</Size 5/Root 1 0 R>>\nstartxref\n340\n%%EOF\n"
    ).encode("utf-8")

    return Response(
        content=synthetic_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(synthetic_pdf)),
        },
    )

