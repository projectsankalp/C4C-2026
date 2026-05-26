"""
AarogyaNet — Passive Absence Detection System routes.

Endpoints:
    POST   /api/absence                  — record a missed visit / unavailable
    GET    /api/absence/patient/<id>     — absence history + continuity for one patient
    GET    /api/absence/alerts           — all patients with active absence alerts (doctor)
    GET    /api/absence/continuity       — continuity overview for all patients (doctor)
    GET    /api/absence/types            — list of valid absence types
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from services.absence_service import (
    ABSENCE_TYPES,
    record_absence,
    get_patient_absences,
    compute_continuity,
    get_absence_alerts,
    get_all_absence_alerts,
    get_continuity_overview,
)

absence_bp = Blueprint('absence', __name__, url_prefix='/api/absence')


@absence_bp.route('/types', methods=['GET'])
@jwt_required()
def list_types():
    """Return the supported absence event types."""
    return jsonify(ABSENCE_TYPES)


@absence_bp.route('', methods=['POST'])
@jwt_required()
def create_absence():
    """
    Record a missed visit or patient-unavailable event.

    Body:
        patient_id      int      (required)
        absence_type    str      (required — from /types)
        notes           str      (optional)
        expected_date   str ISO  (optional)
    """
    claims = get_jwt()
    role   = claims.get('role', '')
    if role not in ('asha', 'admin', 'doctor'):
        return jsonify({'error': 'Insufficient permissions'}), 403

    user_id = int(get_jwt_identity())
    data    = request.get_json(force=True)

    try:
        result = record_absence(data, user_id)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to record absence: {str(e)}'}), 500


@absence_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def patient_absence_history(patient_id):
    """
    Full absence history + continuity analysis for one patient.

    Returns:
        absences    list of absence events
        continuity  continuity intelligence dict
        alerts      prioritised alert list
    """
    try:
        absences   = get_patient_absences(patient_id)
        continuity = compute_continuity(patient_id)
        alerts     = get_absence_alerts(patient_id)
        return jsonify({
            'patient_id': patient_id,
            'absences':   absences,
            'continuity': continuity,
            'alerts':     alerts,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@absence_bp.route('/alerts', methods=['GET'])
@jwt_required()
def all_absence_alerts():
    """
    All patients with active absence alerts — doctor/admin only.
    Sorted by severity.
    """
    claims = get_jwt()
    role   = claims.get('role', '')
    if role not in ('doctor', 'admin'):
        return jsonify({'error': 'Doctor or admin access required'}), 403

    try:
        return jsonify(get_all_absence_alerts())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@absence_bp.route('/continuity', methods=['GET'])
@jwt_required()
def continuity_overview():
    """
    Continuity overview table for all patients — doctor/admin only.
    """
    claims = get_jwt()
    role   = claims.get('role', '')
    if role not in ('doctor', 'admin'):
        return jsonify({'error': 'Doctor or admin access required'}), 403

    try:
        return jsonify(get_continuity_overview())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
