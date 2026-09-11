# Changelog

All notable changes to the Land Governance Platform are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-11

### Production Delivery & Containerization
- **Multi-Stage Production Dockerfiles**:
  - `apps/api/Dockerfile`: Python 3.12-slim multi-stage build running as non-root user `appuser` (UID 10001). Pre-compiles dependencies with `uv` into `/opt/venv`.
  - `apps/web/Dockerfile`: Node 20-alpine multi-stage build running as non-root user `nextjs` (UID 1001) utilizing Next.js standalone output mode and asset separation.
- **Production Compose (`compose.prod.yaml`)**:
  - Orchestrates 6 containerized services: `postgres` (PostGIS 3.6), `redis` (v7), `minio` (S3), `api` (FastAPI), `web` (Next.js standalone), and `nginx` (v1.27 reverse proxy).
  - Configured health checks for every service using `pg_isready`, `redis-cli`, `mc`/HTTP live probes, python health probes, and `wget` spidering.
  - Eliminated hardcoded secrets in favor of parameterized environment variables.
- **Nginx Reverse Proxy (`infrastructure/nginx/nginx.conf`)**:
  - Configured single ingress on port 80 forwarding `/api/*` to FastAPI upstream and `/*` to Next.js upstream.
  - Added WebSocket upgrade header proxying, 50MB client request body allowance, and `/healthz` health monitoring endpoint.
- **Production Server Startup**:
  - Created `apps/api/app/server.py` with multi-worker support and Windows event-loop compatibility fallback.
  - Verified non-reload production startup and probe responses.
- **Automated OpenAPI Specification**:
  - Exported canonical OpenAPI v3.1 schema to `openapi.json` at repository root.
- **Comprehensive Documentation**:
  - Overhauled root `README.md` with system architecture diagrams, quick-start guides, environment variable references, and operational runbooks.

---

## [0.4.0] - 2026-09-11

### Security Hardening & Performance Optimization
- **Rate Limiting**:
  - Implemented SlowAPI Redis-backed limiter with custom client IP resolution and in-memory test fallback.
  - Applied strict rate limits to `/api/v1/auth/login` (5/min), `/api/v1/auth/register` (3/min), and `/api/v1/search` (30/min).
- **Upload Sanitization & MIME Scanning**:
  - Implemented `validate_and_sanitize_upload` in `app/services/storage.py` validating magic byte signatures (PDF `%PDF`, PNG `PNG`, JPEG `ÿØÿ`).
  - Added UUID prefixing and regex-based filename sanitization.
- **Database Query Indexing**:
  - Created Alembic migration `20260911_0003_perf_indexes.py` adding B-Tree and GiST composite indexes for search performance (`idx_parcels_jurisdiction_status`, `idx_parcels_geom_gist`).
- **Response Caching**:
  - Implemented async Redis caching module in `app/core/cache.py` with TTL-based invalidation for read-heavy endpoints (`/dashboard/stats` 60s, `/spatial/features` 120s).
- **Information Leakage Prevention**:
  - Configured custom FastAPI exception handlers intercepting unhandled 500 errors to prevent stack trace leakage in production mode.
  - Built `scripts/audit_client_bundle.mjs` verifying zero secret keys, private credentials, or internal URLs in frontend client builds.
- **Startup Secret Validation**:
  - Added strict Pydantic model validator in `app/core/config.py` failing fast if default or short secrets are detected when `APP_ENV=production`.

---

## [0.3.0] - 2026-09-11

### Content Completeness & Data Flow Integrity
- **Pagination & Query Controls**:
  - Added interactive pagination bars, page size selectors, and item counters to all resource list pages.
  - Wired sorting and filtering dropdowns (by date, status, resource type, jurisdiction) to backend query parameters.
- **Evidence Provenance Visualizer**:
  - Built interactive evidence trace tree rendering upstream originating deeds and downstream transaction child nodes with SHA-256 integrity badges.
- **Evidence Integrity & Synthetic Data Disclaimers**:
  - Audited all mock/seed data records; added amber "Synthetic Data" and "Demo Record" pill badges across dashboard stats, cadastral maps, and evidence registries.
- **Static & Information Pages**:
  - Added fully responsive, semantic `/about`, `/faq`, and `/contact` pages with real domain content and interactive inquiry submission.

---

## [0.2.0] - 2026-09-11

### Frontend UI/UX Polish & Accessibility
- **Responsive Layout Audits**:
  - Verified and tuned layout flow across mobile (375px), tablet (768px), and desktop (1440px) viewports with collapsible sidebars and responsive tables.
- **Loading & Empty State Feedback**:
  - Created animated skeleton placeholders for resource cards, map viewports, and statistical widgets.
  - Added contextual empty states with search reset actions and retry buttons on API error.
- **Form Validation & Notifications**:
  - Integrated React Hook Form and Zod validation schemas across authentication and contribution forms with inline error messaging.
  - Built custom toast notification dispatch system for instant user submission feedback.
- **Accessibility & SEO**:
  - Added WCAG 2.1 AA compliant color contrast, aria labels, role tags, and keyboard focus outlines.
  - Configured OpenGraph meta tags, route titles, and favicon assets.

---

## [0.1.0] - 2026-09-10

### Initial Architecture & Scaffolding
- **FastAPI Backend**:
  - Configured FastAPI with async SQLAlchemy 2.0 and GeoAlchemy2.
  - Scaffolded core models: Users, Parcels, Policies, Datasets, Evidence Records, and Audit Logs.
  - Initialized Alembic database migrations.
- **Next.js Frontend**:
  - Initialized Next.js 14 App Router project with Tailwind CSS.
  - Integrated MapLibre GL with PostGIS cadastral polygon layer rendering.
  - Configured JWT authentication store and protected route navigation guards.
- **Infrastructure**:
  - Docker Compose service definition for PostgreSQL (PostGIS 3.6), Redis 7, and MinIO S3.
