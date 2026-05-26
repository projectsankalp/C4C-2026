"""General helper utilities."""
import hashlib
import json
import time
import uuid

def generate_patient_id() -> str:
    """Generate a unique patient ID like AN-2024-XXXX."""
    year = time.strftime('%Y')
    uid = uuid.uuid4().hex[:6].upper()
    return f"AN-{year}-{uid}"

def generate_visit_hash(visit_data: dict) -> str:
    """SHA-256 hash of visit data for blockchain integrity."""
    payload = json.dumps(visit_data, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()

def serialize_row(row) -> dict:
    """Convert a psycopg2 RealDictRow to a plain dict with JSON-safe values."""
    if row is None:
        return {}
    result = {}
    for k, v in dict(row).items():
        if hasattr(v, 'isoformat'):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result

def rows_to_list(rows) -> list:
    """Convert a list of psycopg2 rows to JSON-safe list of dicts."""
    return [serialize_row(r) for r in rows]

def paginate(query_result: list, page: int = 1, per_page: int = 20) -> dict:
    """Simple in-memory pagination helper."""
    page = max(1, page)
    total = len(query_result)
    start = (page - 1) * per_page
    end = start + per_page
    return {
        'items': query_result[start:end],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page,
    }
