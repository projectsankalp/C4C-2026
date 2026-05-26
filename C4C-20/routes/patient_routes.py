"""
Patient management routes.
ASHA workers manage their assigned patients; doctors view their queue.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import psycopg2.extras
from database.postgres import get_db_connection
from utils.helpers import generate_patient_id, serialize_row, rows_to_list
from utils.validators import sanitize_text

patient_bp = Blueprint('patients', __name__, url_prefix='/api/patients')


@patient_bp.route('', methods=['GET'])
@jwt_required()
def list_patients():
    """
    List patients.
    - ASHA: only their assigned patients
    - Doctor: their queue, risk-ranked
    - Admin: all patients
    """
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get('role', '')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if role == 'asha':
        cur.execute("""
            SELECT p.*, u.full_name as asha_name,
                   v.risk_score, v.risk_level, v.visit_date as last_visit_date
            FROM patients p
            LEFT JOIN users u ON u.id = p.asha_worker_id
            LEFT JOIN LATERAL (
                SELECT risk_score, risk_level, visit_date
                FROM asha_visits WHERE patient_id = p.id
                ORDER BY visit_date DESC LIMIT 1
            ) v ON true
            WHERE p.asha_worker_id = %s
            ORDER BY COALESCE(v.risk_score, 0) DESC
        """, (user_id,))
    elif role == 'doctor':
        cur.execute("""
            SELECT p.*, u.full_name as asha_name,
                   v.risk_score, v.risk_level, v.visit_date as last_visit_date
            FROM patients p
            LEFT JOIN users u ON u.id = p.asha_worker_id
            LEFT JOIN LATERAL (
                SELECT risk_score, risk_level, visit_date
                FROM asha_visits WHERE patient_id = p.id
                ORDER BY visit_date DESC LIMIT 1
            ) v ON true
            ORDER BY COALESCE(v.risk_score, 0) DESC
        """)
    else:
        cur.execute("""
            SELECT p.*, u.full_name as asha_name,
                   v.risk_score, v.risk_level, v.visit_date as last_visit_date
            FROM patients p
            LEFT JOIN users u ON u.id = p.asha_worker_id
            LEFT JOIN LATERAL (
                SELECT risk_score, risk_level, visit_date
                FROM asha_visits WHERE patient_id = p.id
                ORDER BY visit_date DESC LIMIT 1
            ) v ON true
            ORDER BY p.id DESC
        """)

    rows = rows_to_list(cur.fetchall())
    cur.close()
    conn.close()
    return jsonify(rows)


@patient_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    """Register a new patient — ASHA workers and admins."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get('role', '')
    if role not in ('asha', 'admin'):
        return jsonify({'error': 'Only ASHA workers or admins can register patients'}), 403

    data = request.get_json(force=True)
    full_name = sanitize_text(data.get('full_name', ''))
    if not full_name:
        return jsonify({'error': 'full_name is required'}), 400

    pid = generate_patient_id()
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO patients
                (patient_id, full_name, age, gender, village, phone,
                 asha_worker_id, medical_history, allergies, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (
            pid,
            full_name,
            data.get('age'),
            sanitize_text(data.get('gender', '')),
            sanitize_text(data.get('village', '')),
            sanitize_text(data.get('phone', '')),
            user_id if role == 'asha' else data.get('asha_worker_id'),
            sanitize_text(data.get('medical_history', '')),
            sanitize_text(data.get('allergies', '')),
            data.get('latitude'),
            data.get('longitude'),
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({'id': new_id, 'patient_id': pid}), 201


@patient_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Get a single patient's full record with visit history."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT p.*, u.full_name as asha_name
        FROM patients p
        LEFT JOIN users u ON u.id = p.asha_worker_id
        WHERE p.id = %s
    """, (patient_id,))
    patient = cur.fetchone()
    if not patient:
        cur.close()
        conn.close()
        return jsonify({'error': 'Patient not found'}), 404

    # Fetch visit history
    cur.execute("""
        SELECT * FROM asha_visits WHERE patient_id = %s ORDER BY visit_date DESC
    """, (patient_id,))
    visits = rows_to_list(cur.fetchall())

    # Fetch prescriptions
    cur.execute("""
        SELECT pr.*, u.full_name as doctor_name
        FROM prescriptions pr
        JOIN users u ON u.id = pr.doctor_id
        WHERE pr.patient_id = %s ORDER BY pr.prescribed_at DESC
    """, (patient_id,))
    prescriptions = rows_to_list(cur.fetchall())

    cur.close()
    conn.close()

    result = serialize_row(patient)
    result['visits'] = visits
    result['prescriptions'] = prescriptions
    return jsonify(result)


@patient_bp.route('/my', methods=['GET'])
@jwt_required()
def my_patient_profile():
    """Return the patient record linked to the logged-in patient user."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') != 'patient':
        return jsonify({'error': 'Only patient role can access this endpoint'}), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Match by user phone or name — simplified for demo
    cur.execute("""
        SELECT p.*, u.full_name as asha_name
        FROM patients p
        LEFT JOIN users u ON u.id = p.asha_worker_id
        WHERE p.phone = (SELECT phone FROM users WHERE id = %s)
        LIMIT 1
    """, (user_id,))
    patient = cur.fetchone()
    cur.close()
    conn.close()

    if not patient:
        return jsonify({'message': 'No patient record linked yet', 'patient': None}), 200
    return jsonify(serialize_row(patient))
