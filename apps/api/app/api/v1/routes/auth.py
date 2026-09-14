import re
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.email import send_welcome_email

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

    # Dispatch welcome email asynchronously in background
    background_tasks.add_task(
        send_welcome_email,
        to_email=user.email,
        full_name=user.full_name,
        org_name=org.name,
        category_title=category_title,
        role_title=role_title,
        is_pending=is_pending,
    )

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
        }

    # Verified immediately: issue HttpOnly access token cookie
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=86400,
        httponly=True,
        samesite="lax",
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
        ),
        "status": "success",
        "message": "Registration successful, you can now log in",
        "requires_verification": False,
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

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=86400,
        httponly=True,
        samesite="lax",
        secure=settings.is_production,
        path="/",
    )

    role_label = "admin" if user.is_superuser else "CITIZEN"

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
        ),
    }


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    role_label = "admin" if current_user.is_superuser else "CITIZEN"
    return UserRead(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=role_label,
        is_active=current_user.status == UserStatus.ACTIVE,
        is_superuser=current_user.is_superuser,
        status=current_user.status.value,
        created_at=current_user.created_at,
    )


@router.post(
    "/logout",
    summary="Logout user and clear session cookies",
)
async def logout(
    response: Response,
) -> dict[str, str]:
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
        secure=settings.is_production,
    )
    return {"status": "success", "message": "Successfully logged out."}

