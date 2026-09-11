.PHONY: help dev db-up db-down api-install api-dev api-migrate migrate web-dev test clean

help:
	@echo "Land Governance Platform Commands:"
	@echo "  make db-up       - Start PostgreSQL (PostGIS) container"
	@echo "  make db-down     - Stop PostgreSQL container"
	@echo "  make api-install - Install API dependencies with uv"
	@echo "  make api-dev     - Run FastAPI backend locally with uv"
	@echo "  make migrate     - Run Alembic database migrations"
	@echo "  make api-migrate - Run Alembic database migrations (alias)"
	@echo "  make web-dev     - Run Next.js frontend dev server"
	@echo "  make test        - Run backend and frontend test suites"

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

api-install:
	cd apps/api && uv sync

api-dev:
	cd apps/api && uv run uvicorn app.main:app --reload --port 8000

migrate:
	cd apps/api && uv run alembic upgrade head

api-migrate: migrate

migration:
	cd apps/api && uv run alembic revision -m "$(message)"

web-dev:
	pnpm --filter @landgov/web dev

test:
	cd apps/api && uv run pytest
	pnpm -r run test
