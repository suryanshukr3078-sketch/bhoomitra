import logging
import sys

import structlog

from app.core.config import settings

SENSITIVE_KEY_SUBSTRINGS = (
    "password",
    "token",
    "secret",
    "authorization",
    "cookie",
    "access_token",
    "refresh_token",
    "api_key",
    "private_key",
)


def redact_sensitive_fields(
    logger: structlog.types.WrappedLogger,
    method_name: str,
    event_dict: structlog.types.EventDict,
) -> structlog.types.EventDict:
    def _redact_value(key: str, val: object) -> object:
        key_lower = key.lower()
        if any(sensitive in key_lower for sensitive in SENSITIVE_KEY_SUBSTRINGS):
            return "[REDACTED]"
        if isinstance(val, dict):
            return {k: _redact_value(str(k), v) for k, v in val.items()}
        if isinstance(val, list):
            return [_redact_value(key, item) if isinstance(item, dict) else item for item in val]
        return val

    return {k: _redact_value(k, v) for k, v in event_dict.items()}


def configure_logging() -> None:
    log_level = logging.DEBUG if settings.debug else logging.INFO

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(
            fmt="iso",
            utc=True,
        ),
        redact_sensitive_fields,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if settings.is_production:
        renderer: structlog.types.Processor = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            renderer,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


logger: structlog.stdlib.BoundLogger = structlog.get_logger()
