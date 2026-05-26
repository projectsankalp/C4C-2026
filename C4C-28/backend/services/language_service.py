"""
Upgraded language_service.py — uses Sarvam AI for translation.
Falls back to static ALERT_TEMPLATES if Sarvam is unavailable.
"""

import sqlite3
from database import get_db
from utils.translations import UI_TRANSLATIONS, ALERT_TEMPLATES
from utils.logger import app_logger


def get_languages(active_only=False):
    db = get_db()
    cursor = db.cursor()
    query = "SELECT id as language_id, code as language_code, name as language_name, native_name, is_active FROM languages"
    if active_only:
        query += " WHERE is_active = 1"
    cursor.execute(query)
    rows = cursor.fetchall()
    return True, [dict(row) for row in rows]


def get_active_languages():
    return get_languages(active_only=True)


def update_user_language(user_id, language_code):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM languages WHERE code = ? AND is_active = 1", (language_code,))
    lang = cursor.fetchone()
    if not lang:
        return False, "Language code is invalid or currently inactive."
    try:
        cursor.execute("UPDATE users SET language_id = ? WHERE id = ?", (lang['id'], user_id))
        db.commit()
        return True, "User preferred language updated successfully."
    except Exception as e:
        return False, str(e)


def get_user_language(user_id):
    db = get_db()
    cursor = db.cursor()
    query = '''
        SELECT u.id as user_id, u.full_name, u.language_id,
               l.code as preferred_language, l.name as language_name, l.native_name
        FROM users u
        JOIN languages l ON u.language_id = l.id
        WHERE u.id = ?
    '''
    cursor.execute(query, (user_id,))
    row = cursor.fetchone()
    if not row:
        return False, "User not found."
    return True, dict(row)


def get_ui_translations(language_code):
    translations = UI_TRANSLATIONS.get(language_code, UI_TRANSLATIONS['en'])
    return True, {
        "language_code": language_code if language_code in UI_TRANSLATIONS else 'en',
        "translations": translations
    }


def translate_message(alert_type: str, language_code: str, **kwargs) -> str:
    """
    Translate an alert message using Sarvam AI.
    Falls back to static ALERT_TEMPLATES if API is unavailable or language is English.
    """
    # Get the English template first
    en_templates = ALERT_TEMPLATES.get('en', {})
    en_template  = en_templates.get(alert_type)

    if not en_template:
        return f"Swachh Vayu Alert: {alert_type}"

    # Format the English base message
    try:
        en_message = en_template.format(**kwargs)
    except KeyError:
        en_message = en_template

    # If target is English, return as-is
    if language_code == 'en':
        return en_message

    # Try Sarvam AI translation
    try:
        from services.sarvam_service import translate_text
        result = translate_text(en_message, target_lang=language_code, source_lang='en')
        if result.get("success") and result.get("translated_text"):
            app_logger.info(f"Sarvam translated alert '{alert_type}' to '{language_code}'")
            return result["translated_text"]
    except Exception as e:
        app_logger.warning(f"Sarvam translation failed for alert '{alert_type}': {e}")

    # Fallback to static template
    static_templates = ALERT_TEMPLATES.get(language_code, ALERT_TEMPLATES['en'])
    static_template  = static_templates.get(alert_type, en_template)
    try:
        return static_template.format(**kwargs)
    except KeyError:
        return static_template


def generate_tts_for_alert(message: str, language_code: str) -> str | None:
    """
    Generate TTS audio (base64) for an alert message.
    Returns base64 audio string or None on failure.
    """
    try:
        from services.sarvam_service import text_to_speech
        result = text_to_speech(message, lang=language_code)
        if result.get("success"):
            return result.get("audio_base64")
    except Exception as e:
        app_logger.warning(f"TTS generation failed for lang '{language_code}': {e}")
    return None


def update_language_status(language_code, is_active):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM languages WHERE code = ?", (language_code,))
    if not cursor.fetchone():
        return False, "Language code not found."
    try:
        cursor.execute("UPDATE languages SET is_active = ? WHERE code = ?",
                       (1 if is_active else 0, language_code))
        db.commit()
        return True, f"Language {language_code} status updated."
    except Exception as e:
        return False, str(e)
