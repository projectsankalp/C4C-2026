from flask import Blueprint, request
from services.alert_service import trigger_alert, get_alerts, update_alert_status
from utils.responses import success_response, error_response
from utils.security import token_required, admin_required
from database import get_db

alert_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@alert_bp.route('', methods=['GET'])
@token_required
@admin_required
def get_all_alerts(current_user):
    """Admin only: Get all alerts with optional filters."""
    filters = request.args.to_dict()
    success, result = get_alerts(filters)
    if success:
        return success_response("Alerts retrieved", data={"alerts": result})
    else:
        return error_response(result, status_code=500)

@alert_bp.route('/latest', methods=['GET'])
@token_required
def get_latest_alerts(current_user):
    """Authenticated users: Get latest 10 alerts."""
    success, result = get_alerts({"limit": 10})
    if success:
        return success_response("Latest alerts retrieved", data={"alerts": result})
    else:
        return error_response(result, status_code=500)

@alert_bp.route('/user/<int:user_id>', methods=['GET'])
@token_required
def get_user_alerts(current_user, user_id):
    """Users can view their own alerts, admins can view any."""
    if current_user['role'] != 'admin' and current_user['id'] != user_id:
        return error_response("Unauthorized", status_code=403)
        
    success, result = get_alerts({"user_id": user_id})
    if success:
        return success_response("User alerts retrieved", data={"alerts": result})
    else:
        return error_response(result, status_code=500)

@alert_bp.route('/village/<string:village>', methods=['GET'])
@token_required
def get_village_alerts(current_user, village):
    """Admin/Officers: Get alerts for a village."""
    success, result = get_alerts({"village": village})
    if success:
        return success_response(f"Alerts retrieved for {village}", data={"alerts": result})
    else:
        return error_response(result, status_code=500)

@alert_bp.route('/create', methods=['POST'])
@token_required
@admin_required
def create_manual_alert(current_user):
    """Admin only: Manually trigger an alert for a node."""
    data = request.get_json()
    if not data or 'node_id' not in data or 'severity' not in data:
        return error_response("node_id and severity required", status_code=400)
        
    success, msg = trigger_alert(
        data['node_id'], 
        data.get('aqi_value'), 
        data['severity'], 
        data.get('alert_type', 'Manual')
    )
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)

@alert_bp.route('/broadcast', methods=['POST'])
@token_required
@admin_required
def emergency_broadcast(current_user):
    """Admin only: Send a broadcast to a village."""
    data = request.get_json()
    if not data or 'village' not in data or 'message' not in data:
        return error_response("village and message required", status_code=400)
        
    # We need a dummy node_id for the village to satisfy the trigger_alert signature.
    # Alternatively, find the first node in that village.
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT id FROM nodes WHERE village = ? LIMIT 1', (data['village'],))
    node = cursor.fetchone()
    if not node:
        return error_response("No nodes found in that village to attach broadcast to", status_code=400)
        
    success, msg = trigger_alert(
        node['id'], 
        None, 
        data.get('severity', 'emergency'), 
        'Broadcast',
        data['message']
    )
    
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)

@alert_bp.route('/<int:alert_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_status(current_user, alert_id):
    """Admin only: Update delivery status (e.g., from GSM callback)."""
    data = request.get_json()
    if not data or 'status' not in data:
        return error_response("status required", status_code=400)
        
    success, msg = update_alert_status(alert_id, data['status'])
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)
