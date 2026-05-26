# Backend State — integrated (Person 1 + Person 2)

## Integrated

- `app/main.py` — FastAPI app + `/health`
- `app/api/v1/router.py` — all v1 routers (auth, voice, passport, documents, certificate, verifier, verify)
- Shared config: `app/config.py` (+ `app/db/queries/users.get_settings()`)
- Shared auth: `app.api.deps` (JWKS/HS256) → `app.api.v1.auth.router.CurrentUserId`

## You still need (runtime)

1. Copy `.env.example` → `.env` and set Supabase + Sarvam keys (keep your `NVIDIA_API_KEY`, `APP_URL`)
2. Run Supabase migrations `migrations/001` → `003`
3. Create buckets: `tts-audio`, `documents`, `certificates`
4. `pip install -r requirements.txt` and `uvicorn app.main:app --reload`

## Schema

Use Person 1 migrations only (`migrations/`). Person 2 code defaults align with `verification_status` enum (`ai_provisional`, etc.).
