import asyncio
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress
from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import ORJSONResponse
from slowapi.errors import RateLimitExceeded

from app.api.router import api_router
from app.core.cache import cache
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import configure_logging
from app.core.middleware import (
    QueryPathRewriteMiddleware,
    RequestIDMiddleware,
)
from app.db.session import (
    check_database_connection,
    close_database_connections,
)

# Configure Windows selector event loop policy for async psycopg support
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

configure_logging()

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncIterator[None]:
    # Log database connection configuration with masked credentials
    logger.info(
        "Database configuration initialized",
        connection_source=settings.db_connection_source,
        masked_database_url=settings.masked_database_url,
    )

    # In serverless mode (Vercel), bypass heavy startup database probes for instant cold starts
    if not settings.is_serverless:
        try:
            database_details = await check_database_connection()
            logger.info(
                "Application started",
                application=settings.app_name,
                environment=settings.app_env,
                database=database_details.get("database_name"),
                postgis=database_details.get("postgis_version"),
            )
        except Exception as error:
            logger.warning(
                "Non-blocking startup database check failed",
                error=str(error),
            )
    else:
        logger.info(
            "Application started in serverless mode",
            application=settings.app_name,
            environment=settings.app_env,
        )

    yield

    with suppress(Exception):
        await close_database_connections()
    with suppress(Exception):
        await cache.close()

    logger.info(
        "Application stopped",
        application=settings.app_name,
    )


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        default_response_class=ORJSONResponse,
        debug=settings.debug,
        docs_url=settings.docs_url,
        openapi_url=settings.openapi_url,
        lifespan=lifespan,
    )

    application.state.limiter = limiter

    @application.exception_handler(RateLimitExceeded)
    async def rate_limit_exceeded_handler(
        request: Request, exc: RateLimitExceeded
    ) -> ORJSONResponse:
        return ORJSONResponse(
            status_code=429,
            content={"detail": f"Rate limit exceeded: {exc.detail}"},
            headers={"Retry-After": "60"},
        )

    @application.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> ORJSONResponse:
        request_id = request.headers.get("X-Request-ID")
        logger.error(
            "Unhandled application exception",
            error=str(exc),
            exc_info=exc,
            request_id=request_id,
            path=request.url.path,
        )
        if settings.is_production:
            return ORJSONResponse(
                status_code=500,
                content={
                    "detail": "An internal server error occurred. Please contact support.",
                    "request_id": request_id,
                },
            )
        return ORJSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "type": exc.__class__.__name__,
                "request_id": request_id,
            },
        )

    application.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.trusted_host_list,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Request-ID",
            "X-Access-Token",
            "X-Auth-Token",
            "Origin",
            "Cache-Control",
            "Pragma",
            "X-Requested-With",
        ],
        expose_headers=[
            "X-Request-ID",
            "Retry-After",
        ],
    )

    application.add_middleware(
        GZipMiddleware,
        minimum_size=1000,
    )

    application.add_middleware(
        RequestIDMiddleware,
    )

    application.add_middleware(
        QueryPathRewriteMiddleware,
    )

    application.include_router(api_router)

    @application.get(
        "/",
        include_in_schema=False,
    )
    async def root() -> dict[str, Any]:
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "environment": settings.app_env,
        }

    return application


app = create_application()
