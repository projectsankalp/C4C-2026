from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileCreateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    preferred_language: str = Field(default="hi-IN")
    phone: str | None = None
    state: str | None = None
    occupation_category: str | None = None


class UserResponse(BaseModel):
    id: UUID
    phone: str | None
    full_name: str
    preferred_language: str
    state: str | None
    occupation_category: str | None
    passport_code: str | None = None
    passport_id: UUID | None = None
    created_at: datetime | None = None
