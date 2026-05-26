from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.api.v1.verify.schemas import PublicSkill, PublicVerifyResponse
from app.db.queries import passport as passport_queries
from app.db.queries import users as users_queries

router = APIRouter(prefix="/verify", tags=["verify"])


@router.get("/{passport_id}", response_model=PublicVerifyResponse)
async def public_verify(passport_id: UUID) -> PublicVerifyResponse:
    passport = await passport_queries.get_passport_by_id(passport_id)
    if not passport or not passport.get("is_active"):
        raise HTTPException(status_code=404, detail="Passport not found")

    user = await users_queries.get_user_by_id(UUID(passport["user_id"]))
    if not user:
        raise HTTPException(status_code=404, detail="Passport not found")

    skills_raw = await passport_queries.get_skills(passport_id)
    skills = [
        PublicSkill(
            skill_name=s["skill_name"],
            skill_level=s.get("skill_level"),
            nsqf_level=s.get("nsqf_level"),
            verification_status=s["verification_status"],
        )
        for s in skills_raw
        if not s.get("archived")
    ]

    return PublicVerifyResponse(
        passport_code=passport["passport_code"],
        holder_name=user["full_name"],
        issued_at=passport.get("issued_at"),
        skills=skills,
    )
