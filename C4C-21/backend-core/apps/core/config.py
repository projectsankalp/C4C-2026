from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:password@localhost/jalrakshak"
    REDIS_URL: str = "redis://localhost:6379/0"
    TWILIO_ACCOUNT_SID: str = "AC..."
    TWILIO_AUTH_TOKEN: str = "..."
    
    class Config:
        env_file = ".env"

settings = Settings()
