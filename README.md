# Land Governance Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI: 0.115+](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL: 18 (PostGIS 3.6)](https://img.shields.io/badge/PostGIS-3.6-navy.svg)](https://postgis.net/)
[![Redis: 7](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)

An enterprise-grade, transparent, and tamper-evident Land Governance and Cadastral Administration platform. The system bridges spatial land records, evidence verification, legal policy tracking, and public participation through high-performance spatial queries, cryptographic provenance tracing, and AI-assisted governance analysis.

---

## Architecture Overview

The platform uses a decoupled microservice-ready architecture orchestrated with containerization and reverse proxy routing.

```
                      ┌────────────────────────────┐
                      │    Client Browser / API    │
                      └─────────────┬──────────────┘
                                    │ HTTP / WebSocket (:80 / :443)
                                    ▼
                      ┌────────────────────────────┐
                      │      Nginx Reverse Proxy   │
                      │  (Rate Limit / TLS / Proxy)│
                      └──────┬──────────────┬──────┘
             /api/*          │              │ / (All frontend routes)
             ┌───────────────┘              └────────────────┐
             ▼                                               ▼
┌─────────────────────────┐                     ┌─────────────────────────┐
│     FastAPI Backend     │                     │    Next.js Frontend     │
│ (Python 3.12 / Uvicorn) │                     │ (Node 20 Alpine / SSR)  │
│  - JWT Authentication   │                     │  - MapLibre GL Cadastre │
│  - Spatial REST API     │                     │  - Provenance Explorer  │
│  - Evidence Validation  │                     │  - Policy & Dataset UI  │
└──────┬───────────┬──────┘                     └─────────────────────────┘
       │           │
       │           ├────────────────────────────┐
       ▼           ▼                            ▼
┌──────────────┐ ┌──────────────┐    ┌─────────────────────────┐
│  PostgreSQL  │ │   Redis 7    │    │        MinIO S3         │
│  + PostGIS   │ │  - Rate Lim. │    │  - Cadastral Documents  │
│ - Spatial DB │ │  - Cache     │    │  - Signed Evidence PDFs │
└──────────────┘ └──────────────┘    └─────────────────────────┘
```

### Core Components:
1. **Frontend (`apps/web`)**: Next.js 14 standalone application featuring Tailwind CSS, Lucide icons, MapLibre GL cadastral viewer with GeoJSON layer toggles, evidence trace explorer, and strict Zod form validation.
2. **Backend (`apps/api`)**: FastAPI application on Python 3.12 utilizing SQLAlchemy 2.0 async ORM, GeoAlchemy2, Pydantic v2 validation, SlowAPI Redis-backed rate limiting, and response caching.
3. **Spatial Database**: PostgreSQL 18 with PostGIS 3.6 storing parcels, boundaries, disputes, and audit trails with spatial GiST indexing (`idx_parcels_geom`).
4. **Object Storage**: MinIO S3-compatible storage with file signature/MIME scanning and path sanitization.
5. **Cache & Throttling**: Redis 7 managing endpoint response caching and token-bucket rate limiting.
6. **Reverse Proxy**: Nginx 1.27 handling single-port routing, 50MB payload limits, WebSocket upgrade headers, and `/healthz` liveness probes.

---

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- [uv](https://github.com/astral-sh/uv) (for local backend development)
- [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/) (for local frontend development)

---

### Production Deployment (Recommended)

1. **Clone repository and configure environment**:
   ```bash
   cp .env.example .env
   ```
   *Update `.env` with strong production secrets (`POSTGRES_PASSWORD`, `SECRET_KEY`, `MINIO_ROOT_PASSWORD`).*

2. **Launch all services via Production Docker Compose**:
   ```bash
   docker compose -f compose.prod.yaml up -d --build
   ```

3. **Verify running containers and health checks**:
   ```bash
   docker compose -f compose.prod.yaml ps
   ```
   All services (`postgres`, `redis`, `minio`, `api`, `web`, `nginx`) report `(healthy)`.

4. **Access the application**:
   - Web Platform: `http://localhost/`
   - Nginx Probe: `http://localhost/healthz`
   - API Live Probe: `http://localhost/api/v1/health/live`
   - API Ready Probe: `http://localhost/api/v1/health/ready`

---

### Local Development Setup

#### 1. Start Support Infrastructure
```bash
docker compose up -d postgres redis minio
```

#### 2. Backend (FastAPI) Setup
```bash
cd apps/api
cp ../../.env.example .env

# Install dependencies into virtual environment
uv sync

# Run database migrations
uv run alembic upgrade head

# Seed synthetic test data (labeled Demo / Synthetic)
uv run python -m app.db.seed

# Start backend server
uv run uvicorn app.main:app --reload --port 8000
```
Swagger API documentation: `http://localhost:8000/docs` (disabled in `production` mode).

#### 3. Frontend (Next.js) Setup
```bash
cd apps/web
pnpm install
pnpm dev
```
Accessible at: `http://localhost:3000`.

---

## Environment Variable Reference

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `APP_ENV` | Yes | `development` / `production` | Enables strict security validators in production |
| `SECRET_KEY` | Yes | Cryptographic string (32+ chars) | Signs JWT session tokens |
| `POSTGRES_USER` | Yes | `land_admin` | Database username |
| `POSTGRES_PASSWORD`| Yes | Secure random string | Database password |
| `POSTGRES_DB` | Yes | `land_governance` | PostGIS database name |
| `DATABASE_URL` | Yes | `postgresql+psycopg://user:pass@host:5432/db` | SQLAlchemy connection string |
| `REDIS_URL` | No | `redis://127.0.0.1:6379/0` | Cache and rate-limiter connection |
| `MINIO_ROOT_USER` | Yes | `minio_admin` | S3 root access key |
| `MINIO_ROOT_PASSWORD`| Yes | Secure random string | S3 root secret key |
| `S3_ENDPOINT_URL` | No | `http://127.0.0.1:9000` | S3 API endpoint |
| `S3_BUCKET_NAME` | No | `land-governance-documents` | Destination document bucket |
| `CORS_ORIGINS` | No | `http://localhost,http://localhost:3000` | Allowed origins for CORS |
| `TRUSTED_HOSTS` | No | `localhost,127.0.0.1,nginx,api` | Permitted Host headers |
| `RATE_LIMIT_ENABLED`| No | `true` | Enforces SlowAPI rate limiting |

---

## Database Migrations

Database schema migrations are managed via **Alembic**:

```bash
cd apps/api

# Create a new migration revision after modifying models:
uv run alembic revision --autogenerate -m "describe_change"

# Upgrade database to latest revision:
uv run alembic upgrade head

# Downgrade one revision:
uv run alembic downgrade -1
```

### Applied Schema Features:
- `spatial_ref_sys` (PostGIS 3.6 spatial reference systems)
- `users`: Secure bcrypt credential storage with role-based permissions (`admin`, `contributor`, `viewer`)
- `parcels`: Geometry polygon/multipolygon parcels with SRID 4326 and GiST spatial indexes
- `policies`: Legal frameworks, jurisdiction tags, and regulatory citations
- `datasets`: Cadastral data layers with metadata and download counts
- `evidence_records`: SHA-256 verified document provenance and upstream/downstream graph relations

---

## Testing & Quality Assurance

### 1. Automated Backend Test Suite
```bash
cd apps/api
uv run pytest -v
```
Includes security hardening validation, rate limit tests, database connectivity, and health probe assertions.

### 2. Code Linting & Static Typing
```bash
cd apps/api
uv run ruff check .
uv run mypy app
```

### 3. Frontend Production Build & Bundle Audit
```bash
# Verify Next.js production build
cd apps/web
pnpm build

# Run secret leak audit on client bundles
cd ../..
node scripts/audit_client_bundle.mjs
```

---

## OpenAPI Specification

The latest OpenAPI specification is maintained at [`openapi.json`](./openapi.json).
To re-generate the specification directly from the active FastAPI application schemas:
```bash
cd apps/api
uv run python -c "from app.main import app; import json; from pathlib import Path; Path('../../openapi.json').write_text(json.dumps(app.openapi(), indent=2))"
```

---

## Known Limitations & Production Checklist

### Known Limitations:
1. **Local TLS / Certificates**: The included `compose.prod.yaml` ships with HTTP on port 80. For internet-facing deployments, attach an SSL termination layer (AWS ALB, Cloudflare, or Let's Encrypt Certbot via Nginx reverse proxy).
2. **File Size Upload Quota**: S3 uploads are currently constrained to 50MB per document. Batch vector tiles should be imported via CLI ingestion pipelines.
3. **Synthetic / Demo Data**: All initial seed records are marked with `is_synthetic: true` or `Demo` banners per platform evidence-integrity requirements.

### Production Readiness Checklist:
- [x] Multi-stage minimal Dockerfiles for API and Web.
- [x] Non-root container execution (`appuser` UID 10001, `nextjs` UID 1001).
- [x] Parameterized secrets with zero hardcoded credentials.
- [x] Native health checks configured for all 6 containerized services.
- [x] Redis-backed rate limiting and response caching active.
- [x] Automated test suite passing with zero regressions.
- [x] Bundle security audit verifying zero leaked secrets in client bundles.
- [x] Full OpenAPI v3.1 schema specification exported.
