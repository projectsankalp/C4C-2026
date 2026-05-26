from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SkillEntryCreate(BaseModel):
    skill_name: str = Field(min_length=1)
    skill_level: str | None = None
    nsqf_level: int | None = Field(default=None, ge=1, le=8)
    confidence_score: float | None = Field(default=None, ge=0.0, le=1.0)
    verification_status: str = "ai_provisional"


class SkillEntryUpdate(BaseModel):
    skill_name: str | None = None
    skill_level: str | None = None
    nsqf_level: int | None = Field(default=None, ge=1, le=8)
    confidence_score: float | None = Field(default=None, ge=0.0, le=1.0)
    verification_status: str | None = None


class SkillEntryResponse(BaseModel):
    id: UUID
    passport_id: UUID
    skill_name: str
    skill_level: str | None
    nsqf_level: int | None
    confidence_score: float | None
    verification_status: str
    is_verified: bool
    archived: bool
    created_at: datetime | None = None


class PassportResponse(BaseModel):
    id: UUID
    user_id: UUID
    passport_code: str
    is_active: bool
    total_skills: int
    issued_at: datetime | None
    skills: list[SkillEntryResponse]
