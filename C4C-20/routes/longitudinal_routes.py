"""
Longitudinal (Passive Clinical Memory) routes.

GET  /api/patients/<id>/longitudinal   — full PCM summary for a patient
GET  /api/patients/<id>/snapshot       — lightweight trend snapshot
GET  /api/risk/longitudinal-queue      — risk queue annotated with trend data
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from services.longitudinal_engine import build_longitudinal_summary, build_snapshot

longitudinal_bp = Blueprint('longitudinal', __name__)


@longitudinal_bp.route('/api/patients/<int:patient_id>/longitudinal', methods=['GET'])
@jwt_required()
def longitudinal_summary(patient_id):
    """
    Full Passive Clinical Memory summary for a patient.

    Includes:
      - BP trend (direction, baseline vs recent, delta, readings)
      - Risk trajectory (score progression, peak, ESCALATING/IMPROVING/STABLE)
      - Adherence trajectory (%, missed reasons, consecutive misses)
      - First-deviation events (FIRST_CRISIS, FIRST_CHEST_PAIN, etc.)
      - GCPE pathway history (frequency, first/last dates)
      - Symptom frequency rates
      - Sudden escalation events
      - Prioritised clinical alerts
      - Doctor narrative paragraph

    Accessible by doctor, admin, and the patient's assigned ASHA worker.
    """
    claims = get_jwt()
    role   = claims.get('role', '')
    if role not in ('doctor', 'admin', 'asha'):
        return jsonify({'error': 'Access denied'}), 403

    try:
        summary = build_longitudinal_summary(patient_id)
    except Exception as e:
        return jsonify({'error': f'Longitudinal analysis failed: {str(e)}'}), 500

    if 'error' in summary:
        return jsonify(summary), 404

    return jsonify(summary)


@longitudinal_bp.route('/api/patients/<int:patient_id>/snapshot', methods=['GET'])
@jwt_required()
def longitudinal_snapshot(patient_id):
    """
    Lightweight longitudinal snapshot — trend directions + top alerts only.
    Fast enough to embed in list views.
    """
    claims = get_jwt()
    if claims.get('role') not in ('doctor', 'admin', 'asha'):
        return jsonify({'error': 'Access denied'}), 403

    try:
        snap = build_snapshot(patient_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify(snap)


@longitudinal_bp.route('/api/risk/longitudinal-queue', methods=['GET'])
@jwt_required()
def longitudinal_queue():
    """
    Risk queue for doctors, augmented with longitudinal trend data.

    Each patient entry includes:
      - standard risk fields (risk_score, risk_level, bp, symptoms)
      - bp_trend direction
      - risk_direction
      - adherence_pct
      - crisis_events count
      - alert_count
      - top_alerts (up to 3)

    Sorted by risk score descending, with ESCALATING patients surfaced higher.
    """
    claims = get_jwt()
    if claims.get('role') not in ('doctor', 'admin'):
        return jsonify({'error': 'Doctor or admin access required'}), 403

    import psycopg2.extras
    from database.postgres import get_db_connection
    from utils.helpers import rows_to_list

    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT DISTINCT ON (p.id)
            p.id, p.patient_id as patient_code, p.full_name, p.age,
            p.village, p.phone,
            v.risk_score, v.risk_level, v.visit_date, v.id as visit_id,
            v.bp_systolic, v.bp_diastolic, v.dizziness, v.chest_pain, v.medicine_missed,
            u.full_name as asha_name
        FROM patients p
        JOIN asha_visits v ON v.patient_id = p.id
        LEFT JOIN users u ON u.id = p.asha_worker_id
        ORDER BY p.id, v.visit_date DESC
    """)
    patients = rows_to_list(cur.fetchall())
    cur.close()
    conn.close()

    # Attach snapshots
    for p in patients:
        try:
            snap = build_snapshot(p['id'])
            p['longitudinal'] = snap
        except Exception:
            p['longitudinal'] = {'has_data': False}

    # Sort: ESCALATING first within each risk level, then by risk score
    _trend_order = {'ESCALATING': 0, 'VOLATILE': 1, 'WORSENING': 1,
                    'STABLE': 2, 'IMPROVING': 3, 'SINGLE': 4, 'NO_DATA': 5}
    _risk_order  = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}

    patients.sort(key=lambda x: (
        _risk_order.get(x.get('risk_level', 'LOW'), 9),
        _trend_order.get((x.get('longitudinal') or {}).get('risk_direction', 'NO_DATA'), 9),
        -(x.get('risk_score') or 0),
    ))

    return jsonify(patients)
