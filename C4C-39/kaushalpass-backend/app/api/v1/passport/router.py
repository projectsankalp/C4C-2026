from uuid import UUID

from fastapi import APIRouter

from app.api.v1.passport.schemas import (
    PassportResponse,
    SkillEntryCreate,
    SkillEntryResponse,
    SkillEntryUpdate,
)
from app.api.v1.auth.router import CurrentUserId
from app.services import passport_service

router = APIRouter(prefix="/passport", tags=["passport"])


def _skill_response(skill: dict) -> SkillEntryResponse:
    return SkillEntryResponse(
        id=UUID(skill["id"]),
        passport_id=UUID(skill["passport_id"]),
        skill_name=skill["skill_name"],
        skill_level=skill.get("skill_level"),
        nsqf_level=skill.get("nsqf_level"),
        confidence_score=float(skill["confidence_score"])
        if skill.get("confidence_score") is not None
        else None,
        verification_status=skill["verification_status"],
        is_verified=bool(skill.get("is_verified")),
        archived=bool(skill.get("archived")),
        created_at=skill.get("created_at"),
    )


@router.get("/me", response_model=PassportResponse)
async def get_my_passport(user_id: CurrentUserId) -> PassportResponse:
    data = await passport_service.get_passport_for_user(user_id)
    passport = data["passport"]
    skills = [_skill_response(s) for s in data["skills"]]
    return PassportResponse(
        id=UUID(passport["id"]),
        user_id=UUID(passport["user_id"]),
        passport_code=passport["passport_code"],
        is_active=passport["is_active"],
        total_skills=passport["total_skills"],
        issued_at=passport.get("issued_at"),
        skills=skills,
    )


@router.post("/skills", response_model=SkillEntryResponse)
async def add_skill(body: SkillEntryCreate, user_id: CurrentUserId) -> SkillEntryResponse:
    skill = await passport_service.add_skill(
        user_id,
        skill_name=body.skill_name,
        skill_level=body.skill_level,
        nsqf_level=body.nsqf_level,
        confidence_score=body.confidence_score,
        verification_status=body.verification_status,
    )
    return _skill_response(skill)


@router.put("/skills/{skill_id}", response_model=SkillEntryResponse)
async def update_skill(
    skill_id: UUID,
    body: SkillEntryUpdate,
    user_id: CurrentUserId,
) -> SkillEntryResponse:
    updates = body.model_dump(exclude_unset=True)
    skill = await passport_service.update_skill_for_user(user_id, skill_id, updates)
    return _skill_response(skill)


@router.delete("/skills/{skill_id}", response_model=SkillEntryResponse)
async def delete_skill(skill_id: UUID, user_id: CurrentUserId) -> SkillEntryResponse:
    skill = await passport_service.soft_delete_skill(user_id, skill_id)
    return _skill_response(skill)
