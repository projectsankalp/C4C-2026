from uuid import UUID

from app.db.queries.users import get_supabase_admin


async def insert_document(
    user_id: UUID,
    *,
    storage_path: str,
    file_type: str,
    file_size_bytes: int | None,
    phash: str | None,
    nemotron_analysis: dict | None = None,
    skill_id: UUID | None = None,
) -> dict:
    client = get_supabase_admin()
    result = (
        client.table("documents")
        .insert(
            {
                "user_id": str(user_id),
                "skill_id": str(skill_id) if skill_id else None,
                "storage_path": storage_path,
                "file_type": file_type,
                "file_size_bytes": file_size_bytes,
                "phash": phash,
                "nemotron_analysis": nemotron_analysis,
            }
        )
        .select("*")
        .single()
        .execute()
    )
    return result.data


async def get_phashes_for_user(user_id: UUID) -> list[str]:
    client = get_supabase_admin()
    result = (
        client.table("documents")
        .select("phash")
        .eq("user_id", str(user_id))
        .not_.is_("phash", "null")
        .execute()
    )
    return [row["phash"] for row in (result.data or []) if row.get("phash")]


async def get_document_by_id(document_id: UUID) -> dict | None:
    client = get_supabase_admin()
    result = (
        client.table("documents")
        .select("*")
        .eq("id", str(document_id))
        .maybe_single()
        .execute()
    )
    return result.data
