from pydantic_settings import BaseSettings
from pydantic import Field
from pydantic_settings import SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Core server settings
    APP_NAME: str = "Rural Health Platform"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field("sqlite+aiosqlite:///./dev.db", env="DATABASE_URL")

    # Redis / Celery broker
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")

    # JWT settings
    JWT_SECRET_KEY: str = Field("devsecret", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GROQ_API_KEY: Optional[str] = Field(None, env="GROQ_API_KEY")

    # AWS S3 (optional, fallback to local)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET_NAME: Optional[str] = None
    LOCAL_UPLOAD_DIR: str = "static/uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
