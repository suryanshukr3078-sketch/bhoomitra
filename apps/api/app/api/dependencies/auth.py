from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.core.security import decode_access_token
from app.models.enums import MembershipStatus
from app.models.identity import OrganizationMembership, User

security_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    auth: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    raw_token = auth.credentials if auth else request.cookies.get("access_token")
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(raw_token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = UUID(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user subject in token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_optional_current_user(
    request: Request,
    auth: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    raw_token = auth.credentials if auth else request.cookies.get("access_token")
    if not raw_token:
        return None
    payload = decode_access_token(raw_token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = UUID(payload["sub"])
    except ValueError:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


def require_roles(allowed_roles: list[str]):
    async def role_checker(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if current_user.is_superuser:
            return current_user

        user_roles: list[str] = []
        if isinstance(current_user.profile, dict):
            roles_val = current_user.profile.get("roles")
            if isinstance(roles_val, list):
                user_roles.extend([str(r).lower() for r in roles_val])
            elif isinstance(roles_val, str):
                user_roles.append(roles_val.lower())

            single_role = current_user.profile.get("role")
            if single_role and isinstance(single_role, str):
                user_roles.append(single_role.lower())

        allowed_lower = [r.lower() for r in allowed_roles]
        if any(r in allowed_lower for r in user_roles):
            return current_user

        # Query active memberships for admin role/title
        membership_res = await db.execute(
            select(OrganizationMembership).where(
                OrganizationMembership.user_id == current_user.id,
                OrganizationMembership.status == MembershipStatus.ACTIVE,
            )
        )
        memberships = membership_res.scalars().all()
        for m in memberships:
            if m.title and "admin" in m.title.lower():
                user_roles.append("admin")
            if isinstance(m.permissions, dict):
                if m.permissions.get("is_admin") or m.permissions.get("role") == "admin":
                    user_roles.append("admin")

        if any(r in allowed_lower for r in user_roles):
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required.",
        )

    return role_checker


require_admin = require_roles(["admin"])
