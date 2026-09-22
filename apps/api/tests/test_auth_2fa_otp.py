import time
from collections.abc import AsyncGenerator, Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.core.security import hash_password
from app.main import app
from app.models.enums import OrganizationType, UserStatus
from app.models.identity import Organization, OrganizationMembership, User
from app.services.otp import get_otp_for_debugging, store_otp


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
            elif "organization_memberships" in stmt_str:
                mock_res.first.return_value = None
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


def test_2fa_registration_flow(auth_client: TestClient) -> None:
    email = f"student_{int(time.time())}@codenova.org"
    password = "StudentPassword123!"

    # Step 1: Initiate register -> requires OTP
    resp = auth_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Nitin Kumar",
            "password": password,
            "organization_name": "Team CodeNova Lab",
            "organization_category": "research",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["otp_required"] is True
    assert data["status"] == "otp_required"

    # Step 2: Retrieve the active OTP code
    otp_code = get_otp_for_debugging(email)
    assert otp_code is not None
    assert len(otp_code) == 6

    # Step 3: Verify OTP -> completes registration & issues token
    verify_resp = auth_client.post(
        "/api/v1/auth/verify-otp",
        json={"email": email, "otp": otp_code, "action": "register"},
    )
    assert verify_resp.status_code == 200
    vdata = verify_resp.json()
    assert vdata["token"] is not None
    assert vdata["user"]["email"] == email


def test_2fa_login_flow(auth_client: TestClient) -> None:
    email = "researcher@codenova.org"
    password = "ValidPassword123!"

    # Create active user first directly
    import uuid
    from datetime import UTC, datetime
    u = User(
        id=uuid.uuid4(),
        email=email,
        full_name="Researcher Nova",
        password_hash=hash_password(password),
        status=UserStatus.ACTIVE,
        is_superuser=False,
    )
    u.created_at = datetime.now(UTC)

    # Put in mock session
    with patch("app.services.email.send_otp_email", return_value=MagicMock(success=True, status="sent")):
        # We need the user in auth_client
        auth_client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "full_name": "Researcher Nova",
                "password": password,
                "organization_name": "CodeNova Academic",
                "organization_category": "academic",
                "otp": "999999",  # dummy
            },
        )
        # Register properly with 2FA
        reg1 = auth_client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "full_name": "Researcher Nova",
                "password": password,
                "organization_name": "CodeNova Academic",
                "organization_category": "academic",
            },
        )
        otp1 = get_otp_for_debugging(email)
        auth_client.post(
            "/api/v1/auth/verify-otp",
            json={"email": email, "otp": otp1, "action": "register"},
        )

        # Now Login Step 1: Submit password -> triggers 2FA OTP
        login_resp = auth_client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        assert login_resp.status_code == 200
        ldata = login_resp.json()
        assert ldata["otp_required"] is True

        # Login Step 2: Retrieve login OTP and verify
        login_otp = get_otp_for_debugging(email)
        assert login_otp is not None

        # Test invalid OTP is rejected
        bad_verify = auth_client.post(
            "/api/v1/auth/verify-otp",
            json={"email": email, "otp": "000000", "action": "login"},
        )
        assert bad_verify.status_code == 400
        assert "Incorrect" in bad_verify.json()["detail"]

        # Test valid OTP succeeds
        verify_login = auth_client.post(
            "/api/v1/auth/verify-otp",
            json={"email": email, "otp": login_otp, "action": "login"},
        )
        assert verify_login.status_code == 200
        assert verify_login.json()["token"] is not None
        assert verify_login.json()["user"]["email"] == email
