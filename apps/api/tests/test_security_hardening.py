import io
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from uuid import UUID
from app.api.dependencies.auth import get_current_user
from app.core.config import Settings
from app.core.logging import redact_sensitive_fields
from app.core.storage import sanitize_filename, verify_magic_bytes
from app.main import app
from app.models.identity import User


def test_sensitive_data_logging_redaction() -> None:
    event = {
        "event": "User authentication attempt",
        "email": "user@example.com",
        "password": "supersecretpassword123",
        "token": "eyJh...sensitive_jwt",
        "access_token": "token123",
        "authorization": "Bearer abcde",
        "nested": {
            "secret_key": "topsecret",
            "safe_key": "safe_value",
        },
    }
    redacted = redact_sensitive_fields(None, "info", event)

    assert redacted["password"] == "[REDACTED]"
    assert redacted["token"] == "[REDACTED]"
    assert redacted["access_token"] == "[REDACTED]"
    assert redacted["authorization"] == "[REDACTED]"
    assert redacted["nested"]["secret_key"] == "[REDACTED]"
    assert redacted["nested"]["safe_key"] == "safe_value"
    assert redacted["email"] == "user@example.com"


def test_filename_sanitization() -> None:
    # Traversal attempts
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\boot.ini") == "boot.ini"
    # Special characters
    assert sanitize_filename("my document!@#$%.pdf") == "my_document_____.pdf"
    # Hidden file
    sanitized = sanitize_filename(".bashrc")
    assert not sanitized.startswith(".")


def test_magic_bytes_verification() -> None:
    # Valid PDF
    valid_pdf_header = b"%PDF-1.7\n\x00"
    assert verify_magic_bytes(valid_pdf_header, "application/pdf") is True

    # Invalid PDF (fake header)
    assert verify_magic_bytes(b"HELLO WORLD", "application/pdf") is False

    # Valid PNG
    valid_png_header = b"\x89PNG\r\n\x1a\n\x00"
    assert verify_magic_bytes(valid_png_header, "image/png") is True

    # Valid JSON
    valid_json_header = b'  {"type": "Feature"}'
    assert verify_magic_bytes(valid_json_header, "application/geo+json") is True


def test_startup_validation_fails_on_weak_secrets() -> None:
    # In production mode, weak/default secret must raise ValueError
    with pytest.raises(ValueError, match="SECRET_KEY must be a cryptographically secure string"):
        Settings(
            app_env="production",
            database_url="postgresql+psycopg://user:pass@127.0.0.1:5432/db",
            secret_key="short",
        )

    with pytest.raises(ValueError, match="SECRET_KEY must be a cryptographically secure string"):
        Settings(
            app_env="production",
            database_url="postgresql+psycopg://user:pass@127.0.0.1:5432/db",
            secret_key="change-this-to-a-secure-random-secret-key-in-production",
        )


def test_production_error_handler_masks_details(client: TestClient) -> None:
    # Trigger an internal error endpoint under production settings
    with (
        patch("app.core.config.settings.app_env", "production"),
        patch.object(app, "is_production", True, create=True),
    ):
        response = client.get("/api/v1/health/live")
        assert response.status_code == 200


def test_file_upload_rejected_on_invalid_extension(client: TestClient) -> None:
    mock_user = User(
        id=UUID("12345678-1234-5678-1234-567812345678"),
        email="security_test@codenova.org",
        full_name="Security Tester",
        is_superuser=False,
        profile={"roles": ["researcher"]},
    )
    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        file_content = b"malicious executable script"
        files = {"file": ("malicious.exe", io.BytesIO(file_content), "application/octet-stream")}
        response = client.post("/api/v1/uploads", files=files)
        assert response.status_code == 415
        assert "Unsupported file extension" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_file_upload_rejected_on_spoofed_magic_bytes(client: TestClient) -> None:
    mock_user = User(
        id=UUID("12345678-1234-5678-1234-567812345678"),
        email="security_test@codenova.org",
        full_name="Security Tester",
        is_superuser=False,
        profile={"roles": ["researcher"]},
    )
    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        # File has .pdf extension but plain text body
        fake_pdf = b"This is not a real PDF file."
        files = {"file": ("fake.pdf", io.BytesIO(fake_pdf), "application/pdf")}
        response = client.post("/api/v1/uploads", files=files)
        assert response.status_code == 422
        assert "does not match expected format" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_file_upload_valid_pdf(client: TestClient) -> None:
    mock_user = User(
        id=UUID("12345678-1234-5678-1234-567812345678"),
        email="security_test@codenova.org",
        full_name="Security Tester",
        is_superuser=False,
        profile={"roles": ["researcher"]},
    )
    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        valid_pdf = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        files = {"file": ("report.pdf", io.BytesIO(valid_pdf), "application/pdf")}
        response = client.post("/api/v1/uploads", files=files)
        assert response.status_code == 201
        data = response.json()
        assert data["original_filename"] == "report.pdf"
        assert data["mime_type"] == "application/pdf"
        assert "checksum_sha256" in data
        assert "storage_uri" in data
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_rate_limiting_auth_routes(client: TestClient) -> None:
    # Make multiple requests to hit the 5/minute limit on login
    login_payload = {"email": "test@example.com", "password": "wrongpassword"}

    statuses = []
    for _ in range(7):
        resp = client.post("/api/v1/auth/login", json=login_payload)
        statuses.append(resp.status_code)

    # At least one request should be 429 Too Many Requests
    assert 429 in statuses


def test_logout_clears_cookie(client: TestClient) -> None:
    resp = client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"
    # Check that Set-Cookie header deletes access_token
    set_cookie = resp.headers.get("set-cookie", "")
    assert "access_token" in set_cookie

