"""Redis sliding-window rate limiter."""

from __future__ import annotations

import time
from typing import TYPE_CHECKING

import redis.asyncio as aioredis

from app.config import Settings
from app.core.exceptions import QuotaError

if TYPE_CHECKING:
    from redis.asyncio import Redis


async def get_redis_client(redis_url: str) -> Redis:
    return aioredis.from_url(redis_url, decode_responses=True)


async def check_and_increment(
    redis: Redis,
    key: str,
    limit: int,
    window_seconds: int,
) -> int:
    """
    Sliding window counter. Returns current count after increment.
    Raises QuotaError if limit exceeded.
    """
    now = time.time()
    window_start = now - window_seconds
    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    results = await pipe.execute()
    count: int = int(results[2])
    if count > limit:
        await redis.zrem(key, str(now))
        raise QuotaError(
            f"Rate limit exceeded: {limit} requests per {window_seconds // 3600}h"
        )
    return count


def voice_assess_key(user_id: str) -> str:
    return f"rate:voice_assess:{user_id}"


async def check_voice_assess_quota(redis: Redis, user_id: str, settings: Settings) -> int:
    return await check_and_increment(
        redis,
        voice_assess_key(user_id),
        settings.VOICE_ASSESS_DAILY_LIMIT,
        settings.RATE_LIMIT_WINDOW_SECONDS,
    )
