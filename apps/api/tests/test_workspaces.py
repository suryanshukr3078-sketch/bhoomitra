from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.main import app


@pytest.fixture
def test_client() -> Generator[TestClient, None, None]:
    async def override_get_db():
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_session.execute = AsyncMock(return_value=mock_result)
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app, base_url="http://localhost")
    yield client
    app.dependency_overrides.clear()


def test_government_workspace_endpoint(test_client: TestClient) -> None:
    res = test_client.get("/api/v1/workspace/government")
    assert res.status_code == 200
    data = res.json()
    assert data["workspace_type"] == "government"
    assert "pending_mutations" in data
    assert len(data["pending_mutations"]) > 0
    assert "cadastral_topology_flags" in data
    assert "svamitva_drone_progress" in data
    assert data["summary"]["avg_mutation_turnaround_days"] == 3.4


def test_government_mutation_action(test_client: TestClient) -> None:
    payload = {
        "action": "approve",
        "remarks": "Title verified against digital RoR ledger. Boundary invariants validated.",
    }
    res = test_client.post("/api/v1/workspace/government/mutations/mut-001/action", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["mutation"]["status"] == "approved"
    assert "officer_action" in data["mutation"]
    assert data["mutation"]["officer_action"]["action"] == "approve"


def test_researcher_workspace_endpoint(test_client: TestClient) -> None:
    res = test_client.get("/api/v1/workspace/researcher")
    assert res.status_code == 200
    data = res.json()
    assert data["workspace_type"] == "researcher"
    assert "spatial_layers_workbench" in data
    assert len(data["spatial_layers_workbench"]) > 0
    assert "citation_benchmarks" in data


def test_policymaker_workspace_endpoint(test_client: TestClient) -> None:
    res = test_client.get("/api/v1/workspace/policymaker")
    assert res.status_code == 200
    data = res.json()
    assert data["workspace_type"] == "policymaker"
    assert "draft_bills" in data
    assert "state_reform_scorecard" in data
    assert len(data["state_reform_scorecard"]) > 0
    assert data["state_reform_scorecard"][0]["state"] == "Maharashtra"


def test_civil_society_workspace_endpoint(test_client: TestClient) -> None:
    res = test_client.get("/api/v1/workspace/civil-society")
    assert res.status_code == 200
    data = res.json()
    assert data["workspace_type"] == "civil_society"
    assert "community_tenure_claims" in data
    assert "citizen_grievances" in data
    assert "commons_encroachment_alerts" in data


def test_civil_society_grievance_submission(test_client: TestClient) -> None:
    payload = {
        "title": "Illegal diversion of pastoral commons survey 88/1",
        "category": "boundary_encroachment",
        "jurisdiction": "IN-MH-PUN",
        "complainant_name": "Gram Sevak Collective",
        "complainant_contact": "+91 98220 11223",
        "description": "Commercial warehouse construction initiated without gram sabha consent on designated grazing commons.",
        "parcel_id": "PAR-PUN-HAV-0881",
    }
    res = test_client.post("/api/v1/workspace/civil-society/grievances", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "ticket" in data
    assert data["ticket"]["title"] == payload["title"]
    assert data["ticket"]["status"] == "lodged_pending_intake"
