"""
Risk engine routes — risk scoring, patient risk queue, outbreak heatmap data.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
import psycopg2.extras
from database.postgres import get_db_connection
from ai_engine.risk_engine import calculate_risk_score, get_risk_summary
from services.geolocation_service import get_high_risk_locations, get_village_stats
from utils.helpers import rows_to_list

risk_bp = Blueprint('risk', __name__, url_prefix='/api/risk')


@risk_bp.route('/score', methods=['POST'])
@jwt_required()
def score():
    """
    Calculate risk score from submitted visit data (preview before saving).
    Accepts same payload as /api/visits POST.
    """
    data = request.get_json(force=True)
    risk_score, risk_level = calculate_risk_score(data)
    return jsonify(get_risk_summary(risk_score, risk_level, data))


@risk_bp.route('/queue', methods=['GET'])
@jwt_required()
def risk_queue():
    """
    Risk-ranked patient queue for doctors.
    Returns patients sorted by highest risk score descending.
    """
    claims = get_jwt()
    if claims.get('role') not in ('doctor', 'admin'):
        return jsonify({'error': 'Doctor or admin access required'}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
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
    all_patients = rows_to_list(cur.fetchall())
    cur.close()
    conn.close()

    # Sort by risk score descending
    all_patients.sort(key=lambda x: x.get('risk_score') or 0, reverse=True)
    return jsonify(all_patients)


@risk_bp.route('/heatmap', methods=['GET'])
@jwt_required()
def heatmap():
    """
    Heatmap data for Leaflet.js outbreak visualisation.
    Returns lat/lng with risk level for HIGH/MEDIUM risk patients.
    """
    locations = get_high_risk_locations()
    village_stats = get_village_stats()
    return jsonify({
        'points': locations,
        'village_stats': village_stats,
    })


@risk_bp.route('/stats', methods=['GET'])
@jwt_required()
def risk_stats():
    """Aggregate risk stats for the dashboard."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            COUNT(*) as total_visits,
            SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk,
            SUM(CASE WHEN risk_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium_risk,
            SUM(CASE WHEN risk_level = 'LOW' THEN 1 ELSE 0 END) as low_risk,
            AVG(risk_score)::numeric(5,1) as avg_risk_score,
            SUM(CASE WHEN chest_pain THEN 1 ELSE 0 END) as chest_pain_cases,
            SUM(CASE WHEN medicine_missed THEN 1 ELSE 0 END) as missed_medicine_cases
        FROM asha_visits
    """)
    stats = dict(cur.fetchone())

    cur.execute("SELECT COUNT(*) as total_patients FROM patients")
    stats['total_patients'] = cur.fetchone()['total_patients']

    cur.execute("SELECT COUNT(*) as total_users FROM users WHERE role = 'asha'")
    stats['total_asha_workers'] = cur.fetchone()['total_users']

    cur.execute("SELECT COUNT(*) as blocks FROM blockchain")
    stats['blockchain_blocks'] = cur.fetchone()['blocks']

    cur.close()
    conn.close()
    return jsonify(stats)


@risk_bp.route('/sos', methods=['POST'])
@jwt_required()
def sos_alert():
    """SOS emergency alert — dispatch help to patient location."""
    from services.notification_service import sos_alert as send_sos
    data = request.get_json(force=True)
    patient_id = data.get('patient_id')
    location = data.get('location', {})
    if not patient_id:
        return jsonify({'error': 'patient_id is required'}), 400
    result = send_sos(patient_id, location)
    return jsonify({'message': 'SOS dispatched', 'alert': result})
