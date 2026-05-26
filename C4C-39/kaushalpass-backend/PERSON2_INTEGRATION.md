# Person 2 — Integration (for Person 1)

Person 2 routers are mounted in `app/api/v1/router.py` (included from `app/main.py`).

## Person 2 pip dependencies

Merge `requirements-person2.txt` into your project `requirements.txt` (do not duplicate versions blindly).

## Environment variables

| Variable | Who sets it |
|----------|-------------|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` | **Person 1 / team** (shared project `.env`) |
| `NVIDIA_API_KEY`, `APP_URL` | **Person 2** — see `.env.example` |

Person 2 services call Supabase for DB + storage, but **provisioning the Supabase project and migrations** is a team/Person 1 concern. Use the same values in one root `.env` when the app runs.

## Database

Apply `supabase/migrations/20250526000001_person2_core_schema.sql` or merge into your migration set.

## Auth helper

Protected routes use `CurrentUserId` from `app.api.v1.auth.router`, backed by JWKS/HS256 in `app.api.deps`.
