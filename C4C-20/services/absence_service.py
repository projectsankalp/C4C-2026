"""
AarogyaNet Passive Absence Detection System.

Treats missed visits, unavailable patients, and broken continuity as
healthcare intelligence signals rather than missing data.

Public API:
    record_absence(data, asha_worker_id)           -> dict
    get_patient_absences(patient_id)               -> list[dict]
    compute_continuity(patient_id)                 -> dict
    get_absence_alerts(patient_id)                 -> list[dict]
    get_all_absence_alerts()                       -> list[dict]
    get_continuity_overview()                      -> list[dict]
"""

import json
import statistics
from datetime import datetime, timezone, timedelta
from typing import Optional

import psycopg2.extras

from database.postgres import get_db_connection


# ── Absence types ──────────────────────────────────────────────────────────────

ABSENCE_TYPES = {
    'missed_visit':            'Missed Scheduled Visit',
    'patient_unavailable':     'Patient Unavailable',
    'patient_refused':         'Patient Refused Assessment',
    'adherence_interruption':  'Adherence Continuity Interrupted',
    'contact_lost':            'Unable to Contact Patient',
    'family_reported_away':    'Patient Away (Family Reported)',
}

# Expected visit frequency — default 30 days for chronic disease monitoring
DEFAULT_VISIT_INTERVAL_DAYS = 30

# Alert thresholds
MISSED_VISIT_STREAK_ALERT    = 2   # alert after this many consecutive misses
DISAPPEARANCE_LOOKBACK_VISITS = 6  # look back this many confirmed visits
HIGH_RISK_UNAVAILABLE_ALERT  = 1   # flag on first unavailability for HIGH-risk patients


# ── Database helpers ───────────────────────────────────────────────────────────

def _get_conn():
    return get_db_connection()


def _fmt_date(dt) -> str:
    if dt is None:
        return '—'
    if isinstance(dt, str):
        return dt[:10]
    if isinstance(dt, datetime):
        return dt.strftime('%Y-%m-%d')
    return str(dt)[:10]


def _days_since(dt) -> Optional[int]:
    """Days since a datetime. Returns None if dt is None."""
    if dt is None:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - dt).days


# ── Record absence ─────────────────────────────────────────────────────────────

def record_absence(data: dict, asha_worker_id: int) -> dict:
    """
    Record a missed visit or patient-unavailable event.

    data keys:
        patient_id      : int   (required)
        absence_type    : str   from ABSENCE_TYPES (required)
        notes           : str   (optional)
        expected_date   : str   ISO date of the planned visit (optional)
    """
    patient_id   = data.get('patient_id')
    absence_type = data.get('absence_type', 'patient_unavailable')
    notes        = data.get('notes', '')
    expected_date = data.get('expected_date')

    if not patient_id:
        raise ValueError('patient_id is required')
    if absence_type not in ABSENCE_TYPES:
        absence_type = 'patient_unavailable'

    conn = _get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch patient latest risk for context
    cur.execute("""
        SELECT p.*, v.risk_score, v.risk_level
        FROM patients p
        LEFT JOIN asha_visits v ON v.patient_id = p.id
        ORDER BY v.visit_date DESC
        LIMIT 1
    """)
    # That query doesn't work right — do it properly
    cur.execute("SELECT * FROM patients WHERE id = %s", (patient_id,))
    patient = cur.fetchone()
    if not patient:
        cur.close(); conn.close()
        raise ValueError(f'Patient {patient_id} not found')

    # Latest risk
    cur.execute("""
        SELECT risk_score, risk_level FROM asha_visits
        WHERE patient_id = %s ORDER BY visit_date DESC LIMIT 1
    """, (patient_id,))
    latest_visit = cur.fetchone()
    risk_level = (latest_visit['risk_level'] if latest_visit else 'LOW') or 'LOW'

    # Insert absence record
    cur.execute("""
        INSERT INTO absence_events
            (patient_id, asha_worker_id, absence_type, notes,
             expected_date, latest_risk_level)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
    """, (
        patient_id, asha_worker_id, absence_type, notes,
        expected_date, risk_level,
    ))
    row = cur.fetchone()
    absence_id  = row['id']
    created_at  = row['created_at']

    conn.commit()
    cur.close()
    conn.close()

    return {
        'id':            absence_id,
        'patient_id':    patient_id,
        'patient_name':  dict(patient).get('full_name', ''),
        'absence_type':  absence_type,
        'absence_label': ABSENCE_TYPES[absence_type],
        'notes':         notes,
        'risk_level':    risk_level,
        'created_at':    created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at),
    }


# ── Fetch absence history ──────────────────────────────────────────────────────

def get_patient_absences(patient_id: int) -> list[dict]:
    """Return all absence events for a patient, newest first."""
    conn = _get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT a.*, u.full_name as asha_name
        FROM absence_events a
        JOIN users u ON u.id = a.asha_worker_id
        WHERE a.patient_id = %s
        ORDER BY a.created_at DESC
    """, (patient_id,))
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    for r in rows:
        r['absence_label'] = ABSENCE_TYPES.get(r.get('absence_type', ''), r.get('absence_type', ''))
        if hasattr(r.get('created_at'), 'isoformat'):
            r['created_at'] = r['created_at'].isoformat()
        if r.get('expected_date') and hasattr(r['expected_date'], 'isoformat'):
            r['expected_date'] = r['expected_date'].isoformat()
    return rows


# ── Continuity computation ─────────────────────────────────────────────────────

def compute_continuity(patient_id: int) -> dict:
    """
    Compute visit continuity intelligence for a patient.

    Returns a structured dict with:
        - visit_count, absence_count
        - last_visit_date, days_since_last_visit
        - continuity_score  (0–100, higher is better)
        - continuity_grade  (GOOD / MODERATE / POOR / CRITICAL)
        - missed_streak     (current consecutive absence streak)
        - max_missed_streak (historical max)
        - sudden_disappearance (bool)
        - regularity_label
        - absence_rate
        - narrative
        - risk_influence    (str: NONE / MODERATE / HIGH)
        - escalation_flag   (bool)
    """
    conn = _get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # All completed visits
    cur.execute("""
        SELECT id, visit_date, risk_score, risk_level
        FROM asha_visits
        WHERE patient_id = %s
        ORDER BY visit_date ASC
    """, (patient_id,))
    visits = [dict(r) for r in cur.fetchall()]

    # All absence events
    cur.execute("""
        SELECT id, absence_type, latest_risk_level, created_at, expected_date
        FROM absence_events
        WHERE patient_id = %s
        ORDER BY created_at ASC
    """, (patient_id,))
    absences = [dict(r) for r in cur.fetchall()]

    # Patient record
    cur.execute("SELECT * FROM patients WHERE id = %s", (patient_id,))
    patient = cur.fetchone()

    cur.close()
    conn.close()

    if not patient:
        return {'has_data': False, 'error': 'Patient not found'}

    visit_count   = len(visits)
    absence_count = len(absences)
    total_events  = visit_count + absence_count

    if total_events == 0:
        return {
            'has_data':          False,
            'visit_count':       0,
            'absence_count':     0,
            'continuity_score':  None,
            'continuity_grade':  'NO_DATA',
            'narrative':         'No visits or absence events recorded for this patient.',
            'risk_influence':    'NONE',
            'escalation_flag':   False,
        }

    # ── Days since last visit ─────────────────────────────────────────────────
    last_visit_date  = visits[-1]['visit_date'] if visits else None
    days_since_visit = _days_since(last_visit_date)

    # ── Absence rate ─────────────────────────────────────────────────────────
    absence_rate = round(absence_count / total_events, 3) if total_events else 0

    # ── Current missed streak (consecutive absences at end of timeline) ───────
    # Build a merged chronological event list
    events = []
    for v in visits:
        events.append(('visit', v['visit_date']))
    for a in absences:
        events.append(('absence', a['created_at']))
    events.sort(key=lambda x: str(x[1]))

    missed_streak = 0
    for kind, _ in reversed(events):
        if kind == 'absence':
            missed_streak += 1
        else:
            break

    max_missed_streak = 0
    run = 0
    for kind, _ in events:
        if kind == 'absence':
            run += 1
            max_missed_streak = max(max_missed_streak, run)
        else:
            run = 0

    # ── Sudden disappearance detection ────────────────────────────────────────
    # Previously consistent patient (≥ DISAPPEARANCE_LOOKBACK_VISITS completed)
    # who now has ≥ 2 absences and no recent visit in 60 days
    sudden_disappearance = False
    if (visit_count >= DISAPPEARANCE_LOOKBACK_VISITS
            and missed_streak >= 2
            and days_since_visit is not None
            and days_since_visit >= 60):
        sudden_disappearance = True

    # Previously compliant (< 20% miss rate) now missing
    previously_compliant = (
        visit_count >= 3
        and (absence_count / max(1, total_events - max(0, total_events - visit_count))) < 0.2
    )
    first_miss_after_compliance = (
        previously_compliant
        and absence_count >= 1
        and visit_count >= 4
    )

    # ── Continuity score (0–100) ──────────────────────────────────────────────
    score = 100

    # Penalise absence rate
    score -= int(absence_rate * 50)

    # Penalise missed streak
    score -= min(30, missed_streak * 12)

    # Penalise days since last visit (beyond 45 days)
    if days_since_visit is not None and days_since_visit > 45:
        overdue_penalty = min(20, (days_since_visit - 45) // 5)
        score -= overdue_penalty

    # Penalise sudden disappearance
    if sudden_disappearance:
        score -= 20

    score = max(0, min(100, score))

    # ── Continuity grade ──────────────────────────────────────────────────────
    if score >= 75:
        grade = 'GOOD'
    elif score >= 50:
        grade = 'MODERATE'
    elif score >= 25:
        grade = 'POOR'
    else:
        grade = 'CRITICAL'

    # ── Visit interval regularity ─────────────────────────────────────────────
    if visit_count >= 2:
        visit_dates = [v['visit_date'] for v in visits]
        gaps = []
        for i in range(1, len(visit_dates)):
            a, b = visit_dates[i-1], visit_dates[i]
            if isinstance(a, str):
                a = datetime.fromisoformat(a)
            if isinstance(b, str):
                b = datetime.fromisoformat(b)
            gaps.append(abs((b - a).days))
        mean_gap = statistics.mean(gaps) if gaps else 0
        std_gap  = statistics.stdev(gaps) if len(gaps) >= 2 else 0
        cv       = (std_gap / mean_gap) if mean_gap > 0 else 0
        if cv < 0.3:
            regularity_label = 'REGULAR'
        elif cv < 0.6:
            regularity_label = 'IRREGULAR'
        else:
            regularity_label = 'VERY_IRREGULAR'
        mean_gap_days = round(mean_gap, 0)
    else:
        regularity_label = 'INSUFFICIENT_DATA'
        mean_gap_days    = None

    # ── Risk influence ────────────────────────────────────────────────────────
    # Latest risk level of patient from absence events or visits
    latest_risk = 'LOW'
    if absences:
        latest_risk = absences[-1].get('latest_risk_level') or 'LOW'
    elif visits:
        latest_risk = visits[-1].get('risk_level') or 'LOW'

    escalation_flag = False
    if latest_risk == 'HIGH' and (
        missed_streak >= HIGH_RISK_UNAVAILABLE_ALERT
        or sudden_disappearance
    ):
        escalation_flag = True

    if missed_streak >= MISSED_VISIT_STREAK_ALERT and latest_risk == 'HIGH':
        risk_influence = 'HIGH'
    elif missed_streak >= MISSED_VISIT_STREAK_ALERT or sudden_disappearance:
        risk_influence = 'MODERATE'
    else:
        risk_influence = 'NONE'

    # ── Narrative ─────────────────────────────────────────────────────────────
    parts = []
    if visit_count == 0:
        parts.append('No completed visits on record.')
    else:
        parts.append(
            f'{visit_count} completed visit{"s" if visit_count != 1 else ""}'
            + (f', last on {_fmt_date(last_visit_date)}' if last_visit_date else '')
            + (f' ({days_since_visit} days ago)' if days_since_visit is not None else '')
            + '.'
        )

    if absence_count:
        parts.append(
            f'{absence_count} missed/unavailable event{"s" if absence_count != 1 else ""} recorded '
            f'({round(absence_rate * 100)}% of all scheduled contacts).'
        )

    if missed_streak >= MISSED_VISIT_STREAK_ALERT:
        parts.append(
            f'ALERT: {missed_streak} consecutive missed contacts — adherence counselling required.'
        )

    if sudden_disappearance:
        parts.append(
            f'DISAPPEARANCE SIGNAL: previously consistent patient ({visit_count} prior visits) '
            f'now unreachable for {days_since_visit} days.'
        )

    if first_miss_after_compliance:
        parts.append(
            f'COMPLIANCE BREAK: first absence detected after {visit_count} consecutive visits.'
        )

    if escalation_flag:
        parts.append(
            f'ESCALATION FLAG: HIGH-risk patient is currently unavailable — supervisor notification indicated.'
        )

    narrative = ' '.join(parts)

    return {
        'has_data':               True,
        'visit_count':            visit_count,
        'absence_count':          absence_count,
        'total_events':           total_events,
        'last_visit_date':        _fmt_date(last_visit_date),
        'days_since_last_visit':  days_since_visit,
        'absence_rate':           absence_rate,
        'absence_rate_pct':       round(absence_rate * 100, 1),
        'missed_streak':          missed_streak,
        'max_missed_streak':      max_missed_streak,
        'sudden_disappearance':   sudden_disappearance,
        'first_miss_after_compliance': first_miss_after_compliance,
        'regularity_label':       regularity_label,
        'mean_gap_days':          mean_gap_days,
        'continuity_score':       score,
        'continuity_grade':       grade,
        'risk_influence':         risk_influence,
        'escalation_flag':        escalation_flag,
        'latest_risk_level':      latest_risk,
        'narrative':              narrative,
    }


# ── Absence alerts for one patient ────────────────────────────────────────────

def get_absence_alerts(patient_id: int) -> list[dict]:
    """
    Generate prioritised absence alerts for a single patient.

    Returns a list of alert dicts:
        severity:    CRITICAL | HIGH | MEDIUM | LOW
        type:        alert type key
        message:     human-readable alert string
        date:        relevant date
    """
    continuity = compute_continuity(patient_id)
    if not continuity.get('has_data'):
        return []

    alerts = []
    streak   = continuity['missed_streak']
    score    = continuity['continuity_score']
    risk     = continuity['latest_risk_level']
    days_ago = continuity['days_since_last_visit']

    if continuity['escalation_flag']:
        alerts.append({
            'severity': 'CRITICAL',
            'type':     'HIGH_RISK_UNAVAILABLE',
            'message':  (
                f'HIGH-risk patient has been unreachable for {days_ago} days. '
                'Immediate supervisor escalation recommended.'
            ),
            'date': continuity['last_visit_date'],
        })

    if continuity['sudden_disappearance']:
        alerts.append({
            'severity': 'HIGH',
            'type':     'SUDDEN_DISAPPEARANCE',
            'message':  (
                f'Sudden disappearance after {continuity["visit_count"]} consistent visits. '
                f'Patient has been absent for {days_ago} days.'
            ),
            'date': continuity['last_visit_date'],
        })

    if streak >= MISSED_VISIT_STREAK_ALERT and not continuity['escalation_flag']:
        alerts.append({
            'severity': 'HIGH' if risk == 'HIGH' else 'MEDIUM',
            'type':     'CONSECUTIVE_MISSES',
            'message':  (
                f'Patient unavailable for {streak} consecutive scheduled contacts. '
                'Field visit and adherence counselling required.'
            ),
            'date': continuity['last_visit_date'],
        })

    if continuity['first_miss_after_compliance']:
        alerts.append({
            'severity': 'MEDIUM',
            'type':     'FIRST_MISS_AFTER_COMPLIANCE',
            'message':  (
                f'First missed visit after {continuity["visit_count"]} compliant visits. '
                'May indicate new barriers — proactive contact recommended.'
            ),
            'date': continuity['last_visit_date'],
        })

    if days_ago is not None and days_ago > 60 and not alerts:
        alerts.append({
            'severity': 'MEDIUM',
            'type':     'OVERDUE_VISIT',
            'message':  (
                f'No visit in {days_ago} days (standard interval: {DEFAULT_VISIT_INTERVAL_DAYS} days). '
                'Schedule follow-up.'
            ),
            'date': continuity['last_visit_date'],
        })

    if score is not None and score < 30 and not any(a['severity'] == 'CRITICAL' for a in alerts):
        alerts.append({
            'severity': 'HIGH',
            'type':     'LOW_CONTINUITY_SCORE',
            'message':  (
                f'Continuity score critically low ({score}/100). '
                'Patient engagement infrastructure broken — review and escalate.'
            ),
            'date': continuity['last_visit_date'],
        })

    return sorted(alerts, key=lambda a: {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}[a['severity']])


# ── Doctor: all-patient absence alerts ────────────────────────────────────────

def get_all_absence_alerts() -> list[dict]:
    """
    Return absence alerts for ALL patients, sorted by severity.
    Used for the doctor's continuity intelligence panel.
    """
    conn = _get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, full_name, village FROM patients ORDER BY full_name")
    patients = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()

    results = []
    for p in patients:
        alerts = get_absence_alerts(p['id'])
        if alerts:
            continuity = compute_continuity(p['id'])
            results.append({
                'patient_id':       p['id'],
                'patient_name':     p['full_name'],
                'village':          p['village'],
                'top_alert':        alerts[0],
                'alert_count':      len(alerts),
                'continuity_score': continuity.get('continuity_score'),
                'continuity_grade': continuity.get('continuity_grade'),
                'missed_streak':    continuity.get('missed_streak', 0),
                'days_since_visit': continuity.get('days_since_last_visit'),
                'latest_risk_level': continuity.get('latest_risk_level', 'LOW'),
                'escalation_flag':  continuity.get('escalation_flag', False),
            })

    sev_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    results.sort(key=lambda r: sev_order.get(r['top_alert']['severity'], 9))
    return results


# ── Continuity overview (doctor dashboard table) ───────────────────────────────

def get_continuity_overview() -> list[dict]:
    """
    Continuity summary for ALL patients.
    Returns lightweight dicts suitable for a dashboard table.
    """
    conn = _get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, full_name, village FROM patients ORDER BY full_name")
    patients = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()

    results = []
    for p in patients:
        c = compute_continuity(p['id'])
        results.append({
            'patient_id':       p['id'],
            'patient_name':     p['full_name'],
            'village':          p['village'],
            'visit_count':      c.get('visit_count', 0),
            'absence_count':    c.get('absence_count', 0),
            'continuity_score': c.get('continuity_score'),
            'continuity_grade': c.get('continuity_grade', 'NO_DATA'),
            'missed_streak':    c.get('missed_streak', 0),
            'days_since_visit': c.get('days_since_last_visit'),
            'regularity_label': c.get('regularity_label', 'INSUFFICIENT_DATA'),
            'escalation_flag':  c.get('escalation_flag', False),
            'latest_risk_level': c.get('latest_risk_level', 'LOW'),
            'has_alerts':       len(get_absence_alerts(p['id'])) > 0,
        })

    # Sort: escalation flags first, then by continuity score ascending (worst first)
    results.sort(key=lambda r: (
        0 if r['escalation_flag'] else 1,
        (r['continuity_score'] or 100),
    ))
    return results
