"""
Prescription routes — JanAushadi prescription workflow.
Doctors create; patients and ASHA workers view.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import psycopg2.extras
from database.postgres import get_db_connection
from services.prescription_service import create_prescription, get_patient_prescriptions
from utils.helpers import serialize_row, rows_to_list
from utils.validators import sanitize_text

prescription_bp = Blueprint('prescriptions', __name__, url_prefix='/api/prescriptions')


@prescription_bp.route('', methods=['POST'])
@jwt_required()
def add_prescription():
    """Create a new prescription — doctors only."""
    claims = get_jwt()
    if claims.get('role') != 'doctor':
        return jsonify({'error': 'Only doctors can create prescriptions'}), 403

    doctor_id = int(get_jwt_identity())
    data = request.get_json(force=True)

    visit_id = data.get('visit_id')
    patient_id = data.get('patient_id')
    medicines = data.get('medicines', [])
    dosage = sanitize_text(data.get('dosage_instructions', ''))
    followup = data.get('followup_date')
    notes = sanitize_text(data.get('notes', ''))

    if not patient_id or not medicines:
        return jsonify({'error': 'patient_id and medicines are required'}), 400
    if not isinstance(medicines, list) or len(medicines) == 0:
        return jsonify({'error': 'medicines must be a non-empty list'}), 400

    result = create_prescription(visit_id, patient_id, doctor_id, medicines, dosage, followup, notes)
    return jsonify({'message': 'Prescription created', **result}), 201


@prescription_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def patient_prescriptions(patient_id):
    """Get all prescriptions for a patient."""
    rows = get_patient_prescriptions(patient_id)
    return jsonify([serialize_row(r) for r in rows])


@prescription_bp.route('/<int:prescription_id>', methods=['GET'])
@jwt_required()
def get_prescription(prescription_id):
    """Get a single prescription."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT pr.*, u.full_name as doctor_name, p.full_name as patient_name
        FROM prescriptions pr
        JOIN users u ON u.id = pr.doctor_id
        JOIN patients p ON p.id = pr.patient_id
        WHERE pr.id = %s
    """, (prescription_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify({'error': 'Prescription not found'}), 404
    return jsonify(serialize_row(row))


@prescription_bp.route('', methods=['GET'])
@jwt_required()
def list_prescriptions():
    """List prescriptions filtered by role."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get('role', '')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if role == 'doctor':
        cur.execute("""
            SELECT pr.*, p.full_name as patient_name
            FROM prescriptions pr
            JOIN patients p ON p.id = pr.patient_id
            WHERE pr.doctor_id = %s
            ORDER BY pr.prescribed_at DESC
        """, (user_id,))
    elif role in ('admin',):
        cur.execute("""
            SELECT pr.*, p.full_name as patient_name, u.full_name as doctor_name
            FROM prescriptions pr
            JOIN patients p ON p.id = pr.patient_id
            JOIN users u ON u.id = pr.doctor_id
            ORDER BY pr.prescribed_at DESC
        """)
    else:
        return jsonify([])

    rows = rows_to_list(cur.fetchall())
    cur.close()
    conn.close()
    return jsonify(rows)
