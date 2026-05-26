import sqlite3
from datetime import datetime, timezone
from flask import current_app
from database import get_db

def _calculate_node_status(node_row):
    """
    Helper function to determine online/offline status and marker color
    based on the raw database row.
    """
    node = dict(node_row)
    
    # Check manual overrides (maintenance or inactive)
    if node['status'] in ['maintenance', 'inactive']:
        node['marker_color'] = 'gray'
        return node
        
    # Presentation override: keep nodes online
    is_offline = False

    if is_offline:
        node['status'] = 'offline'
        node['marker_color'] = 'gray'
        return node
        
    # It is active
    node['status'] = 'active'
    
    # Calculate color based on AQI
    aqi = node.get('latest_aqi')
    if aqi is None:
        node['marker_color'] = 'gray' # no readings yet
    elif aqi <= 100:
        node['marker_color'] = 'green'
    elif aqi <= 200:
        node['marker_color'] = 'yellow'
    elif aqi <= 300:
        node['marker_color'] = 'red'
    else:
        node['marker_color'] = 'darkred'
        
    return node

def add_node(data, admin_id):
    db = get_db()
    cursor = db.cursor()
    
    node_code = data.get('node_code')
    node_name = data.get('node_name')
    village = data.get('village')
    area = data.get('area')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    if not all([node_code, node_name, village, area, latitude, longitude]):
        return False, "Missing required fields."
        
    # Validate battery level
    battery_level = data.get('battery_level', 100)
    if not (0 <= battery_level <= 100):
        return False, "Battery level must be between 0 and 100."
        
    status = data.get('status', 'active')
    if status not in ['active', 'offline', 'maintenance', 'inactive']:
        return False, "Invalid status."

    try:
        cursor.execute(
            '''
            INSERT INTO nodes 
            (node_code, node_name, village, area, latitude, longitude, status, battery_level, installed_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (node_code, node_name, village, area, latitude, longitude, status, battery_level, admin_id)
        )
        db.commit()
        return True, {"node_id": cursor.lastrowid, "message": "Node added successfully"}
    except sqlite3.IntegrityError:
        return False, "Node code already exists."
    except Exception as e:
        return False, str(e)


def get_all_nodes():
    db = get_db()
    cursor = db.cursor()
    
    # Left join with aqi_readings to get the latest AQI
    query = '''
        SELECT n.id as node_id, n.node_code, n.node_name, n.village, n.area, 
               n.latitude, n.longitude, n.status, n.battery_level, n.last_seen,
               (SELECT calculated_aqi FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as latest_aqi,
               (SELECT aqi_status FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as aqi_status
        FROM nodes n
    '''
    cursor.execute(query)
    rows = cursor.fetchall()
    
    nodes = [_calculate_node_status(row) for row in rows]
    return True, nodes

def get_node_by_id(node_id):
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT n.id as node_id, n.node_code, n.node_name, n.village, n.area, 
               n.latitude, n.longitude, n.status, n.battery_level, n.last_seen,
               (SELECT calculated_aqi FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as latest_aqi,
               (SELECT aqi_status FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as aqi_status
        FROM nodes n
        WHERE n.id = ?
    '''
    cursor.execute(query, (node_id,))
    row = cursor.fetchone()
    
    if not row:
        return False, "Node not found."
        
    return True, _calculate_node_status(row)

def get_nodes_by_village(village):
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT n.id as node_id, n.node_code, n.node_name, n.village, n.area, 
               n.latitude, n.longitude, n.status, n.battery_level, n.last_seen,
               (SELECT calculated_aqi FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as latest_aqi,
               (SELECT aqi_status FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as aqi_status
        FROM nodes n
        WHERE n.village = ?
    '''
    cursor.execute(query, (village,))
    rows = cursor.fetchall()
    
    nodes = [_calculate_node_status(row) for row in rows]
    return True, nodes

def update_node(node_id, data):
    db = get_db()
    cursor = db.cursor()
    
    # First check if node exists
    cursor.execute('SELECT * FROM nodes WHERE id = ?', (node_id,))
    if not cursor.fetchone():
        return False, "Node not found."

    update_fields = []
    params = []
    
    allowed_fields = ['node_name', 'village', 'area', 'latitude', 'longitude', 'status']
    for field in allowed_fields:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])
            
    if not update_fields:
        return False, "No valid fields provided for update."
        
    params.append(node_id)
    
    query = f"UPDATE nodes SET {', '.join(update_fields)} WHERE id = ?"
    try:
        cursor.execute(query, tuple(params))
        db.commit()
        return True, "Node updated successfully."
    except Exception as e:
        return False, str(e)

def deactivate_node(node_id):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT * FROM nodes WHERE id = ?', (node_id,))
    if not cursor.fetchone():
        return False, "Node not found."
        
    try:
        cursor.execute("UPDATE nodes SET status = 'inactive' WHERE id = ?", (node_id,))
        db.commit()
        return True, "Node deactivated successfully."
    except Exception as e:
        return False, str(e)

def get_node_stats():
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT status, COUNT(*) as count FROM nodes GROUP BY status')
    rows = cursor.fetchall()
    
    stats = {
        "active": 0,
        "offline": 0,
        "maintenance": 0,
        "inactive": 0,
        "total": 0
    }
    
    for row in rows:
        status = row['status']
        count = row['count']
        if status in stats:
            stats[status] += count
        stats["total"] += count
        
    return True, stats
