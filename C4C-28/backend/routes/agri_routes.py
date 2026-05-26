"""
Agricultural Intelligence API Routes
Prefix: /api/agri
"""

from flask import Blueprint, request
from utils.responses import success_response, error_response
from services.agri_intelligence_service import get_full_advisory

agri_bp = Blueprint('agri', __name__, url_prefix='/api/agri')


@agri_bp.route('/advisory', methods=['GET'])
def full_advisory():
    """Full advisory — all 4 modules in one payload."""
    node_id = request.args.get('node_id', type=int)
    try:
        data = get_full_advisory(node_id)
        return success_response("Advisory generated", data=data)
    except Exception as e:
        return error_response(str(e), 500)


@agri_bp.route('/spray-window', methods=['GET'])
def spray_window():
    """Spray advisory only."""
    node_id = request.args.get('node_id', type=int)
    try:
        data = get_full_advisory(node_id)
        return success_response("Spray advisory", data=data['spray'])
    except Exception as e:
        return error_response(str(e), 500)


@agri_bp.route('/drying', methods=['GET'])
def drying():
    """Crop drying advisory only."""
    node_id = request.args.get('node_id', type=int)
    try:
        data = get_full_advisory(node_id)
        return success_response("Drying advisory", data=data['drying'])
    except Exception as e:
        return error_response(str(e), 500)


@agri_bp.route('/work-timing', methods=['GET'])
def work_timing():
    """Work timing advisory only."""
    node_id = request.args.get('node_id', type=int)
    try:
        data = get_full_advisory(node_id)
        return success_response("Work timing advisory", data=data['work_timing'])
    except Exception as e:
        return error_response(str(e), 500)


@agri_bp.route('/interference', methods=['GET'])
def interference():
    """Smoke/dust interference alerts only."""
    node_id = request.args.get('node_id', type=int)
    try:
        data = get_full_advisory(node_id)
        return success_response("Interference alerts", data=data['interference'])
    except Exception as e:
        return error_response(str(e), 500)
