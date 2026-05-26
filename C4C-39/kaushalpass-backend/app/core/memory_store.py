"""In-memory Redis substitute for local dev when REDIS_URL is not a redis:// URL."""

from __future__ import annotations

import time
from typing import Any


class MemoryPipeline:
    def __init__(self, store: MemoryStore) -> None:
        self._store = store
        self._ops: list[tuple[str, tuple[Any, ...]]] = []

    def zremrangebyscore(self, key: str, _min: float, max_score: float) -> MemoryPipeline:
        self._ops.append(("zremrangebyscore", (key, max_score)))
        return self

    def zadd(self, key: str, mapping: dict[str, float]) -> MemoryPipeline:
        self._ops.append(("zadd", (key, mapping)))
        return self

    def zcard(self, key: str) -> MemoryPipeline:
        self._ops.append(("zcard", (key,)))
        return self

    def expire(self, key: str, seconds: int) -> MemoryPipeline:
        self._ops.append(("expire", (key, seconds)))
        return self

    async def execute(self) -> list[Any]:
        results: list[Any] = []
        for op, args in self._ops:
            if op == "zremrangebyscore":
                results.append(self._store._zremrangebyscore(*args))
            elif op == "zadd":
                results.append(self._store._zadd(*args))
            elif op == "zcard":
                results.append(self._store._zcard(args[0]))
            elif op == "expire":
                results.append(True)
        return results


class MemoryStore:
    """Minimal async KV + sorted-set for JWKS cache and rate limits."""

    def __init__(self) -> None:
        self._kv: dict[str, str] = {}
        self._zsets: dict[str, dict[str, float]] = {}
        self._expiry: dict[str, float] = {}

    async def aclose(self) -> None:
        return None

    async def get(self, key: str) -> str | None:
        self._purge_expired(key)
        return self._kv.get(key)

    async def setex(self, key: str, ttl: int, value: str) -> None:
        self._kv[key] = value
        self._expiry[key] = time.time() + ttl

    async def delete(self, key: str) -> None:
        self._kv.pop(key, None)
        self._zsets.pop(key, None)
        self._expiry.pop(key, None)

    async def zrem(self, key: str, member: str) -> None:
        z = self._zsets.get(key)
        if z:
            z.pop(member, None)

    def pipeline(self) -> MemoryPipeline:
        return MemoryPipeline(self)

    def _purge_expired(self, key: str) -> None:
        exp = self._expiry.get(key)
        if exp and time.time() > exp:
            self._kv.pop(key, None)
            self._expiry.pop(key, None)

    def _zremrangebyscore(self, key: str, max_score: float) -> int:
        z = self._zsets.setdefault(key, {})
        remove = [m for m, s in z.items() if s <= max_score]
        for m in remove:
            del z[m]
        return len(remove)

    def _zadd(self, key: str, mapping: dict[str, float]) -> int:
        z = self._zsets.setdefault(key, {})
        z.update(mapping)
        return len(mapping)

    def _zcard(self, key: str) -> int:
        return len(self._zsets.get(key, {}))
