"""
Geolocation service — provides location data for outbreak heatmap and SOS.
"""
import psycopg2.extras
from database.postgres import get_db_connection

def get_high_risk_locations() -> list:
    """
    Return lat/lng of patients with HIGH risk visits for the outbreak heatmap.
    Only returns patients who have shared their location.
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT p.full_name, p.village, p.latitude, p.longitude,
               v.risk_level, v.risk_score, v.visit_date
        FROM patients p
        JOIN asha_visits v ON v.patient_id = p.id
        WHERE p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          AND v.risk_level IN ('HIGH', 'MEDIUM')
        ORDER BY v.visit_date DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return rows

def get_village_stats() -> list:
    """Aggregate risk stats per village for the heatmap overlay."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT p.village,
               COUNT(*) as patient_count,
               SUM(CASE WHEN v.risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk_count,
               AVG(v.risk_score) as avg_risk_score,
               AVG(p.latitude) as lat,
               AVG(p.longitude) as lng
        FROM patients p
        JOIN asha_visits v ON v.patient_id = p.id
        WHERE p.latitude IS NOT NULL
        GROUP BY p.village
    """)
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return rows
