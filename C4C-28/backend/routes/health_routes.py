from flask import Blueprint, current_app
from database import get_db
from utils.responses import success_response, error_response

health_bp = Blueprint('health', __name__, url_prefix='/api')

@health_bp.route('/health', methods=['GET'])
def system_health():
    """Public: Check if backend and database are online."""
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1")
        return success_response("System is online and database is connected.")
    except Exception as e:
        return error_response(f"System online but database connection failed: {str(e)}", status_code=500)

@health_bp.route('/hardware/status', methods=['GET'])
def hardware_status():
    """Public: Check hardware configuration and status."""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get Node Count
        cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM nodes")
        node_stats = dict(cursor.fetchone())
        
        # Get Last AQI timestamp
        cursor.execute("SELECT reading_time FROM aqi_readings ORDER BY reading_time DESC LIMIT 1")
        last_reading = cursor.fetchone()
        last_aqi_time = last_reading['reading_time'] if last_reading else None
        
        status = {
            "backend": "online",
            "database": "connected",
            "lora_port": current_app.config.get('LORA_SERIAL_PORT'),
            "gsm_port": current_app.config.get('GSM_SERIAL_PORT'),
            "gsm_mock_mode": current_app.config.get('GSM_MOCK_MODE', False),
            "total_nodes": node_stats['total'],
            "active_nodes": node_stats['active'] if node_stats['active'] else 0,
            "last_aqi_reading": last_aqi_time
        }
        
        return success_response("Hardware status retrieved", data=status)
        
    except Exception as e:
        return error_response(f"Failed to fetch hardware status: {str(e)}", status_code=500)
