import contextlib
import json
import time
from typing import Any

import redis.asyncio as aioredis
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)


class CacheService:
    def __init__(self, redis_url: str = settings.redis_url) -> None:
        self.redis_url = redis_url
        self._redis: aioredis.Redis | None = None
        self._memory_cache: dict[str, tuple[str, float]] = {}
        self._redis_available = True

    async def _get_client(self) -> aioredis.Redis | None:
        if not self._redis_available:
            return None
        # In serverless environments (Vercel), skip local 127.0.0.1/localhost Redis to avoid 2s connection timeout
        if settings.is_serverless and any(h in self.redis_url for h in ("127.0.0.1", "localhost")):
            self._redis_available = False
            return None
        if self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=2.0,
                )
                await self._redis.ping()
            except Exception as e:
                logger.warning(
                    "Redis unavailable, falling back to memory cache",
                    error=str(e),
                )
                self._redis_available = False
                self._redis = None
                return None
        return self._redis

    async def get(self, key: str) -> str | None:
        client = await self._get_client()
        if client:
            try:
                res: Any = await client.get(key)
                if isinstance(res, bytes):
                    return res.decode("utf-8")
                return res if isinstance(res, str) else None
            except Exception as e:
                logger.warning("Redis get error, falling back to memory", error=str(e))
                self._redis_available = False

        # In-memory fallback
        if key in self._memory_cache:
            val, expires_at = self._memory_cache[key]
            if time.time() < expires_at:
                return val
            del self._memory_cache[key]
        return None

    async def set(self, key: str, value: str, expire_seconds: int = 60) -> None:
        client = await self._get_client()
        if client:
            try:
                await client.set(key, value, ex=expire_seconds)
                return
            except Exception as e:
                logger.warning("Redis set error, falling back to memory", error=str(e))
                self._redis_available = False

        # In-memory fallback
        self._memory_cache[key] = (value, time.time() + expire_seconds)

    async def get_json(self, key: str) -> Any | None:
        data = await self.get(key)
        if data is None:
            return None
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return None

    async def set_json(self, key: str, value: Any, expire_seconds: int = 60) -> None:
        serialized = json.dumps(value, default=str)
        await self.set(key, serialized, expire_seconds=expire_seconds)

    async def delete(self, key: str) -> None:
        client = await self._get_client()
        if client:
            with contextlib.suppress(Exception):
                await client.delete(key)
        self._memory_cache.pop(key, None)

    async def close(self) -> None:
        if self._redis:
            await self._redis.aclose()
            self._redis = None


cache = CacheService()
