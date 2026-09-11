from typing import Any
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert "environment" in data


def test_liveness_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "service" in data
    assert "version" in data


def test_readiness_endpoint_success(client: TestClient) -> None:
    fake_db_info: dict[str, Any] = {
        "database_name": "land_governance",
        "database_user": "land_admin",
        "postgis_version": "3.6.0",
    }
    with patch(
        "app.api.v1.routes.health.check_database_connection",
        new=AsyncMock(return_value=fake_db_info),
    ):
        response = client.get("/api/v1/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["database"] == fake_db_info
        assert "service" in data


def test_readiness_endpoint_failure(client: TestClient) -> None:
    with patch(
        "app.api.v1.routes.health.check_database_connection",
        side_effect=RuntimeError("Connection refused"),
    ):
        response = client.get("/api/v1/health/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["detail"] == "Database is not ready."


def test_request_id_middleware_generated(client: TestClient) -> None:
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 0


def test_request_id_middleware_propagated(client: TestClient) -> None:
    custom_id = "test-req-id-12345"
    response = client.get("/api/v1/health/live", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id
