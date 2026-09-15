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
            path_rewritten = False

            # 1. Check if 'path=' query parameter is passed (e.g. ?path=api/v1/...)
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
                        path_rewritten = True
                except Exception as exc:
                    logger.warning("QueryPathRewriteMiddleware failed to rewrite path", error=str(exc))

            # 2. If not rewritten by query param and scope['path'] is handler path (/api/index.py),
            # check headers set by Vercel for the original matched path
            if not path_rewritten and scope.get("path") in ("/api/index.py", "/api/index"):
                headers_dict = {k.lower(): v for k, v in scope.get("headers", [])}
                for h_name in (b"x-matched-path", b"x-forwarded-uri", b"x-real-path"):
                    if h_name in headers_dict:
                        raw_val = headers_dict[h_name].decode("latin-1")
                        if raw_val and not raw_val.startswith("/api/index.py") and not raw_val.startswith("/api/index"):
                            if "?" in raw_val:
                                raw_val = raw_val.split("?", 1)[0]
                            clean_matched = "/" + raw_val.lstrip("/")
                            scope["path"] = clean_matched
                            scope["raw_path"] = clean_matched.encode("latin-1")
                            break

            # 3. Normalize trailing slashes for paths longer than 1 char (e.g. /health/ -> /health)
            final_path = scope.get("path", "")
            if len(final_path) > 1 and final_path.endswith("/"):
                clean_path = final_path.rstrip("/")
                scope["path"] = clean_path
                scope["raw_path"] = clean_path.encode("latin-1")

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


class CacheControlMiddleware(BaseHTTPMiddleware):
    """Sets edge-caching headers for public idempotent GET endpoints on Vercel/CDN.

    Allows Vercel Edge nodes (e.g. Mumbai bom1) to cache public catalog data for 60 seconds
    with stale-while-revalidate=300, reducing subsequent response latencies from ~2.5s down to <30ms.
    """

    PUBLIC_CACHE_PREFIXES = (
        "/api/v1/policies",
        "/api/v1/resources",
        "/api/v1/datasets",
        "/api/v1/spatial",
        "/api/v1/health",
        "/policies",
        "/resources",
        "/datasets",
        "/spatial",
        "/health",
    )

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        response = await call_next(request)

        # Only cache successful GET requests without sensitive authentication
        if request.method == "GET" and response.status_code == 200:
            has_auth = bool(
                request.headers.get("Authorization")
                or request.cookies.get("access_token")
                or request.cookies.get("auth_token")
            )
            path = request.url.path

            if not has_auth and any(path.startswith(p) for p in self.PUBLIC_CACHE_PREFIXES):
                response.headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=300"
            elif path.endswith("/dashboard/metrics") and not has_auth:
                response.headers["Cache-Control"] = "public, s-maxage=30, stale-while-revalidate=60"

        return response

