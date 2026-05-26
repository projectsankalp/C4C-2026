"""
Prescription Token & Adherence routes — AarogyaNet.

Endpoints:
  POST /api/tokens/redeem                      — redeem a token (patient / ASHA / delivery)
  GET  /api/tokens/<token_id>                  — get token status (any authenticated user)
  GET  /api/tokens/prescription/<int:rx_id>    — tokens for one prescription (doctor / admin)
  GET  /api/tokens/patient/<int:patient_id>    — tokens for a patient (patient / ASHA / doctor)
  GET  /api/tokens/my                          — role-aware listing for the calling user
"""
import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from services.token_service import (
    redeem_token,
    record_adherence_block,
    get_token_by_id,
    get_tokens_for_prescription,
    get_tokens_for_patient,
    get_all_tokens_for_doctor,
)
from blockchain.blockchain import add_adherence_block

log = logging.getLogger(__name__)

token_bp = Blueprint('tokens', __name__, url_prefix='/api/tokens')


# ---------------------------------------------------------------------------
# POST /api/tokens/redeem
# ---------------------------------------------------------------------------
@token_bp.route('/redeem', methods=['POST'])
@jwt_required()
def redeem():
    """
    Redeem a prescription token.
    Body: { token_id, redemption_method }
      redemption_method: patient_pickup | asha_pickup | home_delivery
    """
    try:
        claims = get_jwt()
        role = claims.get('role', '')
        if role not in ('patient', 'asha', 'admin', 'doctor'):
            return jsonify({'error': 'Unauthorized role'}), 403

        user_id = int(get_jwt_identity())
        data = request.get_json(force=True) or {}
        token_id = (data.get('token_id') or '').strip()
        method = (data.get('redemption_method') or '').strip()

        if not token_id or not method:
            return jsonify({'error': 'token_id and redemption_method are required'}), 400

        result = redeem_token(token_id, method, user_id)
        if not result.get('success'):
            return jsonify({'error': result.get('message', 'Redemption failed')}), 409

        block_index = None
        adherence_hash = None
        try:
            block, adherence_hash = add_adherence_block(token_id, method)
            record_adherence_block(token_id, method, block.index, adherence_hash)
            block_index = block.index
        except Exception as exc:
            log.warning('[tokens] Blockchain write failed for %s: %s', token_id, exc)

        return jsonify({
            'message': result.get('message', 'Redeemed'),
            'token': result.get('token'),
            'block_index': block_index,
            'adherence_hash': adherence_hash,
        }), 200

    except Exception as exc:
        log.error('[tokens] /redeem error: %s', exc, exc_info=True)
        return jsonify({'error': 'Redemption service unavailable. Please try again.'}), 500


# ---------------------------------------------------------------------------
# GET /api/tokens/<token_id>
# ---------------------------------------------------------------------------
@token_bp.route('/<token_id>', methods=['GET'])
@jwt_required()
def token_status(token_id):
    """Return status, pickup method, and redemption timestamp for a token."""
    try:
        token = get_token_by_id(token_id)
        if not token:
            return jsonify({'error': 'Token not found'}), 404
        return jsonify(token)
    except Exception as exc:
        log.error('[tokens] /token_status error for %s: %s', token_id, exc)
        return jsonify({'error': 'Token lookup failed'}), 500


# ---------------------------------------------------------------------------
# GET /api/tokens/prescription/<int:rx_id>
# ---------------------------------------------------------------------------
@token_bp.route('/prescription/<int:rx_id>', methods=['GET'])
@jwt_required()
def tokens_by_prescription(rx_id):
    """Tokens linked to a single prescription — doctor / admin view."""
    try:
        claims = get_jwt()
        role = claims.get('role', '')
        if role not in ('doctor', 'admin'):
            return jsonify({'error': 'Doctors and admins only'}), 403
        tokens = get_tokens_for_prescription(rx_id)
        return jsonify(tokens if isinstance(tokens, list) else [])
    except Exception as exc:
        log.error('[tokens] /tokens_by_prescription error for rx %s: %s', rx_id, exc)
        return jsonify([]), 200


# ---------------------------------------------------------------------------
# GET /api/tokens/patient/<int:patient_id>
# ---------------------------------------------------------------------------
@token_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def tokens_by_patient(patient_id):
    """Tokens for a patient — visible to patient, ASHA, doctor, admin."""
    try:
        tokens = get_tokens_for_patient(patient_id)
        return jsonify(tokens if isinstance(tokens, list) else [])
    except Exception as exc:
        log.error('[tokens] /tokens_by_patient error for patient %s: %s', patient_id, exc)
        return jsonify([]), 200


# ---------------------------------------------------------------------------
# GET /api/tokens/my
# ---------------------------------------------------------------------------
@token_bp.route('/my', methods=['GET'])
@jwt_required()
def my_tokens():
    """Role-aware token listing for the calling user."""
    user_id = int(get_jwt_identity())
    claims  = get_jwt()
    role    = claims.get('role', '')

    # ── Doctor: all tokens from prescriptions this doctor issued ────────────
    if role == 'doctor':
        try:
            tokens = get_all_tokens_for_doctor(user_id)
            return jsonify(tokens if isinstance(tokens, list) else [])
        except Exception as exc:
            log.error('[tokens] my_tokens doctor error for user %s: %s', user_id, exc)
            return jsonify([]), 200

    # ── ASHA: tokens for all patients assigned to this ASHA worker ──────────
    if role == 'asha':
        try:
            from database.postgres import get_db_connection
            import psycopg2.extras
            conn = get_db_connection()
            cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                cur.execute(
                    "SELECT id FROM patients WHERE asha_worker_id = %s",
                    (user_id,)
                )
                patient_ids = [r['id'] for r in cur.fetchall()]
            finally:
                cur.close()
                conn.close()

            all_tokens = []
            for pid in patient_ids:
                all_tokens.extend(get_tokens_for_patient(pid))
            return jsonify(all_tokens)

        except Exception as exc:
            log.error('[tokens] my_tokens asha error for user %s: %s', user_id, exc)
            return jsonify([]), 200

    # ── Patient: find this user's patient record via phone or name match ─────
    if role == 'patient':
        try:
            from database.postgres import get_db_connection
            import psycopg2.extras
            conn = get_db_connection()
            cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                # Try to find the patient record that corresponds to this user account.
                # Match on phone first (most reliable), then fall back to name.
                cur.execute("""
                    SELECT p.id
                    FROM patients p
                    JOIN users u ON u.id = %s
                    WHERE p.phone = u.phone
                       OR lower(p.full_name) = lower(u.full_name)
                    LIMIT 1
                """, (user_id,))
                row = cur.fetchone()
            finally:
                cur.close()
                conn.close()

            if not row:
                return jsonify([]), 200

            tokens = get_tokens_for_patient(row['id'])
            return jsonify(tokens if isinstance(tokens, list) else [])

        except Exception as exc:
            log.error('[tokens] my_tokens patient error for user %s: %s', user_id, exc)
            return jsonify([]), 200

    # ── Admin: return all tokens (paginated to last 200) ────────────────────
    if role == 'admin':
        try:
            from database.postgres import get_db_connection
            import psycopg2.extras
            from utils.helpers import serialize_row
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
                    LEFT JOIN prescriptions pr   ON pr.id  = pt.prescription_id
                    LEFT JOIN patients p         ON p.id   = pt.patient_id
                    LEFT JOIN users u            ON u.id   = pt.redeemed_by
                    LEFT JOIN adherence_events ae ON ae.token_id = pt.token_id
                    ORDER BY pt.issued_at DESC
                    LIMIT 200
                """)
                rows = [serialize_row(r) for r in cur.fetchall()]
            finally:
                cur.close()
                conn.close()
            return jsonify(rows)
        except Exception as exc:
            log.error('[tokens] my_tokens admin error: %s', exc)
            return jsonify([]), 200

    return jsonify([]), 200
