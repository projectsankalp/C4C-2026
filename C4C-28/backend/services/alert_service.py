import sqlite3
from datetime import datetime, timezone
from flask import current_app
from database import get_db
from services.sms_service import attempt_delivery
from utils.logger import alert_logger

def trigger_alert(node_id, aqi_value, severity, alert_type="AQI_WARNING", broadcast_message=None):
    """
    Checks duplicate rules and creates an alert for affected users.
    If it's an AQI trigger, it limits to the node's village.
    """
    db = get_db()
    cursor = db.cursor()
    
    cooldown = current_app.config.get('ALERT_COOLDOWN_SECONDS', 900)
    
    # Check node details
    cursor.execute("SELECT node_code, village FROM nodes WHERE id = ?", (node_id,))
    node = cursor.fetchone()
    if not node:
        return False, "Node not found."
    
    node_code = node['node_code']
    village = node['village']
    
    # 1. Check for recent duplicates (if not a manual broadcast)
    if alert_type != 'Broadcast':
        cursor.execute('''
            SELECT alert_time FROM alerts 
            WHERE node_id = ? AND severity_level = ? AND alert_type = ?
            ORDER BY alert_time DESC LIMIT 1
        ''', (node_id, severity, alert_type))
        
        last_alert = cursor.fetchone()
        if last_alert:
            try:
                alert_val = last_alert['alert_time']
                if isinstance(alert_val, str):
                    last_alert_time = datetime.strptime(alert_val, '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc)
                else:
                    last_alert_time = alert_val.replace(tzinfo=timezone.utc)
                
                now = datetime.now(timezone.utc)
                diff = (now - last_alert_time).total_seconds()
                if diff < cooldown:
                    alert_logger.warning(f"Duplicate alert skipped for node {node_code} (cooldown active)")
                    return False, "Alert skipped (Cooldown active)"
            except Exception:
                pass # fallback to insert if parsing fails

    # 2. Fetch users in the same village
    cursor.execute("SELECT id, mobile_number, language_id, alert_mode FROM users WHERE village_name = ?", (village,))
    users = cursor.fetchall()
    
    if not users:
        return False, "No users found in this village to alert."
        
    inserted_count = 0
    # Determine the message/data for the SMS engine
    message_val = broadcast_message if alert_type == 'Broadcast' else None
    display_type = broadcast_message if alert_type == 'Broadcast' else alert_type

    # 3. Create alerts and attempt delivery
    from services.language_service import translate_message
    
    for user in users:
        # Determine format (sms vs voice)
        is_sms = user['alert_mode'] in ['sms', 'both']
        is_voice = user['alert_mode'] in ['voice', 'both']
        
        # Get language code from DB
        cursor.execute("SELECT code FROM languages WHERE id = ?", (user['language_id'],))
        lang_row = cursor.fetchone()
        language_code = lang_row['code'] if lang_row else 'en'
        
        # Determine the translated message
        if alert_type == 'Broadcast':
            translated_message = translate_message('Broadcast', language_code, message=broadcast_message)
        elif alert_type == 'AQI_WARNING':
            # Map severity to Template Keys
            template_key = 'Poor' if severity == 'high' else 'Hazardous'
            translated_message = translate_message(template_key, language_code, aqi_value=aqi_value)
        else:
            translated_message = translate_message(alert_type, language_code, node_code=node_code)
            
        try:
            cursor.execute('''
                INSERT INTO alerts (node_id, user_id, alert_type, message, language_id, aqi_value, severity_level, delivery_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (node_id, user['id'], alert_type, translated_message, user['language_id'], aqi_value, severity, 'pending'))
            alert_id = cursor.lastrowid
            
            # Fire SMS engine
            if is_sms:
                attempt_delivery(alert_id, user['mobile_number'], translated_message)
            if is_voice:
                # Generate Sarvam TTS audio for voice-mode users
                try:
                    from services.language_service import generate_tts_for_alert
                    audio_b64 = generate_tts_for_alert(translated_message, language_code)
                    status_val = 'voice_sent' if audio_b64 else 'pending_voice'
                    cursor.execute('UPDATE alerts SET delivery_status = ? WHERE id = ?', (status_val, alert_id))
                    if audio_b64:
                        alert_logger.info(f"Sarvam TTS generated for alert {alert_id} (lang={language_code})")
                except Exception as tts_err:
                    alert_logger.warning(f"TTS generation failed for alert {alert_id}: {tts_err}")
                    cursor.execute('UPDATE alerts SET delivery_status = ? WHERE id = ?', ('pending_voice', alert_id))
                
            inserted_count += 1
            
        except Exception as e:
            alert_logger.error(f"Failed to create alert for user {user['id']}: {str(e)}")
            continue

    db.commit()
    alert_logger.info(f"Alert created successfully for {inserted_count} users")
    return True, f"Alert created successfully for {inserted_count} users"


def get_alerts(filters):
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT a.id, a.alert_time, a.alert_type, a.message, a.aqi_value, a.severity_level, a.delivery_status,
               n.node_code, n.node_name, n.village, n.area,
               u.full_name as user_name
        FROM alerts a
        LEFT JOIN nodes n ON a.node_id = n.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE 1=1
    '''
    params = []
    
    if 'village' in filters:
        query += " AND n.village = ?"
        params.append(filters['village'])
    if 'severity' in filters:
        query += " AND a.severity_level = ?"
        params.append(filters['severity'])
    if 'alert_type' in filters:
        query += " AND a.alert_type = ?"
        params.append(filters['alert_type'])
    if 'user_id' in filters:
        query += " AND a.user_id = ?"
        params.append(filters['user_id'])
        
    query += " ORDER BY a.alert_time DESC"
    
    if 'limit' in filters:
        try:
            query += " LIMIT ?"
            params.append(int(filters['limit']))
        except ValueError:
            pass
            
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    
    results = []
    for row in rows:
        alert_data = dict(row)
        alert_data['is_new'] = False
        
        if alert_data.get('alert_time'):
            try:
                a_time = alert_data['alert_time']
                # Sometimes SQLite rows return datetime objects directly
                if isinstance(a_time, datetime):
                    alert_time = a_time
                else:
                    # SQLite default format is 'YYYY-MM-DD HH:MM:SS'
                    # But if it looks like HTTP date, try to parse it
                    try:
                        alert_time = datetime.strptime(a_time, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        # Fallback for RFC formatting from jsonify/sqlite
                        alert_time = datetime.strptime(a_time, '%a, %d %b %Y %H:%M:%S GMT')
                        
                # Ensure naive comparison
                alert_time = alert_time.replace(tzinfo=None)
                if (datetime.utcnow() - alert_time).total_seconds() <= 10:
                    alert_data['is_new'] = True
            except Exception as e:
                pass
                
        results.append(alert_data)
        
    return True, results


def update_alert_status(alert_id, status):
    if status not in ['pending', 'sent', 'failed', 'delivered', 'pending_voice']:
        return False, "Invalid status"
        
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT id FROM alerts WHERE id = ?', (alert_id,))
    if not cursor.fetchone():
        return False, "Alert not found"
        
    try:
        cursor.execute('UPDATE alerts SET delivery_status = ? WHERE id = ?', (status, alert_id))
        db.commit()
        return True, "Alert status updated"
    except Exception as e:
        return False, str(e)
