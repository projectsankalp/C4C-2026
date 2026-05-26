from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PublicSkill(BaseModel):
    skill_name: str
    skill_level: str | None
    nsqf_level: int | None
    verification_status: str


class PublicVerifyResponse(BaseModel):
    passport_code: str
    holder_name: str
    issued_at: datetime | None
    skills: list[PublicSkill]
