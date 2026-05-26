# KaushalPass Backend — Person 1

Foundation + Sarvam voice pipeline + GLM 5.1 NSQF assessment.

## Prerequisites

- Python 3.12
- Supabase project (run migrations in `migrations/`)
- Redis (Upstash recommended)
- [Sarvam API key](https://dashboard.sarvam.ai)
- [NVIDIA API key](https://build.nvidia.com) for GLM 5.1 NIM

## Setup

```bash
cd kaushalpass-backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
```

### Supabase migrations

Run in order in Supabase SQL Editor:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_rls_policies.sql`
3. `migrations/003_indexes.sql`

Create Storage buckets (private; signed URLs used): `tts-audio`, `documents`, `certificates`.

### Run locally

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API endpoints (Person 1 + Person 2)

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | No |
| GET | `/api/v1/auth/me` | Bearer JWT |
| POST | `/api/v1/auth/profile` | Bearer JWT |
| POST | `/api/v1/voice/assess` | Bearer JWT |
| GET | `/api/v1/passport/me` | Bearer JWT |
| POST | `/api/v1/passport/skills` | Bearer JWT |
| PUT | `/api/v1/passport/skills/{skill_id}` | Bearer JWT |
| DELETE | `/api/v1/passport/skills/{skill_id}` | Bearer JWT |
| POST | `/api/v1/documents/upload` | Bearer JWT |
| GET | `/api/v1/documents/{document_id}/url` | Bearer JWT |
| POST | `/api/v1/certificate/generate` | Bearer JWT |
| GET | `/api/v1/certificate/status/{job_id}` | Bearer JWT |
| GET | `/api/v1/verifier/queue` | Bearer JWT |
| POST | `/api/v1/verifier/submit/{assessment_id}` | Bearer JWT |
| GET | `/api/v1/verify/{passport_id}` | No |

### Voice assess (multipart)

- `audio`: WebM/WAV file (max ~60s)
- `language_code`: `hi-IN` \| `ta-IN` \| `te-IN` \| `kn-IN` \| `bn-IN` \| `en-IN`

SSE events: text chunks → `data: [DONE]:{json}` → `data: [TTS]:{signed_url}`

## Quality checks

```bash
ruff check app/
mypy app/
```

Person 2 routers are registered in `app/api/v1/router.py`.
