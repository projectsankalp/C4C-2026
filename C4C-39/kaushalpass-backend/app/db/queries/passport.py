from uuid import UUID

from app.db.queries.users import get_supabase_admin


async def get_passport_by_user(user_id: UUID) -> dict | None:
    client = get_supabase_admin()
    result = (
        client.table("passports")
        .select("*")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    return result.data if result else None


async def get_passport_by_id(passport_id: UUID) -> dict | None:
    client = get_supabase_admin()
    result = (
        client.table("passports")
        .select("*")
        .eq("id", str(passport_id))
        .maybe_single()
        .execute()
    )
    return result.data if result else None


async def get_skills(passport_id: UUID, *, include_archived: bool = False) -> list[dict]:
    client = get_supabase_admin()
    query = client.table("skills").select("*").eq("passport_id", str(passport_id))
    if not include_archived:
        query = query.eq("archived", False)
    result = query.order("created_at", desc=False).execute()
    return result.data or []


async def insert_skill(
    passport_id: UUID,
    *,
    skill_name: str,
    skill_level: str | None,
    nsqf_level: int | None,
    confidence_score: float | None,
    verification_status: str = "ai_provisional",
    is_verified: bool = False,
) -> dict:
    client = get_supabase_admin()
    result = (
        client.table("skills")
        .insert(
            {
                "passport_id": str(passport_id),
                "skill_name": skill_name,
                "skill_level": skill_level or "beginner",
                "nsqf_level": nsqf_level if nsqf_level is not None else 1,
                "confidence_score": confidence_score if confidence_score is not None else 0.5,
                "verification_status": verification_status,
                "is_verified": is_verified,
            }
        )
        .select("*")
        .single()
        .execute()
    )
    await increment_total_skills(passport_id, 1)
    return result.data


async def update_skill(skill_id: UUID, updates: dict) -> dict:
    client = get_supabase_admin()
    result = (
        client.table("skills")
        .update(updates)
        .eq("id", str(skill_id))
        .select("*")
        .single()
        .execute()
    )
    return result.data


async def soft_delete_skill(skill_id: UUID, passport_id: UUID) -> dict:
    client = get_supabase_admin()
    result = (
        client.table("skills")
        .update({"archived": True})
        .eq("id", str(skill_id))
        .eq("passport_id", str(passport_id))
        .select("*")
        .single()
        .execute()
    )
    await increment_total_skills(passport_id, -1)
    return result.data


async def increment_total_skills(passport_id: UUID, delta: int) -> None:
    client = get_supabase_admin()
    passport = (
        client.table("passports")
        .select("total_skills")
        .eq("id", str(passport_id))
        .single()
        .execute()
    )
    current = int(passport.data.get("total_skills", 0))
    new_total = max(0, current + delta)
    client.table("passports").update({"total_skills": new_total}).eq(
        "id", str(passport_id)
    ).execute()


async def get_skill_by_id(skill_id: UUID) -> dict | None:
    client = get_supabase_admin()
    result = (
        client.table("skills").select("*").eq("id", str(skill_id)).maybe_single().execute()
    )
    return result.data if result else None
