"""Redis cache utilities"""
import json
from typing import Any, Optional

import redis.asyncio as redis

from app.core.config import settings

# Redis client
redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """Get Redis client"""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def close_redis() -> None:
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def get_cache(key: str) -> Optional[Any]:
    """Get value from cache"""
    client = await get_redis()
    value = await client.get(key)
    if value:
        return json.loads(value)
    return None


async def set_cache(key: str, value: Any, ttl: int) -> None:
    """Set value in cache with TTL"""
    client = await get_redis()
    await client.setex(key, ttl, json.dumps(value))


async def delete_cache(key: str) -> None:
    """Delete value from cache"""
    client = await get_redis()
    await client.delete(key)


async def clear_cache_pattern(pattern: str) -> None:
    """Clear all cache keys matching pattern"""
    client = await get_redis()
    async for key in client.scan_iter(match=pattern):
        await client.delete(key)

