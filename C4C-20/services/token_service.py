"""
Prescription Tokenization Service — AarogyaNet.

Generates cryptographically signed, single-use prescription redemption tokens
and drives the JanAushadi fulfillment workflow.
"""
import hashlib
import json
import logging
import time
import uuid
from datetime import datetime, timedelta

import psycopg2.extras

from blockchain.block import load_or_create_keypair, sign_hash, verify_signature
from database.postgres import get_db_connection
from utils.helpers import serialize_row

log = logging.getLogger(__name__)

_PRIVATE_KEY, _PUBLIC_KEY = load_or_create_keypair()

# ---------------------------------------------------------------------------
# Mock JanAushadi outlets per village
# ---------------------------------------------------------------------------
_JAN_OUTLETS = {
    "rampur":    "Jan Aushadi Kendra — Rampur PHC",
    "sundarpur": "Jan Aushadi Kendra — Sundarpur UPHC",
    "bhatpur":   "Jan Aushadi Kendra — Bhatpur CHC",
    "mandawar":  "Jan Aushadi Kendra — Mandawar Block",
    "phc block": "Jan Aushadi Kendra — PHC Block Central",
}
_DEFAULT_OUTLET = "Jan Aushadi Kendra — District Hospital"

VALID_METHODS   = {"patient_pickup", "asha_pickup", "home_delivery"}
VALID_STATUSES  = {"pending", "redeemed", "expired", "cancelled"}
TOKEN_EXPIRY_DAYS = 30


def _nearest_outlet(village: str) -> str:
    return _JAN_OUTLETS.get((village or "").lower().strip(), _DEFAULT_OUTLET)


def _make_token_id() -> str:
    return uuid.uuid4().hex


def _make_token_hash(token_id: str, prescription_id: int,
                     patient_id: int, issued_ts: float) -> str:
    payload = json.dumps({
        "token_id":        token_id,
        "prescription_id": prescription_id,
        "patient_id":      patient_id,
        "issued_ts":       issued_ts,
    }, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def _safe_serialize(row) -> dict:
    """
    Serialize a psycopg2 RealDictRow to a plain dict.
    Normalizes datetime → ISO string, None → None, and
    ensures redemption_status is always a known value.
    """
    if row is None:
        return {}
    result = serialize_row(row)
    # Normalise status so frontend never sees an unexpected value
    status = result.get("redemption_status") or "pending"
    if status not in VALID_STATUSES:
        result["redemption_status"] = "pending"
    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_prescription_token(prescription_id: int, patient_id: int,
                                 village: str = "") -> dict:
    """
    Create a signed prescription token for a given prescription.
    Called automatically when a doctor issues a prescription.
    Returns the token record as a dict, or raises on failure.
    """
    token_id  = _make_token_id()
    issued_ts = time.time()
    expires_at = datetime.utcnow() + timedelta(days=TOKEN_EXPIRY_DAYS)
    token_hash = _make_token_hash(token_id, prescription_id, patient_id, issued_ts)
    signature  = sign_hash(_PRIVATE_KEY, token_hash)
    outlet     = _nearest_outlet(village)

    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO prescription_tokens
                (token_id, prescription_id, patient_id, token_hash, signature,
                 issued_at, expires_at, redemption_status, outlet_name)
            VALUES (%s, %s, %s, %s, %s, NOW(), %s, 'pending', %s)
            RETURNING *
        """, (token_id, prescription_id, patient_id,
              token_hash, signature, expires_at, outlet))
        row = dict(cur.fetchone())
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

    return row


def redeem_token(token_id: str, redemption_method: str,
                 redeemed_by_user_id: int) -> dict:
    """
    Attempt single-use redemption of a token.
    Returns {'success': True/False, 'message': str, 'token': dict|None}.
    Never raises — all errors are returned as {'success': False, 'message': …}.
    """
    if not token_id or not token_id.strip():
        return {"success": False, "message": "token_id is required"}

    method = (redemption_method or "").strip().lower()
    if method not in VALID_METHODS:
        return {"success": False,
                "message": f"Invalid method. Valid options: {', '.join(sorted(VALID_METHODS))}"}

    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Lock the row so concurrent requests cannot double-redeem
        cur.execute("""
            SELECT * FROM prescription_tokens
            WHERE token_id = %s
            FOR UPDATE
        """, (token_id,))
        row = cur.fetchone()

        if not row:
            return {"success": False, "message": "Token not found — possible forged identifier"}

        token = dict(row)
        status = (token.get("redemption_status") or "pending").strip().lower()

        # Integrity check
        try:
            if not verify_signature(_PUBLIC_KEY, token["token_hash"], token.get("signature") or ""):
                return {"success": False,
                        "message": "Token signature verification failed — tampered token"}
        except Exception as exc:
            log.warning('[token_service] signature verify error for %s: %s', token_id, exc)

        # Status guards
        if status == "redeemed":
            return {"success": False, "message": "Token already redeemed — duplicate redemption rejected"}
        if status == "cancelled":
            return {"success": False, "message": "Token has been cancelled"}
        if status == "expired":
            return {"success": False, "message": "Token has expired"}

        # Wall-clock expiry check
        expires_at = token.get("expires_at")
        if expires_at and datetime.utcnow() > expires_at:
            cur.execute(
                "UPDATE prescription_tokens SET redemption_status='expired' WHERE token_id=%s",
                (token_id,))
            conn.commit()
            return {"success": False, "message": "Token has expired"}

        # Single-use burn
        cur.execute("""
            UPDATE prescription_tokens
            SET redemption_status = 'redeemed',
                redeemed_at       = NOW(),
                redemption_method = %s,
                redeemed_by       = %s
            WHERE token_id = %s
            RETURNING *
        """, (method, redeemed_by_user_id, token_id))
        updated = cur.fetchone()
        conn.commit()

        return {
            "success": True,
            "message": "Token redeemed successfully",
            "token":   _safe_serialize(updated),
        }

    except Exception as exc:
        log.error('[token_service] redeem_token error for %s: %s', token_id, exc, exc_info=True)
        try:
            conn.rollback()
        except Exception:
            pass
        return {"success": False, "message": "Redemption service error — please retry"}
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def record_adherence_block(token_id: str, redemption_method: str,
                            block_index: int, adherence_hash: str) -> None:
    """Persist the adherence blockchain reference against the token. Never raises."""
    conn = get_db_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO adherence_events
                (token_id, adherence_hash, block_index, redemption_type)
            VALUES (%s, %s, %s, %s)
        """, (token_id, adherence_hash, block_index, redemption_method))
        cur.execute("""
            UPDATE prescription_tokens SET block_index = %s WHERE token_id = %s
        """, (block_index, token_id))
        conn.commit()
    except Exception as exc:
        log.error('[token_service] record_adherence_block error for %s: %s', token_id, exc)
        try:
            conn.rollback()
        except Exception:
            pass
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def get_token_by_id(token_id: str) -> dict | None:
    """Return full token detail or None. Never raises."""
    if not token_id:
        return None
    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT pt.*,
                   u.full_name  AS redeemed_by_name,
                   p.full_name  AS patient_name,
                   p.village    AS patient_village,
                   ae.adherence_hash,
                   ae.block_index AS adherence_block_index
            FROM prescription_tokens pt
            LEFT JOIN users    u  ON u.id  = pt.redeemed_by
            LEFT JOIN patients p  ON p.id  = pt.patient_id
            LEFT JOIN adherence_events ae ON ae.token_id = pt.token_id
            WHERE pt.token_id = %s
        """, (token_id,))
        row = cur.fetchone()
        return _safe_serialize(row) if row else None
    except Exception as exc:
        log.error('[token_service] get_token_by_id error for %s: %s', token_id, exc)
        return None
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def get_tokens_for_prescription(prescription_id: int) -> list:
    """Return all tokens for a prescription. Never raises — returns [] on error."""
    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT pt.*,
                   p.full_name  AS patient_name,
                   u.full_name  AS redeemed_by_name,
                   ae.adherence_hash,
                   ae.block_index AS adherence_block_index
            FROM prescription_tokens pt
            LEFT JOIN patients p ON p.id  = pt.patient_id
            LEFT JOIN users u    ON u.id  = pt.redeemed_by
            LEFT JOIN adherence_events ae ON ae.token_id = pt.token_id
            WHERE pt.prescription_id = %s
            ORDER BY pt.issued_at DESC
        """, (prescription_id,))
        return [_safe_serialize(r) for r in cur.fetchall()]
    except Exception as exc:
        log.error('[token_service] get_tokens_for_prescription error for rx %s: %s',
                  prescription_id, exc)
        return []
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def get_tokens_for_patient(patient_id: int) -> list:
    """Return all tokens for a patient. Never raises — returns [] on error."""
    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT pt.*,
                   p.full_name   AS patient_name,
                   u.full_name   AS redeemed_by_name,
                   pr.prescribed_at,
                   ae.adherence_hash,
                   ae.block_index AS adherence_block_index
            FROM prescription_tokens pt
            LEFT JOIN prescriptions pr ON pr.id  = pt.prescription_id
            LEFT JOIN patients p       ON p.id   = pt.patient_id
            LEFT JOIN users u          ON u.id   = pt.redeemed_by
            LEFT JOIN adherence_events ae ON ae.token_id = pt.token_id
            WHERE pt.patient_id = %s
            ORDER BY pt.issued_at DESC
        """, (patient_id,))
        return [_safe_serialize(r) for r in cur.fetchall()]
    except Exception as exc:
        log.error('[token_service] get_tokens_for_patient error for patient %s: %s',
                  patient_id, exc)
        return []
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


def get_all_tokens_for_doctor(doctor_id: int) -> list:
    """
    All tokens linked to prescriptions issued by this doctor.
    Derived via prescriptions.doctor_id — no doctor_id column needed on patients.
    Never raises — returns [] on error.
    """
    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT pt.*,
                   p.full_name   AS patient_name,
                   u.full_name   AS redeemed_by_name,
                   pr.prescribed_at,
                   ae.adherence_hash,
                   ae.block_index AS adherence_block_index
            FROM prescription_tokens pt
            JOIN  prescriptions pr    ON pr.id  = pt.prescription_id
            LEFT JOIN patients p      ON p.id   = pt.patient_id
            LEFT JOIN users u         ON u.id   = pt.redeemed_by
            LEFT JOIN adherence_events ae ON ae.token_id = pt.token_id
            WHERE pr.doctor_id = %s
            ORDER BY pt.issued_at DESC
        """, (doctor_id,))
        return [_safe_serialize(r) for r in cur.fetchall()]
    except Exception as exc:
        log.error('[token_service] get_all_tokens_for_doctor error for doctor %s: %s',
                  doctor_id, exc)
        return []
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass
