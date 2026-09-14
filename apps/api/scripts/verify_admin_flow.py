import sys
import time
import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.enums import MembershipStatus, OrganizationType, UserStatus
from app.models.identity import Organization, OrganizationMembership, User

limiter.enabled = False

users_db: dict[uuid.UUID, User] = {}
orgs_db: dict[uuid.UUID, Organization] = {}
memberships_db: list[OrganizationMembership] = []

class FakeSession:
    async def execute(self, stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt)
        if "FROM users" in stmt_str or "users.email" in stmt_str or "users.id" in stmt_str:
            email_param = None
            try:
                compiled = stmt.compile()
                for param in compiled.params.values():
                    if isinstance(param, str) and "@" in param:
                        email_param = param.lower().strip()
                    elif isinstance(param, uuid.UUID) and param in users_db:
                        mock_res.scalar_one_or_none.return_value = users_db[param]
                        return mock_res
            except Exception:
                pass
            if email_param:
                for u in users_db.values():
                    if u.email.lower() == email_param:
                        mock_res.scalar_one_or_none.return_value = u
                        return mock_res
                mock_res.scalar_one_or_none.return_value = None
                return mock_res
            mock_res.scalars.return_value.all.return_value = list(users_db.values())
            return mock_res
        elif "FROM organizations" in stmt_str or "organizations.name" in stmt_str:
            name_param = None
            try:
                compiled = stmt.compile()
                for param in compiled.params.values():
                    if isinstance(param, str) and "@" not in param:
                        name_param = param.lower().strip()
            except Exception:
                pass
            if name_param:
                for o in orgs_db.values():
                    if o.name.lower() == name_param:
                        mock_res.scalar_one_or_none.return_value = o
                        return mock_res
                mock_res.scalar_one_or_none.return_value = None
                return mock_res
            mock_res.all.return_value = [(o, len([m for m in memberships_db if m.organization_id == o.id])) for o in orgs_db.values()]
            return mock_res
        elif "FROM organization_memberships" in stmt_str:
            for m in memberships_db:
                if str(m.user_id) in stmt_str:
                    mock_res.scalars.return_value.first.return_value = m
                    mock_res.scalar_one_or_none.return_value = m
                    return mock_res
            mock_res.scalars.return_value.first.return_value = memberships_db[0] if memberships_db else None
            mock_res.scalar_one_or_none.return_value = memberships_db[0] if memberships_db else None
            return mock_res
        return mock_res

    async def get(self, model, ident):
        if model == User:
            return users_db.get(ident)
        elif model == Organization:
            return orgs_db.get(ident)
        return None

    def add(self, obj):
        if isinstance(obj, User):
            users_db[obj.id] = obj
        elif isinstance(obj, Organization):
            orgs_db[obj.id] = obj
        elif isinstance(obj, OrganizationMembership):
            memberships_db.append(obj)

    async def flush(self):
        pass

    async def commit(self):
        pass

    async def rollback(self):
        pass

    async def refresh(self, obj):
        pass

async def override_get_db():
    yield FakeSession()

app.dependency_overrides[get_db] = override_get_db

print("=== STARTING FULL END-TO-END VERIFICATION CYCLE ===")

# Create Admin User
admin_id = uuid.uuid4()
admin_user = User(
    id=admin_id,
    email="admin@landgov.gov",
    full_name="Platform Registrar Administrator",
    password_hash=hash_password("AdminSecurePassword123!"),
    is_superuser=True,
    status=UserStatus.ACTIVE,
    profile={"roles": ["admin"], "role": "admin"},
    created_at=datetime.now(UTC),
)
users_db[admin_id] = admin_user

with (
    patch("app.main.check_database_connection", new=AsyncMock(return_value={})),
    patch("app.main.close_database_connections", new=AsyncMock()),
    TestClient(app, base_url="http://localhost") as client,
):
    # Step 1: Register as Government Agency user
    officer_email = f"officer_{int(time.time())}@revenue.gov"
    officer_pass = "GovOfficerPassword123!"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": officer_email,
            "full_name": "Commissioner Rajesh Kumar",
            "password": officer_pass,
            "organization_name": "State Revenue Department",
            "organization_category": "government",
        },
    )
    print(f"1. Register Government Agency user -> Status: {reg_res.status_code}")
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["status"] == "pending"
    assert "Verification" in reg_data["message"] or "verification" in reg_data["message"]
    officer_id = uuid.UUID(reg_data["user"]["id"])
    print(f"   [PASS] Account created with pending verification (ID: {officer_id})")

    # Step 2: Attempt Login as pending user -> MUST FAIL with 403
    login_attempt = client.post(
        "/api/v1/auth/login",
        json={"email": officer_email, "password": officer_pass},
    )
    print(f"2. Pending user login attempt -> Status: {login_attempt.status_code}")
    assert login_attempt.status_code == 403
    assert "pending verification" in login_attempt.json()["detail"].lower()
    print("   [PASS] Pending login blocked with HTTP 403 Forbidden")

    # Step 3: Admin logs in
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@landgov.gov", "password": "AdminSecurePassword123!"},
    )
    print(f"3. Admin login -> Status: {admin_login.status_code}")
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["token"]["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("   [PASS] Admin authenticated and received token")

    # Step 4: Admin fetches pending approvals list
    pending_list = client.get("/api/v1/admin/users?status=pending", headers=admin_headers)
    print(f"4. Admin view pending approvals -> Status: {pending_list.status_code}")
    assert pending_list.status_code == 200
    p_users = pending_list.json()["users"]
    assert any(u["email"] == officer_email for u in p_users)
    print(f"   [PASS] Officer found in pending approvals list: {officer_email}")

    # Step 5: Admin inspects organizations list
    orgs_res = client.get("/api/v1/admin/organizations", headers=admin_headers)
    print(f"5. Admin view organizations -> Status: {orgs_res.status_code}")
    assert orgs_res.status_code == 200
    assert orgs_res.json()["total"] >= 1
    print("   [PASS] Organizations retrieved with member counts")

    # Step 6: Admin approves pending registration
    approve_res = client.patch(f"/api/v1/admin/memberships/{officer_id}/approve", headers=admin_headers)
    print(f"6. Admin approve membership -> Status: {approve_res.status_code}")
    assert approve_res.status_code == 200
    app_data = approve_res.json()
    assert app_data["status"] == "success"
    assert app_data["membership_status"] == "active"
    assert app_data["user_status"] == "active"
    print("   [PASS] Membership and user status updated to 'active'")

    # Step 7: Officer can now log in successfully (200) and access features
    officer_login = client.post(
        "/api/v1/auth/login",
        json={"email": officer_email, "password": officer_pass},
    )
    print(f"7. Officer login after approval -> Status: {officer_login.status_code}")
    assert officer_login.status_code == 200
    assert "access_token" in officer_login.cookies or officer_login.json().get("token") is not None
    print("   [PASS] Government Officer successfully logged in after admin approval!")

print("=== ALL END-TO-END CHECKS PASSED PERFECTLY ===")
