from collections.abc import AsyncGenerator
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

from sqlalchemy.pool import NullPool

connection_options = (
    f"-c timezone=UTC "
    f"-c statement_timeout={settings.db_statement_timeout_ms} "
    f"-c lock_timeout={settings.db_lock_timeout_ms} "
    "-c idle_in_transaction_session_timeout="
    f"{settings.db_idle_transaction_timeout_ms}"
)

# Serverless connection pooling:
# In serverless environments (e.g. Vercel), instances freeze or terminate unpredictably.
# Connecting to Supabase's transaction pooler (PgBouncer, port 6543) with NullPool
# ensures no connections are hoarded across frozen containers, eliminating stuck
# "idle in transaction" sessions and pool exhaustion.
if settings.is_serverless:
    serverless_options = (
        f"-c timezone=UTC "
        f"-c statement_timeout={settings.db_statement_timeout_ms} "
        f"-c lock_timeout={settings.db_lock_timeout_ms} "
        "-c idle_in_transaction_session_timeout=5000"
    )
    engine: AsyncEngine = create_async_engine(
        settings.database_url,
        echo=settings.debug,
        poolclass=NullPool,
        pool_pre_ping=False,
        connect_args={
            "application_name": settings.app_name,
            "options": serverless_options,
        },
    )
else:
    engine: AsyncEngine = create_async_engine(
        settings.database_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout_seconds,
        pool_recycle=settings.db_pool_recycle_seconds,
        pool_use_lifo=True,
        pool_reset_on_return="rollback",
        connect_args={
            "application_name": settings.app_name,
            "options": connection_options,
        },
    )


AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[
    AsyncSession,
    None,
]:
    async with AsyncSessionFactory() as session:
        try:
            yield session
            if session.in_transaction():
                await session.commit()
        except Exception:
            if session.in_transaction():
                await session.rollback()
            raise
        finally:
            await session.close()


get_db = get_db_session


async def check_database_connection() -> dict[str, Any]:
    async with engine.connect() as connection:
        result = await connection.execute(
            text(
                """
                SELECT
                    current_database() AS database_name,
                    current_user AS database_user,
                    PostGIS_Version() AS postgis_version
                """
            )
        )

        row = result.mappings().one()

        return {
            "database_name": row["database_name"],
            "database_user": row["database_user"],
            "postgis_version": row["postgis_version"],
        }


async def close_database_connections() -> None:
    await engine.dispose()
