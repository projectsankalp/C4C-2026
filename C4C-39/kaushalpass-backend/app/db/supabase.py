"""Supabase client singleton."""

from functools import lru_cache

from supabase import Client, create_client

from app.config import Settings, get_settings


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def get_supabase() -> Client:
    return get_supabase_client()
