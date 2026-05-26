from flask import Blueprint, request
from services.auth_service import register_user, login_user
from utils.responses import success_response, error_response
from utils.security import token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user or admin."""
    data = request.get_json()
    if not data:
        return error_response("Invalid JSON data provided.", status_code=400)
    
    success, result = register_user(data)
    
    if success:
        return success_response(result['message'], data={"user_id": result['user_id']})
    else:
        return error_response(result, status_code=400)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate and return JWT token."""
    data = request.get_json()
    if not data:
        return error_response("Invalid JSON data provided.", status_code=400)
    
    mobile_number = data.get('mobile_number')
    password = data.get('password')
    
    success, result = login_user(mobile_number, password)
    
    if success:
        return success_response("Login successful", data=result)
    else:
        return error_response(result, status_code=401)


@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Protected route to get user profile basic info."""
    return success_response("Profile retrieved successfully", data={"user": current_user})
