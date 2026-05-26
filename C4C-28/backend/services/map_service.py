import sqlite3
from database import get_db
from services.node_service import _calculate_node_status

def _get_heatmap_intensity(aqi):
    if aqi is None: return 0.0
    if aqi <= 100: return 0.2
    if aqi <= 200: return 0.4
    if aqi <= 300: return 0.7
    return 1.0

def update_node_location(node_id, lat, lng):
    try:
        lat = float(lat)
        lng = float(lng)
        if not (-90 <= lat <= 90):
            return False, "Latitude must be between -90 and 90."
        if not (-180 <= lng <= 180):
            return False, "Longitude must be between -180 and 180."
    except ValueError:
        return False, "Latitude and Longitude must be numeric."
        
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM nodes WHERE id = ?", (node_id,))
    if not cursor.fetchone():
        return False, "Node not found."
        
    try:
        cursor.execute("UPDATE nodes SET latitude = ?, longitude = ? WHERE id = ?", (lat, lng, node_id))
        db.commit()
        return True, "Node location updated successfully."
    except Exception as e:
        return False, str(e)


def get_map_nodes(filters=None):
    if filters is None:
        filters = {}
        
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT n.id as node_id, n.node_code, n.node_name, n.village, n.area, 
               n.latitude, n.longitude, n.status, n.battery_level, n.last_seen,
               (SELECT calculated_aqi FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as latest_aqi,
               (SELECT aqi_status FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as aqi_status,
               (SELECT reading_time FROM aqi_readings WHERE node_id = n.id ORDER BY reading_time DESC LIMIT 1) as recorded_at
        FROM nodes n
        WHERE n.latitude IS NOT NULL AND n.longitude IS NOT NULL
    '''
    
    params = []
    if 'village' in filters:
        query += " AND n.village = ?"
        params.append(filters['village'])
        
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    
    nodes = [_calculate_node_status(row) for row in rows]
    return True, nodes


def get_heatmap_data():
    success, nodes = get_map_nodes()
    if not success:
        return False, nodes
        
    heatmap = []
    for node in nodes:
        # Ignore nodes that are offline or have no AQI
        if node['status'] == 'offline' or node['latest_aqi'] is None:
            continue
            
        heatmap.append({
            "latitude": node['latitude'],
            "longitude": node['longitude'],
            "aqi_intensity": _get_heatmap_intensity(node['latest_aqi']),
            "aqi_status": node['aqi_status'],
            "node_name": node['node_name'],
            "village": node['village'],
            "area": node['area']
        })
        
    return True, heatmap


def get_danger_zones():
    success, nodes = get_map_nodes()
    if not success:
        return False, nodes
        
    danger_zones = []
    for node in nodes:
        if node['status'] == 'offline' or (node['aqi_status'] in ['Poor', 'Hazardous']):
            danger_zones.append({
                "village": node['village'],
                "area": node['area'],
                "node": node['node_code'],
                "aqi": node['latest_aqi'],
                "status": node['status'] if node['status'] == 'offline' else node['aqi_status'],
                "advice": "System check required." if node['status'] == 'offline' else "Avoid outdoor exposure."
            })
            
    return True, danger_zones


def get_offline_nodes():
    success, nodes = get_map_nodes()
    if not success:
        return False, nodes
        
    offline_nodes = [node for node in nodes if node['status'] == 'offline']
    return True, offline_nodes
