import smtplib
import socket
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app
from app.services.email import (
    EmailDeliveryResult,
    get_smtp_status,
    is_smtp_configured,
    send_email_sync,
    send_welcome_email,
)


def test_email_delivery_result_semantics() -> None:
    res_success = EmailDeliveryResult(success=True, status="sent", message="Delivered")
    assert bool(res_success) is True
    assert res_success.success is True
    assert res_success.status == "sent"
    assert res_success["status"] == "sent"

    res_simulated = EmailDeliveryResult(success=True, status="simulated", message="Simulated delivery")
    assert bool(res_simulated) is True
    assert res_simulated.status == "simulated"

    res_fail = EmailDeliveryResult(success=False, status="failed", message="Auth failure")
    assert bool(res_fail) is False
    assert res_fail.success is False
    assert res_fail.status == "failed"


def test_smtp_password_cleaning_spaces_and_quotes() -> None:
    # 16-character Google App Password format: 'abcd efgh ijkl mnop'
    s = Settings(smtp_password="'abcd efgh ijkl mnop'")
    assert s.smtp_password == "abcdefghijklmnop"

    s2 = Settings(smtp_password='"my-custom-pass"')
    assert s2.smtp_password == "my-custom-pass"

    s3 = Settings(smtp_user="  myuser@gmail.com  ")
    assert s3.smtp_user == "myuser@gmail.com"


def test_smtp_status_masking() -> None:
    with patch("app.services.email.settings.smtp_user", "suryanshu@gmail.com"), \
         patch("app.services.email.settings.smtp_password", "secretapppass123"), \
         patch("app.services.email.settings.smtp_port", 587), \
         patch("app.services.email.settings.smtp_ssl", False), \
         patch("app.services.email.settings.smtp_tls", True):
        status = get_smtp_status()
        assert status["configured"] is True
        assert status["user_masked"] == "su***@gmail.com"
        assert status["protocol"] == "STARTTLS"
        assert status["port"] == 587


def test_smtp_status_port_465_ssl() -> None:
    with patch("app.services.email.settings.smtp_user", "admin@bhoomitra.gov.in"), \
         patch("app.services.email.settings.smtp_password", "secretpass"), \
         patch("app.services.email.settings.smtp_port", 465), \
         patch("app.services.email.settings.smtp_ssl", False):
        status = get_smtp_status()
        assert status["configured"] is True
        assert status["protocol"] == "SSL"
        assert status["port"] == 465


def test_send_email_sync_simulated_when_unconfigured() -> None:
    with patch("app.services.email.settings.smtp_user", None), \
         patch("app.services.email.settings.smtp_password", None):
        result = send_email_sync(
            to_email="citizen@example.com",
            subject="Welcome to Bhoomitra",
            html_body="<p>Test</p>",
        )
        assert result.success is True
        assert result.status == "simulated"
        assert "not configured" in result.message


def test_send_email_sync_gmail_auth_error_translation() -> None:
    with patch("app.services.email.settings.smtp_user", "test@gmail.com"), \
         patch("app.services.email.settings.smtp_password", "badpass"), \
         patch("app.services.email.settings.smtp_host", "smtp.gmail.com"), \
         patch("app.services.email.settings.smtp_port", 587), \
         patch("smtplib.SMTP") as mock_smtp_cls:
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(
            535, b"5.7.8 Username and Password not accepted. BadCredentials"
        )
        mock_smtp_cls.return_value = mock_server

        # Also mock fallback port 465 SSL
        with patch("smtplib.SMTP_SSL") as mock_ssl_cls:
            mock_ssl_server = MagicMock()
            mock_ssl_server.login.side_effect = smtplib.SMTPAuthenticationError(
                535, b"5.7.8 Username and Password not accepted. BadCredentials"
            )
            mock_ssl_cls.return_value = mock_ssl_server

            result = send_email_sync(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_body="<p>Test</p>",
            )

            assert result.success is False
            assert result.status == "failed"
            assert "Google App Password" in result.message


def test_send_email_sync_gmail_port_failover() -> None:
    # Primary port 587 times out, fallback port 465 succeeds
    with patch("app.services.email.settings.smtp_user", "test@gmail.com"), \
         patch("app.services.email.settings.smtp_password", "validpass"), \
         patch("app.services.email.settings.smtp_host", "smtp.gmail.com"), \
         patch("app.services.email.settings.smtp_port", 587), \
         patch("smtplib.SMTP") as mock_smtp_cls, \
         patch("smtplib.SMTP_SSL") as mock_ssl_cls:

        mock_smtp_cls.side_effect = socket.timeout("timed out on 587")

        mock_ssl_server = MagicMock()
        mock_ssl_cls.return_value = mock_ssl_server

        result = send_email_sync(
            to_email="recipient@example.com",
            subject="Test Subject",
            html_body="<p>Test</p>",
        )

        assert result.success is True
        assert result.status == "sent"
        assert result.get("details", {}).get("failover_used") is True


def test_smtp_status_api_endpoint(client: TestClient) -> None:
    resp = client.get("/api/v1/auth/smtp-status")
    assert resp.status_code == 200
    data = resp.json()
    assert "configured" in data
    assert "host" in data
    assert "port" in data
    assert "protocol" in data


def test_test_smtp_api_endpoint_unconfigured(client: TestClient) -> None:
    with patch("app.services.email.settings.smtp_user", None), \
         patch("app.services.email.settings.smtp_password", None):
        resp = client.post(
            "/api/v1/auth/test-smtp",
            json={"to_email": "test@example.com"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is False
        assert data["status"] == "unconfigured"

