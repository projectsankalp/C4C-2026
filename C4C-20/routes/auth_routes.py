"""
Authentication routes — login, register, logout, profile.
Uses JWT (flask-jwt-extended) for stateless auth.
Roles: asha | doctor | patient | admin
"""
from flask import Blueprint, request, jsonify, make_response, session as flask_session
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, set_access_cookies
import psycopg2.extras
from database.postgres import get_db_connection
from utils.auth import hash_password, check_password
from utils.validators import validate_email, validate_role, sanitize_text
from utils.helpers import serialize_row

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT access token."""
    data = request.get_json(force=True)
    username = sanitize_text(data.get('username', ''))
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "SELECT id, username, email, role, full_name, password_hash, is_active "
        "FROM users WHERE username = %s", (username,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not check_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user['is_active']:
        return jsonify({'error': 'Account is deactivated'}), 403

    # Store role in JWT additional_claims so we can check it in role_required
    additional_claims = {'role': user['role'], 'full_name': user['full_name']}
    access_token = create_access_token(
        identity=str(user['id']),
        additional_claims=additional_claims
    )

    flask_session['user_id'] = user['id']
    flask_session['user_role'] = user['role']
    flask_session['user_full_name'] = user['full_name']
    flask_session.permanent = True

    response = make_response(jsonify({
        'access_token': access_token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role'],
            'full_name': user['full_name'],
        }
    }))
    set_access_cookies(response, access_token)
    return response


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (admin only in production; open for demo)."""
    data = request.get_json(force=True)
    username = sanitize_text(data.get('username', ''))
    email = sanitize_text(data.get('email', ''))
    password = data.get('password', '')
    role = sanitize_text(data.get('role', 'patient'))
    full_name = sanitize_text(data.get('full_name', ''))
    phone = sanitize_text(data.get('phone', ''))
    village = sanitize_text(data.get('village', ''))

    # Validation
    if not username or len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if not validate_role(role):
        return jsonify({'error': f'Invalid role. Must be one of: asha, doctor, patient, admin'}), 400

    pw_hash = hash_password(password)

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users (username, email, password_hash, role, full_name, phone, village)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (username, email, pw_hash, role, full_name, phone, village))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 409

    return jsonify({'message': 'User registered successfully', 'id': new_id}), 201


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """Return the current user's profile."""
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "SELECT id, username, email, role, full_name, phone, village, created_at "
        "FROM users WHERE id = %s", (int(user_id),)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(serialize_row(user))


@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    """List all users — admin only."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, username, email, role, full_name, is_active, created_at FROM users ORDER BY id")
    rows = [serialize_row(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(rows)
