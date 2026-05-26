"""Input validation helpers for AarogyaNet API routes."""
import re

def validate_bp(systolic, diastolic) -> tuple[bool, str]:
    """Validate blood pressure readings."""
    try:
        s, d = int(systolic), int(diastolic)
    except (TypeError, ValueError):
        return False, "BP values must be integers"
    if not (60 <= s <= 300):
        return False, f"Systolic BP {s} out of range (60-300)"
    if not (40 <= d <= 200):
        return False, f"Diastolic BP {d} out of range (40-200)"
    return True, "ok"

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email or ''))

def validate_phone(phone: str) -> bool:
    return bool(re.match(r'^\+?[0-9]{10,15}$', phone or ''))

def validate_role(role: str) -> bool:
    return role in ('asha', 'doctor', 'patient', 'admin')

def sanitize_text(text) -> str:
    if text is None:
        return ''
    return str(text).strip()[:2000]


def validate_coordinates(lat, lon) -> tuple[bool, str]:
    """
    Validate GPS coordinates for visit integrity.
    Returns (True, 'ok') or (False, reason).
    Null/None coordinates are accepted (device may lack GPS).
    """
    if lat is None and lon is None:
        return True, 'ok'               # GPS absent — graceful fallback

    if lat is None or lon is None:
        return False, "Both latitude and longitude must be provided together"

    try:
        lat, lon = float(lat), float(lon)
    except (TypeError, ValueError):
        return False, "GPS coordinates must be numeric"

    if not (-90.0 <= lat <= 90.0):
        return False, f"Latitude {lat} out of valid range (-90 to 90)"
    if not (-180.0 <= lon <= 180.0):
        return False, f"Longitude {lon} out of valid range (-180 to 180)"

    # (0.0, 0.0) is the GPS failure sentinel (Gulf of Guinea) — reject for India
    if lat == 0.0 and lon == 0.0:
        return False, "GPS coordinates (0,0) rejected — likely a device error"

    return True, 'ok'
