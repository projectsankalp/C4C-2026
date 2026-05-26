"""FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated, AsyncGenerator

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from supabase import Client

from app.config import Settings, get_settings
from app.core.exceptions import AuthError
from app.core.memory_store import MemoryStore
from app.core.rate_limiter import get_redis_client
from app.core.security import decode_supabase_jwt, user_id_from_claims
from app.db.supabase import get_supabase

bearer_scheme = HTTPBearer(auto_error=False)

RedisLike = Redis | MemoryStore


def _use_memory_redis(redis_url: str) -> bool:
    return not redis_url.startswith("redis://") and not redis_url.startswith("rediss://")


async def get_redis(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AsyncGenerator[RedisLike, None]:
    if _use_memory_redis(settings.REDIS_URL):
        yield MemoryStore()
        return
    client = await get_redis_client(settings.REDIS_URL)
    try:
        yield client
    finally:
        await client.aclose()


def get_settings_dep() -> Settings:
    return get_settings()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
    authorization: Annotated[str | None, Header()] = None,
    redis: RedisLike = Depends(get_redis),
    settings: Settings = Depends(get_settings_dep),
) -> str:
    token: str | None = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
    if not token:
        raise AuthError()
    claims = await decode_supabase_jwt(token, redis, settings)
    return user_id_from_claims(claims)


def get_supabase_dep() -> Client:
    return get_supabase()
