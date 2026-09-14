"""
Safeguard CLI utility to manually promote a user to administrator.
No self-service path exists via the UI to gain administrative access.

Usage:
    python scripts/promote_admin.py --email admin@landgov.gov
"""
import argparse
import asyncio
import sys

from sqlalchemy import select

from app.db.session import AsyncSessionFactory
from app.models.enums import UserStatus
from app.models.identity import User


async def promote_user(email: str) -> None:
    clean_email = email.strip().lower()
    async with AsyncSessionFactory() as session:
        result = await session.execute(
            select(User).where(User.email == clean_email)
        )
        user = result.scalar_one_or_none()
        if not user:
            print(f"[ERROR] User with email '{clean_email}' does not exist in the database.")
            sys.exit(1)

        user.is_superuser = True
        user.status = UserStatus.ACTIVE

        # Also ensure profile reflects admin role
        profile = dict(user.profile) if isinstance(user.profile, dict) else {}
        roles = list(profile.get("roles", []))
        if "admin" not in roles:
            roles.append("admin")
        profile["roles"] = roles
        profile["role"] = "admin"
        user.profile = profile

        await session.commit()
        print(f"[SUCCESS] User '{user.email}' (ID: {user.id}) has been promoted to Administrator.")
        print("  - is_superuser: True")
        print(f"  - status: {user.status.value}")
        print("  - role: admin")


def main() -> None:
    parser = argparse.ArgumentParser(description="Promote user to administrator")
    parser.add_argument(
        "--email",
        type=str,
        required=True,
        help="Email address of the user to promote",
    )
    args = parser.parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(promote_user(args.email))


if __name__ == "__main__":
    main()
