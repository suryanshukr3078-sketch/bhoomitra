from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.db.session import check_database_connection

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "/live",
    summary="Liveness check",
)
async def liveness() -> dict[str, str]:
    return {
        "status": "alive",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@router.get(
    "/ready",
    summary="Readiness check",
)
async def readiness() -> dict[str, Any]:
    try:
        database = await check_database_connection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not ready.",
        ) from error

    return {
        "status": "ready",
        "service": settings.app_name,
        "database": {
            **database,
            "connection_source": settings.db_connection_source,
            "database_url": settings.masked_database_url,
        },
    }
