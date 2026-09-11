from uuid import uuid4

import structlog
from fastapi import Request
from starlette.middleware.base import (
    BaseHTTPMiddleware,
    RequestResponseEndpoint,
)
from starlette.responses import Response

logger = structlog.get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        request_id = request.headers.get(
            "X-Request-ID",
            str(uuid4()),
        )

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "Unhandled request exception",
            )
            raise
        finally:
            structlog.contextvars.clear_contextvars()

        response.headers["X-Request-ID"] = request_id

        return response
