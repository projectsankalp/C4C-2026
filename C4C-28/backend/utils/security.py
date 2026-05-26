import jwt
from functools import wraps
from flask import request, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
from utils.responses import error_response

def hash_password(password):
    """Generates a secure hash for the given password."""
    return generate_password_hash(password)

def verify_password(password, hashed):
    """Verifies a password against a hash."""
    return check_password_hash(hashed, password)

def generate_token(user_id, role, village):
    """Generates a JWT token for a user valid for 24 hours."""
    payload = {
        'user_id': user_id,
        'role': role,
        'village': village,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def token_required(f):
    """Decorator to protect routes requiring authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header (Bearer token)
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return error_response('Token is missing!', status_code=401)

        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = {
                'id': data['user_id'],
                'role': data['role'],
                'village': data['village']
            }
        except jwt.ExpiredSignatureError:
            return error_response('Token has expired!', status_code=401)
        except jwt.InvalidTokenError:
            return error_response('Token is invalid!', status_code=401)
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to protect routes requiring admin privileges."""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return error_response('Admin privileges required!', status_code=403)
        return f(current_user, *args, **kwargs)
    
    return decorated
