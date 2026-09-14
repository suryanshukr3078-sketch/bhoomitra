from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.services.assistant_service import (
    DISCLAIMER_TEXT,
    INSUFFICIENT_INFO_ANSWER,
    format_context_block,
    generate_rag_answer,
)


def test_format_context_block():
    resources = [
        {
            "id": "res-1",
            "title": "Title 1",
            "resource_type": "policy",
            "abstract": "Summary 1",
            "publisher": "Govt of AP",
        },
        {
            "id": "res-2",
            "title": "Title 2",
            "resource_type": "research_paper",
            "abstract": "Summary 2",
        },
    ]
    block = format_context_block(resources)
    assert "[1] Title: Title 1" in block
    assert "Type: policy | Publisher: Govt of AP" in block
    assert "[2] Title: Title 2" in block
    assert "Abstract/Summary: Summary 2" in block


def test_generate_rag_answer_empty_resources():
    res = generate_rag_answer("What are forest rights?", [])
    assert res["answer"] == INSUFFICIENT_INFO_ANSWER
    assert res["disclaimer"] == DISCLAIMER_TEXT
    assert res["sources"] == []


def test_generate_rag_answer_with_mocked_gemini():
    resources = [
        {
            "id": "res-123",
            "title": "Maharashtra Land Revenue Code Sec 148",
            "resource_type": "policy",
            "abstract": "Mandates topological polygon validation for all mutation deeds.",
            "similarity_score": 0.89,
        }
    ]

    mock_response = MagicMock()
    mock_response.text = "Under the Maharashtra Land Revenue Code [1], topological validation is required."

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch("app.services.assistant_service.get_effective_gemini_api_key", return_value="fake_key"), \
         patch("google.genai.Client", return_value=mock_client):
        result = generate_rag_answer("What does the code mandate?", resources)

    assert result["provider"] == "gemini"
    assert "topological validation is required" in result["answer"]
    assert "[1]" in result["answer"]
    assert len(result["sources"]) == 1
    assert result["sources"][0]["id"] == "res-123"
    assert result["disclaimer"] == DISCLAIMER_TEXT


def test_assistant_endpoint_post_and_get(client: TestClient):
    # Test POST
    post_resp = client.post(
        "/api/v1/search/assistant",
        json={"question": "What are the rules for cadastral mutations?", "limit": 3},
    )
    assert post_resp.status_code == 200
    data = post_resp.json()
    assert "answer" in data
    assert "sources" in data
    assert "disclaimer" in data
    assert data["disclaimer"] == DISCLAIMER_TEXT
    assert isinstance(data["sources"], list)

    # Test GET alias
    get_resp = client.get(
        "/api/v1/search/assistant?q=cadastral&limit=2",
    )
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert "answer" in get_data
    assert "sources" in get_data
    assert get_data["disclaimer"] == DISCLAIMER_TEXT


def test_assistant_endpoint_rate_limiting(client: TestClient):
    statuses = []
    for _ in range(12):
        resp = client.post(
            "/api/v1/search/assistant",
            json={"question": "Rate limit test question", "limit": 1},
        )
        statuses.append(resp.status_code)

    # 10 allowed per minute, 11th and 12th should be 429
    assert 429 in statuses
