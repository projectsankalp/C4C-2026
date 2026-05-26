import sqlite3
from database import get_db
from utils.security import hash_password, verify_password, generate_token

def register_user(data):
    """
    Registers a new user in the database.
    Expected data: full_name, email, password, mobile_number, village_name, area_name, language_id, role, latitude, longitude
    """
    db = get_db()
    
    # Extract fields with safe defaults
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    mobile_number = data.get('mobile_number')
    village_name = data.get('village_name')
    area_name = data.get('area_name')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    language_id = data.get('language_id', 1) # Default to 1 (e.g. English)
    role = data.get('role', 'user') # Default to user
    alert_mode = data.get('alert_mode', 'SMS')

    if not all([full_name, password, mobile_number, village_name]):
        return False, "Missing required fields (full_name, password, mobile_number, village_name)."

    hashed_pw = hash_password(password)

    try:
        cursor = db.cursor()
        cursor.execute(
            '''
            INSERT INTO users 
            (full_name, email, password_hash, mobile_number, village_name, area_name, latitude, longitude, language_id, alert_mode, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (full_name, email, hashed_pw, mobile_number, village_name, area_name, latitude, longitude, language_id, alert_mode, role)
        )
        db.commit()
        
        # Return the new user ID
        return True, {"user_id": cursor.lastrowid, "message": "User registered successfully"}
        
    except sqlite3.IntegrityError as e:
        if 'email' in str(e).lower():
            return False, "Email already exists."
        elif 'mobile_number' in str(e).lower():
            return False, "Mobile number already exists."
        return False, "A user with these credentials already exists."
    except Exception as e:
        return False, str(e)


def login_user(mobile_number, password):
    """
    Authenticates a user and returns a JWT token.
    """
    if not mobile_number or not password:
        return False, "Mobile number and password are required."

    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT * FROM users WHERE mobile_number = ?', (mobile_number,))
    user = cursor.fetchone()

    if not user:
        return False, "Invalid mobile number or password."

    if not verify_password(password, user['password_hash']):
        return False, "Invalid mobile number or password."

    # Generate token
    token = generate_token(user['id'], user['role'], user['village_name'])
    
    user_data = dict(user)
    # Remove password hash before sending to client
    user_data.pop('password_hash', None)

    return True, {
        "token": token,
        "user": user_data
    }
