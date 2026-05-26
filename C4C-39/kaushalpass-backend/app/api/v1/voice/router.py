"""POST /api/v1/voice/assess — voice-to-voice SSE pipeline."""

from __future__ import annotations

import asyncio
import json
import uuid
from collections.abc import AsyncGenerator
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from supabase import Client

from app.api.deps import RedisLike, get_current_user_id, get_redis, get_settings_dep, get_supabase_dep
from app.config import Settings
from app.core.rate_limiter import check_voice_assess_quota
from app.db.queries import assessments as assessments_queries
from app.services import glm_service, sarvam_service
from app.services.glm_service import build_assess_result, parse_streamed_assessment

router = APIRouter(prefix="/voice", tags=["voice"])

VALID_LANG = frozenset({"hi-IN", "ta-IN", "te-IN", "kn-IN", "bn-IN", "en-IN"})
LANG_ALIASES: dict[str, str] = {
    "en": "en-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "bn": "bn-IN",
}


def normalize_language_code(code: str) -> str:
    code = code.strip()
    return LANG_ALIASES.get(code, code)


def _sse_data(payload: str) -> str:
    return f"data: {payload}\n\n"


async def _upload_tts_wav(
    supabase: Client,
    user_id: str,
    audio_bytes: bytes,
    settings: Settings,
) -> str:
    """Upload TTS wav to Supabase Storage and return signed URL."""
    path = f"{user_id}/{uuid.uuid4()}.wav"
    bucket = settings.TTS_BUCKET
    supabase.storage.from_(bucket).upload(
        path,
        audio_bytes,
        file_options={"content-type": "audio/wav", "upsert": "false"},
    )
    signed = supabase.storage.from_(bucket).create_signed_url(
        path,
        settings.TTS_SIGNED_URL_EXPIRY_SECONDS,
    )
    url = signed.get("signedURL") or signed.get("signedUrl") or ""
    if not url:
        raise RuntimeError("Failed to create signed URL for TTS audio")
    return url


async def _log_usage(supabase: Client, user_id: str, action: str, tokens: int = 0) -> None:
    """Log usage to usage_logs table."""
    supabase.table("usage_logs").insert(
        {
            "user_id": user_id,
            "action": action,
            "tokens_used": tokens,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ).execute()


@router.post(
    "/assess",
    responses={
        200: {
            "description": "SSE stream (text/event-stream)",
            "content": {"text/event-stream": {"example": "data: [DONE]:{...}\n\n"}},
        }
    },
)
async def voice_assess(
    audio: UploadFile = File(...),
    language_code: str = Form(...),
    user_id: str = Depends(get_current_user_id),
    redis: RedisLike = Depends(get_redis),
    settings: Settings = Depends(get_settings_dep),
    supabase: Client = Depends(get_supabase_dep),
) -> StreamingResponse:
    """
    Core voice-to-voice pipeline (SSE):
    STT → GLM stream → TTS → [DONE] + [TTS] events
    """
    language_code = normalize_language_code(language_code)
    if language_code not in VALID_LANG:
        from app.core.exceptions import ServiceError

        raise ServiceError(
            "Invalid language_code. Use en-IN (not en), hi-IN, ta-IN, te-IN, kn-IN, or bn-IN.",
            400,
        )

    await check_voice_assess_quota(redis, user_id, settings)
    audio_bytes = await audio.read()
    if not audio_bytes:
        from app.core.exceptions import ServiceError

        raise ServiceError("Empty audio file", 400)

    filename = audio.filename or "audio.webm"

    async def event_stream() -> AsyncGenerator[str, None]:
        loop = asyncio.get_running_loop()

        # 1. STT (blocking SDK — thread pool)
        try:
            transcript = await loop.run_in_executor(
                None,
                lambda: sarvam_service.transcribe_audio(
                    audio_bytes, language_code, filename=filename, settings=settings
                ),
            )
        except Exception as exc:
            yield _sse_data(json.dumps({"error": str(exc)}))
            return

        yield _sse_data(json.dumps({"transcript": transcript}))

        # 2. GLM SSE stream
        full_text_parts: list[str] = []
        async for token in glm_service.stream_skill_assessment(
            transcript, language_code, settings=settings
        ):
            full_text_parts.append(token)
            yield _sse_data(token)

        full_text = "".join(full_text_parts)
        try:
            parsed = parse_streamed_assessment(full_text)
        except Exception as exc:
            yield _sse_data(json.dumps({"error": str(exc)}))
            return

        # 3. TTS feedback
        feedback = sarvam_service.build_feedback_text(parsed, language_code)
        try:
            wav_bytes = await loop.run_in_executor(
                None,
                lambda: sarvam_service.synthesize_speech(
                    feedback, language_code, settings=settings
                ),
            )
        except Exception as exc:
            yield _sse_data(json.dumps({"error": f"TTS failed: {exc}"}))
            return

        storage_path = ""
        tts_url = ""
        try:
            tts_url = await _upload_tts_wav(supabase, user_id, wav_bytes, settings)
            # storage_path is the wav filename without the signed-URL query string
            storage_path = tts_url.split("?")[0].split("/")[-1]
        except Exception as exc:
            yield _sse_data(json.dumps({"error": f"Storage upload failed: {exc}"}))
            return

        assess_payload = build_assess_result(parsed, transcript, tts_url)

        # 4. Persist assessment via the shared query layer (async — awaited directly)
        try:
            await assessments_queries.insert_assessment(
                UUID(user_id),
                input_type="voice",
                language_code=language_code,
                transcribed_text=transcript,
                glm_raw_response={"text": full_text},
                parsed_result=assess_payload,
                tts_audio_path=storage_path,
            )
        except Exception:
            pass  # non-fatal: stream must complete even if DB write fails

        # 5. Log usage (best-effort, non-blocking)
        try:
            await loop.run_in_executor(
                None,
                lambda: _log_usage(supabase, user_id, "voice_assess"),
            )
        except Exception:
            pass

        yield _sse_data(f"[DONE]:{json.dumps(assess_payload, ensure_ascii=False)}")
        yield _sse_data(f"[TTS]:{tts_url}")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
