import sqlite3
from datetime import datetime, timezone
from database import get_db
from services.node_service import _calculate_node_status
from services.alert_service import trigger_alert
from utils.logger import aqi_logger

def _mq135_to_aqi(mq135_value):
    """
    Temporary direct mapping as requested: calculated_aqi = mapped MQ135 value
    """
    return int(mq135_value)

def _get_aqi_status(aqi):
    if aqi <= 100: return 'Good'
    if aqi <= 200: return 'Moderate'
    if aqi <= 300: return 'Poor'
    return 'Hazardous'

def add_reading(data):
    node_code = data.get('node_code')
    mq135_value = data.get('mq135_value')
    
    if not node_code or mq135_value is None:
        return False, "node_code and mq135_value are required"
        
    try:
        mq135_value = float(mq135_value)
        if mq135_value < 0:
            return False, "mq135_value cannot be negative"
    except ValueError:
        return False, "mq135_value must be numeric"
        
    db = get_db()
    cursor = db.cursor()
    
    # 1. Lookup node
    cursor.execute('SELECT id, status FROM nodes WHERE node_code = ?', (node_code,))
    node = cursor.fetchone()
    
    if not node:
        return False, f"Node with code {node_code} not found"
        
    node_id = node['id']
    
    # 2. Calculate AQI
    aqi = _mq135_to_aqi(mq135_value)
    status = _get_aqi_status(aqi)
    
    temp = data.get('temperature')
    humidity = data.get('humidity')
    battery = data.get('battery_level')
    rssi = data.get('lora_rssi')
    
    # 3. Insert Reading
    try:
        cursor.execute('''
            INSERT INTO aqi_readings 
            (node_id, mq135_value, calculated_aqi, aqi_status, temperature, humidity, battery_level, lora_signal_strength)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (node_id, mq135_value, aqi, status, temp, humidity, battery, rssi))
        
        # 4. Update Node Health
        update_q = "UPDATE nodes SET last_seen = CURRENT_TIMESTAMP"
        params = []
        if battery is not None:
            update_q += ", battery_level = ?"
            params.append(battery)
            
        update_q += " WHERE id = ?"
        params.append(node_id)
        
        cursor.execute(update_q, tuple(params))
        db.commit()
        
        # 5. Trigger Alerts if needed
        alert_msg = None
        if status == 'Poor':
            _, alert_msg = trigger_alert(node_id, aqi, 'high', 'Poor air quality detected')
        elif status == 'Hazardous':
            _, alert_msg = trigger_alert(node_id, aqi, 'emergency', 'Hazardous air quality detected')
            
        aqi_logger.info(f"AQI reading saved for {node_code}: {aqi} ({status})")
        return True, {
            "message": "Reading saved successfully",
            "calculated_aqi": aqi,
            "status": status,
            "alert_status": alert_msg
        }
        
    except Exception as e:
        aqi_logger.error(f"Failed to save AQI reading for {node_code}: {str(e)}")
        return False, str(e)


def get_latest_aqi():
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT n.id as node_id, n.node_code, n.node_name, n.village, n.area, 
               n.latitude, n.longitude, n.status, n.battery_level, n.last_seen,
               r.mq135_value, r.calculated_aqi as latest_aqi, r.aqi_status, r.temperature, r.humidity, r.reading_time as recorded_at
        FROM nodes n
        LEFT JOIN aqi_readings r ON r.id = (
            SELECT id FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1
        )
    '''
    cursor.execute(query)
    rows = cursor.fetchall()
    
    results = []
    for row in rows:
        node_data = dict(row)
        node_data = _calculate_node_status(node_data)
        
        # Calculate AQI freshness
        node_data['is_fresh'] = False
        if node_data.get('recorded_at'):
            try:
                a_time = node_data['recorded_at']
                if isinstance(a_time, datetime):
                    recorded_time = a_time
                else:
                    try:
                        recorded_time = datetime.strptime(a_time, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        recorded_time = datetime.strptime(a_time, '%a, %d %b %Y %H:%M:%S GMT')
                        
                recorded_time = recorded_time.replace(tzinfo=None)
                if (datetime.utcnow() - recorded_time).total_seconds() <= 300: # 5 minutes
                    node_data['is_fresh'] = True
            except Exception:
                pass
                
        results.append(node_data)
        
    return True, results


def get_aqi_history(filters):
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT r.reading_time as time, r.calculated_aqi as aqi, r.mq135_value, 
               r.temperature, r.humidity, n.node_name, n.area
        FROM aqi_readings r
        JOIN nodes n ON r.node_id = n.id
        WHERE 1=1
    '''
    params = []
    
    if 'node_id' in filters:
        query += " AND n.id = ?"
        params.append(filters['node_id'])
    if 'village' in filters:
        query += " AND n.village = ?"
        params.append(filters['village'])
        
    query += " ORDER BY r.reading_time DESC"
    
    if 'limit' in filters:
        try:
            limit = int(filters['limit'])
            query += " LIMIT ?"
            params.append(limit)
        except ValueError:
            pass
            
    cursor.execute(query, tuple(params))
    return True, [dict(row) for row in cursor.fetchall()]


def get_village_aqi(village):
    return get_aqi_history({"village": village, "limit": 100})


def get_node_aqi(node_id):
    return get_aqi_history({"node_id": node_id, "limit": 100})


def get_aqi_summary():
    db = get_db()
    cursor = db.cursor()
    
    # Simple aggregations for today
    stats = {}
    
    cursor.execute('''
        SELECT 
            AVG(calculated_aqi) as avg_aqi,
            MAX(calculated_aqi) as max_aqi,
            MIN(calculated_aqi) as min_aqi,
            COUNT(*) as total_readings
        FROM aqi_readings
        WHERE date(reading_time) = date('now')
    ''')
    day_stats = cursor.fetchone()
    
    stats['average_aqi_today'] = int(day_stats['avg_aqi'] or 0)
    stats['highest_aqi_today'] = day_stats['max_aqi'] or 0
    stats['lowest_aqi_today'] = day_stats['min_aqi'] or 0
    stats['total_readings_today'] = day_stats['total_readings']
    
    # Active alerts today
    cursor.execute("SELECT COUNT(*) as alert_count FROM alerts WHERE date(alert_time) = date('now')")
    stats['alerts_today'] = cursor.fetchone()['alert_count']
    
    # Node stats
    cursor.execute("SELECT status, COUNT(*) as count FROM nodes GROUP BY status")
    node_counts = {row['status']: row['count'] for row in cursor.fetchall()}
    stats['total_nodes'] = sum(node_counts.values())
    stats['active_nodes'] = node_counts.get('active', 0)
    stats['offline_nodes'] = node_counts.get('offline', 0)
    stats['danger_nodes'] = node_counts.get('inactive', 0) # Simplification
    
    # Most polluted area
    cursor.execute('''
        SELECT n.area, AVG(r.calculated_aqi) as avg_aqi 
        FROM aqi_readings r JOIN nodes n ON r.node_id = n.id 
        WHERE date(r.reading_time) = date('now') 
        GROUP BY n.area ORDER BY avg_aqi DESC LIMIT 1
    ''')
    worst = cursor.fetchone()
    stats['most_polluted_area'] = worst['area'] if worst else 'N/A'

    cursor.execute('''
        SELECT n.area, AVG(r.calculated_aqi) as avg_aqi 
        FROM aqi_readings r JOIN nodes n ON r.node_id = n.id 
        WHERE date(r.reading_time) = date('now') 
        GROUP BY n.area ORDER BY avg_aqi ASC LIMIT 1
    ''')
    best = cursor.fetchone()
    stats['least_polluted_area'] = best['area'] if best else 'N/A'
    
    return True, stats
