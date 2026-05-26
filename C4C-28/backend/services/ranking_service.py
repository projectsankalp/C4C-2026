import sqlite3
from database import get_db
import datetime
import calendar

def _get_quarter_dates(quarter, year):
    """Returns start_date and end_date strings for a quarter."""
    q_map = {
        'Q1': (1, 3),
        'Q2': (4, 6),
        'Q3': (7, 9),
        'Q4': (10, 12)
    }
    start_month, end_month = q_map.get(quarter.upper(), (1, 3))
    
    start_date = f"{year}-{start_month:02d}-01 00:00:00"
    last_day = calendar.monthrange(year, end_month)[1]
    end_date = f"{year}-{end_month:02d}-{last_day} 23:59:59"
    return start_date, end_date

def _get_previous_quarter(quarter, year):
    q_map = {'Q1': ('Q4', year - 1), 'Q2': ('Q1', year), 'Q3': ('Q2', year), 'Q4': ('Q3', year)}
    return q_map.get(quarter.upper())

def _calc_clean_air_score(avg_aqi):
    if avg_aqi <= 50: return 50
    if avg_aqi <= 100: return 40
    if avg_aqi <= 200: return 25
    if avg_aqi <= 300: return 10
    return 0

def _calc_improvement_score(prev_avg, curr_avg):
    if prev_avg is None or prev_avg == 0:
        return 0, 0.0 # No history to compare
    
    improvement = ((prev_avg - curr_avg) / prev_avg) * 100
    
    if improvement >= 20: return 20, improvement
    if improvement >= 10: return 15, improvement
    if improvement >= 5: return 10, improvement
    if improvement > 0: return 5, improvement
    return 0, improvement

def _calc_uptime_score(days_with_readings, total_days_in_quarter):
    uptime_pct = (days_with_readings / total_days_in_quarter) * 100 if total_days_in_quarter else 0
    if uptime_pct >= 90: return 15
    if uptime_pct >= 75: return 10
    if uptime_pct >= 50: return 5
    return 0

def _calc_participation_score(user_count):
    if user_count >= 100: return 10
    if user_count >= 50: return 7
    if user_count >= 20: return 5
    if user_count >= 1: return 2
    return 0

def _calc_hazard_penalty(hazard_count):
    if hazard_count >= 16: return -20
    if hazard_count >= 6: return -10
    if hazard_count >= 1: return -5
    return 0

def generate_ranking(quarter, year):
    db = get_db()
    cursor = db.cursor()
    
    quarter = quarter.upper()
    start_date, end_date = _get_quarter_dates(quarter, year)
    
    # Check if ranking already generated
    cursor.execute("SELECT id FROM rankings WHERE quarter = ? AND year = ?", (quarter, year))
    if cursor.fetchone():
        # For MVP, we will delete and regenerate if called again
        cursor.execute("DELETE FROM rankings WHERE quarter = ? AND year = ?", (quarter, year))
    
    # 1. Get all villages with readings in this quarter
    cursor.execute('''
        SELECT n.village, 
               AVG(r.calculated_aqi) as avg_aqi,
               MIN(r.calculated_aqi) as best_aqi,
               MAX(r.calculated_aqi) as worst_aqi,
               COUNT(DISTINCT DATE(r.reading_time)) as days_with_readings,
               SUM(CASE WHEN r.aqi_status IN ('Poor', 'Hazardous') THEN 1 ELSE 0 END) as hazard_count
        FROM aqi_readings r
        JOIN nodes n ON r.node_id = n.id
        WHERE r.reading_time >= ? AND r.reading_time <= ?
        GROUP BY n.village
    ''', (start_date, end_date))
    
    village_stats = cursor.fetchall()
    if not village_stats:
        return False, "No data available for the selected quarter."
        
    # Calculate total days in quarter (approx 90-92, but we'll use exact)
    d1 = datetime.datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
    d2 = datetime.datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
    total_days = (d2 - d1).days + 1
    
    prev_q, prev_y = _get_previous_quarter(quarter, year)
    
    rankings_to_insert = []
    
    for stat in village_stats:
        village = stat['village']
        avg_aqi = int(stat['avg_aqi'])
        best_aqi = int(stat['best_aqi'])
        worst_aqi = int(stat['worst_aqi'])
        days_with_readings = stat['days_with_readings']
        hazard_count = stat['hazard_count']
        
        # Get prev quarter avg for improvement
        cursor.execute("SELECT average_aqi FROM rankings WHERE village_name = ? AND quarter = ? AND year = ?", (village, prev_q, prev_y))
        prev_row = cursor.fetchone()
        prev_avg = prev_row['average_aqi'] if prev_row else None
        
        # Get user count for participation
        cursor.execute("SELECT COUNT(id) as c FROM users WHERE village_name = ?", (village,))
        user_count = cursor.fetchone()['c']
        
        clean_air_score = _calc_clean_air_score(avg_aqi)
        imp_score, imp_pct = _calc_improvement_score(prev_avg, avg_aqi)
        uptime_score = _calc_uptime_score(days_with_readings, total_days)
        part_score = _calc_participation_score(user_count)
        hazard_penalty = _calc_hazard_penalty(hazard_count)
        
        final_score = clean_air_score + imp_score + uptime_score + part_score + hazard_penalty
        
        # Eligibility
        reward_status = 'not_eligible'
        if final_score >= 70 and avg_aqi <= 100 and uptime_score >= 10:
            reward_status = 'eligible'
            
        rankings_to_insert.append({
            'village': village,
            'avg_aqi': avg_aqi,
            'best_aqi': best_aqi,
            'worst_aqi': worst_aqi,
            'imp_pct': round(imp_pct, 2) if prev_avg else None,
            'part_score': part_score,
            'final_score': final_score,
            'reward_status': reward_status
        })
        
    # Sort by final score desc
    rankings_to_insert.sort(key=lambda x: x['final_score'], reverse=True)
    
    for i, r in enumerate(rankings_to_insert):
        rank_pos = i + 1
        cursor.execute('''
            INSERT INTO rankings (village_name, quarter, year, average_aqi, best_aqi, worst_aqi, 
                                reduction_percentage, participation_score, final_score, rank_position, reward_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (r['village'], quarter, year, r['avg_aqi'], r['best_aqi'], r['worst_aqi'], 
              r['imp_pct'], r['part_score'], r['final_score'], rank_pos, r['reward_status']))
              
    db.commit()
    return True, f"Ranking generated for {len(rankings_to_insert)} villages."


def get_rankings(filters=None):
    if filters is None:
        filters = {}
        
    db = get_db()
    cursor = db.cursor()
    
    query = "SELECT * FROM rankings WHERE 1=1"
    params = []
    
    if 'quarter' in filters:
        query += " AND quarter = ?"
        params.append(filters['quarter'].upper())
    if 'year' in filters:
        query += " AND year = ?"
        params.append(filters['year'])
    if 'reward_status' in filters:
        query += " AND reward_status = ?"
        params.append(filters['reward_status'])
        
    query += " ORDER BY year DESC, quarter DESC, rank_position ASC"
    
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    return True, [dict(row) for row in rows]


def get_current_ranking():
    db = get_db()
    cursor = db.cursor()
    
    # Find latest year and quarter that exists in the DB
    cursor.execute("SELECT quarter, year FROM rankings ORDER BY year DESC, quarter DESC LIMIT 1")
    row = cursor.fetchone()
    
    if not row:
        return False, "No rankings available."
        
    return get_rankings({'quarter': row['quarter'], 'year': row['year']})


def get_village_ranking(village_name):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM rankings WHERE village_name = ? ORDER BY year ASC, quarter ASC", (village_name,))
    rows = cursor.fetchall()
    return True, [dict(row) for row in rows]


def update_reward_status(ranking_id, status):
    valid_statuses = ['not_eligible', 'eligible', 'under_review', 'rewarded']
    if status not in valid_statuses:
        return False, "Invalid reward status."
        
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM rankings WHERE id = ?", (ranking_id,))
    if not cursor.fetchone():
        return False, "Ranking record not found."
        
    try:
        cursor.execute("UPDATE rankings SET reward_status = ? WHERE id = ?", (status, ranking_id))
        db.commit()
        return True, "Reward status updated successfully."
    except Exception as e:
        return False, str(e)
