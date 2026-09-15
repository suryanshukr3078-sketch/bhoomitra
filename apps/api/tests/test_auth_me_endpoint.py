import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_auth_me_unauthenticated_json_returns_401():
    client = TestClient(app, base_url="http://localhost")
    resp = client.get("/api/v1/auth/me", headers={"Accept": "application/json"})
    assert resp.status_code == 401
    data = resp.json()
    assert "detail" in data
    assert "Missing authentication credentials" in data["detail"]


def test_auth_me_demo_mode_returns_200():
    client = TestClient(app, base_url="http://localhost")
    resp = client.get("/api/v1/auth/me?demo=true", headers={"Accept": "application/json"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "Academic Researcher"
    assert "National Cadastral Research Institute" in data["organization_name"]
    assert data["is_active"] is True


def test_auth_me_browser_navigation_returns_html_gateway():
    client = TestClient(app, base_url="http://localhost")
    resp = client.get("/api/v1/auth/me", headers={"Accept": "text/html,application/xhtml+xml"})
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")
    assert "Authentication Gateway" in resp.text
    assert "Direct Portal Access" in resp.text
    assert "Researcher & Academic" in resp.text


def test_auth_me_browser_demo_returns_html():
    client = TestClient(app, base_url="http://localhost")
    resp = client.get("/api/v1/auth/me?demo=true", headers={"Accept": "text/html"})
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")
    assert "Demo Preview Session" in resp.text
    assert "Dr. Aarav Sharma" in resp.text


def test_auth_me_raw_json_override():
    client = TestClient(app, base_url="http://localhost")
    resp = client.get("/api/v1/auth/me?demo=true&format=json", headers={"Accept": "text/html"})
    assert resp.status_code == 200
    assert "application/json" in resp.headers.get("content-type", "")
    data = resp.json()
    assert data["role"] == "Academic Researcher"
