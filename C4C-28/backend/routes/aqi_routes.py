from flask import Blueprint, request
from services.aqi_service import (
    add_reading, get_latest_aqi, get_aqi_history, 
    get_node_aqi, get_village_aqi, get_aqi_summary
)
from utils.responses import success_response, error_response
from utils.security import token_required

aqi_bp = Blueprint('aqi', __name__, url_prefix='/api/aqi')

@aqi_bp.route('/readings', methods=['POST'])
def receive_reading():
    """Public/Hardware API: Receive sensor reading."""
    data = request.get_json(silent=True)
    
    if not data:
        # Fallback: Parse raw string payloads (like "AQI:86,STATUS:MEDIUM")
        raw_data = request.get_data().decode('utf-8', errors='ignore').strip()
        if "AQI:" in raw_data or "aqi:" in raw_data.lower():
            try:
                parts = raw_data.split(',')
                parsed_data = {}
                for part in parts:
                    if ':' in part:
                        k, v = part.split(':', 1)
                        parsed_data[k.strip().lower()] = v.strip()
                
                aqi_val = int(parsed_data.get('aqi', 0))
                data = {
                    "node_code": "NODE_02",  # Default to our active Pimpalgaon node code
                    "mq135_value": aqi_val,
                    "temperature": 28.0,
                    "humidity": 55.0,
                    "battery_level": 95
                }
            except Exception:
                pass
        elif raw_data.isdigit():
            data = {
                "node_code": "NODE_02",
                "mq135_value": int(raw_data),
                "temperature": 28.0,
                "humidity": 55.0,
                "battery_level": 95
            }
            
    if not data:
        return error_response("Invalid JSON or string data provided.", status_code=400)
    
    success, result = add_reading(data)
    
    if success:
        return success_response(result['message'], data=result)
    else:
        return error_response(result, status_code=400)

@aqi_bp.route('/latest', methods=['GET'])
@token_required
def latest_aqi(current_user):
    """Authenticated users: Get latest overall AQI."""
    success, result = get_latest_aqi()
    if success:
        return success_response("Latest AQI retrieved", data={"nodes": result})
    else:
        return error_response(result, status_code=500)

@aqi_bp.route('/history', methods=['GET'])
@token_required
def aqi_history(current_user):
    """Authenticated users: Get AQI history."""
    filters = request.args.to_dict()
    success, result = get_aqi_history(filters)
    if success:
        return success_response("History retrieved", data={"history": result})
    else:
        return error_response(result, status_code=500)

@aqi_bp.route('/node/<int:node_id>', methods=['GET'])
@token_required
def node_aqi(current_user, node_id):
    """Authenticated users: Get readings of one node."""
    success, result = get_node_aqi(node_id)
    if success:
        return success_response(f"Readings for node {node_id}", data={"history": result})
    else:
        return error_response(result, status_code=500)

@aqi_bp.route('/village/<string:village>', methods=['GET'])
@token_required
def village_aqi(current_user, village):
    """Authenticated users: Get readings of one village."""
    success, result = get_village_aqi(village)
    if success:
        return success_response(f"Readings for village {village}", data={"history": result})
    else:
        return error_response(result, status_code=500)

@aqi_bp.route('/summary', methods=['GET'])
@token_required
def aqi_summary(current_user):
    """Authenticated users: Dashboard summary cards."""
    success, result = get_aqi_summary()
    if success:
        return success_response("Summary retrieved", data={"summary": result})
    else:
        return error_response(result, status_code=500)
