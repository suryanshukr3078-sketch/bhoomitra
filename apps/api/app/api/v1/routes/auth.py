import asyncio
import logging
import re
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.email import (
    get_smtp_status,
    is_smtp_configured,
    send_email_sync,
    send_welcome_email,
)

logger = logging.getLogger("bhoomitra.auth")

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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
    user: UserRead
    status: str = "success"
    message: str | None = None
    requires_verification: bool = False
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
        if membership_row and isinstance(membership_row, (tuple, list)) and len(membership_row) >= 2:
            m, o = membership_row[0], membership_row[1]
            if m and hasattr(m, "role") and isinstance(getattr(m, "role", None), str):
                role_label = m.role
            if o and hasattr(o, "id") and hasattr(o, "name") and isinstance(getattr(o, "name", None), str):
                org_id_val = str(o.id)
                org_name_val = str(o.name)
                org_slug_val = str(getattr(o, "slug", None) or "")
    except Exception:
        pass

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
    }


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    role_label = "admin" if current_user.is_superuser else "CITIZEN"
    org_id_val = None
    org_name_val = None
    org_slug_val = None

    try:
        stmt_membership = (
            select(OrganizationMembership, Organization)
            .outerjoin(Organization, OrganizationMembership.organization_id == Organization.id)
            .where(OrganizationMembership.user_id == current_user.id)
        )
        membership_res = await db.execute(stmt_membership)
        membership_row = membership_res.first()
        if membership_row and isinstance(membership_row, (tuple, list)) and len(membership_row) >= 2:
            m, o = membership_row[0], membership_row[1]
            if m and hasattr(m, "role") and isinstance(getattr(m, "role", None), str):
                role_label = m.role
            if o and hasattr(o, "id") and hasattr(o, "name") and isinstance(getattr(o, "name", None), str):
                org_id_val = str(o.id)
                org_name_val = str(o.name)
                org_slug_val = str(getattr(o, "slug", None) or "")
    except Exception:
        pass

    return UserRead(
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


@router.get(
    "/smtp-status",
    summary="Check platform SMTP configuration status",
)
async def get_smtp_configuration_status() -> dict[str, Any]:
    return get_smtp_status()


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
    if not is_smtp_configured():
        return {
            "success": False,
            "status": "unconfigured",
            "message": "SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not configured on the server.",
            "smtp_status": get_smtp_status(),
        }

    test_html = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; padding: 24px; color: #0f172a; background-color: #f8fafc;">
  <div style="max-width: 500px; background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
    <h2 style="color: #047857; margin-top: 0;">🏛️ Bhoomitra SMTP Diagnostic Test</h2>
    <p>This automated test message confirms that your SMTP relay configuration is active and transmitting properly.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <tr><td style="padding: 6px 0; color: #64748b;">Host:</td><td style="font-weight: 600;">{settings.smtp_host}:{settings.smtp_port}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Recipient:</td><td style="font-weight: 600;">{payload.to_email}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Timestamp:</td><td style="font-weight: 600;">{datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}</td></tr>
    </table>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Bhoomitra National Land Governance Platform</p>
  </div>
</body>
</html>"""
    test_text = f"Bhoomitra SMTP Diagnostic Test\n\nVerified delivery to {payload.to_email} at {datetime.now(UTC).isoformat()}."

    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(
                send_email_sync,
                to_email=payload.to_email,
                subject=payload.subject,
                html_body=test_html,
                text_body=test_text,
            ),
            timeout=10.0,
        )
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


