from typing import Any

from fastapi import APIRouter, Depends, Query
from geoalchemy2.functions import ST_AsGeoJSON
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.core.cache import cache
from app.models.resources import SpatialFeature

router = APIRouter(prefix="/spatial", tags=["Spatial"])


@router.get(
    "/features",
    summary="Get spatial features as GeoJSON FeatureCollection (Redis cached)",
)
async def get_spatial_features(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    cache_key = f"spatial:features:{limit}:{offset}"
    cached_data = await cache.get_json(cache_key)
    if isinstance(cached_data, dict):
        cached_data["cached"] = True
        return cached_data

    stmt = (
        select(
            SpatialFeature.id,
            SpatialFeature.external_id,
            SpatialFeature.properties,
            ST_AsGeoJSON(SpatialFeature.geom).label("geojson_geom"),
        )
        .limit(limit)
        .offset(offset)
    )

    rows = (await db.execute(stmt)).all()

    import json

    features = []
    for row in rows:
        geom = json.loads(row.geojson_geom) if row.geojson_geom else None
        features.append(
            {
                "type": "Feature",
                "id": row.id,
                "properties": {
                    "external_id": row.external_id,
                    **(row.properties or {}),
                },
                "geometry": geom,
            }
        )

    result = {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features),
        "cached": False,
    }

    await cache.set_json(cache_key, result, expire_seconds=300)
    return result
