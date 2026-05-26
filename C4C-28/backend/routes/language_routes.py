from flask import Blueprint, request
from services.language_service import (
    get_languages, get_active_languages, update_user_language,
    get_user_language, get_ui_translations, update_language_status,
    translate_message
)
from utils.responses import success_response, error_response
from utils.security import token_required, admin_required

language_bp = Blueprint('languages', __name__, url_prefix='/api/languages')

@language_bp.route('', methods=['GET'])
def list_languages():
    """Public: Get all languages."""
    success, result = get_languages()
    if success:
        return success_response("Languages retrieved", data={"languages": result})
    else:
        return error_response(result, status_code=500)

@language_bp.route('/active', methods=['GET'])
def list_active_languages():
    """Public: Get active languages."""
    success, result = get_active_languages()
    if success:
        return success_response("Active languages retrieved", data={"languages": result})
    else:
        return error_response(result, status_code=500)

@language_bp.route('/ui/<string:lang_code>', methods=['GET'])
def ui_translations(lang_code):
    """Public: Get website text labels."""
    success, result = get_ui_translations(lang_code)
    if success:
        return success_response("Translations retrieved", data=result)
    else:
        return error_response(result, status_code=500)

@language_bp.route('/user/<int:user_id>', methods=['GET'])
@token_required
def fetch_user_language(current_user, user_id):
    """Token required: Fetch preferred language."""
    if current_user['role'] != 'admin' and current_user['id'] != user_id:
        return error_response("Unauthorized", status_code=403)
        
    success, result = get_user_language(user_id)
    if success:
        return success_response("User language retrieved", data=result)
    else:
        return error_response(result, status_code=404)

@language_bp.route('/user/<int:user_id>', methods=['PUT'])
@token_required
def change_user_language(current_user, user_id):
    """Token required: Change preferred language."""
    if current_user['role'] != 'admin' and current_user['id'] != user_id:
        return error_response("Unauthorized", status_code=403)
        
    data = request.get_json()
    if not data or 'language_code' not in data:
        return error_response("language_code required", status_code=400)
        
    success, msg = update_user_language(user_id, data['language_code'])
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)

@language_bp.route('/<string:lang_code>/status', methods=['PUT'])
@token_required
@admin_required
def toggle_language_status(current_user, lang_code):
    """Admin only: Enable/Disable language."""
    data = request.get_json()
    if not data or 'is_active' not in data:
        return error_response("is_active required (bool)", status_code=400)
        
    success, msg = update_language_status(lang_code, data['is_active'])
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)
