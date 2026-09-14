import uuid
from collections.abc import AsyncGenerator, Generator
from datetime import UTC, datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.enums import MembershipStatus, OrganizationType, UserStatus
from app.models.identity import Organization, OrganizationMembership, User


@pytest.fixture(autouse=True)
def disable_limiter() -> Generator[None, None, None]:
    limiter.enabled = False
    yield
    limiter.enabled = True


@pytest.fixture
def admin_test_env() -> Generator[dict[str, Any], None, None]:
    now = datetime.now(UTC)
    admin_id = uuid.uuid4()
    regular_id = uuid.uuid4()
    pending_id = uuid.uuid4()
    org_id = uuid.uuid4()

    admin_user = User(
        id=admin_id,
        email="superadmin@landgov.gov",
        full_name="Super Admin",
        password_hash=hash_password("AdminPass123!"),
        is_superuser=True,
        status=UserStatus.ACTIVE,
        profile={"roles": ["admin"], "role": "admin"},
        created_at=now,
    )

    regular_user = User(
        id=regular_id,
        email="regular@citizen.org",
        full_name="Regular Citizen",
        password_hash=hash_password("CitizenPass123!"),
        is_superuser=False,
        status=UserStatus.ACTIVE,
        profile={"roles": ["citizen"]},
        created_at=now,
    )

    pending_user = User(
        id=pending_id,
        email="pending_officer@revenue.gov",
        full_name="Pending Officer",
        password_hash=hash_password("OfficerPass123!"),
        is_superuser=False,
        status=UserStatus.PENDING,
        profile={},
        created_at=now,
    )

    org = Organization(
        id=org_id,
        name="Department of Land Resources",
        slug="dept-land-resources",
        organization_type=OrganizationType.GOVERNMENT,
        is_active=True,
        created_at=now,
    )

    pending_membership = OrganizationMembership(
        user_id=pending_id,
        organization_id=org_id,
        title="Government Officer",
        status=MembershipStatus.PENDING,
        created_at=now,
    )
    pending_membership.organization = org
    pending_user.memberships = [pending_membership]

    users_db: dict[uuid.UUID, User] = {
        admin_id: admin_user,
        regular_id: regular_user,
        pending_id: pending_user,
    }
    orgs_db: dict[uuid.UUID, Organization] = {org_id: org}
    memberships_db: list[OrganizationMembership] = [pending_membership]

    class FakeSession:
        async def execute(self, stmt: Any) -> Any:
            mock_res = MagicMock()
            stmt_str = str(stmt)

            if "FROM users" in stmt_str or "users.id" in stmt_str:
                # Check if fetching by ID
                for u_id, u in users_db.items():
                    if str(u_id) in stmt_str:
                        mock_res.scalar_one_or_none.return_value = u
                        return mock_res
                # Or compiling params
                try:
                    compiled = stmt.compile()
                    for param in compiled.params.values():
                        if isinstance(param, uuid.UUID) and param in users_db:
                            mock_res.scalar_one_or_none.return_value = users_db[param]
                            return mock_res
                        if isinstance(param, str) and "@" in param:
                            for u in users_db.values():
                                if u.email.lower() == param.lower():
                                    mock_res.scalar_one_or_none.return_value = u
                                    return mock_res
                except Exception:
                    pass
                # Otherwise return all users
                mock_res.scalars.return_value.all.return_value = list(users_db.values())
                return mock_res

            elif "FROM organizations" in stmt_str:
                # Returns list of (org, member_count)
                mock_res.all.return_value = [(o, len(memberships_db)) for o in orgs_db.values()]
                return mock_res

            elif "FROM organization_memberships" in stmt_str:
                # Return matching membership
                matched = memberships_db
                for m in memberships_db:
                    if str(m.user_id) in stmt_str:
                        mock_res.scalars.return_value.first.return_value = m
                        mock_res.scalar_one_or_none.return_value = m
                        return mock_res
                mock_res.scalars.return_value.first.return_value = (
                    memberships_db[0] if memberships_db else None
                )
                mock_res.scalar_one_or_none.return_value = (
                    memberships_db[0] if memberships_db else None
                )
                return mock_res

            return mock_res

        async def get(self, model: Any, ident: Any) -> Any:
            if model == User:
                return users_db.get(ident)
            return None

        def add(self, obj: Any) -> None:
            if isinstance(obj, User):
                users_db[obj.id] = obj
            elif isinstance(obj, Organization):
                orgs_db[obj.id] = obj
            elif isinstance(obj, OrganizationMembership):
                memberships_db.append(obj)

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
        admin_token = create_access_token({"sub": str(admin_id), "email": admin_user.email})
        regular_token = create_access_token({"sub": str(regular_id), "email": regular_user.email})
        yield {
            "client": test_client,
            "admin_token": admin_token,
            "regular_token": regular_token,
            "pending_user": pending_user,
            "pending_membership": pending_membership,
            "org": org,
        }
    app.dependency_overrides.clear()


def test_unauthenticated_admin_access_rejected(admin_test_env: dict[str, Any]) -> None:
    client: TestClient = admin_test_env["client"]

    r1 = client.get("/api/v1/admin/users")
    assert r1.status_code == 401

    r2 = client.get("/api/v1/admin/organizations")
    assert r2.status_code == 401

    r3 = client.patch(f"/api/v1/admin/memberships/{uuid.uuid4()}/approve")
    assert r3.status_code == 401


def test_non_admin_access_forbidden(admin_test_env: dict[str, Any]) -> None:
    client: TestClient = admin_test_env["client"]
    token = admin_test_env["regular_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r1 = client.get("/api/v1/admin/users", headers=headers)
    assert r1.status_code == 403
    assert "Administrative privileges required" in r1.json()["detail"]

    r2 = client.get("/api/v1/admin/organizations", headers=headers)
    assert r2.status_code == 403

    r3 = client.patch(f"/api/v1/admin/memberships/{uuid.uuid4()}/approve", headers=headers)
    assert r3.status_code == 403


def test_admin_can_list_users_and_organizations(admin_test_env: dict[str, Any]) -> None:
    client: TestClient = admin_test_env["client"]
    token = admin_test_env["admin_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/admin/users", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert data["total"] >= 1
    assert any(u["email"] == "pending_officer@revenue.gov" for u in data["users"])

    resp_org = client.get("/api/v1/admin/organizations", headers=headers)
    assert resp_org.status_code == 200
    org_data = resp_org.json()
    assert "organizations" in org_data
    assert org_data["total"] >= 1
    assert org_data["organizations"][0]["name"] == "Department of Land Resources"


def test_admin_full_approval_cycle(admin_test_env: dict[str, Any]) -> None:
    client: TestClient = admin_test_env["client"]
    admin_token = admin_test_env["admin_token"]
    pending_user = admin_test_env["pending_user"]
    pending_mem = admin_test_env["pending_membership"]

    # 1. Verify pending officer cannot log in initially (403)
    login_fail = client.post(
        "/api/v1/auth/login",
        json={"email": pending_user.email, "password": "OfficerPass123!"},
    )
    assert login_fail.status_code == 403
    assert "pending verification" in login_fail.json()["detail"]

    # 2. Admin approves membership via user_id identifier
    approve_resp = client.patch(
        f"/api/v1/admin/memberships/{pending_user.id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert approve_resp.status_code == 200
    app_data = approve_resp.json()
    assert app_data["status"] == "success"
    assert app_data["membership_status"] == "active"
    assert app_data["user_status"] == "active"

    assert pending_mem.status == MembershipStatus.ACTIVE
    assert pending_user.status == UserStatus.ACTIVE

    # 3. Verified officer can now log in successfully (200)
    login_success = client.post(
        "/api/v1/auth/login",
        json={"email": pending_user.email, "password": "OfficerPass123!"},
    )
    assert login_success.status_code == 200
    assert "access_token" in login_success.cookies or login_success.json().get("token") is not None


def test_admin_full_rejection_cycle(admin_test_env: dict[str, Any]) -> None:
    client: TestClient = admin_test_env["client"]
    admin_token = admin_test_env["admin_token"]
    pending_user = admin_test_env["pending_user"]
    pending_mem = admin_test_env["pending_membership"]

    # Admin rejects membership
    reject_resp = client.patch(
        f"/api/v1/admin/memberships/{pending_user.id}/reject",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert reject_resp.status_code == 200
    rej_data = reject_resp.json()
    assert rej_data["status"] == "success"
    assert rej_data["membership_status"] == "removed"
    assert rej_data["user_status"] == "suspended"

    assert pending_mem.status == MembershipStatus.REMOVED
    assert pending_user.status == UserStatus.SUSPENDED

    # Login remains blocked
    login_fail = client.post(
        "/api/v1/auth/login",
        json={"email": pending_user.email, "password": "OfficerPass123!"},
    )
    assert login_fail.status_code in (401, 403)
