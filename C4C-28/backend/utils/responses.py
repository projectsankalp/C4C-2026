from flask import jsonify
from datetime import datetime, timezone

def success_response(message, data=None):
    """
    Standard format for successful API responses.
    """
    response = {
        "success": True,
        "message": message,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "data": data if data is not None else {}
    }
    return jsonify(response), 200

def error_response(message, error=None, status_code=400):
    """
    Standard format for error API responses.
    """
    response = {
        "success": False,
        "message": message,
        "error": error if error is not None else str(message)
    }
    return jsonify(response), status_code
