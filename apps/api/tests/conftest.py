import asyncio
import sys
from collections.abc import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.db import get_db
from app.main import app

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    async def override_get_db() -> AsyncGenerator[AsyncMock, None]:
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_result.scalars.return_value.all.return_value = []
        mock_session.execute = AsyncMock(return_value=mock_result)
        yield mock_session

    fake_db_info = {
        "database_name": "land_governance_test",
        "database_user": "land_admin",
        "postgis_version": "3.6.0",
    }

    app.dependency_overrides[get_db] = override_get_db
    with (
        patch(
            "app.main.check_database_connection",
            new=AsyncMock(return_value=fake_db_info),
        ),
        patch(
            "app.main.close_database_connections",
            new=AsyncMock(),
        ),
        TestClient(app, base_url="http://localhost") as test_client,
    ):
        yield test_client
    app.dependency_overrides.clear()
