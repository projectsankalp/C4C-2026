"""
Agri Intelligence Service — Environmental Decision Intelligence Engine

Converts raw sensor data (MQ135, temperature, humidity) from aqi_readings
into actionable agricultural guidance across 4 modules:
  1. Smart Spraying Window
  2. Crop Drying Optimization
  3. Outdoor Work Timing
  4. Smoke/Dust Interference Detection
"""

from datetime import datetime, timedelta
from database import get_db


# ─── Helpers ──────────────────────────────────────────────────────

def _clamp(val, lo=0, hi=100):
    return max(lo, min(hi, int(val)))


def _get_latest_readings(node_id=None):
    """Fetch latest reading per node (or a specific node)."""
    db = get_db()
    cursor = db.cursor()
    if node_id:
        cursor.execute('''
            SELECT r.*, n.node_code, n.node_name, n.village, n.area
            FROM aqi_readings r
            JOIN nodes n ON r.node_id = n.id
            WHERE r.node_id = ?
            ORDER BY r.reading_time DESC LIMIT 1
        ''', (node_id,))
        row = cursor.fetchone()
        return [dict(row)] if row else []
    else:
        cursor.execute('''
            SELECT r.*, n.node_code, n.node_name, n.village, n.area
            FROM aqi_readings r
            JOIN nodes n ON r.node_id = n.id
            WHERE r.id IN (
                SELECT MAX(id) FROM aqi_readings GROUP BY node_id
            )
            ORDER BY r.reading_time DESC
        ''')
        return [dict(row) for row in cursor.fetchall()]


def _get_recent_readings(hours=3, node_id=None):
    """Fetch readings from the last N hours for trend analysis."""
    db = get_db()
    cursor = db.cursor()
    cutoff = (datetime.utcnow() - timedelta(hours=hours)).strftime('%Y-%m-%d %H:%M:%S')
    if node_id:
        cursor.execute('''
            SELECT r.*, n.node_code, n.village
            FROM aqi_readings r JOIN nodes n ON r.node_id = n.id
            WHERE r.reading_time >= ? AND r.node_id = ?
            ORDER BY r.reading_time DESC
        ''', (cutoff, node_id))
    else:
        cursor.execute('''
            SELECT r.*, n.node_code, n.village
            FROM aqi_readings r JOIN nodes n ON r.node_id = n.id
            WHERE r.reading_time >= ?
            ORDER BY r.reading_time DESC
        ''', (cutoff,))
    return [dict(row) for row in cursor.fetchall()]


def _avg(values):
    return sum(values) / len(values) if values else 0


def _current_hour():
    return datetime.utcnow().hour


# ─── Module 1: Smart Spraying Window ─────────────────────────────

def compute_spray_advisory(latest, recent):
    """
    Ideal spray conditions:
      - Humidity 40–70% (best absorption, low evaporation)
      - Temperature 15–30°C (pesticide works best)
      - AQI < 150 (low particulate drift)
      - Low MQ135 variance (stable atmosphere)
    """
    if not latest:
        return _empty_spray()

    avg_aqi = _avg([r.get('calculated_aqi', 0) for r in latest])
    avg_temp = _avg([r.get('temperature', 25) or 25 for r in latest])
    avg_humidity = _avg([r.get('humidity', 50) or 50 for r in latest])

    # MQ135 variance for atmospheric stability
    mq_values = [r.get('mq135_value', 0) for r in recent if r.get('mq135_value')]
    mq_variance = 0
    if len(mq_values) >= 2:
        mq_avg = _avg(mq_values)
        mq_variance = _avg([(v - mq_avg) ** 2 for v in mq_values]) ** 0.5

    # Score components (each 0–25, total 0–100)
    humidity_score = 25 - min(25, abs(avg_humidity - 55) * 0.8)
    temp_score = 25 - min(25, abs(avg_temp - 22.5) * 1.5)
    aqi_score = max(0, 25 - (avg_aqi / 8))
    stability_score = max(0, 25 - mq_variance * 0.5)

    spray_score = _clamp(humidity_score + temp_score + aqi_score + stability_score)

    # Status
    if spray_score >= 70:
        status = 'IDEAL'
    elif spray_score >= 40:
        status = 'CAUTION'
    else:
        status = 'AVOID'

    # Reasons
    reasons = []
    if avg_humidity < 40:
        reasons.append('Low humidity — rapid evaporation risk')
    elif avg_humidity > 70:
        reasons.append('High humidity — poor drying, runoff risk')
    if avg_temp < 15:
        reasons.append('Cold temperature — reduced pesticide efficacy')
    elif avg_temp > 30:
        reasons.append('High temperature — increased evaporation')
    if avg_aqi > 150:
        reasons.append('High particulate — spray drift risk')
    if mq_variance > 30:
        reasons.append('Unstable atmosphere — wind gusts likely')
    if not reasons:
        reasons.append('All conditions favorable for spraying')

    # Generate 12-hour window recommendations
    windows = _generate_hourly_windows(latest, recent, 'spray')

    return {
        'spray_score': spray_score,
        'status': status,
        'humidity': round(avg_humidity, 1),
        'temperature': round(avg_temp, 1),
        'aqi': round(avg_aqi),
        'stability': round(max(0, 100 - mq_variance * 2)),
        'reasons': reasons,
        'windows': windows,
    }


def _empty_spray():
    return {
        'spray_score': 0, 'status': 'UNKNOWN',
        'humidity': 0, 'temperature': 0, 'aqi': 0, 'stability': 0,
        'reasons': ['No sensor data available'], 'windows': [],
    }


# ─── Module 2: Crop Drying Optimization ──────────────────────────

def compute_drying_advisory(latest, recent):
    """
    Ideal drying conditions:
      - Humidity < 55% (faster moisture removal)
      - Temperature > 25°C (warm air aids drying)
      - AQI < 200 (no smoke/dust contamination)
    """
    if not latest:
        return _empty_drying()

    avg_aqi = _avg([r.get('calculated_aqi', 0) for r in latest])
    avg_temp = _avg([r.get('temperature', 25) or 25 for r in latest])
    avg_humidity = _avg([r.get('humidity', 50) or 50 for r in latest])

    # Score components
    humidity_score = max(0, 35 - max(0, avg_humidity - 40) * 1.2)
    temp_score = min(35, max(0, (avg_temp - 15) * 2.3))
    aqi_score = max(0, 30 - (avg_aqi / 10))

    drying_score = _clamp(humidity_score + temp_score + aqi_score)

    if drying_score >= 70:
        status = 'SAFE'
    elif drying_score >= 40:
        status = 'RISKY'
    else:
        status = 'UNSAFE'

    moisture_warning = avg_humidity > 65
    dust_interference = avg_aqi > 200
    smoke_detected = avg_aqi > 300

    reasons = []
    if moisture_warning:
        reasons.append('High moisture — crops may absorb humidity')
    if dust_interference:
        reasons.append('Dust/particulate contamination risk')
    if smoke_detected:
        reasons.append('Smoke detected — crop quality affected')
    if avg_temp < 20:
        reasons.append('Low temperature — slow drying')
    if not reasons:
        reasons.append('Good conditions for outdoor drying')

    windows = _generate_hourly_windows(latest, recent, 'drying')

    return {
        'drying_score': drying_score,
        'status': status,
        'humidity': round(avg_humidity, 1),
        'temperature': round(avg_temp, 1),
        'aqi': round(avg_aqi),
        'moisture_warning': moisture_warning,
        'dust_interference': dust_interference,
        'smoke_detected': smoke_detected,
        'reasons': reasons,
        'windows': windows,
    }


def _empty_drying():
    return {
        'drying_score': 0, 'status': 'UNKNOWN',
        'humidity': 0, 'temperature': 0, 'aqi': 0,
        'moisture_warning': False, 'dust_interference': False,
        'smoke_detected': False, 'reasons': ['No sensor data available'],
        'windows': [],
    }


# ─── Module 3: Outdoor Work Timing ───────────────────────────────

def compute_work_timing(latest, recent):
    """
    Comfortable outdoor conditions:
      - AQI < 150 (breathable)
      - Temperature 18–32°C (not too hot/cold)
      - Humidity < 75% (not oppressive)
    """
    if not latest:
        return _empty_work()

    avg_aqi = _avg([r.get('calculated_aqi', 0) for r in latest])
    avg_temp = _avg([r.get('temperature', 25) or 25 for r in latest])
    avg_humidity = _avg([r.get('humidity', 50) or 50 for r in latest])

    # Score components
    aqi_score = max(0, 40 - (avg_aqi / 5))
    temp_score = 30 - min(30, abs(avg_temp - 25) * 2)
    humidity_score = max(0, 30 - max(0, avg_humidity - 50) * 1.2)

    comfort_score = _clamp(aqi_score + temp_score + humidity_score)

    if comfort_score >= 70:
        status = 'COMFORTABLE'
    elif comfort_score >= 40:
        status = 'MODERATE'
    else:
        status = 'UNCOMFORTABLE'

    reasons = []
    if avg_aqi > 200:
        reasons.append('Heavy air pollution — limit outdoor exposure')
    elif avg_aqi > 150:
        reasons.append('Moderate pollution — take breaks')
    if avg_temp > 35:
        reasons.append('Heat stress risk — hydrate frequently')
    elif avg_temp > 32:
        reasons.append('Warm conditions — avoid midday work')
    if avg_humidity > 75:
        reasons.append('High humidity — increased fatigue')
    if not reasons:
        reasons.append('Good conditions for outdoor work')

    windows = _generate_hourly_windows(latest, recent, 'work')

    # Recommended and avoid hours
    recommended = []
    avoid = []
    for w in windows:
        if w['score'] >= 65:
            recommended.append(w['hour_label'])
        elif w['score'] < 35:
            avoid.append(w['hour_label'])

    return {
        'comfort_score': comfort_score,
        'status': status,
        'humidity': round(avg_humidity, 1),
        'temperature': round(avg_temp, 1),
        'aqi': round(avg_aqi),
        'recommended_hours': recommended[:6],
        'avoid_hours': avoid[:6],
        'reasons': reasons,
        'windows': windows,
    }


def _empty_work():
    return {
        'comfort_score': 0, 'status': 'UNKNOWN',
        'humidity': 0, 'temperature': 0, 'aqi': 0,
        'recommended_hours': [], 'avoid_hours': [],
        'reasons': ['No sensor data available'], 'windows': [],
    }


# ─── Module 4: Smoke & Dust Interference ─────────────────────────

def compute_interference_alerts(latest, recent):
    """
    Detect sudden environmental instability:
      - MQ135 spike > 2x rolling average
      - AQI jump > 80 points in 1 hour
      - Rate-of-change analysis
    """
    active_alerts = []

    if not latest or not recent:
        return {'active_alerts': [], 'overall_status': 'NO_DATA', 'alert_count': 0}

    # Current values
    avg_aqi = _avg([r.get('calculated_aqi', 0) for r in latest])
    avg_mq = _avg([r.get('mq135_value', 0) for r in latest])

    # Historical averages
    hist_aqi = _avg([r.get('calculated_aqi', 0) for r in recent])
    hist_mq = _avg([r.get('mq135_value', 0) for r in recent])

    # Spike detection
    if hist_mq > 0 and avg_mq > hist_mq * 2:
        active_alerts.append({
            'type': 'SMOKE_DRIFT',
            'severity': 'HIGH' if avg_mq > hist_mq * 3 else 'MEDIUM',
            'message': f'Smoke levels {avg_mq / max(hist_mq, 1):.1f}x above normal',
            'current': round(avg_mq),
            'baseline': round(hist_mq),
        })

    if hist_aqi > 0 and avg_aqi > hist_aqi * 1.5 and avg_aqi > 150:
        active_alerts.append({
            'type': 'DUST_INTERFERENCE',
            'severity': 'HIGH' if avg_aqi > 300 else 'MEDIUM',
            'message': f'Dust levels elevated — AQI jumped from {int(hist_aqi)} to {int(avg_aqi)}',
            'current': round(avg_aqi),
            'baseline': round(hist_aqi),
        })

    # Rate of change (using sorted recent readings)
    if len(recent) >= 4:
        recent_sorted = sorted(recent, key=lambda r: r.get('reading_time', ''))
        first_half = recent_sorted[:len(recent_sorted) // 2]
        second_half = recent_sorted[len(recent_sorted) // 2:]
        first_avg = _avg([r.get('calculated_aqi', 0) for r in first_half])
        second_avg = _avg([r.get('calculated_aqi', 0) for r in second_half])
        change_rate = second_avg - first_avg

        if change_rate > 60:
            active_alerts.append({
                'type': 'INSTABILITY',
                'severity': 'HIGH',
                'message': f'Rapid environmental deterioration: +{int(change_rate)} AQI in {len(recent)} readings',
                'change_rate': round(change_rate),
            })

    # Activity interrupt — current conditions unsuitable
    if avg_aqi > 250:
        active_alerts.append({
            'type': 'ACTIVITY_INTERRUPT',
            'severity': 'CRITICAL' if avg_aqi > 400 else 'HIGH',
            'message': 'Suspend outdoor agricultural activities',
            'aqi': round(avg_aqi),
        })

    if active_alerts:
        worst = max(active_alerts, key=lambda a: {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3}.get(a['severity'], 0))
        overall = worst['severity']
    else:
        overall = 'CLEAR'

    return {
        'active_alerts': active_alerts,
        'overall_status': overall,
        'alert_count': len(active_alerts),
        'current_aqi': round(avg_aqi),
        'baseline_aqi': round(hist_aqi) if recent else 0,
    }


# ─── Hourly Window Generator ─────────────────────────────────────

def _generate_hourly_windows(latest, recent, module_type):
    """
    Generate 12-hour forward window recommendations.
    Uses time-of-day heuristics combined with current sensor data.
    """
    now = datetime.utcnow()
    current_hour = now.hour

    avg_aqi = _avg([r.get('calculated_aqi', 0) for r in latest]) if latest else 100
    avg_temp = _avg([r.get('temperature', 25) or 25 for r in latest]) if latest else 25
    avg_humidity = _avg([r.get('humidity', 50) or 50 for r in latest]) if latest else 50

    windows = []
    for i in range(12):
        hour = (current_hour + i) % 24
        label = f"{hour:02d}:00"

        # Time-of-day modifiers (simulate diurnal patterns)
        # Early morning: cooler, more humid, less dust
        # Midday: hotter, drier, more dust/activity
        # Evening: cooling, humidity rising
        if 5 <= hour <= 8:
            temp_mod, hum_mod, aqi_mod = -3, 8, -20
        elif 9 <= hour <= 11:
            temp_mod, hum_mod, aqi_mod = 1, -5, 10
        elif 12 <= hour <= 15:
            temp_mod, hum_mod, aqi_mod = 5, -12, 30
        elif 16 <= hour <= 18:
            temp_mod, hum_mod, aqi_mod = 2, -3, 15
        elif 19 <= hour <= 21:
            temp_mod, hum_mod, aqi_mod = -2, 5, -10
        else:  # night
            temp_mod, hum_mod, aqi_mod = -5, 12, -25

        proj_temp = avg_temp + temp_mod
        proj_hum = max(20, min(95, avg_humidity + hum_mod))
        proj_aqi = max(10, avg_aqi + aqi_mod)

        if module_type == 'spray':
            h_s = 25 - min(25, abs(proj_hum - 55) * 0.8)
            t_s = 25 - min(25, abs(proj_temp - 22.5) * 1.5)
            a_s = max(0, 25 - proj_aqi / 8)
            s_s = 25  # assume stable for projection
            score = _clamp(h_s + t_s + a_s + s_s)
        elif module_type == 'drying':
            h_s = max(0, 35 - max(0, proj_hum - 40) * 1.2)
            t_s = min(35, max(0, (proj_temp - 15) * 2.3))
            a_s = max(0, 30 - proj_aqi / 10)
            score = _clamp(h_s + t_s + a_s)
        else:  # work
            a_s = max(0, 40 - proj_aqi / 5)
            t_s = 30 - min(30, abs(proj_temp - 25) * 2)
            h_s = max(0, 30 - max(0, proj_hum - 50) * 1.2)
            score = _clamp(a_s + t_s + h_s)

        if score >= 70:
            rating = 'GOOD'
        elif score >= 40:
            rating = 'FAIR'
        else:
            rating = 'POOR'

        windows.append({
            'hour': hour,
            'hour_label': label,
            'score': score,
            'rating': rating,
            'projected_temp': round(proj_temp, 1),
            'projected_humidity': round(proj_hum, 1),
            'projected_aqi': round(proj_aqi),
        })

    return windows


# ─── Main Entry Point ────────────────────────────────────────────

def get_full_advisory(node_id=None):
    """
    Returns combined advisory for all 4 modules.
    Optionally filter by node_id.
    """
    latest = _get_latest_readings(node_id)
    recent = _get_recent_readings(hours=3, node_id=node_id)

    return {
        'spray': compute_spray_advisory(latest, recent),
        'drying': compute_drying_advisory(latest, recent),
        'work_timing': compute_work_timing(latest, recent),
        'interference': compute_interference_alerts(latest, recent),
        'meta': {
            'generated_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'node_count': len(latest),
            'readings_analyzed': len(recent),
            'node_id': node_id,
        }
    }
