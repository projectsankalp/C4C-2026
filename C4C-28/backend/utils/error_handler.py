from flask import jsonify
import traceback
from utils.responses import error_response
from utils.logger import error_logger, app_logger

def register_error_handlers(app):
    
    @app.errorhandler(400)
    def bad_request(e):
        app_logger.warning(f"400 Bad Request: {e.description}")
        return error_response("Bad Request", error=e.description, status_code=400)

    @app.errorhandler(401)
    def unauthorized(e):
        app_logger.warning(f"401 Unauthorized: {e.description}")
        return error_response("Unauthorized", error=e.description, status_code=401)

    @app.errorhandler(403)
    def forbidden(e):
        app_logger.warning(f"403 Forbidden: {e.description}")
        return error_response("Forbidden", error=e.description, status_code=403)

    @app.errorhandler(404)
    def not_found(e):
        app_logger.warning(f"404 Not Found: {e.description}")
        return error_response("Resource not found", error=e.description, status_code=404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        app_logger.warning(f"405 Method Not Allowed: {e.description}")
        return error_response("Method Not Allowed", error=e.description, status_code=405)

    @app.errorhandler(409)
    def conflict(e):
        app_logger.warning(f"409 Conflict: {e.description}")
        return error_response("Conflict", error=e.description, status_code=409)

    @app.errorhandler(500)
    def internal_error(e):
        # We don't want to expose raw stack trace to frontend
        return error_response("Internal Server Error", error="Something went wrong. Please try again.", status_code=500)

    @app.errorhandler(Exception)
    def handle_exception(e):
        # Log the full stack trace for debugging
        error_logger.critical(f"Unhandled Exception: {str(e)}\n{traceback.format_exc()}")
        return error_response("An unexpected error occurred.", error="Technical reason logged.", status_code=500)
