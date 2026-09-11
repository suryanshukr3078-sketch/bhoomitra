from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserStatus
from app.models.identity import User
from app.schemas.identity import Token, UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=200)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: Token
    user: UserRead


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
)
@limiter.limit("5/minute")
async def register(
    request: Request,
    body: RegisterRequest,
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

    user = User(
        email=body.email.lower().strip(),
        full_name=body.full_name.strip(),
        password_hash=hash_password(body.password),
        status=UserStatus.ACTIVE,
        is_superuser=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "token": Token(access_token=access_token, token_type="bearer"),
        "user": UserRead(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role="CITIZEN",
            is_active=user.status == UserStatus.ACTIVE,
            created_at=user.created_at,
        ),
    }


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate and receive bearer token",
)
@limiter.limit("5/minute")
async def login(
    request: Request,
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or suspended.",
        )

    user.last_login_at = datetime.now(UTC)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "token": Token(access_token=access_token, token_type="bearer"),
        "user": UserRead(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role="CITIZEN",
            is_active=True,
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
    return UserRead(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role="CITIZEN",
        is_active=current_user.status == UserStatus.ACTIVE,
        created_at=current_user.created_at,
    )
