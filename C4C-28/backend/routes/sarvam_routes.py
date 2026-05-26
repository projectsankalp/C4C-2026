"""
Sarvam AI Routes — /api/sarvam/*

Endpoints:
  POST /api/sarvam/translate          — Translate text to target language
  POST /api/sarvam/tts                — Text-to-Speech → returns base64 WAV
  POST /api/sarvam/stt                — Speech-to-Text → returns transcript
  POST /api/sarvam/voice-assistant    — Full voice Q&A: STT → answer → TTS
  GET  /api/sarvam/languages          — Supported languages list
"""

from flask import Blueprint, request, jsonify
from services.sarvam_service import (
    translate_text, text_to_speech, speech_to_text, answer_aqi_question
)
from services.aqi_service import get_latest_aqi
from utils.responses import success_response, error_response
from utils.logger import app_logger

sarvam_bp = Blueprint("sarvam", __name__, url_prefix="/api/sarvam")

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English",   "native": "English",    "sarvam": "en-IN"},
    {"code": "hi", "name": "Hindi",     "native": "हिन्दी",     "sarvam": "hi-IN"},
    {"code": "mr", "name": "Marathi",   "native": "मराठी",      "sarvam": "mr-IN"},
    {"code": "kn", "name": "Kannada",   "native": "ಕನ್ನಡ",     "sarvam": "kn-IN"},
    {"code": "ta", "name": "Tamil",     "native": "தமிழ்",      "sarvam": "ta-IN"},
    {"code": "te", "name": "Telugu",    "native": "తెలుగు",     "sarvam": "te-IN"},
    {"code": "bn", "name": "Bengali",   "native": "বাংলা",      "sarvam": "bn-IN"},
    {"code": "gu", "name": "Gujarati",  "native": "ગુજરાતી",   "sarvam": "gu-IN"},
    {"code": "pa", "name": "Punjabi",   "native": "ਪੰਜਾਬੀ",    "sarvam": "pa-IN"},
    {"code": "ml", "name": "Malayalam", "native": "മലയാളം",     "sarvam": "ml-IN"},
    {"code": "or", "name": "Odia",      "native": "ଓଡ଼ିଆ",     "sarvam": "od-IN"},
]


@sarvam_bp.route("/languages", methods=["GET"])
def get_languages():
    """Return all supported Sarvam languages."""
    return success_response("Supported languages", data={"languages": SUPPORTED_LANGUAGES})


@sarvam_bp.route("/translate", methods=["POST"])
def translate():
    """
    Translate text to target language via Sarvam AI.
    Body: { text, target_lang, source_lang? }
    """
    body = request.get_json() or {}
    text        = body.get("text", "").strip()
    target_lang = body.get("target_lang", "en")
    source_lang = body.get("source_lang", "en")

    if not text:
        return error_response("text is required", 400)

    result = translate_text(text, target_lang=target_lang, source_lang=source_lang)

    if result.get("success"):
        return success_response("Translation successful", data={
            "original":    text,
            "translated":  result["translated_text"],
            "target_lang": target_lang,
            "source_lang": source_lang,
        })
    else:
        # Graceful degradation: return original text with a warning
        return success_response("Translation unavailable — returning original", data={
            "original":   text,
            "translated": text,
            "warning":    result.get("error", "API unavailable"),
        })


@sarvam_bp.route("/tts", methods=["POST"])
def tts():
    """
    Convert text to speech.
    Body: { text, lang }
    Returns: { audio_base64, format }
    """
    body = request.get_json() or {}
    text = body.get("text", "").strip()
    lang = body.get("lang", "en")

    if not text:
        return error_response("text is required", 400)
    if len(text) > 500:
        text = text[:497] + "..."

    result = text_to_speech(text, lang=lang)

    if result.get("success"):
        return success_response("TTS successful", data={
            "audio_base64": result["audio_base64"],
            "format":       result.get("format", "wav"),
            "lang":         lang,
        })
    else:
        return error_response(f"TTS failed: {result.get('error', 'Unknown')}", 503)


@sarvam_bp.route("/stt", methods=["POST"])
def stt():
    """
    Speech-to-Text from uploaded audio file.
    Multipart: audio file + lang field
    """
    if "audio" not in request.files:
        return error_response("audio file is required", 400)

    audio_file = request.files["audio"]
    lang = request.form.get("lang", "hi")
    audio_bytes = audio_file.read()
    content_type = audio_file.content_type or "audio/webm"

    result = speech_to_text(audio_bytes, lang=lang, content_type=content_type)

    if result.get("success"):
        return success_response("Transcription successful", data={
            "transcript": result["transcript"],
            "lang":       lang,
        })
    else:
        return error_response(f"STT failed: {result.get('error', 'Unknown')}", 503)


@sarvam_bp.route("/voice-assistant", methods=["POST"])
def voice_assistant():
    """
    Full voice assistant pipeline:
      1. Receive audio bytes (WAV/WebM)
      2. STT → get transcript
      3. Query AQI context
      4. Generate answer
      5. TTS → return audio + text

    Body (multipart): audio file, lang, stt_lang
    Body (json):      text, lang
    """
    lang = request.form.get("lang", "hi")
    # STT language: what the user is SPEAKING (may differ from display lang)
    # Default to 'hi' (Hindi) since most users speak Hindi
    stt_lang = request.form.get("stt_lang", "hi")

    # Step 1: Get transcript
    transcript = ""
    if "audio" in request.files:
        audio_file  = request.files["audio"]
        audio_bytes = audio_file.read()
        content_type = audio_file.content_type or "audio/webm"
        app_logger.info(f"Voice assistant received audio: {len(audio_bytes)} bytes, type={content_type}, stt_lang={stt_lang}")

        if len(audio_bytes) < 1000:
            return error_response("Audio recording too short. Please speak for at least 1 second.", 400)

        stt_result = speech_to_text(audio_bytes, lang=stt_lang, content_type=content_type)
        if stt_result.get("success") and stt_result.get("transcript", "").strip():
            transcript = stt_result["transcript"]
        else:
            app_logger.warning(f"STT failed or empty: {stt_result.get('error', 'empty transcript')}")
            return error_response(
                "Could not understand your speech. Please speak more clearly or use the text input instead.",
                400
            )
    elif request.is_json:
        # Allow text input for testing / fallback
        transcript = request.get_json().get("text", "")
        lang = request.get_json().get("lang", lang)

    if not transcript:
        return error_response("No audio or text provided. Please speak or type your question.", 400)

    # Step 2: Get AQI context
    context = {"current_aqi": "unknown", "village": "your area", "status": "unknown"}
    try:
        ok, readings_data = get_latest_aqi()
        if ok and readings_data:
            top = readings_data[0] if isinstance(readings_data, list) else readings_data.get("readings", [{}])[0]
            context = {
                "current_aqi": top.get("calculated_aqi", "unknown"),
                "village":     top.get("village", "your area"),
                "status":      top.get("aqi_status", "unknown"),
            }
    except Exception as e:
        app_logger.warning(f"Failed to fetch AQI context for voice assistant: {e}")

    # Step 3: Generate answer (translated)
    reply_text = answer_aqi_question(transcript, lang=lang, context=context)

    # Step 4: TTS the reply
    tts_result = text_to_speech(reply_text, lang=lang)

    response_data = {
        "transcript":   transcript,
        "reply_text":   reply_text,
        "audio_base64": tts_result.get("audio_base64"),
        "lang":         lang,
        "context":      context,
    }

    return success_response("Voice assistant response", data=response_data)


@sarvam_bp.route("/translate-alert", methods=["POST"])
def translate_alert():
    """
    Translate an alert message for a specific user language.
    Body: { message, target_lang, alert_type?, aqi_value? }
    Returns translated text + TTS audio.
    """
    body        = request.get_json() or {}
    message     = body.get("message", "").strip()
    target_lang = body.get("target_lang", "en")

    if not message:
        return error_response("message is required", 400)

    # Translate
    trans_result = translate_text(message, target_lang=target_lang)
    translated   = trans_result.get("translated_text", message)

    # Generate TTS
    tts_result   = text_to_speech(translated, lang=target_lang)

    return success_response("Alert translated", data={
        "original":     message,
        "translated":   translated,
        "target_lang":  target_lang,
        "audio_base64": tts_result.get("audio_base64"),
        "tts_success":  tts_result.get("success", False),
    })
