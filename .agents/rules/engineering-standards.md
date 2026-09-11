# Land Governance Platform Engineering Standards

## General

- Build one approved phase at a time.
- Never begin a later phase without user confirmation.
- Use production-oriented code with explicit configuration.
- Do not hardcode secrets, passwords, URLs, or cloud credentials.
- Preserve backward compatibility unless a migration is provided.
- Every phase must finish with executable verification steps.

## Backend

- Use Python type annotations.
- Use FastAPI dependency injection.
- Use asynchronous SQLAlchemy sessions.
- Use Alembic for all schema changes.
- Never call Base.metadata.create_all() in production code.
- Keep routes, services, repositories, and database models separate.
- A request may have only one SQLAlchemy AsyncSession.
- Explicitly commit write transactions in service functions.
- Roll back failed transactions.
- Validate all external input with Pydantic.

## Database

- Use UUID primary keys for business entities.
- Use UTC timestamps with time zones.
- Use PostGIS geometries in EPSG:4326 unless otherwise documented.
- Add GiST indexes to queryable geometry columns.
- Store flexible metadata in JSONB.
- Store document binaries in object storage.
- Resource versions and provenance records are append-only.
- Evidence must reference a specific resource version, not only a resource.

## Frontend

- Use TypeScript in strict mode.
- Prefer server components unless browser state is required.
- Validate frontend forms with Zod.
- Use TanStack Query for client-side server state.
- Do not place access tokens in localStorage.
- Make public pages accessible and mobile-responsive.

## Security

- Apply least privilege.
- Never expose stack traces in production responses.
- Never log passwords, tokens, private documents, or personal data.
- Authentication and authorization must be enforced on the backend.
