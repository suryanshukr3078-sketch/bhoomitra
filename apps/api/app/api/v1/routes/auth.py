import asyncio
import logging
import re
import uuid
from datetime import UTC, datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.email import (
    configure_runtime_smtp,
    get_email_log_by_id,
    get_email_logs,
    get_runtime_smtp_config,
    get_smtp_status,
    is_smtp_configured,
    reset_runtime_smtp,
    send_email_sync,
    send_otp_email,
    send_welcome_email,
)
from app.services.otp import (
    can_resend_otp,
    get_otp_for_debugging,
    store_otp,
    verify_stored_otp,
)

logger = logging.getLogger("bhoomitra.auth")

from app.api.dependencies.auth import extract_raw_token, get_current_user, security_bearer
from app.api.dependencies.db import get_db
from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.enums import MembershipStatus, OrganizationType, UserStatus
from app.models.identity import Organization, OrganizationMembership, User
from app.schemas.identity import Token, UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])


def slugify_org_name(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower().strip()).strip("-")
    if not base:
        base = "org"
    return f"{base[:200]}-{uuid.uuid4().hex[:6]}"


def resolve_organization_category(
    category_raw: str | None,
) -> tuple[OrganizationType, bool, str]:
    """
    Resolves category to (OrganizationType, is_pending, role_title).
    Government Agency and Policy Maker categories require verification (is_pending = True).
    All other institutes (Academic, Research, Civil Society, Community, Private, International, Other)
    are active immediately (is_pending = False).
    """
    cat = (category_raw or "").lower().strip()
    if cat in ("government", "govt", "government_agency", "state_department", "municipal"):
        return OrganizationType.GOVERNMENT, True, "Government Officer"
    elif cat in ("policy_maker", "policymaker", "policy", "legislative", "think_tank"):
        return OrganizationType.GOVERNMENT, True, "Policy Maker"
    elif cat in ("academic", "academic_institution", "university", "college", "higher_education"):
        return OrganizationType.ACADEMIC, False, "Academic Researcher"
    elif cat in ("research", "researcher", "scientific", "laboratory", "institute"):
        return OrganizationType.RESEARCH, False, "Research Fellow"
    elif cat in ("civil_society", "independent_contributor", "ngo", "advocacy"):
        return OrganizationType.CIVIL_SOCIETY, False, "Civil Society Contributor"
    elif cat in ("community", "tribal", "gram_sabha", "panchayat", "customary"):
        return OrganizationType.COMMUNITY, False, "Community Delegate"
    elif cat in ("private", "corporate", "enterprise", "industry"):
        return OrganizationType.PRIVATE, False, "Private Sector Participant"
    elif cat in ("international", "global", "multilateral", "un_agency"):
        return OrganizationType.INTERNATIONAL, False, "International Observer"
    else:
        return OrganizationType.OTHER, False, "Institutional Contributor"


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    organization_name: str | None = Field(default=None, max_length=250)
    organization_category: str | None = Field(default=None, max_length=100)
    organization_type: str | None = Field(default=None, max_length=100)
    otp: str | None = Field(default=None, max_length=10)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    otp: str | None = Field(default=None, max_length=10)


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=10)
    action: str = Field(default="login")  # 'login' or 'register'


class ResendOtpRequest(BaseModel):
    email: EmailStr
    action: str = Field(default="login")  # 'login' or 'register'


CATEGORY_DISPLAY_TITLES = {
    "academic": "Academic Institution / University / College",
    "research": "Scientific Research Institute / GIS Lab",
    "government": "Government Agency & Revenue Authority",
    "policy_maker": "Policy Maker & Statutory Advisory Body",
    "civil_society": "Civil Society Organization / NGO",
    "community": "Community, Tribal Council & Gram Sabha",
    "private": "Private Enterprise / Geomatics Industry",
    "international": "International / Multilateral Agency",
    "other": "Custom Autonomous Institution",
}


class AuthResponse(BaseModel):
    token: Token | None = None
    user: UserRead | None = None
    status: str = "success"
    message: str | None = None
    requires_verification: bool = False
    otp_required: bool = False
    debug_otp: str | None = None
    email: str | None = None
    email_sent: bool = True
    email_status: str | None = None
    email_message: str | None = None


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account with collaborative workspace",
)
@limiter.limit("5/minute")
async def register(
    request: Request,
    response: Response,
    body: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> Any:
    # Check for existing user
    stmt = select(User).where(User.email == body.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email address already exists.",
        )

    # Determine organization category, approval requirement, and role
    category_raw = body.organization_category or body.organization_type or "civil_society"
    org_type, is_pending, role_title = resolve_organization_category(category_raw)

    org_name = (body.organization_name or "").strip()
    if not org_name:
        org_name = f"{body.full_name.strip()}'s Organization"

    # 2-Factor Authentication (2FA) verification gate for Sign-Up / Registration
    if not body.otp:
        otp_code, expires_at = store_otp(
            email=body.email,
            action="register",
            payload={
                "email": body.email.lower().strip(),
                "full_name": body.full_name.strip(),
                "password": body.password,
                "organization_name": org_name,
                "organization_category": category_raw,
                "organization_type": body.organization_type,
            },
        )

        email_status = "simulated" if not is_smtp_configured() else "pending"
        email_message = "Simulated delivery (SMTP credentials not configured)." if not is_smtp_configured() else ""

        try:
            email_result = await asyncio.wait_for(
                asyncio.to_thread(
                    send_otp_email,
                    to_email=body.email.lower().strip(),
                    otp_code=otp_code,
                    full_name=body.full_name.strip(),
                    action_type="register",
                ),
                timeout=5.0,
            )
            if isinstance(email_result, dict):
                email_status = str(email_result.get("status", "unknown"))
                email_message = str(email_result.get("message", ""))
            else:
                email_status = "sent" if email_result else "failed"
                email_message = "Delivered successfully." if email_result else "Failed to send."
        except Exception as email_exc:
            logger.warning(f"[AuthRoute] Registration OTP email encounter: {email_exc}")
            email_status = "failed"
            email_message = f"Email delivery notice: {email_exc}"

        return {
            "token": None,
            "user": None,
            "status": "otp_required",
            "message": "Registration verification code sent to your email.",
            "otp_required": True,
            "email": body.email.lower().strip(),
            "debug_otp": None,
            "email_status": email_status,
            "email_message": email_message,
        }

    # If an OTP was provided in body, verify it
    is_valid, verify_msg, _ = verify_stored_otp(
        email=body.email,
        otp=body.otp,
        action="register",
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=verify_msg,
        )

    try:
        # Find or create Organization
        stmt_org = select(Organization).where(func.lower(Organization.name) == org_name.lower())
        org = (await db.execute(stmt_org)).scalar_one_or_none()
        if not org:
            org = Organization(
                id=uuid.uuid4(),
                name=org_name,
                slug=slugify_org_name(org_name),
                organization_type=org_type,
                country_code="IN",
                is_active=True,
            )
            db.add(org)
            await db.flush()

        # Create User with appropriate status
        user_status = UserStatus.PENDING if is_pending else UserStatus.ACTIVE
        user_created_at = datetime.now(UTC)
        user = User(
            id=uuid.uuid4(),
            email=body.email.lower().strip(),
            full_name=body.full_name.strip(),
            password_hash=hash_password(body.password),
            status=user_status,
            is_superuser=False,
        )
        user.created_at = user_created_at
        db.add(user)
        await db.flush()

        # Create OrganizationMembership
        membership_status = MembershipStatus.PENDING if is_pending else MembershipStatus.ACTIVE
        membership = OrganizationMembership(
            user_id=user.id,
            organization_id=org.id,
            title=role_title,
            status=membership_status,
        )
        db.add(membership)

        await db.commit()
        await db.refresh(user)
    except Exception:
        await db.rollback()
        raise

    resolved_created_at = getattr(user, "created_at", None) or user_created_at
    category_title = CATEGORY_DISPLAY_TITLES.get(category_raw, category_raw.replace("_", " ").title())

    # Dispatch welcome email safely before response is returned
    # This guarantees completion in serverless environments (AWS Lambda/Vercel) before container freeze
    email_status = "simulated" if not is_smtp_configured() else "pending"
    email_message = "Simulated delivery (SMTP credentials not configured)." if not is_smtp_configured() else ""

    try:
        email_result = await asyncio.wait_for(
            asyncio.to_thread(
                send_welcome_email,
                to_email=user.email,
                full_name=user.full_name,
                org_name=org.name,
                category_title=category_title,
                role_title=role_title,
                is_pending=is_pending,
            ),
            timeout=5.0,
        )
        if isinstance(email_result, dict):
            email_status = str(email_result.get("status", "unknown"))
            email_message = str(email_result.get("message", ""))
        else:
            email_status = "sent" if email_result else "failed"
            email_message = "Delivered successfully." if email_result else "Failed to send."
    except Exception as email_exc:
        logger.warning(f"[AuthRoute] Welcome email dispatch non-blocking notice: {email_exc}")
        email_status = "failed"
        email_message = f"Email delivery encounter: {email_exc}"

    if is_pending:
        # Pending verification: do NOT issue access token cookie
        return {
            "token": None,
            "user": UserRead(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                role=role_title,
                is_active=False,
                created_at=resolved_created_at,
            ),
            "status": "pending",
            "message": "Registration submitted for verification, you will be notified once approved.",
            "requires_verification": True,
            "email_status": email_status,
            "email_message": email_message,
        }

    # Verified immediately: issue access token cookie
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    cookie_samesite = "none" if settings.is_production else "lax"
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=86400,
        httponly=True,
        samesite=cookie_samesite,
        secure=settings.is_production,
        path="/",
    )

    return {
        "token": Token(access_token=access_token, token_type="bearer"),
        "user": UserRead(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=role_title,
            is_active=True,
            created_at=resolved_created_at,
            organization_id=str(org.id) if org else None,
            organization_name=org.name if org else None,
            organization_slug=org.slug if org else None,
        ),
        "status": "success",
        "message": "Registration successful, you can now log in",
        "requires_verification": False,
        "email_status": email_status,
        "email_message": email_message,
    }


async def resolve_user_membership_and_org(
    db: AsyncSession,
    user: User,
) -> tuple[str, str | None, str | None, str | None]:
    role_label = "admin" if user.is_superuser else "CITIZEN"
    org_id_val = None
    org_name_val = None
    org_slug_val = None

    try:
        stmt_membership = (
            select(OrganizationMembership, Organization)
            .outerjoin(Organization, OrganizationMembership.organization_id == Organization.id)
            .where(OrganizationMembership.user_id == user.id)
        )
        membership_res = await db.execute(stmt_membership)
        membership_row = membership_res.first()
        if membership_row is not None:
            m = membership_row[0] if len(membership_row) > 0 else None
            o = membership_row[1] if len(membership_row) > 1 else None
            if m is not None:
                title_attr = getattr(m, "title", None) or getattr(m, "role", None)
                if title_attr and isinstance(title_attr, str) and title_attr.strip():
                    role_label = title_attr.strip()
            if o is not None:
                if hasattr(o, "id") and o.id:
                    org_id_val = str(o.id)
                if hasattr(o, "name") and o.name:
                    org_name_val = str(o.name)
                if hasattr(o, "slug") and o.slug:
                    org_slug_val = str(o.slug)
    except Exception as exc:
        logger.warning(f"Failed to resolve user organization membership: {exc}")

    return role_label, org_id_val, org_name_val, org_slug_val


def render_auth_me_html(
    user: UserRead | None,
    is_authenticated: bool,
    is_demo: bool = False,
) -> str:
    web_base_url = "https://web-rho-gules-89.vercel.app"

    if is_authenticated and user:
        status_badge = (
            '<span class="badge badge-demo">Demo Preview Session</span>'
            if is_demo
            else '<span class="badge badge-success">&#x25CF; Authenticated Active Session</span>'
        )
        role_badge = f'<span class="badge badge-role">{user.role}</span>'
        org_markup = ""
        if user.organization_name:
            org_markup = f"""
            <div class="field-row">
                <span class="field-label">Organization</span>
                <span class="field-value">{user.organization_name} <span class="text-dim">({user.organization_slug or "verified"})</span></span>
            </div>
            """

        main_content = f"""
        <div class="card card-glow">
            <div class="card-header">
                <div>
                    <h2 class="user-name">{user.full_name}</h2>
                    <p class="user-email">{user.email}</p>
                </div>
                <div>{status_badge}</div>
            </div>
            <div class="divider"></div>
            <div class="field-grid">
                <div class="field-row">
                    <span class="field-label">Platform Role</span>
                    <span class="field-value">{role_badge}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Account Status</span>
                    <span class="field-value"><span class="badge badge-active">{user.status.upper()}</span></span>
                </div>
                {org_markup}
                <div class="field-row">
                    <span class="field-label">User ID</span>
                    <span class="field-value mono">{user.id}</span>
                </div>
            </div>
            <div class="divider"></div>
            <div class="button-group">
                <a href="{web_base_url}/workspaces" class="btn btn-primary" target="_blank">&#x2197; Launch Web Workspaces</a>
                <a href="?format=json" class="btn btn-secondary">&#x2935; View Raw JSON</a>
                <a href="{web_base_url}/login" class="btn btn-outline" target="_blank">Switch Account</a>
            </div>
        </div>
        """
    else:
        main_content = f"""
        <div class="card card-glow">
            <div class="card-header">
                <div>
                    <h2 class="user-name">&#x1F512; Authentication Gateway</h2>
                    <p class="user-email">Endpoint: <code>/api/v1/auth/me</code> (HTTP 401 Protected)</p>
                </div>
                <div><span class="badge badge-warning">&#x25CF; No Session Detected</span></div>
            </div>
            <p class="description">
                This endpoint provides authenticated user credentials, verified organizational memberships, and role-based permissions.
                To inspect identity data, sign in through your portal or test with a simulated demo session.
            </p>

            <div class="notice-box" id="local-token-notice" style="display: none;">
                <p>&#x2728; <strong>Browser Session Detected:</strong> Found an active access token in your browser storage.</p>
                <button type="button" onclick="useStoredToken()" class="btn btn-sm btn-primary" style="margin-top: 8px;">Apply Stored Token</button>
            </div>

            <div class="token-form">
                <label class="field-label">Test with JWT Bearer Token:</label>
                <div class="input-row">
                    <input type="text" id="token-input" placeholder="Paste access_token (eyJ...)" />
                    <button type="button" onclick="submitToken()" class="btn btn-primary">Inspect</button>
                </div>
            </div>

            <div class="divider"></div>
            <div class="button-group">
                <a href="{web_base_url}/login" class="btn btn-primary" target="_blank">&#x2197; Sign In to Web Portal</a>
                <a href="?demo=true" class="btn btn-secondary">&#x26A1; Preview Demo Session</a>
                <a href="?format=json" class="btn btn-outline">&#x2935; Raw JSON 401</a>
            </div>
        </div>

        <div class="portals-section">
            <h3 class="section-title">Direct Portal Access</h3>
            <div class="portals-grid">
                <a href="{web_base_url}/login/researcher" class="portal-card" target="_blank">
                    <span class="portal-icon">&#x1F393;</span>
                    <strong>Researcher & Academic</strong>
                    <p>Cadastral analytics, spatial datasets & research</p>
                </a>
                <a href="{web_base_url}/login/government" class="portal-card" target="_blank">
                    <span class="portal-icon">&#x1F3DB;</span>
                    <strong>Government Official</strong>
                    <p>Parcel records, mutation clearance & statutory registry</p>
                </a>
                <a href="{web_base_url}/login/policymaker" class="portal-card" target="_blank">
                    <span class="portal-icon">&#x2696;</span>
                    <strong>Policy Maker</strong>
                    <p>Tenure policy intelligence & legislative analytics</p>
                </a>
                <a href="{web_base_url}/login/civil-society" class="portal-card" target="_blank">
                    <span class="portal-icon">&#x1F91D;</span>
                    <strong>Civil Society & NGO</strong>
                    <p>Community advocacy, tenure disputes & grievances</p>
                </a>
                <a href="{web_base_url}/login/admin" class="portal-card" target="_blank">
                    <span class="portal-icon">&#x1F6E1;</span>
                    <strong>System Administrator</strong>
                    <p>Institutional verification & platform governance</p>
                </a>
            </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bhoomitra · Session & Auth Inspector (/api/v1/auth/me)</title>
    <style>
        :root {{
            --bg: #090d16;
            --card-bg: #131b2e;
            --border: #1e293b;
            --border-hover: #334155;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-dim: #64748b;
            --primary: #10b981;
            --primary-hover: #059669;
            --accent: #3b82f6;
            --warning: #f59e0b;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background: var(--bg);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
        }}
        .container {{ width: 100%; max-width: 820px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .header h1 {{ font-size: 26px; font-weight: 700; letter-spacing: -0.5px; color: #fff; margin-bottom: 6px; }}
        .header p {{ color: var(--text-muted); font-size: 14px; }}
        .card {{
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
            margin-bottom: 24px;
        }}
        .card-glow {{ border-color: rgba(16, 185, 129, 0.3); }}
        .card-header {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }}
        .user-name {{ font-size: 22px; font-weight: 600; color: #fff; }}
        .user-email {{ color: var(--text-muted); font-size: 14px; margin-top: 4px; }}
        .description {{ color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 20px; }}
        .divider {{ height: 1px; background: var(--border); margin: 20px 0; }}
        .field-grid {{ display: grid; grid-template-columns: 1fr; gap: 14px; }}
        @media (min-width: 600px) {{ .field-grid {{ grid-template-columns: 1fr 1fr; }} }}
        .field-row {{ display: flex; flex-direction: column; gap: 4px; }}
        .field-label {{ font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-dim); font-weight: 600; }}
        .field-value {{ font-size: 14px; color: #fff; font-weight: 500; }}
        .mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #cbd5e1; }}
        .badge {{
            display: inline-flex; align-items: center; gap: 6px;
            padding: 4px 12px; border-radius: 9999px;
            font-size: 12px; font-weight: 600;
        }}
        .badge-success {{ background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }}
        .badge-warning {{ background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }}
        .badge-demo {{ background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }}
        .badge-role {{ background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); }}
        .badge-active {{ background: rgba(16, 185, 129, 0.2); color: #10b981; }}
        .button-group {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }}
        .btn {{
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
            text-decoration: none; cursor: pointer; transition: all 0.15s ease; border: none;
        }}
        .btn-primary {{ background: var(--primary); color: #022c22; }}
        .btn-primary:hover {{ background: var(--primary-hover); }}
        .btn-secondary {{ background: #1e293b; color: #f8fafc; border: 1px solid #334155; }}
        .btn-secondary:hover {{ background: #334155; }}
        .btn-outline {{ background: transparent; color: var(--text-muted); border: 1px solid var(--border); }}
        .btn-outline:hover {{ color: #fff; border-color: #475569; }}
        .btn-sm {{ padding: 6px 12px; font-size: 12px; }}
        .token-form {{ margin-top: 16px; }}
        .input-row {{ display: flex; gap: 8px; margin-top: 6px; }}
        .input-row input {{
            flex: 1; background: #0b1120; border: 1px solid var(--border);
            padding: 10px 14px; border-radius: 8px; color: #fff; font-size: 13px;
            font-family: monospace; outline: none;
        }}
        .input-row input:focus {{ border-color: var(--primary); }}
        .notice-box {{
            background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25);
            padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; color: #a7f3d0;
        }}
        .portals-section {{ margin-top: 30px; }}
        .section-title {{ font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-dim); margin-bottom: 14px; font-weight: 600; }}
        .portals-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }}
        .portal-card {{
            background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;
            padding: 16px; text-decoration: none; color: inherit; transition: all 0.2s ease;
        }}
        .portal-card:hover {{ border-color: var(--border-hover); transform: translateY(-2px); }}
        .portal-icon {{ font-size: 22px; display: block; margin-bottom: 8px; }}
        .portal-card strong {{ font-size: 14px; color: #fff; display: block; margin-bottom: 4px; }}
        .portal-card p {{ font-size: 12px; color: var(--text-dim); line-height: 1.4; }}
        .footer {{ text-align: center; margin-top: 40px; font-size: 12px; color: var(--text-dim); }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🌱 Bhoomitra Land Governance Platform</h1>
            <p>Spatial Cadastral Repository · Identity & Role Clearance Gateway</p>
        </header>

        {main_content}

        <footer class="footer">
            <p>Bhoomitra National Land Governance Platform &bull; REST API v1.0 &bull; Secure Encrypted Session</p>
        </footer>
    </div>

    <script>
        (function() {{
            try {{
                var localToken = localStorage.getItem('access_token');
                if (localToken && !window.location.search.includes('token=') && !window.location.search.includes('demo=')) {{
                    var notice = document.getElementById('local-token-notice');
                    if (notice) notice.style.display = 'block';
                }}
            }} catch(e) {{}}
        }})();

        function useStoredToken() {{
            var localToken = localStorage.getItem('access_token');
            if (localToken) {{
                window.location.href = window.location.pathname + '?token=' + encodeURIComponent(localToken.trim());
            }}
        }}

        function submitToken() {{
            var val = document.getElementById('token-input').value.trim();
            if (val) {{
                window.location.href = window.location.pathname + '?token=' + encodeURIComponent(val);
            }}
        }}
    </script>
</body>
</html>"""


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate and receive bearer token",
)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    stmt = select(User).where(User.email == body.email.lower().strip())
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != UserStatus.ACTIVE:
        if user.status == UserStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is pending verification and approval.",
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or suspended.",
        )

    # 2-Factor Authentication (2FA) enforcement
    if not body.otp:
        otp_code, expires_at = store_otp(
            email=user.email,
            action="login",
            payload={"user_id": str(user.id)},
        )

        email_status = "simulated" if not is_smtp_configured() else "pending"
        email_message = "Simulated delivery (SMTP credentials not configured)." if not is_smtp_configured() else ""

        try:
            email_result = await asyncio.wait_for(
                asyncio.to_thread(
                    send_otp_email,
                    to_email=user.email,
                    otp_code=otp_code,
                    full_name=user.full_name,
                    action_type="login",
                ),
                timeout=5.0,
            )
            if isinstance(email_result, dict):
                email_status = str(email_result.get("status", "unknown"))
                email_message = str(email_result.get("message", ""))
            else:
                email_status = "sent" if email_result else "failed"
                email_message = "Delivered successfully." if email_result else "Failed to send."
        except Exception as email_exc:
            logger.warning(f"[AuthRoute] Login OTP email encounter: {email_exc}")
            email_status = "failed"
            email_message = f"Email delivery notice: {email_exc}"

        return {
            "token": None,
            "user": None,
            "status": "otp_required",
            "message": "Two-factor authentication code sent to your email.",
            "otp_required": True,
            "email": user.email,
            "debug_otp": None,
            "email_status": email_status,
            "email_message": email_message,
        }

    # If an OTP was provided directly in login body, verify it
    is_valid, verify_msg, _ = verify_stored_otp(
        email=user.email,
        otp=body.otp,
        action="login",
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=verify_msg,
        )

    try:
        user.last_login_at = datetime.now(UTC)
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    access_token = create_access_token({"sub": str(user.id), "email": user.email})

    cookie_samesite = "none" if settings.is_production else "lax"
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=86400,
        httponly=True,
        samesite=cookie_samesite,
        secure=settings.is_production,
        path="/",
    )

    role_label, org_id_val, org_name_val, org_slug_val = await resolve_user_membership_and_org(db, user)

    return {
        "token": Token(access_token=access_token, token_type="bearer"),
        "user": UserRead(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=role_label,
            is_active=user.status == UserStatus.ACTIVE,
            is_superuser=user.is_superuser,
            status=user.status.value,
            created_at=user.created_at,
            organization_id=org_id_val,
            organization_name=org_name_val,
            organization_slug=org_slug_val,
        ),
        "status": "success",
        "message": "Authentication successful.",
        "otp_required": False,
    }


@router.post(
    "/verify-otp",
    response_model=AuthResponse,
    summary="Verify 2FA OTP code and issue session token",
)
@limiter.limit("10/minute")
async def verify_otp_endpoint(
    request: Request,
    response: Response,
    body: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    action = body.action.lower().strip()
    is_valid, error_msg, payload = verify_stored_otp(
        email=body.email,
        otp=body.otp,
        action=action,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    # 1. Action: LOGIN
    if action == "login":
        stmt = select(User).where(User.email == body.email.lower().strip())
        user = (await db.execute(stmt)).scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account no longer exists.",
            )

        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is pending verification or suspended.",
            )

        try:
            user.last_login_at = datetime.now(UTC)
            await db.commit()
        except Exception:
            await db.rollback()
            raise

        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        cookie_samesite = "none" if settings.is_production else "lax"
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=86400,
            httponly=True,
            samesite=cookie_samesite,
            secure=settings.is_production,
            path="/",
        )

        role_label, org_id_val, org_name_val, org_slug_val = await resolve_user_membership_and_org(db, user)

        return {
            "token": Token(access_token=access_token, token_type="bearer"),
            "user": UserRead(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                role=role_label,
                is_active=user.status == UserStatus.ACTIVE,
                is_superuser=user.is_superuser,
                status=user.status.value,
                created_at=user.created_at,
                organization_id=org_id_val,
                organization_name=org_name_val,
                organization_slug=org_slug_val,
            ),
            "status": "success",
            "message": "Login 2FA verified successfully.",
            "otp_required": False,
        }

    # 2. Action: REGISTER
    elif action == "register":
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration data expired. Please start registration again.",
            )

        # Check existing user again to prevent race conditions
        stmt = select(User).where(User.email == body.email.lower().strip())
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email address already exists.",
            )

        category_raw = payload.get("organization_category") or payload.get("organization_type") or "civil_society"
        org_type, is_pending, role_title = resolve_organization_category(category_raw)
        org_name = payload.get("organization_name") or f"{payload.get('full_name')}'s Organization"

        try:
            # Find or create Organization
            stmt_org = select(Organization).where(func.lower(Organization.name) == org_name.lower())
            org = (await db.execute(stmt_org)).scalar_one_or_none()
            if not org:
                org = Organization(
                    id=uuid.uuid4(),
                    name=org_name,
                    slug=slugify_org_name(org_name),
                    organization_type=org_type,
                    country_code="IN",
                    is_active=True,
                )
                db.add(org)
                await db.flush()

            user_status = UserStatus.PENDING if is_pending else UserStatus.ACTIVE
            user_created_at = datetime.now(UTC)
            user = User(
                id=uuid.uuid4(),
                email=payload["email"],
                full_name=payload["full_name"],
                password_hash=hash_password(payload["password"]),
                status=user_status,
                is_superuser=False,
            )
            user.created_at = user_created_at
            db.add(user)
            await db.flush()

            membership_status = MembershipStatus.PENDING if is_pending else MembershipStatus.ACTIVE
            membership = OrganizationMembership(
                user_id=user.id,
                organization_id=org.id,
                title=role_title,
                status=membership_status,
            )
            db.add(membership)

            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            raise

        resolved_created_at = getattr(user, "created_at", None) or user_created_at
        category_title = CATEGORY_DISPLAY_TITLES.get(category_raw, category_raw.replace("_", " ").title())

        # Welcome onboarding email dispatch
        try:
            asyncio.create_task(
                asyncio.to_thread(
                    send_welcome_email,
                    to_email=user.email,
                    full_name=user.full_name,
                    org_name=org.name,
                    category_title=category_title,
                    role_title=role_title,
                    is_pending=is_pending,
                )
            )
        except Exception as email_exc:
            logger.warning(f"[AuthRoute] Async welcome email dispatch notice: {email_exc}")

        if is_pending:
            return {
                "token": None,
                "user": UserRead(
                    id=str(user.id),
                    email=user.email,
                    full_name=user.full_name,
                    role=role_title,
                    is_active=False,
                    created_at=resolved_created_at,
                ),
                "status": "pending",
                "message": "Registration verified and submitted for administrative approval.",
                "requires_verification": True,
                "otp_required": False,
            }

        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        cookie_samesite = "none" if settings.is_production else "lax"
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=86400,
            httponly=True,
            samesite=cookie_samesite,
            secure=settings.is_production,
            path="/",
        )

        return {
            "token": Token(access_token=access_token, token_type="bearer"),
            "user": UserRead(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                role=role_title,
                is_active=True,
                created_at=resolved_created_at,
                organization_id=str(org.id) if org else None,
                organization_name=org.name if org else None,
                organization_slug=org.slug if org else None,
            ),
            "status": "success",
            "message": "Registration verified and account activated successfully.",
            "requires_verification": False,
            "otp_required": False,
        }

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unknown action context for OTP verification.",
    )


@router.post(
    "/resend-otp",
    summary="Resend 2FA OTP code with Team CodeNova branding",
)
@limiter.limit("5/minute")
async def resend_otp_endpoint(
    request: Request,
    body: ResendOtpRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    email = body.email.lower().strip()
    action = body.action.lower().strip()

    can_resend, remaining_secs = can_resend_otp(email)
    if not can_resend:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining_secs} seconds before requesting another verification code.",
        )

    full_name = "User"
    if action == "login":
        stmt = select(User).where(User.email == email)
        user = (await db.execute(stmt)).scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        full_name = user.full_name
        otp_code, _ = store_otp(email=email, action="login", payload={"user_id": str(user.id)})
    else:
        # For register, refresh the existing OTP
        from app.services.otp import _OTP_CACHE
        record = _OTP_CACHE.get(email)
        payload = record.get("payload", {}) if record else {}
        full_name = payload.get("full_name", "User")
        otp_code, _ = store_otp(email=email, action="register", payload=payload)

    email_status = "simulated" if not is_smtp_configured() else "pending"
    email_message = "Simulated delivery (SMTP credentials not configured)." if not is_smtp_configured() else ""

    try:
        email_result = await asyncio.wait_for(
            asyncio.to_thread(
                send_otp_email,
                to_email=email,
                otp_code=otp_code,
                full_name=full_name,
                action_type=action,
            ),
            timeout=5.0,
        )
        if isinstance(email_result, dict):
            email_status = str(email_result.get("status", "unknown"))
            email_message = str(email_result.get("message", ""))
        else:
            email_status = "sent" if email_result else "failed"
            email_message = "Delivered successfully." if email_result else "Failed to send."
    except Exception as email_exc:
        logger.warning(f"[AuthRoute] Resend OTP email encounter: {email_exc}")
        email_status = "failed"
        email_message = f"Email delivery notice: {email_exc}"

    return {
        "success": True,
        "status": "sent" if email_status == "sent" else "simulated",
        "message": f"A new verification code has been dispatched to {email}.",
        "email_status": email_status,
        "email_message": email_message,
        "debug_otp": None,
    }


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user profile",
)
async def get_me(
    request: Request,
    auth: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
    demo: bool = False,
    preview: bool = False,
    format: str | None = None,
) -> Any:
    accept_header = request.headers.get("accept", "").lower()
    wants_html = ("text/html" in accept_header) and (format != "json")

    # 1. Demo Mode
    if demo or preview:
        demo_user = UserRead(
            id="00000000-0000-0000-0000-000000000001",
            email="demo.researcher@bhoomitra.gov.in",
            full_name="Dr. Aarav Sharma (Demo Researcher)",
            role="Academic Researcher",
            is_active=True,
            is_superuser=False,
            status="active",
            created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            organization_id="00000000-0000-0000-0000-000000000002",
            organization_name="National Cadastral Research Institute",
            organization_slug="national-cadastral-research-institute",
        )
        if wants_html:
            return HTMLResponse(
                content=render_auth_me_html(user=demo_user, is_authenticated=True, is_demo=True),
                status_code=200,
            )
        return demo_user

    # 2. Extract Token and Authenticate User
    raw_token = extract_raw_token(request, auth)
    current_user: User | None = None

    if raw_token:
        payload = decode_access_token(raw_token)
        if payload and "sub" in payload:
            try:
                user_id = UUID(payload["sub"])
                result = await db.execute(select(User).where(User.id == user_id))
                current_user = result.scalar_one_or_none()
            except (ValueError, TypeError):
                pass

    if current_user:
        role_label, org_id_val, org_name_val, org_slug_val = await resolve_user_membership_and_org(db, current_user)
        user_read = UserRead(
            id=str(current_user.id),
            email=current_user.email,
            full_name=current_user.full_name,
            role=role_label,
            is_active=current_user.status == UserStatus.ACTIVE,
            is_superuser=current_user.is_superuser,
            status=current_user.status.value,
            created_at=current_user.created_at,
            organization_id=org_id_val,
            organization_name=org_name_val,
            organization_slug=org_slug_val,
        )
        if wants_html:
            return HTMLResponse(
                content=render_auth_me_html(user=user_read, is_authenticated=True, is_demo=False),
                status_code=200,
            )
        return user_read

    # 3. Unauthenticated Handling
    if wants_html:
        return HTMLResponse(
            content=render_auth_me_html(user=None, is_authenticated=False, is_demo=False),
            status_code=200,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing authentication credentials. Please provide a Bearer token in the Authorization header, an access_token cookie, or a ?token= parameter. To test with a demo profile, append ?demo=true or visit this URL in your web browser.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post(
    "/logout",
    summary="Logout user and clear session cookies",
)
async def logout(
    response: Response,
) -> dict[str, str]:
    cookie_samesite = "none" if settings.is_production else "lax"
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite=cookie_samesite,
        secure=settings.is_production,
    )
    return {"status": "success", "message": "Successfully logged out."}


class TestSmtpPayload(BaseModel):
    to_email: EmailStr
    subject: str = "Bhoomitra SMTP Verification Diagnostic Test"
    provider: str | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_ssl: bool | None = None
    smtp_tls: bool | None = None
    from_email: str | None = None
    from_name: str | None = None
    api_key: str | None = None
    persist: bool = False


class ConfigureSmtpPayload(BaseModel):
    provider: str | None = None
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_ssl: bool = False
    smtp_tls: bool = True
    from_email: str | None = None
    from_name: str = "Bhoomitra Land Governance Platform"
    api_key: str | None = None
    reset: bool = False


@router.get(
    "/smtp-status",
    summary="Check platform SMTP configuration status",
)
@router.get(
    "/smtp/status",
    summary="Check platform SMTP configuration status",
    include_in_schema=False,
)
async def get_smtp_configuration_status() -> dict[str, Any]:
    return get_smtp_status()


@router.post(
    "/configure-smtp",
    summary="Configure runtime SMTP and email delivery credentials",
)
async def configure_smtp_endpoint(
    payload: ConfigureSmtpPayload,
) -> dict[str, Any]:
    if payload.reset:
        reset_runtime_smtp()
        return {
            "success": True,
            "message": "Runtime email configuration reset to system defaults.",
            "smtp_status": get_smtp_status(),
        }

    config: dict[str, Any] = {}
    if payload.provider:
        config["provider"] = payload.provider
    if payload.smtp_host:
        config["host"] = payload.smtp_host
    if payload.smtp_port:
        config["port"] = payload.smtp_port
    if payload.smtp_user:
        config["user"] = payload.smtp_user
    if payload.smtp_password:
        config["password"] = payload.smtp_password
    if payload.smtp_ssl is not None:
        config["use_ssl"] = payload.smtp_ssl
    if payload.smtp_tls is not None:
        config["use_tls"] = payload.smtp_tls
    if payload.from_email:
        config["from_email"] = payload.from_email
    if payload.from_name:
        config["from_name"] = payload.from_name
    if payload.api_key:
        config["api_key"] = payload.api_key

    configure_runtime_smtp(config)
    return {
        "success": True,
        "message": "Runtime email configuration saved successfully.",
        "smtp_status": get_smtp_status(),
    }


@router.get(
    "/email-logs",
    summary="Retrieve outgoing email audit ledger",
)
async def list_email_logs(limit: int = 50) -> dict[str, Any]:
    logs = get_email_logs(limit=min(limit, 100))
    return {
        "count": len(logs),
        "logs": logs,
    }


@router.post(
    "/resend-email/{email_id}",
    summary="Resend an email from the audit outbox",
)
async def resend_email_endpoint(email_id: str) -> dict[str, Any]:
    log = get_email_log_by_id(email_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email log entry {email_id} not found.",
        )
    result = await asyncio.to_thread(
        send_email_sync,
        to_email=log["to_email"],
        subject=f"[Resend] {log['subject']}",
        html_body=log.get("html_body", ""),
    )
    return {
        "success": result.success,
        "status": result.status,
        "message": result.message,
        "details": result.get("details", {}),
    }


@router.post(
    "/test-smtp",
    summary="Send a test email to verify SMTP configuration",
)
@limiter.limit("5/minute")
async def test_smtp_dispatch(
    request: Request,
    response: Response,
    payload: TestSmtpPayload,
) -> dict[str, Any]:
    dynamic_cfg: dict[str, Any] = {}
    if payload.provider:
        dynamic_cfg["provider"] = payload.provider
    if payload.smtp_host:
        dynamic_cfg["host"] = payload.smtp_host
    if payload.smtp_port:
        dynamic_cfg["port"] = payload.smtp_port
    if payload.smtp_user:
        dynamic_cfg["user"] = payload.smtp_user
    if payload.smtp_password:
        dynamic_cfg["password"] = payload.smtp_password
    if payload.smtp_ssl is not None:
        dynamic_cfg["use_ssl"] = payload.smtp_ssl
    if payload.smtp_tls is not None:
        dynamic_cfg["use_tls"] = payload.smtp_tls
    if payload.from_email:
        dynamic_cfg["from_email"] = payload.from_email
    if payload.from_name:
        dynamic_cfg["from_name"] = payload.from_name
    if payload.api_key:
        dynamic_cfg["api_key"] = payload.api_key

    has_dynamic_creds = bool(
        dynamic_cfg.get("api_key")
        or (dynamic_cfg.get("user") and dynamic_cfg.get("password"))
    )

    if not has_dynamic_creds and not is_smtp_configured():
        return {
            "success": False,
            "status": "unconfigured",
            "message": "SMTP credentials (SMTP_USER/SMTP_PASSWORD or API Key) are not configured on the server.",
            "smtp_status": get_smtp_status(),
        }

    active_host = dynamic_cfg.get("host") or settings.smtp_host
    active_port = dynamic_cfg.get("port") or settings.smtp_port

    test_html = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; background-color: #f8fafc;">
  <div style="max-width: 520px; margin: 0 auto; background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.04);">
    <div style="background: #047857; color: white; padding: 8px 14px; border-radius: 6px; display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px;">
      Live Diagnostic Pass
    </div>
    <h2 style="color: #064e3b; margin: 0 0 12px 0; font-size: 22px;">🏛️ Bhoomitra Email Dispatch Verified</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
      This automated diagnostic test confirms that the platform email delivery pipeline is active, authenticated, and communicating successfully with mail recipients.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 0; color: #64748b; width: 35%;">Relay Host</td>
        <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">{active_host}:{active_port}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 0; color: #64748b;">Recipient</td>
        <td style="padding: 8px 0; font-weight: 600; color: #047857;">{payload.to_email}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Dispatched At</td>
        <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">{datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
      </tr>
    </table>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #166534;">
      ✓ Verification complete. Registration notifications and platform security alerts are operational.
    </div>
    <hr style="margin: 24px 0 16px 0; border: none; border-top: 1px solid #e2e8f0;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">Bhoomitra National Land Governance Platform</p>
  </div>
</body>
</html>"""
    test_text = f"Bhoomitra SMTP Diagnostic Test\n\nVerified delivery to {payload.to_email} via {active_host}:{active_port} at {datetime.now(UTC).isoformat()}."

    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(
                send_email_sync,
                to_email=payload.to_email,
                subject=payload.subject,
                html_body=test_html,
                text_body=test_text,
                runtime_config=dynamic_cfg if dynamic_cfg else None,
            ),
            timeout=12.0,
        )

        if payload.persist and result.success and dynamic_cfg:
            configure_runtime_smtp(dynamic_cfg)

        return {
            "success": result.success,
            "status": result.status,
            "message": result.message,
            "details": result.get("details", {}),
            "smtp_status": get_smtp_status(),
        }
    except Exception as exc:
        return {
            "success": False,
            "status": "failed",
            "message": f"SMTP test failed with error: {type(exc).__name__}: {exc}",
            "smtp_status": get_smtp_status(),
        }


