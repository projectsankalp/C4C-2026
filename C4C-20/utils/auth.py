"""JWT auth helpers and password hashing utilities."""
import hashlib
import functools
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt

def hash_password(password: str) -> str:
    """SHA-256 hash a plain-text password."""
    return hashlib.sha256(password.encode()).hexdigest()

def check_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against its hash."""
    return hash_password(plain) == hashed

def role_required(*roles):
    """Decorator: ensures the JWT bearer has one of the allowed roles."""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get('role', '')
                if user_role not in roles:
                    return jsonify({'error': f'Role "{user_role}" is not permitted. Required: {list(roles)}'}), 403
            except Exception as e:
                return jsonify({'error': str(e)}), 401
            return fn(*args, **kwargs)
        return wrapper
    return decorator
