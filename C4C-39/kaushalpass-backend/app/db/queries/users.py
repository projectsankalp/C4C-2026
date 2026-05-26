import os
import secrets
import string
from functools import lru_cache
from uuid import UUID

from supabase import Client, create_client


def get_settings() -> dict:
    """Env-backed settings shared by Person 2 queries/services."""
    try:
        from app.config import get_settings as get_app_settings

        s = get_app_settings()
        nvidia_base = s.NVIDIA_API_BASE.rstrip("/")
        return {
            "supabase_url": s.SUPABASE_URL,
            "supabase_service_role_key": s.SUPABASE_SERVICE_ROLE_KEY,
            "supabase_jwt_secret": s.SUPABASE_JWT_SECRET,
            "nvidia_api_key": s.NVIDIA_API_KEY,
            "nvidia_api_url": f"{nvidia_base}/chat/completions",
            "app_url": s.APP_URL,
            "storage_bucket_documents": s.STORAGE_BUCKET_DOCUMENTS,
            "storage_bucket_certificates": s.STORAGE_BUCKET_CERTIFICATES,
            "passport_code_prefix": s.PASSPORT_CODE_PREFIX,
        }
    except Exception:
        return {
            "supabase_url": os.environ.get("SUPABASE_URL", ""),
            "supabase_service_role_key": os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
            "supabase_jwt_secret": os.environ.get("SUPABASE_JWT_SECRET", ""),
            "nvidia_api_key": os.environ.get("NVIDIA_API_KEY", ""),
            "nvidia_api_url": os.environ.get(
                "NVIDIA_API_URL",
                "https://integrate.api.nvidia.com/v1/chat/completions",
            ),
            "app_url": os.environ.get("APP_URL", "https://kaushalpass.in"),
            "storage_bucket_documents": os.environ.get("STORAGE_BUCKET_DOCUMENTS", "documents"),
            "storage_bucket_certificates": os.environ.get(
                "STORAGE_BUCKET_CERTIFICATES", "certificates"
            ),
            "passport_code_prefix": os.environ.get("PASSPORT_CODE_PREFIX", "KP-2025"),
        }


@lru_cache
def get_supabase_admin() -> Client:
    settings = get_settings()
    if not settings["supabase_url"] or not settings["supabase_service_role_key"]:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(settings["supabase_url"], settings["supabase_service_role_key"])


def _generate_passport_code() -> str:
    settings = get_settings()
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
    return f"{settings['passport_code_prefix']}-{suffix}"


async def get_user_by_id(user_id: UUID) -> dict | None:
    client = get_supabase_admin()
    result = client.table("users").select("*").eq("id", str(user_id)).maybe_single().execute()
    return result.data if result else None


async def upsert_user(
    user_id: UUID,
    *,
    full_name: str,
    preferred_language: str,
    phone: str | None = None,
    state: str | None = None,
    occupation_category: str | None = None,
) -> dict:
    client = get_supabase_admin()
    payload = {
        "id": str(user_id),
        "full_name": full_name,
        "preferred_language": preferred_language,
        "phone": phone,
        "state": state,
        "occupation_category": occupation_category,
    }
    result = (
        client.table("users")
        .upsert(payload, on_conflict="id")
        .select("*")
        .single()
        .execute()
    )
    return result.data


async def create_passport_for_user(user_id: UUID) -> dict:
    client = get_supabase_admin()
    for _ in range(5):
        code = _generate_passport_code()
        try:
            result = (
                client.table("passports")
                .insert(
                    {
                        "user_id": str(user_id),
                        "passport_code": code,
                        "is_active": True,
                        "total_skills": 0,
                    }
                )
                .select("*")
                .single()
                .execute()
            )
            return result.data
        except Exception:
            continue
    raise RuntimeError("Failed to generate unique passport code")
