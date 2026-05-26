"""JWT validation via Supabase JWKS (cached in Redis)."""

from __future__ import annotations

import json
from typing import Any

import httpx
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

from app.config import Settings
from app.core.exceptions import AuthError


async def fetch_jwks(jwks_url: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        return response.json()


async def get_jwks_cached(
    redis: Any,  # Redis or MemoryStore
    settings: Settings,
) -> dict[str, Any]:
    cache_key = "jwks:supabase"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    jwks_url = settings.SUPABASE_JWKS_URL or f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    jwks = await fetch_jwks(jwks_url)
    await redis.setex(
        cache_key,
        settings.JWKS_CACHE_TTL_SECONDS,
        json.dumps(jwks),
    )
    return jwks


def _get_rsa_key(jwks: dict[str, Any], kid: str) -> dict[str, str] | None:
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
    return None


async def decode_supabase_jwt(
    token: str,
    redis: Any,
    settings: Settings,
) -> dict[str, Any]:
    """Validate JWT and return claims. Raises AuthError on failure."""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise AuthError("Invalid token header") from exc

    kid = unverified_header.get("kid")
    if not kid:
        if settings.SUPABASE_JWT_SECRET:
            try:
                return jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    audience="authenticated",
                )
            except JWTError as exc:
                raise AuthError("Invalid token") from exc
        raise AuthError("Missing key id in token")

    jwks = await get_jwks_cached(redis, settings)
    rsa_key = _get_rsa_key(jwks, kid)
    if not rsa_key:
        await redis.delete("jwks:supabase")
        jwks = await get_jwks_cached(redis, settings)
        rsa_key = _get_rsa_key(jwks, kid)
    if not rsa_key:
        raise AuthError("Unable to find matching signing key")

    try:
        return jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience="authenticated",
        )
    except ExpiredSignatureError as exc:
        raise AuthError("Token expired") from exc
    except JWTError as exc:
        raise AuthError("Invalid token") from exc


def user_id_from_claims(claims: dict[str, Any]) -> str:
    sub = claims.get("sub")
    if not sub:
        raise AuthError("Token missing subject")
    return str(sub)
