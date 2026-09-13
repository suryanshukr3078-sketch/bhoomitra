import urllib.parse
from uuid import uuid4

import structlog
from fastapi import Request
from starlette.middleware.base import (
    BaseHTTPMiddleware,
    RequestResponseEndpoint,
)
from starlette.responses import Response
from starlette.types import ASGIApp, Receive, Scope, Send

logger = structlog.get_logger(__name__)


class QueryPathRewriteMiddleware:
    """ASGI middleware to rewrite requests routed via '?path=...' query parameter.

    In serverless environments (e.g. Vercel) or when proxied by external clients,
    requests may arrive at '/', '/api', or '/api/index.py' with the actual destination
    endpoint passed as '?path=api/v1/...'.

    This middleware extracts the 'path' parameter, strips it from the query string,
    and updates scope['path'] and scope['raw_path'] so FastAPI dispatches to the
    correct route handler.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            query_string: bytes = scope.get("query_string", b"")
            if b"path=" in query_string:
                try:
                    qs_str = query_string.decode("latin-1")
                    parsed = urllib.parse.parse_qsl(qs_str, keep_blank_values=True)
                    target_path: str | None = None
                    remaining_params: list[tuple[str, str]] = []

                    for key, val in parsed:
                        if key == "path" and target_path is None:
                            target_path = val
                        else:
                            remaining_params.append((key, val))

                    if target_path:
                        target_path = urllib.parse.unquote(target_path)
                        # Extract any query parameters that may be embedded in target_path
                        if "?" in target_path:
                            target_path, embedded_qs = target_path.split("?", 1)
                            if embedded_qs:
                                embedded_params = urllib.parse.parse_qsl(embedded_qs, keep_blank_values=True)
                                remaining_params.extend(embedded_params)

                        # Normalize path with single leading slash
                        target_path = "/" + target_path.lstrip("/")

                        scope["path"] = target_path
                        scope["raw_path"] = target_path.encode("latin-1")

                        if remaining_params:
                            scope["query_string"] = urllib.parse.urlencode(remaining_params).encode("latin-1")
                        else:
                            scope["query_string"] = b""
                except Exception as exc:
                    logger.warning("QueryPathRewriteMiddleware failed to rewrite path", error=str(exc))

        await self.app(scope, receive, send)


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
