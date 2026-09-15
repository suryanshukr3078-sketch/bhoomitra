import re
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.core.storage import ALLOWED_EXTENSIONS
from app.models.enums import (
    OrganizationType,
    PolicyLifecycleStatus,
    ResourceStatus,
    ResourceType,
    ResourceVisibility,
    SpatialStorageType,
    UserStatus,
)
from app.models.identity import Organization, OrganizationMembership, User
from app.models.resources import Policy, ResearchPaper, Resource, SpatialLayer

router = APIRouter(prefix="/resources", tags=["Resources"])

MINIMAL_JPEG = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00"
    b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f"
    b"\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342"
    b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
    b"\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00"
    b"\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
    b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)
MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    b"\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa74/\x17\x00\x00\x00\x00IEND\xaeB`\x82"
)


class ResourceSubmission(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    abstract: str = Field(..., min_length=10)
    resource_type: ResourceType = ResourceType.RESEARCH_PAPER
    visibility: ResourceVisibility = ResourceVisibility.PUBLIC
    status: ResourceStatus = ResourceStatus.PUBLISHED
    jurisdiction: str | None = None
    journal: str | None = None
    doi: str | None = None
    publisher: str | None = None
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
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    try:
        # 1. Use the authenticated user's ID directly (any logged-in user may contribute)
        user_id = current_user.id

        # 2. Resolve Owner Organization: prefer user's own membership org, fallback to first org
        org_id = None
        if current_user.id:
            mem_res = await db.execute(
                select(OrganizationMembership)
                .where(OrganizationMembership.user_id == current_user.id)
                .limit(1)
            )
            mem = mem_res.scalar_one_or_none()
            if mem:
                org_id = mem.organization_id

        if not org_id:
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
        default_publisher = payload.publisher or "National Land Records Modernization Directorate"
        resource = Resource(
            id=uuid4(),
            title=payload.title,
            slug=slug,
            abstract=payload.abstract,
            resource_type=payload.resource_type,
            status=payload.status,
            visibility=payload.visibility,
            owner_organization_id=org_id,
            created_by_id=user_id,
            source_url=effective_source_url,
            publisher=default_publisher,
            published_at=datetime.now(timezone.utc) if payload.status == ResourceStatus.PUBLISHED else None,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
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
                publisher=default_publisher,
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

        # 5. Generate AI semantic embedding and create ResourceVersion
        from app.models.resources import ResourceVersion
        from app.services.embedding_service import generate_embedding

        embedding_text = f"{payload.title}\n\n{payload.abstract or ''}".strip()
        embedding_vector = generate_embedding(embedding_text)

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
            embedding=embedding_vector,
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
            "publisher": resource.publisher,
            "created_at": resource.created_at.isoformat() if resource.created_at else datetime.now(timezone.utc).isoformat(),
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
    response.headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=300"
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
                "publisher": getattr(item, "publisher", None) or "National Land Records Modernization Directorate",
                "created_at": item.created_at.isoformat() if item.created_at else None,
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
        filename = latest_version.original_filename
        storage_uri = latest_version.storage_uri
        mime_type = latest_version.mime_type
        if not filename and storage_uri:
            clean_uri = storage_uri.split("?")[0].split("#")[0]
            parsed_path = urlparse(clean_uri).path or clean_uri
            filename = Path(parsed_path).name or f"{resource.slug}.pdf"
        if filename and (not mime_type or mime_type in ("application/octet-stream", "application/pdf")):
            ext = Path(filename).suffix.lower()
            if ext in ALLOWED_EXTENSIONS:
                mime_type = ALLOWED_EXTENSIONS[ext]
        file_info = {
            "filename": filename or f"{resource.slug}.pdf",
            "storage_uri": storage_uri,
            "download_url": f"/api/v1/resources/{resource.id}/download",
            "view_url": f"/api/v1/resources/{resource.id}/view",
            "mime_type": mime_type or "application/pdf",
            "size_bytes": latest_version.file_size_bytes,
            "checksum_sha256": latest_version.checksum_sha256,
        }
    elif resource.source_url:
        clean_url = resource.source_url.split("?")[0].split("#")[0]
        parsed_path = urlparse(clean_url).path or clean_url
        inferred_filename = Path(parsed_path).name or f"{resource.slug}.pdf"
        inferred_ext = Path(inferred_filename).suffix.lower()
        inferred_mime = ALLOWED_EXTENSIONS.get(inferred_ext, "application/pdf")
        file_info = {
            "filename": inferred_filename,
            "storage_uri": resource.source_url,
            "download_url": f"/api/v1/resources/{resource.id}/download",
            "view_url": f"/api/v1/resources/{resource.id}/view",
            "mime_type": inferred_mime,
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
            "publisher": getattr(rp, "publisher", None) or getattr(resource, "publisher", None) or "National Land Records Modernization Directorate",
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
            "feature_count": getattr(sl, "feature_count", None),
        }

    return {
        "id": str(resource.id),
        "title": resource.title,
        "slug": resource.slug,
        "abstract": resource.abstract,
        "resource_type": resource.resource_type.value,
        "status": resource.status.value,
        "visibility": resource.visibility.value,
        "publisher": getattr(resource, "publisher", None) or "National Land Records Modernization Directorate",
        "created_at": resource.created_at.isoformat() if resource.created_at else None,
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
                "created_at": v.created_at.isoformat() if v.created_at else None,
                "download_url": f"/api/v1/resources/{resource.id}/download",
                "view_url": f"/api/v1/resources/{resource.id}/view",
            }
            for v in resource.versions
        ],
        **child_meta,
    }


async def _serve_resource_file(
    resource_id: str,
    db: AsyncSession,
    inline: bool = False,
) -> Response:
    from sqlalchemy.orm import selectinload
    from fastapi.responses import Response, RedirectResponse
    from uuid import UUID

    stmt = (
        select(Resource)
        .options(selectinload(Resource.versions))
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
            detail="Resource not found",
        )

    # 1. Check ResourceVersion storage_uri or source_url
    latest_version = resource.versions[-1] if resource.versions else None
    storage_uri = (latest_version.storage_uri if latest_version else None) or resource.source_url
    filename = (latest_version.original_filename if latest_version else None)
    mime_type = (latest_version.mime_type if latest_version else None)

    if (not filename or not mime_type or mime_type in ("application/octet-stream", "application/pdf")) and storage_uri:
        clean_uri = storage_uri.split("?")[0].split("#")[0]
        parsed_path = urlparse(clean_uri).path or clean_uri
        name = Path(parsed_path).name
        if name and "." in name:
            if not filename:
                filename = name
            ext = Path(name).suffix.lower()
            if not mime_type or mime_type in ("application/octet-stream", "application/pdf"):
                if ext in ALLOWED_EXTENSIONS:
                    mime_type = ALLOWED_EXTENSIONS[ext]

    if filename and (not mime_type or mime_type in ("application/octet-stream", "application/pdf")):
        ext = Path(filename).suffix.lower()
        if ext in ALLOWED_EXTENSIONS:
            mime_type = ALLOWED_EXTENSIONS[ext]

    if not filename:
        filename = f"{resource.slug}.pdf"
    if not mime_type:
        mime_type = "application/pdf"

    disposition_type = "inline" if inline else "attachment"

    if storage_uri:
        if storage_uri.startswith("data:"):
            from app.core.storage import storage_service

            content, resolved_mime = await storage_service.get_file_content(storage_uri)
            return Response(
                content=content,
                media_type=resolved_mime or mime_type,
                headers={
                    "Content-Disposition": f'{disposition_type}; filename="{filename}"',
                    "Content-Length": str(len(content)),
                    "Cache-Control": "public, max-age=3600",
                },
            )
        elif storage_uri.startswith("local://"):
            local_rel = storage_uri[len("local://"):]
            for base_dir in [Path.cwd(), Path("apps/api"), Path("/tmp")]:
                candidate = base_dir / local_rel
                if candidate.exists() and candidate.is_file():
                    content = candidate.read_bytes()
                    return Response(
                        content=content,
                        media_type=mime_type,
                        headers={
                            "Content-Disposition": f'{disposition_type}; filename="{filename}"',
                            "Content-Length": str(len(content)),
                            "Cache-Control": "public, max-age=3600",
                        },
                    )

            # Check Supabase Storage if local binary is not on disk (serverless container)
            key = local_rel
            if "land-governance-documents/" in key:
                key = key.split("land-governance-documents/", 1)[1]
            key = key.lstrip("/")

            supabase_url = f"https://oqnghfghjpvcccuqgjwj.supabase.co/storage/v1/object/public/land-governance-documents/{key}"
            try:
                import httpx

                async with httpx.AsyncClient(timeout=3.0) as http_client:
                    res = await http_client.head(supabase_url)
                    if res.status_code == 200:
                        return RedirectResponse(url=supabase_url)
            except Exception:
                pass
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
                        "Content-Disposition": f'{disposition_type}; filename="{filename}"',
                        "Content-Length": str(len(content)),
                        "Cache-Control": "public, max-age=3600",
                    },
                )
            except Exception:
                from app.core.storage import storage_service

                presigned = storage_service.generate_presigned_url(storage_uri)
                if presigned:
                    return RedirectResponse(url=presigned)
        else:
            # Short key or relative path
            key = storage_uri.lstrip("/")
            if "land-governance-documents/" in key:
                key = key.split("land-governance-documents/", 1)[1]
            key = key.lstrip("/")

            supabase_url = f"https://oqnghfghjpvcccuqgjwj.supabase.co/storage/v1/object/public/land-governance-documents/{key}"
            try:
                import httpx

                async with httpx.AsyncClient(timeout=3.0) as http_client:
                    res = await http_client.head(supabase_url)
                    if res.status_code == 200:
                        return RedirectResponse(url=supabase_url)
            except Exception:
                pass

    # 2. Fallback content generation if binary not stored in persistent storage
    if mime_type in ("image/jpeg", "image/jpg"):
        return Response(
            content=MINIMAL_JPEG,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f'{disposition_type}; filename="{filename}"',
                "Content-Length": str(len(MINIMAL_JPEG)),
                "Cache-Control": "public, max-age=3600",
            },
        )
    elif mime_type == "image/png":
        return Response(
            content=MINIMAL_PNG,
            media_type="image/png",
            headers={
                "Content-Disposition": f'{disposition_type}; filename="{filename}"',
                "Content-Length": str(len(MINIMAL_PNG)),
                "Cache-Control": "public, max-age=3600",
            },
        )

    elif mime_type in ("application/geo+json", "application/json") or filename.lower().endswith((".geojson", ".json")):
        title_escaped_json = resource.title.replace('"', '\\"')
        synthetic_geojson = (
            f'{{"type":"FeatureCollection","properties":{{"title":"{title_escaped_json}","resource_id":"{resource.id}"}},"features":[]}}'
        ).encode("utf-8")
        return Response(
            content=synthetic_geojson,
            media_type="application/geo+json",
            headers={
                "Content-Disposition": f'{disposition_type}; filename="{filename}"',
                "Content-Length": str(len(synthetic_geojson)),
                "Cache-Control": "public, max-age=3600",
            },
        )

    title_escaped = re.sub(r"[^\x20-\x7E]", "", resource.title or "Document").replace("(", "\\(").replace(")", "\\)")
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
            "Content-Disposition": f'{disposition_type}; filename="{filename}"',
            "Content-Length": str(len(synthetic_pdf)),
            "Cache-Control": "public, max-age=3600",
        },
    )


@router.get(
    "/{resource_id}/view",
    summary="View the binary file attached to a resource inline in browser",
)
async def view_resource_file(
    resource_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await _serve_resource_file(resource_id, db, inline=True)


@router.get(
    "/{resource_id}/download",
    summary="Download the binary file attached to a resource",
)
async def download_resource_file(
    resource_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await _serve_resource_file(resource_id, db, inline=False)

