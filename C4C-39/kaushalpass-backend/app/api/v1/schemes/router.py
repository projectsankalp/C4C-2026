"""GET /api/v1/schemes/recommend — AI-powered government scheme advisor."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.auth.router import CurrentUserId
from app.api.v1.schemes.schemas import SchemeRecommendRequest, SchemeRecommendResponse
from app.api.deps import get_settings_dep
from app.config import Settings
from app.db.queries import passport as passport_queries
from app.db.queries import users as users_queries
from app.services import scheme_service

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.post("/recommend", response_model=SchemeRecommendResponse)
async def recommend_schemes(
    body: SchemeRecommendRequest,
    user_id: CurrentUserId,
    settings: Settings = Depends(get_settings_dep),
) -> SchemeRecommendResponse:
    """
    Takes a free-text problem description and returns the top 3 matching
    government schemes from MyScheme.gov.in, ranked by Groq AI.
    """
    result = await scheme_service.recommend_schemes(body.problem, settings=settings)
    if not result["schemes"]:
        raise HTTPException(
            status_code=503,
            detail="Could not load scheme data at this time. Please try again shortly.",
        )
    return SchemeRecommendResponse(**result)


@router.get("/recommend/auto", response_model=SchemeRecommendResponse)
async def recommend_schemes_auto(
    user_id: CurrentUserId,
    settings: Settings = Depends(get_settings_dep),
) -> SchemeRecommendResponse:
    """
    Auto-generates a scheme recommendation based on the user's own passport
    profile (occupation + skills) — no manual input needed.
    """
    # Build problem description from the user's profile
    user = await users_queries.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    passport = await passport_queries.get_passport_by_user(user_id)
    skills: list[dict] = []
    if passport:
        skills = await passport_queries.get_skills(passport["id"])

    occupation = user.get("occupation_category") or "informal sector worker"
    state = user.get("state") or ""
    skill_names = ", ".join(s["skill_name"] for s in skills[:5]) if skills else ""

    # Compose a natural-language problem description from profile data
    parts = [f"I am a {occupation}"]
    if state:
        parts.append(f"from {state}")
    if skill_names:
        parts.append(f"with skills in {skill_names}")
    parts.append("looking for government loan schemes or financial support")
    problem = " ".join(parts)

    result = await scheme_service.recommend_schemes(problem, settings=settings)
    if not result["schemes"]:
        raise HTTPException(
            status_code=503,
            detail="Could not load scheme data at this time. Please try again shortly.",
        )
    return SchemeRecommendResponse(**result)
