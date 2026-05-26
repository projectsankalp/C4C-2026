"""Application settings — all env vars loaded here."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE if _ENV_FILE.is_file() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "KaushalPass API"
    APP_VERSION: str = "1.0"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "https://kaushalpass.in"]
    )

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_JWKS_URL: str = ""

    # Redis (Upstash) — use "memory" for in-process dev fallback (no Redis server)
    REDIS_URL: str = "memory"

    # Sarvam AI
    SARVAM_API_KEY: str = ""

    # NVIDIA NIM — GLM 5.1 + Nemotron
    NVIDIA_API_KEY: str = ""
    NVIDIA_API_BASE: str = "https://integrate.api.nvidia.com/v1"
    GLM_MODEL: str = "z-ai/glm-5.1"

    # Person 2 — certificates / public verify links
    APP_URL: str = "https://kaushalpass.in"
    STORAGE_BUCKET_DOCUMENTS: str = "documents"
    STORAGE_BUCKET_CERTIFICATES: str = "certificates"
    PASSPORT_CODE_PREFIX: str = "KP-2025"

    # Rate limits
    VOICE_ASSESS_DAILY_LIMIT: int = 10
    RATE_LIMIT_WINDOW_SECONDS: int = 86400

    # Storage
    TTS_BUCKET: str = "tts-audio"
    TTS_SIGNED_URL_EXPIRY_SECONDS: int = 3600

    # JWKS cache TTL
    JWKS_CACHE_TTL_SECONDS: int = 3600

    # Scheme Advisor (Groq AI matcher)
    GROQ_API_KEY: str = ""
    SCHEME_CACHE_TTL_HOURS: int = 24


@lru_cache
def get_settings() -> Settings:
    return Settings()
