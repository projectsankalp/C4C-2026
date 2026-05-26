from uuid import UUID

from app.db.queries.users import get_supabase_admin


async def insert_assessment(
    user_id: UUID,
    *,
    input_type: str,
    language_code: str | None = None,
    transcribed_text: str | None = None,
    glm_raw_response: dict | None = None,
    nemotron_analysis: dict | None = None,
    parsed_result: dict | None = None,
    skill_id: UUID | None = None,
    tts_audio_path: str | None = None,
    tokens_used: int = 0,
) -> dict:
    client = get_supabase_admin()
    payload = {
        "user_id": str(user_id),
        "input_type": input_type,
        "language_code": language_code,
        "transcribed_text": transcribed_text,
        "glm_raw_response": glm_raw_response,
        "nemotron_analysis": nemotron_analysis,
        "parsed_result": parsed_result,
        "skill_id": str(skill_id) if skill_id else None,
        "tts_audio_path": tts_audio_path,
        "tokens_used": tokens_used,
    }
    result = client.table("assessments").insert(payload).select("*").single().execute()
    return result.data


async def get_assessment_by_id(assessment_id: UUID) -> dict | None:
    client = get_supabase_admin()
    result = (
        client.table("assessments")
        .select("*")
        .eq("id", str(assessment_id))
        .maybe_single()
        .execute()
    )
    return result.data


async def get_pending_queue(limit: int = 50) -> list[dict]:
    client = get_supabase_admin()
    result = (
        client.table("assessments")
        .select("*, users(full_name), skills(skill_name, verification_status)")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    rows = result.data or []
    pending: list[dict] = []
    for row in rows:
        parsed = row.get("parsed_result") or {}
        if parsed.get("verification_escalated"):
            continue
        skill = row.get("skills") or {}
        if skill.get("verification_status") in (
            None,
            "ai_provisional",
            "pending",
            "awaiting_review",
        ):
            pending.append(row)
    return pending


async def get_assessment_reviews(assessment_id: UUID) -> list[dict]:
    client = get_supabase_admin()
    result = (
        client.table("verifier_reviews")
        .select("*")
        .eq("assessment_id", str(assessment_id))
        .order("created_at")
        .execute()
    )
    return result.data or []


async def insert_verifier_review(
    assessment_id: UUID,
    verifier_user_id: UUID,
    *,
    rubric_scores: dict,
    overall_score: float,
    notes: str | None = None,
) -> dict:
    client = get_supabase_admin()
    result = (
        client.table("verifier_reviews")
        .insert(
            {
                "assessment_id": str(assessment_id),
                "verifier_user_id": str(verifier_user_id),
                "rubric_scores": rubric_scores,
                "overall_score": overall_score,
                "notes": notes,
            }
        )
        .select("*")
        .single()
        .execute()
    )
    return result.data


async def update_skill_verification_status(skill_id: UUID, status: str) -> dict:
    client = get_supabase_admin()
    result = (
        client.table("skills")
        .update(
            {
                "verification_status": status,
                "is_verified": status in ("community_verified", "verified"),
            }
        )
        .eq("id", str(skill_id))
        .select("*")
        .single()
        .execute()
    )
    return result.data


async def flag_for_escalation(assessment_id: UUID) -> dict:
    client = get_supabase_admin()
    assessment = await get_assessment_by_id(assessment_id)
    if not assessment:
        raise ValueError("Assessment not found")
    parsed = dict(assessment.get("parsed_result") or {})
    parsed["verification_escalated"] = True
    result = (
        client.table("assessments")
        .update({"parsed_result": parsed})
        .eq("id", str(assessment_id))
        .select("*")
        .single()
        .execute()
    )
    return result.data
