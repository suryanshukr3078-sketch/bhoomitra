import uuid
from collections.abc import AsyncGenerator, Generator
from datetime import UTC, datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.core.cache import cache
from app.core.limiter import limiter
from app.core.security import create_access_token
from app.main import app
from app.models.enums import OrganizationType, UserStatus
from app.models.identity import Organization, OrganizationMembership, User


@pytest.fixture(autouse=True)
def disable_limiter() -> Generator[None, None, None]:
    limiter.enabled = False
    yield
    limiter.enabled = True


@pytest.fixture(autouse=True)
def clear_cache() -> Generator[None, None, None]:
    cache._memory_cache.clear()
    yield
    cache._memory_cache.clear()


@pytest.fixture
def dashboard_env() -> Generator[dict[str, Any], None, None]:
    now = datetime.now(UTC)
    admin_id = uuid.uuid4()
    govt_id = uuid.uuid4()
    researcher_id = uuid.uuid4()
    citizen_id = uuid.uuid4()
    govt_org_id = uuid.uuid4()
    acad_org_id = uuid.uuid4()

    govt_org = Organization(
        id=govt_org_id,
        name="State Cadastral Department",
        slug="state-cadastral-dept",
        organization_type=OrganizationType.GOVERNMENT,
        is_active=True,
        created_at=now,
    )
    acad_org = Organization(
        id=acad_org_id,
        name="Institute of Land Policy",
        slug="institute-land-policy",
        organization_type=OrganizationType.ACADEMIC,
        is_active=True,
        created_at=now,
    )

    admin_user = User(
        id=admin_id,
        email="admin@landgov.gov",
        full_name="Platform Administrator",
        is_superuser=True,
        status=UserStatus.ACTIVE,
        profile={"role": "admin"},
        created_at=now,
    )

    govt_user = User(
        id=govt_id,
        email="commissioner@revenue.gov",
        full_name="Commissioner Sharma",
        is_superuser=False,
        status=UserStatus.ACTIVE,
        profile={"role": "government_official"},
        created_at=now,
    )
    govt_mem = OrganizationMembership(
        user_id=govt_id,
        organization_id=govt_org_id,
        title="Land Revenue Commissioner",
        status=UserStatus.ACTIVE,
    )
    govt_mem.organization = govt_org
    govt_user.memberships = [govt_mem]

    researcher_user = User(
        id=researcher_id,
        email="dr.anita@university.ac.in",
        full_name="Dr. Anita Desai",
        is_superuser=False,
        status=UserStatus.ACTIVE,
        profile={"role": "researcher"},
        created_at=now,
    )
    acad_mem = OrganizationMembership(
        user_id=researcher_id,
        organization_id=acad_org_id,
        title="Lead GIS Researcher",
        status=UserStatus.ACTIVE,
    )
    acad_mem.organization = acad_org
    researcher_user.memberships = [acad_mem]

    citizen_user = User(
        id=citizen_id,
        email="citizen@public.org",
        full_name="Ramesh Verma",
        is_superuser=False,
        status=UserStatus.ACTIVE,
        profile={"role": "citizen"},
        created_at=now,
    )

    users_map = {
        admin_id: admin_user,
        govt_id: govt_user,
        researcher_id: researcher_user,
        citizen_id: citizen_user,
    }

    class FakeSession:
        async def execute(self, stmt: Any) -> Any:
            mock_res = MagicMock()
            stmt_str = str(stmt)
            if "FROM users" in stmt_str or "users.id" in stmt_str:
                for u_id, u in users_map.items():
                    if str(u_id) in stmt_str:
                        mock_res.scalar_one_or_none.return_value = u
                        return mock_res
                try:
                    compiled = stmt.compile()
                    for p in compiled.params.values():
                        if isinstance(p, uuid.UUID) and p in users_map:
                            mock_res.scalar_one_or_none.return_value = users_map[p]
                            return mock_res
                except Exception:
                    pass
            # Default numeric counts for aggregation queries
            mock_res.scalar_one.return_value = 12
            mock_res.scalar_one_or_none.return_value = None
            mock_res.mappings.return_value.one.return_value = {
                "total_papers": 12,
                "total_spatial": 8,
                "total_policies": 15,
                "enacted_policies": 10,
                "under_review": 3,
                "draft_policies": 2,
            }
            return mock_res

    async def override_get_db() -> AsyncGenerator[FakeSession, None]:
        yield FakeSession()

    app.dependency_overrides[get_db] = override_get_db
    with (
        patch("app.main.check_database_connection", new=AsyncMock(return_value={})),
        patch("app.main.close_database_connections", new=AsyncMock()),
        TestClient(app, base_url="http://localhost") as client,
    ):
        yield {
            "client": client,
            "admin_token": create_access_token({"sub": str(admin_id)}),
            "govt_token": create_access_token({"sub": str(govt_id)}),
            "researcher_token": create_access_token({"sub": str(researcher_id)}),
            "citizen_token": create_access_token({"sub": str(citizen_id)}),
        }
    app.dependency_overrides.clear()


def test_public_dashboard_metrics_and_masking(dashboard_env: dict[str, Any]) -> None:
    client: TestClient = dashboard_env["client"]

    # Public unauthenticated request
    resp = client.get("/api/v1/dashboard/metrics")
    assert resp.status_code == 200
    data = resp.json()

    # RBAC permissions for public user
    assert data["permissions"]["role"] == "public"
    assert data["permissions"]["is_authenticated"] is False
    assert data["permissions"]["can_view_sensitive_disputes"] is False
    assert data["permissions"]["can_export_raw_geospatial"] is False

    # Check 7 domains exist
    assert "research" in data
    assert "policy" in data
    assert "land_use" in data
    assert "climate" in data
    assert "disputes" in data
    assert "projects" in data
    assert "geospatial" in data

    # Sensitive dispute details are masked
    assert data["disputes"]["sensitive_details_masked"] is True
    assert data["disputes"]["hotspots"] is None


def test_researcher_dashboard_metrics(dashboard_env: dict[str, Any]) -> None:
    client: TestClient = dashboard_env["client"]
    token = dashboard_env["researcher_token"]

    resp = client.get("/api/v1/dashboard/metrics", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()

    assert data["permissions"]["role"] == "researcher"
    assert data["permissions"]["is_authenticated"] is True
    assert data["permissions"]["can_export_raw_geospatial"] is True
    assert data["permissions"]["can_view_sensitive_disputes"] is False
    assert data["research"]["total_papers"] > 0
    assert len(data["research"]["top_themes"]) >= 1


def test_government_official_dispute_access(dashboard_env: dict[str, Any]) -> None:
    client: TestClient = dashboard_env["client"]
    token = dashboard_env["govt_token"]

    resp = client.get("/api/v1/dashboard/metrics", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()

    # Government official has access to sensitive dispute hotspots
    assert data["permissions"]["role"] == "government_official"
    assert data["permissions"]["can_view_sensitive_disputes"] is True
    assert data["disputes"]["sensitive_details_masked"] is False
    assert data["disputes"]["hotspots"] is not None
    assert len(data["disputes"]["hotspots"]) >= 1
    assert data["disputes"]["hotspots"][0]["district"] == "Pune"


def test_admin_dashboard_full_permissions(dashboard_env: dict[str, Any]) -> None:
    client: TestClient = dashboard_env["client"]
    token = dashboard_env["admin_token"]

    resp = client.get("/api/v1/dashboard/metrics", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()

    assert data["permissions"]["role"] == "admin"
    assert data["permissions"]["can_view_sensitive_disputes"] is True
    assert data["permissions"]["can_export_raw_geospatial"] is True
    assert data["permissions"]["can_view_agency_audits"] is True


def test_individual_dimension_endpoints(dashboard_env: dict[str, Any]) -> None:
    client: TestClient = dashboard_env["client"]

    r_res = client.get("/api/v1/dashboard/research")
    assert r_res.status_code == 200
    assert "top_themes" in r_res.json()

    r_pol = client.get("/api/v1/dashboard/policies")
    assert r_pol.status_code == 200
    assert "enacted_count" in r_pol.json()

    r_lu = client.get("/api/v1/dashboard/land-use")
    assert r_lu.status_code == 200
    assert "agricultural_pct" in r_lu.json()

    r_clim = client.get("/api/v1/dashboard/climate")
    assert r_clim.status_code == 200
    assert "coastal_vulnerability_index" in r_clim.json()

    r_disp = client.get("/api/v1/dashboard/disputes")
    assert r_disp.status_code == 200
    assert "resolution_rate_pct" in r_disp.json()

    r_proj = client.get("/api/v1/dashboard/projects")
    assert r_proj.status_code == 200
    assert "drone_surveyed_villages" in r_proj.json()

    r_geo = client.get("/api/v1/dashboard/geospatial")
    assert r_geo.status_code == 200
    assert "total_parcels_digitized" in r_geo.json()


def test_legacy_stats_endpoint(dashboard_env: dict[str, Any]) -> None:
    client: TestClient = dashboard_env["client"]
    resp = client.get("/api/v1/dashboard/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_resources" in data
    assert "total_research_papers" in data
