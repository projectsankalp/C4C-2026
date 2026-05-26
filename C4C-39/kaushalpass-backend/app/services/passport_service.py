from uuid import UUID

from fastapi import HTTPException

from app.db.queries import passport as passport_queries
from app.db.queries import users as users_queries
from app.services.nsqf_mapper import map_skill_to_nsqf


async def get_passport_for_user(user_id: UUID) -> dict:
    passport = await passport_queries.get_passport_by_user(user_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    skills = await passport_queries.get_skills(UUID(passport["id"]))
    user = await users_queries.get_user_by_id(user_id)
    return {
        "passport": passport,
        "user": user,
        "skills": skills,
    }


async def add_skill(
    user_id: UUID,
    *,
    skill_name: str,
    skill_level: str | None = None,
    nsqf_level: int | None = None,
    confidence_score: float | None = None,
    verification_status: str = "ai_provisional",
) -> dict:
    passport = await passport_queries.get_passport_by_user(user_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")

    resolved_nsqf = nsqf_level
    if resolved_nsqf is None:
        mapped_level, _ = map_skill_to_nsqf(skill_name)
        resolved_nsqf = mapped_level

    return await passport_queries.insert_skill(
        UUID(passport["id"]),
        skill_name=skill_name,
        skill_level=skill_level,
        nsqf_level=resolved_nsqf,
        confidence_score=confidence_score,
        verification_status=verification_status,
    )


async def update_skill_for_user(
    user_id: UUID,
    skill_id: UUID,
    updates: dict,
) -> dict:
    passport = await passport_queries.get_passport_by_user(user_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    skill = await passport_queries.get_skill_by_id(skill_id)
    if not skill or skill.get("passport_id") != passport["id"]:
        raise HTTPException(status_code=403, detail="Skill does not belong to this user")
    if skill.get("archived"):
        raise HTTPException(status_code=404, detail="Skill not found")
    return await passport_queries.update_skill(skill_id, updates)


async def soft_delete_skill(user_id: UUID, skill_id: UUID) -> dict:
    passport = await passport_queries.get_passport_by_user(user_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    skill = await passport_queries.get_skill_by_id(skill_id)
    if not skill or skill.get("passport_id") != passport["id"]:
        raise HTTPException(status_code=403, detail="Skill does not belong to this user")
    return await passport_queries.soft_delete_skill(skill_id, UUID(passport["id"]))
