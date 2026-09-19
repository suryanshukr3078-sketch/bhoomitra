import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

# Ensure apps/api is in sys.path
apps_api_dir = Path(__file__).resolve().parent.parent
if str(apps_api_dir) not in sys.path:
    sys.path.insert(0, str(apps_api_dir))

from app.api.dependencies.db import get_db
from app.api.v1.routes.resources import MINIMAL_JPEG, MINIMAL_PNG
from app.main import app
from app.models.enums import ResourceStatus, ResourceType, ResourceVisibility
from app.models.resources import Resource


@pytest.fixture
def mock_target_resource() -> Resource:
    res = Resource(
        id=UUID("23387c84-6f0b-4bce-9105-5e9103a459dd"),
        title="Gold Crown Name Wallpaper",
        slug="gold-crown-name-wallpaper-suryanshu",
        abstract="A sample wallpaper resource with image binary in source_url.",
        resource_type=ResourceType.RESEARCH_PAPER,
        status=ResourceStatus.PUBLISHED,
        visibility=ResourceVisibility.PUBLIC,
        publisher="Indian Council of Agricultural Research (ICAR)",
        source_url="local://land-governance-documents/uploads/c0be4fd8-f7d6-4fe2-8e8c-7147d56dcc05/Gold_Crown_Name_Wallpaper_Suryanshu.jpeg",
        created_at=datetime.now(timezone.utc),
        is_demo=False,
    )
    res.versions = []
    res.research_paper = None
    res.policy = None
    res.spatial_layer = None
    return res


from app.api.dependencies.auth import get_current_user
from app.models.identity import User


@pytest.fixture
def test_client_with_resource(mock_target_resource: Resource) -> TestClient:
    mock_user = User(
        id=UUID("11111111-1111-1111-1111-111111111111"),
        email="researcher@codenova.org",
        full_name="Researcher Test",
        is_superuser=False,
        profile={"roles": ["researcher"]},
    )

    async def override_get_db():
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_target_resource
        mock_result.scalars.return_value.first.return_value = mock_target_resource
        mock_result.scalars.return_value.all.return_value = [mock_target_resource]
        mock_session.execute = AsyncMock(return_value=mock_result)
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    client = TestClient(app, base_url="http://localhost")
    yield client
    app.dependency_overrides.clear()


def test_direct_resource_download(test_client_with_resource: TestClient) -> None:
    response = test_client_with_resource.get("/api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert 'filename="Gold_Crown_Name_Wallpaper_Suryanshu.jpeg"' in response.headers["content-disposition"]
    assert response.headers["content-disposition"].startswith("attachment;")
    assert response.content == MINIMAL_JPEG


def test_query_path_resource_download(test_client_with_resource: TestClient) -> None:
    # Test /?path=api/v1/resources/...
    response = test_client_with_resource.get(
        "/?path=api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert 'filename="Gold_Crown_Name_Wallpaper_Suryanshu.jpeg"' in response.headers["content-disposition"]
    assert response.content == MINIMAL_JPEG


def test_api_prefix_query_path(test_client_with_resource: TestClient) -> None:
    # Test /api?path=...
    response = test_client_with_resource.get(
        "/api?path=api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.content == MINIMAL_JPEG


def test_api_index_py_query_path(test_client_with_resource: TestClient) -> None:
    # Test /api/index.py?path=...
    response = test_client_with_resource.get(
        "/api/index.py?path=api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.content == MINIMAL_JPEG


def test_research_router_download(test_client_with_resource: TestClient) -> None:
    # Test /api/v1/research/...
    response = test_client_with_resource.get(
        "/api/v1/research/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.content == MINIMAL_JPEG


def test_documents_router_download(test_client_with_resource: TestClient) -> None:
    # Test /api/v1/documents/...
    response = test_client_with_resource.get(
        "/api/v1/documents/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.content == MINIMAL_JPEG


def test_view_resource_file_inline(test_client_with_resource: TestClient) -> None:
    # Test inline view disposition
    response = test_client_with_resource.get(
        "/?path=api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd/view"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.headers["content-disposition"].startswith("inline;")
    assert 'filename="Gold_Crown_Name_Wallpaper_Suryanshu.jpeg"' in response.headers["content-disposition"]


def test_resource_details_mime_and_filename(test_client_with_resource: TestClient) -> None:
    # Direct get
    response = test_client_with_resource.get("/api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd")
    assert response.status_code == 200
    data = response.json()
    assert data["file"] is not None
    assert data["file"]["filename"] == "Gold_Crown_Name_Wallpaper_Suryanshu.jpeg"
    assert data["file"]["mime_type"] == "image/jpeg"

    # Query get
    response_q = test_client_with_resource.get("/?path=api/v1/resources/23387c84-6f0b-4bce-9105-5e9103a459dd")
    assert response_q.status_code == 200
    data_q = response_q.json()
    assert data_q["file"]["filename"] == "Gold_Crown_Name_Wallpaper_Suryanshu.jpeg"
    assert data_q["file"]["mime_type"] == "image/jpeg"


def test_policies_router_download_and_view(test_client_with_resource: TestClient) -> None:
    # Test /api/v1/policies/... download
    resp_dl = test_client_with_resource.get(
        "/api/v1/policies/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert resp_dl.status_code == 200
    assert resp_dl.headers["content-type"] == "image/jpeg"

    # Test /api/v1/policies/... view
    resp_view = test_client_with_resource.get(
        "/api/v1/policies/23387c84-6f0b-4bce-9105-5e9103a459dd/view"
    )
    assert resp_view.status_code == 200
    assert resp_view.headers["content-disposition"].startswith("inline;")


def test_datasets_router_download_and_view(test_client_with_resource: TestClient) -> None:
    # Test /api/v1/datasets/... download
    resp_dl = test_client_with_resource.get(
        "/api/v1/datasets/23387c84-6f0b-4bce-9105-5e9103a459dd/download"
    )
    assert resp_dl.status_code == 200
    assert resp_dl.headers["content-type"] == "image/jpeg"

    # Test /api/v1/datasets/... view
    resp_view = test_client_with_resource.get(
        "/api/v1/datasets/23387c84-6f0b-4bce-9105-5e9103a459dd/view"
    )
    assert resp_view.status_code == 200
    assert resp_view.headers["content-disposition"].startswith("inline;")


def test_publisher_field_in_research_and_report_resources(test_client_with_resource: TestClient) -> None:
    # 1. Create a research paper with a publisher
    create_payload = {
        "title": "Geospatial Tenure Study 2026",
        "abstract": "In-depth study on spatial land rights and cadastral surveying.",
        "resource_type": "research_paper",
        "visibility": "public",
        "status": "published",
        "publisher": "Indian Council of Agricultural Research (ICAR)",
        "journal": "Indian Journal of Land Governance",
    }
    create_resp = test_client_with_resource.post("/api/v1/resources", json=create_payload)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    # 2. Get resource details and verify publisher
    get_resp = test_client_with_resource.get(f"/api/v1/resources/{created_id}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert "publisher" in data
    assert data["publisher"] == "Indian Council of Agricultural Research (ICAR)"

    # 3. List resources and verify publisher is present
    list_resp = test_client_with_resource.get("/api/v1/resources?resource_type=research_paper")
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    assert len(items) > 0
    assert any("publisher" in item and item["publisher"] is not None for item in items)


