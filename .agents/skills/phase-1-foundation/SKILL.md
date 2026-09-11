---
name: phase-1-foundation
description: Builds and verifies the Phase 1 foundation for the national land-governance platform, including the monorepo, PostGIS database schema, Alembic migrations, FastAPI configuration, and database connection pool.
---

# Phase 1 Foundation

Use this skill only for Phase 1 of the land-governance platform.

## Scope

Implement and verify:

1. Monorepo directories.
2. PostgreSQL and PostGIS development infrastructure.
3. SQLAlchemy database models.
4. Alembic migration configuration.
5. FastAPI settings and lifespan.
6. Asynchronous database connection pool.
7. Liveness and readiness endpoints.

## Out of scope

Do not implement:

- Authentication endpoints
- GIS map UI
- Tile generation
- Semantic or vector search
- Research CRUD interfaces
- Policy CRUD interfaces
- AI-generated answers
- Production cloud deployment

## Execution rules

1. Read `.agents/rules/engineering-standards.md`.
2. Inspect existing files before modifying them.
3. Do not overwrite user code without presenting the intended change.
4. Run formatting and static validation after creating files.
5. Start PostgreSQL.
6. Apply Alembic migrations.
7. Start FastAPI.
8. Test the liveness and readiness endpoints.
9. Report all created files and command results.
10. Stop and wait for user approval before beginning Phase 2.
