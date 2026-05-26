import os
import joblib
import pandas as pd
from datetime import datetime, timezone
import sqlite3
from database import get_db

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'rf_model.pkl')
model = None

# Load model once on startup if available
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("✅ RF Model loaded for predictions.")
    except Exception as e:
        print(f"⚠️ Error loading model: {e}")

def get_risk_level(aqi):
    if aqi <= 100: return 'SAFE'
    if aqi <= 200: return 'WARNING'
    if aqi <= 300: return 'DANGER'
    return 'EMERGENCY'

from services.alert_service import trigger_alert

def trigger_pre_alert(node_id, predicted_aqi, risk_level):
    """
    Creates an automated pre-alert that sends SMS immediately.
    """
    if predicted_aqi < 201:
        return
        
    db = get_db()
    cursor = db.cursor()
    
    # Check if a PRE_ALERT already exists in the last 24 hours to avoid spam
    cursor.execute('''
        SELECT id FROM alerts 
        WHERE node_id = ? AND alert_type = 'PRE_ALERT' 
        AND alert_time >= datetime('now', '-24 hours')
    ''', (node_id,))
    
    if cursor.fetchone():
        return # Already generated
        
    message = f"AI PREDICTION: AQI expected to reach {predicted_aqi} (Risk: {risk_level}) in the next 4 hours."
    
    # Trigger the standard alert flow to automatically send SMS to all villagers
    trigger_alert(node_id, predicted_aqi, risk_level.lower(), alert_type="PRE_ALERT", broadcast_message=message)

def predict_node_aqi(node_id):
    """
    Predicts the AQI for a specific node 4 hours into the future.
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get latest reading
    cursor.execute('''
        SELECT calculated_aqi, temperature, humidity, reading_time 
        FROM aqi_readings 
        WHERE node_id = ? 
        ORDER BY reading_time DESC LIMIT 1
    ''', (node_id,))
    
    latest = cursor.fetchone()
    if not latest:
        return False, "No data available for prediction."
        
    current_aqi = latest['calculated_aqi']
    
    # Get previous reading
    cursor.execute('''
        SELECT calculated_aqi 
        FROM aqi_readings 
        WHERE node_id = ? 
        ORDER BY reading_time DESC LIMIT 1 OFFSET 1
    ''', (node_id,))
    prev = cursor.fetchone()
    previous_aqi = prev['calculated_aqi'] if prev else current_aqi
    
    # Get rolling 3-hour avg
    cursor.execute('''
        SELECT AVG(calculated_aqi) as avg_3h
        FROM (
            SELECT calculated_aqi FROM aqi_readings 
            WHERE node_id = ? 
            ORDER BY reading_time DESC LIMIT 3
        )
    ''', (node_id,))
    avg_row = cursor.fetchone()
    rolling_avg_3h = avg_row['avg_3h'] if avg_row and avg_row['avg_3h'] else current_aqi
    
    # Fallback missing temp/humidity
    temp = latest['temperature'] if latest['temperature'] is not None else 30.0
    humidity = latest['humidity'] if latest['humidity'] is not None else 50.0
    
    now = datetime.now()
    
    features = {
        'calculated_aqi': current_aqi,
        'previous_aqi': previous_aqi,
        'temperature': temp,
        'humidity': humidity,
        'hour_of_day': now.hour,
        'day_of_week': now.weekday(),
        'rolling_avg_3h': rolling_avg_3h,
        'aqi_change_rate': current_aqi - previous_aqi
    }
    
    predicted_aqi = current_aqi
    
    # If model exists, use it. Otherwise, rule-based fallback
    if model:
        try:
            df = pd.DataFrame([features])
            pred_val = model.predict(df)[0]
            predicted_aqi = int(round(pred_val))
        except Exception as e:
            print(f"Prediction error: {e}")
            predicted_aqi = current_aqi # Fallback to current
    else:
        # Rule-based fallback: just follow the trend slightly
        trend = current_aqi - previous_aqi
        predicted_aqi = current_aqi + int(trend * 0.5)
        
    # Bound AQI
    predicted_aqi = max(0, min(500, predicted_aqi))
    
    risk_level = get_risk_level(predicted_aqi)
    
    # Evaluate pre-alert
    trigger_pre_alert(node_id, predicted_aqi, risk_level)
    
    return True, {
        "node_id": node_id,
        "current_aqi": current_aqi,
        "predicted_aqi_4h": predicted_aqi,
        "risk_level": risk_level,
        "trend": "rising" if predicted_aqi > current_aqi else "falling" if predicted_aqi < current_aqi else "stable"
    }

def get_latest_predictions():
    """
    Gets predictions for all active nodes.
    """
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM nodes WHERE status != 'offline'")
    nodes = cursor.fetchall()
    
    results = []
    for node in nodes:
        success, data = predict_node_aqi(node['id'])
        if success:
            # Join with village name for UI
            cursor.execute("SELECT village, node_code, node_name FROM nodes WHERE id = ?", (node['id'],))
            ninfo = cursor.fetchone()
            data['village'] = ninfo['village']
            data['node_code'] = ninfo['node_code']
            data['node_name'] = ninfo['node_name']
            results.append(data)
            
    return True, results
