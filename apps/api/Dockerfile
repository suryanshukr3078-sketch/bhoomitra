# ------------------------------------------------------------------------------
# Stage 1: Build virtual environment with uv
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# ------------------------------------------------------------------------------
# Stage 2: Runtime image (non-root, minimal)
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000

# Create non-root system user
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -s /sbin/nologin -M appuser

COPY --from=builder --chown=appuser:appuser /opt/venv /opt/venv
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import os, urllib.request; port = os.environ.get('PORT', '8000'); urllib.request.urlopen(f'http://127.0.0.1:{port}/api/v1/health/live')" || exit 1

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${API_WORKERS:-1}"]

