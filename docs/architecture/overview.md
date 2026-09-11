# System Architecture Overview

The Land Governance Platform is composed of:
1. **Frontend (apps/web)**: Next.js with React 18, Tailwind CSS, and MapLibre GL.
2. **Backend (apps/api)**: FastAPI application exposing high-throughput REST and GIS endpoints.
3. **Database**: PostgreSQL with PostGIS extensions for spatial cadastral queries and topological validation.
4. **Audit Ledger**: Cryptographically linked audit logs guaranteeing tamper resistance.
