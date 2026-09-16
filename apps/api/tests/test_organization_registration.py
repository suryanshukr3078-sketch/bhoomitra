import time
from collections.abc import AsyncGenerator, Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.main import app
from app.services.otp import get_otp_for_debugging


@pytest.fixture(autouse=True)
def disable_limiter() -> Generator[None, None, None]:
    limiter.enabled = False
    yield
    limiter.enabled = True


@pytest.fixture
def auth_client() -> Generator[TestClient, None, None]:
    users_by_email: dict[str, Any] = {}
    orgs_by_name: dict[str, Any] = {}

    class FakeSession:
        async def execute(self, stmt: Any) -> Any:
            mock_res = MagicMock()
            stmt_str = str(stmt)
            if "FROM users" in stmt_str or "users.email" in stmt_str:
                email_param = None
                try:
                    compiled = stmt.compile()
                    for param in compiled.params.values():
                        if isinstance(param, str) and "@" in param:
                            email_param = param.lower().strip()
                except Exception:
                    pass
                user = users_by_email.get(email_param) if email_param else None
                mock_res.scalar_one_or_none.return_value = user
            elif "FROM organizations" in stmt_str or "organizations.name" in stmt_str:
                org_name_param = None
                try:
                    compiled = stmt.compile()
                    for param in compiled.params.values():
                        if isinstance(param, str) and "@" not in param:
                            org_name_param = param.lower().strip()
                except Exception:
                    pass
                org = orgs_by_name.get(org_name_param) if org_name_param else None
                mock_res.scalar_one_or_none.return_value = org
            else:
                mock_res.scalar_one_or_none.return_value = None
            return mock_res

        def add(self, obj: Any) -> None:
            if hasattr(obj, "email"):
                users_by_email[obj.email.lower().strip()] = obj
            elif hasattr(obj, "name"):
                orgs_by_name[obj.name.lower().strip()] = obj

        async def flush(self) -> None:
            pass

        async def commit(self) -> None:
            pass

        async def rollback(self) -> None:
            pass

        async def refresh(self, obj: Any) -> None:
            pass

    async def override_get_db() -> AsyncGenerator[FakeSession, None]:
        yield FakeSession()

    app.dependency_overrides[get_db] = override_get_db
    with (
        patch("app.main.check_database_connection", new=AsyncMock(return_value={})),
        patch("app.main.close_database_connections", new=AsyncMock()),
        TestClient(app, base_url="http://localhost") as test_client,
    ):
        yield test_client
    app.dependency_overrides.clear()


def test_researcher_registration_and_immediate_login(auth_client: TestClient) -> None:
    ts = int(time.time())
    email = f"researcher_{ts}@university.edu"
    password = "ResearchPassword123!"

    # 1. Register as Researcher (initiates 2FA OTP)
    resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Dr. Aris Thorne",
            "password": password,
            "organization_name": "National Cadastral Research Center",
            "organization_category": "academic",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["otp_required"] is True
    assert data["status"] == "otp_required"

    # Verify registration OTP
    otp_code = get_otp_for_debugging(email)
    verify_resp = auth_client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp": otp_code, "action": "register"},
    )
    assert verify_resp.status_code == 200
    vdata = verify_resp.json()
    assert vdata["requires_verification"] is False
    assert vdata["token"] is not None
    assert vdata["user"]["is_active"] is True

    # 2. Confirm 2FA login works
    login_resp = auth_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    ldata = login_resp.json()
    assert ldata["otp_required"] is True

    login_otp = get_otp_for_debugging(email)
    verify_login = auth_client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp": login_otp, "action": "login"},
    )
    assert verify_login.status_code == 200
    assert verify_login.json()["token"] is not None
    assert verify_login.json()["user"]["email"] == email


def test_government_agency_registration_and_pending_login_block(auth_client: TestClient) -> None:
    ts = int(time.time())
    email = f"officer_{ts}@revenue.gov"
    password = "GovPassword123!"

    # 1. Register as Government Agency
    resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Rajesh Sharma",
            "password": password,
            "organization_name": "State Directorate of Land Records",
            "organization_category": "government",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["otp_required"] is True

    # Complete OTP verification
    reg_otp = get_otp_for_debugging(email)
    verify_resp = auth_client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp": reg_otp, "action": "register"},
    )
    assert verify_resp.status_code == 200
    vdata = verify_resp.json()
    assert vdata["requires_verification"] is True
    assert vdata["status"] == "pending"
    assert vdata["token"] is None
    assert vdata["user"]["is_active"] is False

    # 2. Confirm login is blocked with 403 Forbidden pending verification
    login_resp = auth_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 403
    detail = login_resp.json().get("detail", "")
    assert "pending verification" in detail.lower()


def test_policy_maker_registration_requires_verification(auth_client: TestClient) -> None:
    ts = int(time.time())
    email = f"policymaker_{ts}@parliament.gov"
    password = "PolicyPassword123!"

    resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Priya Nair",
            "password": password,
            "organization_name": "Land Policy Commission",
            "organization_category": "policy_maker",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["otp_required"] is True

    reg_otp = get_otp_for_debugging(email)
    verify_resp = auth_client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp": reg_otp, "action": "register"},
    )
    assert verify_resp.status_code == 200
    vdata = verify_resp.json()
    assert vdata["requires_verification"] is True
    assert vdata["status"] == "pending"

    # Confirm login is blocked with pending verification message
    login_resp = auth_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 403
    assert "pending verification" in login_resp.json()["detail"].lower()


def test_civil_society_registration_active_immediately(auth_client: TestClient) -> None:
    ts = int(time.time())
    email = f"advocate_{ts}@landrights.org"
    password = "CivilPassword123!"

    resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Sunita Patel",
            "password": password,
            "organization_name": "People's Land Foundation",
            "organization_category": "civil_society",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["otp_required"] is True

    reg_otp = get_otp_for_debugging(email)
    verify_resp = auth_client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp": reg_otp, "action": "register"},
    )
    assert verify_resp.status_code == 200
    vdata = verify_resp.json()
    assert vdata["requires_verification"] is False
    assert vdata["token"] is not None

    # Immediate login triggers 2FA
    login_resp = auth_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["otp_required"] is True


def test_organization_reuse_across_users(auth_client: TestClient) -> None:
    ts = int(time.time())
    org_name = f"Shared Research Institute {ts}"

    user1_resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": f"user1_{ts}@shared.org",
            "full_name": "Researcher One",
            "password": "Password123!",
            "organization_name": org_name,
            "organization_category": "research",
        },
    )
    assert user1_resp.status_code == 201

    user2_resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": f"user2_{ts}@shared.org",
            "full_name": "Researcher Two",
            "password": "Password123!",
            "organization_name": org_name.upper(),  # case-insensitive match
            "organization_category": "research",
        },
    )
    assert user2_resp.status_code == 201
