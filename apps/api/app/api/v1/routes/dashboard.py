from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.core.cache import cache
from app.models.identity import Organization, User
from app.models.resources import Policy, ResearchPaper, Resource, SpatialFeature

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    summary="Get aggregated platform statistics (Redis cached)",
)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    cache_key = "dashboard:stats"
    cached_data = await cache.get_json(cache_key)
    if isinstance(cached_data, dict):
        cached_data["cached"] = True
        return cached_data

    total_resources = (await db.execute(select(func.count(Resource.id)))).scalar_one() or 0
    total_papers = (
        await db.execute(select(func.count(ResearchPaper.resource_id)))
    ).scalar_one() or 0
    total_policies = (await db.execute(select(func.count(Policy.resource_id)))).scalar_one() or 0
    total_spatial_features = (
        await db.execute(select(func.count(SpatialFeature.id)))
    ).scalar_one() or 0
    total_organizations = (await db.execute(select(func.count(Organization.id)))).scalar_one() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one() or 0

    data = {
        "total_resources": total_resources,
        "total_research_papers": total_papers,
        "total_policies": total_policies,
        "total_spatial_features": total_spatial_features,
        "total_organizations": total_organizations,
        "total_users": total_users,
        "cached": False,
    }

    await cache.set_json(cache_key, data, expire_seconds=60)
    return data
