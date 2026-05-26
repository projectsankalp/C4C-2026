"""
Sarvam AI Service — Core client for all Sarvam AI capabilities:
  - translate_text()     → Translate any text to an Indian language
  - text_to_speech()     → Convert text to base64 WAV audio
  - speech_to_text()     → Convert audio bytes to text (STT)

API docs: https://docs.sarvam.ai
Requires: SARVAM_API_KEY in config / env
"""

import os
import requests
from utils.logger import app_logger

SARVAM_BASE_URL = "https://api.sarvam.ai"

# Map our 2-letter codes → Sarvam BCP-47 codes
LANG_MAP = {
    "en": "en-IN",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "kn": "kn-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
    "ml": "ml-IN",
    "or": "od-IN",
}

# Sarvam TTS speaker voices per language
TTS_SPEAKERS = {
    "en-IN": "anushka",
    "hi-IN": "anushka",
    "mr-IN": "anushka",
    "kn-IN": "anushka",
    "ta-IN": "anushka",
    "te-IN": "anushka",
    "bn-IN": "anushka",
    "gu-IN": "anushka",
    "pa-IN": "anushka",
    "ml-IN": "anushka",
    "od-IN": "anushka",
}


def _get_api_key():
    """Get Sarvam API key from env or Flask config."""
    key = os.environ.get("SARVAM_API_KEY", "")
    if not key:
        try:
            from flask import current_app
            key = current_app.config.get("SARVAM_API_KEY", "")
        except RuntimeError:
            pass
    return key


def _headers():
    return {
        "api-subscription-key": _get_api_key(),
        "Content-Type": "application/json",
    }


def _to_sarvam_code(lang_code: str) -> str:
    """Convert 2-letter code like 'hi' to Sarvam BCP-47 'hi-IN'."""
    if "-" in lang_code:
        return lang_code  # already in correct format
    return LANG_MAP.get(lang_code, "en-IN")


# ─────────────────────────────────────────────
#  1. TRANSLATION
# ─────────────────────────────────────────────

def translate_text(text: str, target_lang: str, source_lang: str = "en") -> dict:
    """
    Translate text from source_lang to target_lang using Sarvam AI.
    Returns: { success: bool, translated_text: str, error: str }
    """
    if not text or not text.strip():
        return {"success": False, "error": "Empty input text", "translated_text": text}

    target = _to_sarvam_code(target_lang)
    source = _to_sarvam_code(source_lang)

    # No point translating English → English
    if target == source or target == "en-IN":
        return {"success": True, "translated_text": text, "cached": True}

    api_key = _get_api_key()
    if not api_key:
        app_logger.warning("SARVAM_API_KEY not set — falling back to static template")
        return {"success": False, "error": "API key not configured", "translated_text": text}

    try:
        payload = {
            "input": text[:1999],  # API max 2000 chars
            "source_language_code": source,
            "target_language_code": target,
            "model": "mayura:v1",
            "enable_preprocessing": True,
        }
        resp = requests.post(
            f"{SARVAM_BASE_URL}/translate",
            json=payload,
            headers=_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        result = resp.json()
        translated = result.get("translated_text", text)
        app_logger.info(f"Sarvam translate: {source}→{target} OK ({len(text)} chars)")
        return {"success": True, "translated_text": translated}

    except requests.exceptions.RequestException as e:
        app_logger.error(f"Sarvam translate error: {e}")
        return {"success": False, "error": str(e), "translated_text": text}


# ─────────────────────────────────────────────
#  2. TEXT-TO-SPEECH
# ─────────────────────────────────────────────

def text_to_speech(text: str, lang: str = "en") -> dict:
    """
    Convert text to audio using Sarvam AI Bulbul TTS.
    Returns: { success: bool, audio_base64: str, error: str }
    """
    if not text or not text.strip():
        return {"success": False, "error": "Empty text", "audio_base64": None}

    target = _to_sarvam_code(lang)
    speaker = TTS_SPEAKERS.get(target, "meera")

    api_key = _get_api_key()
    if not api_key:
        return {"success": False, "error": "API key not configured", "audio_base64": None}

    try:
        payload = {
            "inputs": [text[:499]],   # Bulbul v2 max ~500 chars per chunk
            "target_language_code": target,
            "speaker": speaker,
            "model": "bulbul:v2",
            "enable_preprocessing": True,
        }
        resp = requests.post(
            f"{SARVAM_BASE_URL}/text-to-speech",
            json=payload,
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        result = resp.json()
        audios = result.get("audios", [])
        if not audios:
            return {"success": False, "error": "No audio returned", "audio_base64": None}

        app_logger.info(f"Sarvam TTS: lang={target} OK")
        return {"success": True, "audio_base64": audios[0], "format": "wav"}

    except requests.exceptions.RequestException as e:
        app_logger.error(f"Sarvam TTS error: {e}")
        return {"success": False, "error": str(e), "audio_base64": None}


# ─────────────────────────────────────────────
#  3. SPEECH-TO-TEXT (for voice assistant)
# ─────────────────────────────────────────────

def speech_to_text(audio_bytes: bytes, lang: str = "hi", content_type: str = "audio/webm") -> dict:
    """
    Transcribe audio bytes using Sarvam Saarika STT.
    Returns: { success: bool, transcript: str, error: str }
    """
    target = _to_sarvam_code(lang)
    api_key = _get_api_key()
    if not api_key:
        return {"success": False, "error": "API key not configured", "transcript": ""}

    # Map content type to file extension
    ext_map = {
        "audio/webm": "webm",
        "audio/wav": "wav",
        "audio/wave": "wav",
        "audio/mp3": "mp3",
        "audio/mpeg": "mp3",
        "audio/ogg": "ogg",
        "audio/flac": "flac",
    }
    ext = ext_map.get(content_type, "webm")
    fname = f"audio.{ext}"

    try:
        files = {"file": (fname, audio_bytes, content_type)}
        data  = {"language_code": target, "model": "saarika:v2"}
        headers = {"api-subscription-key": api_key}

        resp = requests.post(
            f"{SARVAM_BASE_URL}/speech-to-text",
            files=files,
            data=data,
            headers=headers,
            timeout=20,
        )
        resp.raise_for_status()
        transcript = resp.json().get("transcript", "")
        app_logger.info(f"Sarvam STT: lang={target} fmt={ext} → '{transcript[:60]}'")
        return {"success": True, "transcript": transcript}

    except requests.exceptions.RequestException as e:
        err_body = resp.text if 'resp' in locals() else ""
        app_logger.error(f"Sarvam STT error: {e} - Body: {err_body}")
        return {"success": False, "error": str(e), "transcript": ""}


# ─────────────────────────────────────────────
#  4. VOICE ASSISTANT — AQI Q&A helper
# ─────────────────────────────────────────────

def answer_aqi_question(transcript: str, lang: str, context: dict) -> str:
    """
    Rule-based AQI answerer. Forms a reply in English,
    then translates to user's language.
    context = { current_aqi, village, status }
    """
    t = transcript.lower()
    aqi_raw  = context.get("current_aqi", "unknown")
    village  = context.get("village", "your area")
    status   = context.get("status", "unknown")

    # Convert AQI to number if possible
    aqi = None
    try:
        aqi = int(aqi_raw) if aqi_raw not in ("unknown", None, "", "None") else None
    except (ValueError, TypeError):
        aqi = None

    # No data available
    if aqi is None:
        reply_en = (
            f"I currently don't have any AQI sensor data available for {village}. "
            f"No sensor readings have been received yet. "
            f"Please check back later or contact your local administrator to ensure sensor nodes are active."
        )
    elif any(w in t for w in ["aqi", "air", "pollution", "quality", "index",
                               "हवा", "वायु", "गुणवत्ता", "प्रदूषण",
                               "हवेची", "निर्देशांक", "মানের"]):
        reply_en = f"The current Air Quality Index in {village} is {aqi}. "
        if aqi <= 50:
            reply_en += f"The status is Good. The air is clean and safe. You can go outside freely."
        elif aqi <= 100:
            reply_en += f"The status is Satisfactory. Air quality is acceptable. Sensitive individuals should take mild precaution."
        elif aqi <= 200:
            reply_en += f"The status is Moderate. Prolonged outdoor activity should be limited, especially for children and elderly."
        elif aqi <= 300:
            reply_en += f"The status is Poor. Avoid outdoor activities. Wear a mask if you must go outside."
        else:
            reply_en += f"The status is Hazardous! This is an emergency. Stay indoors, close all windows, and avoid all outdoor exposure."
    elif any(w in t for w in ["safe", "go out", "outside", "mask",
                               "बाहर", "सुरक्षित", "मास्क"]):
        if aqi <= 100:
            reply_en = f"Yes, it is safe to go outside. The AQI in {village} is {aqi}, which is within safe limits."
        elif aqi <= 200:
            reply_en = f"It is somewhat safe but be cautious. The AQI in {village} is {aqi}. Wearing a mask is recommended."
        else:
            reply_en = f"No, it is NOT safe to go outside. The AQI in {village} is {aqi}, which is {status}. Stay indoors."
    elif any(w in t for w in ["hello", "hi", "help", "नमस्ते", "मदद"]):
        reply_en = (
            f"Hello! I am the Vayu Assistant. I can tell you about air quality in your area. "
            f"The current AQI in {village} is {aqi} ({status}). "
            f"You can ask me: Is it safe to go outside? What is the pollution level? Should I wear a mask?"
        )
    else:
        reply_en = (
            f"The current AQI in {village} is {aqi}, which means the air quality is {status}. "
            f"You can ask me about safety, pollution levels, or health precautions."
        )

    # Translate reply to user's preferred language
    if lang and lang != "en":
        result = translate_text(reply_en, target_lang=lang, source_lang="en")
        return result.get("translated_text", reply_en)

    return reply_en
