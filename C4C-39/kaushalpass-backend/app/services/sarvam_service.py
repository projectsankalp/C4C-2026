"""Sarvam Saaras v3 STT + Bulbul v3 TTS."""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Final

from sarvamai import SarvamAI

from app.config import Settings, get_settings
from app.core.exceptions import ServiceError

SPEAKER_MAP: Final[dict[str, str]] = {
    "hi-IN": "anushka",
    "ta-IN": "kavitha",
    "te-IN": "shruti",
    "kn-IN": "suhani",
    "bn-IN": "manisha",
    "en-IN": "ishita",
}

VALID_LANG_CODES: Final[frozenset[str]] = frozenset(SPEAKER_MAP.keys())


def _client(settings: Settings | None = None) -> SarvamAI:
    s = settings or get_settings()
    return SarvamAI(api_subscription_key=s.SARVAM_API_KEY)


def transcribe_audio(
    audio_bytes: bytes,
    language_code: str,
    *,
    filename: str = "audio.webm",
    settings: Settings | None = None,
) -> str:
    """
    Speech-to-text via Sarvam Saaras v3.
    Writes bytes to a temp file for SDK upload.
    """
    if language_code not in VALID_LANG_CODES:
        raise ServiceError(f"Unsupported language_code: {language_code}", 400)

    suffix = Path(filename).suffix or ".webm"
    client = _client(settings)

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            response = client.speech_to_text.transcribe(
                file=audio_file,
                model="saaras:v3",
                mode="transcribe",
                language_code=language_code,
            )
        transcript = getattr(response, "transcript", None) or ""
        if not transcript.strip():
            raise ServiceError("Empty transcript from STT", 422)
        return transcript.strip()
    except ServiceError:
        raise
    except Exception as exc:
        raise ServiceError(f"STT failed: {exc}") from exc
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def synthesize_speech(
    text: str,
    language_code: str,
    *,
    settings: Settings | None = None,
) -> bytes:
    """Text-to-speech via Sarvam Bulbul v3. Returns wav bytes."""
    if language_code not in VALID_LANG_CODES:
        raise ServiceError(f"Unsupported language_code: {language_code}", 400)

    client = _client(settings)
    speaker = SPEAKER_MAP.get(language_code, "anushka")

    try:
        response = client.text_to_speech.convert(
            inputs=[text],
            target_language_code=language_code,
            model="bulbul:v3",
            speaker=speaker,
            pace=0.9,
            enable_preprocessing=True,
        )
        audios = getattr(response, "audios", None) or []
        if not audios:
            raise ServiceError("TTS returned no audio", 502)
        raw = audios[0]
        if isinstance(raw, bytes):
            return raw
        if isinstance(raw, str):
            import base64

            return base64.b64decode(raw)
        raise ServiceError("Unexpected TTS audio format", 502)
    except ServiceError:
        raise
    except Exception as exc:
        raise ServiceError(f"TTS failed: {exc}") from exc


def build_feedback_text(assess: dict[str, object], language_code: str) -> str:
    """Short spoken feedback for TTS from assessment JSON."""
    skill = str(assess.get("skill_name", ""))
    level = str(assess.get("level", ""))
    nsqf = assess.get("nsqf_level", "")

    templates: dict[str, str] = {
        "hi-IN": f"आपका कौशल: {skill}, स्तर: {level}, NSQF स्तर {nsqf}.",
        "ta-IN": f"உங்கள் திறமை: {skill}, நிலை: {level}, NSQF நிலை {nsqf}.",
        "te-IN": f"మీ నైపుణ్యం: {skill}, స్థాయి: {level}, NSQF స్థాయి {nsqf}.",
        "kn-IN": f"ನಿಮ್ಮ ಕೌಶಲ್ಯ: {skill}, ಮಟ್ಟ: {level}, NSQF ಮಟ್ಟ {nsqf}.",
        "bn-IN": f"আপনার দক্ষতা: {skill}, স্তর: {level}, NSQF স্তর {nsqf}.",
        "en-IN": f"Your skill: {skill}, level: {level}, NSQF level {nsqf}.",
    }
    return templates.get(language_code, templates["hi-IN"])
