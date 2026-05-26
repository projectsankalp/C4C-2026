"""
AarogyaNet Passive Clinical Memory (PCM) — Longitudinal Analysis Engine.

Transforms isolated visit records into structured healthcare intelligence
by computing deterministic trends, first-deviation detections, pathway
histories, adherence trajectories, and clinical alert narratives across
a patient's full visit history.

No ML, no AI, no prediction — pure deterministic rule analysis.

Public API:
    build_longitudinal_summary(patient_id) -> dict
    build_snapshot(patient_id)             -> dict   # lightweight version
"""

import json
import statistics
from datetime import datetime, timezone
from typing import Any

import psycopg2.extras

from database.postgres import get_db_connection


# ── Data loading ──────────────────────────────────────────────────────────────

def load_patient_visits(patient_id: int) -> tuple[dict | None, list[dict]]:
    """
    Fetch the patient record and all visits ordered oldest → newest.

    Returns (patient_dict, visits_list).
    gcpe_data fields are already parsed to Python dicts by psycopg2.
    """
    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT * FROM patients WHERE id = %s", (patient_id,))
    patient = cur.fetchone()

    cur.execute("""
        SELECT id, visit_date, bp_systolic, bp_diastolic, pulse, temperature,
               dizziness, chest_pain, medicine_missed,
               risk_score, risk_level, gcpe_data, notes
        FROM asha_visits
        WHERE patient_id = %s
        ORDER BY visit_date ASC
    """, (patient_id,))
    visits = [dict(r) for r in cur.fetchall()]

    cur.close()
    conn.close()

    # Normalise gcpe_data — may arrive as string if stored via non-JSON path
    for v in visits:
        gd = v.get('gcpe_data')
        if isinstance(gd, str):
            try:
                v['gcpe_data'] = json.loads(gd)
            except (json.JSONDecodeError, TypeError):
                v['gcpe_data'] = {}
        elif gd is None:
            v['gcpe_data'] = {}

    return (dict(patient) if patient else None), visits


def _gcpe(visit: dict) -> dict:
    """Safe accessor for gcpe_data sub-dict."""
    return visit.get('gcpe_data') or {}


def _pathways(visit: dict) -> list:
    return _gcpe(visit).get('pathways', [])


def _fmt_date(dt) -> str:
    if dt is None:
        return '—'
    if isinstance(dt, str):
        return dt[:10]
    return dt.strftime('%Y-%m-%d')


def _days_between(a, b) -> int:
    """Days between two datetime-like objects."""
    try:
        if isinstance(a, str):
            a = datetime.fromisoformat(a)
        if isinstance(b, str):
            b = datetime.fromisoformat(b)
        return abs((b - a).days)
    except Exception:
        return 0


# ── BP trend analysis ─────────────────────────────────────────────────────────

def analyze_bp_trend(visits: list) -> dict:
    """
    Classify systolic BP progression over all visits.

    Direction:
        IMPROVING  — recent average ≥ 10 mmHg lower than baseline
        WORSENING  — recent average ≥ 10 mmHg higher than baseline
        VOLATILE   — standard deviation ≥ 15 mmHg
        STABLE     — variation within ±10 mmHg
        SINGLE     — only one reading available
    """
    readings = [
        (v['visit_date'], int(v['bp_systolic']), int(v.get('bp_diastolic') or 0))
        for v in visits
        if v.get('bp_systolic')
    ]

    if not readings:
        return {'direction': 'NO_DATA', 'readings': [], 'narrative': 'No BP readings recorded.'}

    systolics = [r[1] for r in readings]

    if len(systolics) == 1:
        return {
            'direction': 'SINGLE',
            'baseline_systolic': systolics[0],
            'recent_systolic':   systolics[0],
            'delta': 0,
            'readings': systolics,
            'narrative': f'Single BP reading: {systolics[0]} mmHg — longitudinal trend not yet computable.',
        }

    # Baseline = mean of earliest readings (up to 2), Recent = mean of latest (up to 2)
    baseline_n = min(2, max(1, len(systolics) // 3))
    recent_n   = min(2, max(1, len(systolics) // 3))
    baseline   = statistics.mean(systolics[:baseline_n])
    recent     = statistics.mean(systolics[-recent_n:])
    delta      = round(recent - baseline, 1)

    std = statistics.stdev(systolics) if len(systolics) >= 2 else 0

    if std >= 15:
        direction = 'VOLATILE'
        narrative = (
            f'BP is volatile — standard deviation {std:.0f} mmHg across '
            f'{len(systolics)} readings (range {min(systolics)}–{max(systolics)} mmHg). '
            'Assess measurement technique and inter-visit variability.'
        )
    elif delta >= 10:
        direction = 'WORSENING'
        narrative = (
            f'Systolic BP worsening: baseline {baseline:.0f} mmHg → '
            f'recent {recent:.0f} mmHg (Δ +{delta} mmHg over {len(systolics)} visits). '
            'Medication review and lifestyle counselling indicated.'
        )
    elif delta <= -10:
        direction = 'IMPROVING'
        narrative = (
            f'Systolic BP improving: baseline {baseline:.0f} mmHg → '
            f'recent {recent:.0f} mmHg (Δ {delta} mmHg over {len(systolics)} visits). '
            'Continue current treatment plan.'
        )
    else:
        direction = 'STABLE'
        narrative = (
            f'BP stable: baseline {baseline:.0f} mmHg → recent {recent:.0f} mmHg '
            f'(Δ {delta:+.0f} mmHg over {len(systolics)} visits).'
        )

    return {
        'direction':          direction,
        'baseline_systolic':  round(baseline, 1),
        'recent_systolic':    round(recent, 1),
        'delta':              delta,
        'std_dev':            round(std, 1),
        'min':                min(systolics),
        'max':                max(systolics),
        'readings':           systolics,
        'dates':              [_fmt_date(r[0]) for r in readings],
        'narrative':          narrative,
    }


# ── Risk trajectory ───────────────────────────────────────────────────────────

def analyze_risk_trajectory(visits: list) -> dict:
    """
    Classify risk score progression over all visits.

    Direction: ESCALATING | IMPROVING | STABLE
    """
    scores = [
        (v['visit_date'], int(v.get('risk_score') or 0), v.get('risk_level', 'LOW'))
        for v in visits
    ]

    if not scores:
        return {'direction': 'NO_DATA', 'scores': [], 'narrative': 'No risk scores recorded.'}

    score_vals   = [s[1] for s in scores]
    levels       = [s[2] for s in scores]
    dates        = [_fmt_date(s[0]) for s in scores]

    if len(score_vals) == 1:
        return {
            'direction': 'SINGLE',
            'scores':    score_vals,
            'levels':    levels,
            'dates':     dates,
            'baseline':  score_vals[0],
            'recent':    score_vals[0],
            'peak':      score_vals[0],
            'narrative': f'Single visit — risk score {score_vals[0]} ({levels[0]}).',
        }

    baseline_n = min(2, max(1, len(score_vals) // 3))
    recent_n   = min(2, max(1, len(score_vals) // 3))
    baseline   = statistics.mean(score_vals[:baseline_n])
    recent     = statistics.mean(score_vals[-recent_n:])
    delta      = round(recent - baseline, 1)
    peak       = max(score_vals)
    peak_date  = dates[score_vals.index(peak)]

    if delta >= 15:
        direction = 'ESCALATING'
    elif delta <= -15:
        direction = 'IMPROVING'
    else:
        direction = 'STABLE'

    score_str = ' → '.join(str(s) for s in score_vals)
    narrative = (
        f'Risk progression: {score_str} across {len(score_vals)} visits. '
        f'Baseline: {baseline:.0f} → Recent: {recent:.0f} (Δ {delta:+.0f}). '
        f'Peak: {peak} on {peak_date}.'
    )

    return {
        'direction':  direction,
        'scores':     score_vals,
        'levels':     levels,
        'dates':      dates,
        'baseline':   round(baseline, 1),
        'recent':     round(recent, 1),
        'peak':       peak,
        'peak_date':  peak_date,
        'delta':      delta,
        'narrative':  narrative,
    }


# ── Adherence trajectory ──────────────────────────────────────────────────────

def analyze_adherence_trajectory(visits: list) -> dict:
    """
    Compute medication adherence patterns over the full visit history.

    Adherence % = (visits with medicine_missed=False) / total * 100
    Trend is computed from the most recent 3 visits vs the prior 3.
    """
    if not visits:
        return {'trend': 'NO_DATA', 'narrative': 'No visit data for adherence analysis.'}

    total   = len(visits)
    missed  = [v for v in visits if v.get('medicine_missed')]
    adhered = total - len(missed)
    pct     = round((adhered / total) * 100, 1)

    # Extract reasons from gcpe_data
    reasons: dict[str, int] = {}
    consecutive = 0
    max_consecutive = 0
    run = 0
    for v in visits:
        reason = _gcpe(v).get('answers', {}).get('missed_reason', '')
        if v.get('medicine_missed'):
            run += 1
            max_consecutive = max(max_consecutive, run)
            if reason:
                reasons[reason] = reasons.get(reason, 0) + 1
        else:
            run = 0

    # Current consecutive streak
    consecutive = 0
    for v in reversed(visits):
        if v.get('medicine_missed'):
            consecutive += 1
        else:
            break

    # Trend from recent 3 vs prior 3
    def _missed_rate(subset):
        if not subset:
            return 0.0
        return sum(1 for v in subset if v.get('medicine_missed')) / len(subset)

    recent_3 = visits[-3:]
    prior_3  = visits[-6:-3] if len(visits) >= 6 else visits[:max(0, len(visits)-3)]
    recent_rate = _missed_rate(recent_3)
    prior_rate  = _missed_rate(prior_3)

    delta = recent_rate - prior_rate
    if delta >= 0.25:
        trend = 'WORSENING'
    elif delta <= -0.25:
        trend = 'IMPROVING'
    elif pct >= 80:
        trend = 'GOOD'
    else:
        trend = 'STABLE'

    narrative = (
        f'{pct}% adherence ({adhered} of {total} visits with medication taken). '
    )
    if consecutive >= 2:
        narrative += f'Currently {consecutive} consecutive missed doses — urgent counselling. '
    if reasons:
        top_reason = max(reasons, key=reasons.get)
        narrative += f'Primary barrier: "{top_reason}" ({reasons[top_reason]}×).'

    return {
        'trend':               trend,
        'total_visits':        total,
        'missed_count':        len(missed),
        'adherence_pct':       pct,
        'missed_reasons':      reasons,
        'max_consecutive_miss':max_consecutive,
        'current_consecutive_miss': consecutive,
        'narrative':           narrative,
    }


# ── First-deviation detection ─────────────────────────────────────────────────

def detect_first_deviations(visits: list) -> list[dict]:
    """
    Detect and date the first occurrence of each clinically significant event.

    Returns a list of deviation events ordered by date.
    """
    if not visits:
        return []

    deviations = []

    seen_abnormal_bp  = False
    seen_chest_pain   = False
    seen_dizziness    = False
    seen_meds_missed  = False
    seen_crisis       = False
    seen_escalation   = False
    seen_tachycardia  = False

    # Determine stable baseline: avg systolic from visits with bp_systolic < 140
    normal_bps = [
        int(v['bp_systolic']) for v in visits
        if v.get('bp_systolic') and int(v['bp_systolic']) < 140
    ]
    baseline_sys = round(statistics.mean(normal_bps), 0) if normal_bps else None

    for v in visits:
        date     = _fmt_date(v['visit_date'])
        bp_s     = int(v.get('bp_systolic') or 0)
        bp_d     = int(v.get('bp_diastolic') or 0)
        pathways = _pathways(v)

        # First abnormal BP (≥140 systolic) after a stable baseline
        if not seen_abnormal_bp and bp_s >= 140:
            seen_abnormal_bp = True
            baseline_str = f'{baseline_sys:.0f} mmHg baseline' if baseline_sys else 'no prior normal baseline'
            deviations.append({
                'type':        'FIRST_ABNORMAL_BP',
                'date':        date,
                'value':       f'{bp_s}/{bp_d} mmHg',
                'severity':    'HIGH' if bp_s >= 180 else 'MEDIUM',
                'description': (
                    f'First BP reading at or above Stage 1 threshold (140/90) '
                    f'— {bp_s}/{bp_d} mmHg vs {baseline_str}.'
                ),
            })

        # First hypertensive crisis (BP ≥180 or diastolic ≥110)
        if not seen_crisis and (bp_s >= 180 or bp_d >= 110 or
                                'hypertensive_crisis' in pathways or
                                'crisis_escalation' in pathways):
            seen_crisis = True
            deviations.append({
                'type':        'FIRST_HYPERTENSIVE_CRISIS',
                'date':        date,
                'value':       f'{bp_s}/{bp_d} mmHg' if bp_s else '—',
                'severity':    'CRITICAL',
                'description': (
                    f'First hypertensive crisis event — BP {bp_s}/{bp_d} mmHg. '
                    'Immediate specialist review and hospital referral protocol activated.'
                ),
            })

        # First chest pain
        if not seen_chest_pain and v.get('chest_pain'):
            seen_chest_pain = True
            deviations.append({
                'type':        'FIRST_CHEST_PAIN',
                'date':        date,
                'value':       None,
                'severity':    'HIGH',
                'description': 'First chest pain episode reported across all visit history.',
            })

        # First dizziness
        if not seen_dizziness and v.get('dizziness'):
            seen_dizziness = True
            deviations.append({
                'type':        'FIRST_DIZZINESS',
                'date':        date,
                'value':       None,
                'severity':    'MEDIUM',
                'description': 'First dizziness episode reported — investigate orthostatic hypotension.',
            })

        # First missed medication
        if not seen_meds_missed and v.get('medicine_missed'):
            seen_meds_missed = True
            reason = _gcpe(v).get('answers', {}).get('missed_reason', '')
            deviations.append({
                'type':        'FIRST_MEDICATION_MISS',
                'date':        date,
                'value':       reason or None,
                'severity':    'MEDIUM',
                'description': (
                    'First antihypertensive medication miss recorded'
                    + (f' — reason: {reason}' if reason else '') + '.'
                ),
            })

        # First crisis escalation (patient refused referral)
        if not seen_escalation and 'crisis_escalation' in pathways:
            seen_escalation = True
            deviations.append({
                'type':        'FIRST_CRISIS_ESCALATION',
                'date':        date,
                'value':       None,
                'severity':    'CRITICAL',
                'description': (
                    'First documented refusal of emergency referral during hypertensive crisis. '
                    'Supervisor notification protocol activated.'
                ),
            })

        # First tachycardia
        pulse = int(v.get('pulse') or 0)
        if not seen_tachycardia and pulse > 100:
            seen_tachycardia = True
            deviations.append({
                'type':        'FIRST_TACHYCARDIA',
                'date':        date,
                'value':       f'{pulse} bpm',
                'severity':    'MEDIUM',
                'description': f'First tachycardia reading ({pulse} bpm > 100 bpm).',
            })

    # Sort by severity then date
    sev_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    deviations.sort(key=lambda d: (sev_order.get(d['severity'], 9), d['date']))

    return deviations


# ── Pathway history ───────────────────────────────────────────────────────────

def analyze_pathway_history(visits: list) -> dict:
    """
    Aggregate all GCPE pathway triggers across the patient's visit history.

    Returns frequency counts, first/last dates, and escalation event counts.
    """
    pathway_stats: dict[str, dict] = {}
    escalation_events = 0
    crisis_events     = 0

    for v in visits:
        date = _fmt_date(v['visit_date'])
        for pid in _pathways(v):
            if pid not in pathway_stats:
                pathway_stats[pid] = {'count': 0, 'first_date': date, 'last_date': date}
            pathway_stats[pid]['count']     += 1
            pathway_stats[pid]['last_date']  = date

        if 'crisis_escalation' in _pathways(v):
            escalation_events += 1
        if any(p in _pathways(v) for p in ('hypertensive_crisis', 'crisis_escalation')):
            crisis_events += 1

    total_events = sum(p['count'] for p in pathway_stats.values())

    return {
        'total_pathway_events': total_events,
        'pathways':             pathway_stats,
        'escalation_events':    escalation_events,
        'crisis_events':        crisis_events,
        'unique_pathways':      list(pathway_stats.keys()),
    }


# ── Symptom frequency ─────────────────────────────────────────────────────────

def analyze_symptom_frequency(visits: list) -> dict:
    """
    Compute per-symptom occurrence rates and flag recurring patterns.
    """
    if not visits:
        return {}

    n = len(visits)

    def rate(field):
        count = sum(1 for v in visits if v.get(field))
        return {'count': count, 'rate': round(count / n, 3), 'pct': round(count / n * 100, 1)}

    diz  = rate('dizziness')
    chest = rate('chest_pain')
    meds  = rate('medicine_missed')

    return {
        'dizziness':           diz,
        'chest_pain':          chest,
        'medicine_missed':     meds,
        'recurring_dizziness': diz['count'] >= 3,
        'recurring_chest_pain':chest['count'] >= 2,
        'chronic_non_adherence': meds['rate'] >= 0.5,
    }


# ── Sudden escalation detector ────────────────────────────────────────────────

def detect_sudden_escalations(visits: list) -> list[dict]:
    """
    Detect visits where risk score jumped ≥ 20 points from the previous visit.
    These are clinically significant acute episodes.
    """
    events = []
    for i in range(1, len(visits)):
        prev = int(visits[i-1].get('risk_score') or 0)
        curr = int(visits[i].get('risk_score') or 0)
        delta = curr - prev
        if delta >= 20:
            events.append({
                'date':      _fmt_date(visits[i]['visit_date']),
                'from_score': prev,
                'to_score':   curr,
                'delta':      delta,
                'description': (
                    f'Sudden risk escalation: score jumped from {prev} to {curr} '
                    f'(Δ +{delta}) between visits.'
                ),
            })
    return events


# ── Clinical alert generation ─────────────────────────────────────────────────

def generate_clinical_alerts(
    bp_trend:   dict,
    risk_traj:  dict,
    adherence:  dict,
    deviations: list,
    pathways:   dict,
    symptoms:   dict,
    escalations: list,
) -> list[str]:
    """
    Produce a prioritised list of human-readable clinical alerts
    based on longitudinal analysis results.
    """
    alerts = []

    # BP trend alerts
    if bp_trend.get('direction') == 'WORSENING':
        alerts.append(
            f"BP WORSENING: systolic increased {bp_trend['baseline_systolic']:.0f} → "
            f"{bp_trend['recent_systolic']:.0f} mmHg "
            f"(Δ +{bp_trend['delta']} mmHg). Medication review required."
        )
    elif bp_trend.get('direction') == 'VOLATILE':
        alerts.append(
            f"BP VOLATILE: std deviation {bp_trend.get('std_dev',0):.0f} mmHg across "
            f"{len(bp_trend.get('readings',[]))} readings. Investigate inconsistent measurement or compliance."
        )

    # Risk trajectory alerts
    if risk_traj.get('direction') == 'ESCALATING':
        alerts.append(
            f"RISK ESCALATING: score increased from {risk_traj['baseline']:.0f} "
            f"to {risk_traj['recent']:.0f} (Δ +{risk_traj['delta']:.0f}). "
            f"Peak: {risk_traj['peak']} on {risk_traj.get('peak_date','—')}."
        )

    # Crisis events
    crisis_count = pathways.get('crisis_events', 0)
    if crisis_count >= 2:
        alerts.append(
            f"REPEATED CRISES: {crisis_count} hypertensive crisis events recorded — "
            "urgent specialist referral and intensive management needed."
        )
    elif crisis_count == 1:
        alerts.append(
            "FIRST CRISIS EVENT: hypertensive crisis documented — "
            "specialist review and medication adjustment required."
        )

    # Escalation refusals
    esc_count = pathways.get('escalation_events', 0)
    if esc_count:
        alerts.append(
            f"REFERRAL REFUSED {esc_count}×: patient has refused emergency referral "
            "during hypertensive crisis — document and escalate to supervisor."
        )

    # Adherence alerts
    pct = adherence.get('adherence_pct', 100)
    cons = adherence.get('current_consecutive_miss', 0)
    if cons >= 2:
        alerts.append(
            f"CONSECUTIVE MISSES: {cons} consecutive visits with missed medication — "
            "immediate adherence counselling required."
        )
    elif pct < 60:
        top = max(adherence.get('missed_reasons', {}).items(),
                  key=lambda x: x[1], default=(None, 0))
        reason_str = f' (primary barrier: "{top[0]}")' if top[0] else ''
        alerts.append(
            f"POOR ADHERENCE: {pct}% medication adherence{reason_str}. "
            "Social barriers assessment and JanAushadi supply check recommended."
        )

    # Symptom recurrence
    if symptoms.get('recurring_dizziness'):
        alerts.append(
            f"RECURRING DIZZINESS: {symptoms['dizziness']['count']} episodes across visit history. "
            "Investigate orthostatic hypotension or cerebral hypoperfusion."
        )
    if symptoms.get('recurring_chest_pain'):
        alerts.append(
            f"RECURRING CHEST PAIN: {symptoms['chest_pain']['count']} episodes. "
            "Cardiac evaluation and ECG referral indicated."
        )

    # Sudden escalations
    for e in escalations[:2]:  # Cap at 2 to avoid noise
        alerts.append(f"SUDDEN ESCALATION on {e['date']}: {e['description']}")

    # First deviations (CRITICAL and HIGH only)
    for d in deviations:
        if d['severity'] in ('CRITICAL', 'HIGH'):
            alerts.append(f"DEVIATION [{d['type']}] on {d['date']}: {d['description']}")

    return alerts


# ── Doctor narrative ──────────────────────────────────────────────────────────

def generate_doctor_summary(
    patient:     dict,
    visits:      list,
    bp_trend:    dict,
    risk_traj:   dict,
    adherence:   dict,
    pathway_hist:dict,
    symptoms:    dict,
    days_tracked:int,
) -> str:
    """
    One-paragraph narrative for the doctor dashboard.
    Synthesises all longitudinal dimensions into plain clinical language.
    """
    n = len(visits)
    if n == 0:
        return "No visit history available for longitudinal analysis."

    name = patient.get('full_name', 'Patient')
    age  = patient.get('age') or '?'

    parts = [
        f"{name} (age {age}) — {n}-visit record over {days_tracked} days."
    ]

    bp_dir = bp_trend.get('direction', 'NO_DATA')
    if bp_dir not in ('NO_DATA', 'SINGLE'):
        bp_base   = bp_trend.get('baseline_systolic', '?')
        bp_recent = bp_trend.get('recent_systolic', '?')
        parts.append(f"BP trajectory: {bp_dir} ({bp_base:.0f}→{bp_recent:.0f} mmHg).")

    r_dir = risk_traj.get('direction', 'NO_DATA')
    if r_dir not in ('NO_DATA', 'SINGLE') and risk_traj.get('scores'):
        scores = risk_traj['scores']
        score_str = ' → '.join(str(s) for s in scores[-5:])
        parts.append(f"Risk trajectory: {r_dir} ({score_str}).")

    pct = adherence.get('adherence_pct')
    if pct is not None:
        parts.append(f"Medication adherence: {pct}% ({adherence.get('missed_count',0)} missed of {n} visits).")

    # Pathway summary
    pw = pathway_hist.get('pathways', {})
    if pw:
        pw_str = ', '.join(
            f"{k.replace('_',' ')} (×{v['count']})"
            for k, v in sorted(pw.items(), key=lambda x: -x[1]['count'])
        )
        parts.append(f"GCPE pathways triggered: {pw_str}.")

    # Crisis / escalation flags
    if pathway_hist.get('crisis_events', 0):
        parts.append(
            f"⚠ {pathway_hist['crisis_events']} hypertensive crisis event(s) on record."
        )
    if pathway_hist.get('escalation_events', 0):
        parts.append(
            f"⚠ {pathway_hist['escalation_events']} referral refusal(s) documented."
        )

    return ' '.join(parts)


# ── Main public function ──────────────────────────────────────────────────────

def analyze_continuity(patient_id: int) -> dict:
    """
    Integrate absence/continuity intelligence into the longitudinal picture.

    Fetches absence events from the database and returns a continuity dict
    compatible with the longitudinal summary format.

    Returns lightweight continuity fields so they can be embedded in the
    longitudinal summary without a circular import.
    """
    try:
        from services.absence_service import compute_continuity, get_absence_alerts
        continuity = compute_continuity(patient_id)
        alerts     = get_absence_alerts(patient_id)
        return {
            'has_data':          continuity.get('has_data', False),
            'continuity_score':  continuity.get('continuity_score'),
            'continuity_grade':  continuity.get('continuity_grade', 'NO_DATA'),
            'missed_streak':     continuity.get('missed_streak', 0),
            'absence_count':     continuity.get('absence_count', 0),
            'absence_rate_pct':  continuity.get('absence_rate_pct', 0),
            'days_since_visit':  continuity.get('days_since_last_visit'),
            'sudden_disappearance': continuity.get('sudden_disappearance', False),
            'escalation_flag':   continuity.get('escalation_flag', False),
            'risk_influence':    continuity.get('risk_influence', 'NONE'),
            'regularity_label':  continuity.get('regularity_label', 'INSUFFICIENT_DATA'),
            'narrative':         continuity.get('narrative', ''),
            'alerts':            alerts,
        }
    except Exception as e:
        return {'has_data': False, 'error': str(e)}


def build_longitudinal_summary(patient_id: int) -> dict:
    """
    Build the full Passive Clinical Memory summary for a patient.

    This is the primary public interface for all longitudinal intelligence.
    All sub-analyses are computed deterministically from visit history.
    """
    patient, visits = load_patient_visits(patient_id)

    if patient is None:
        return {'error': f'Patient {patient_id} not found'}

    n = len(visits)

    first_date = visits[0]['visit_date'] if visits else None
    last_date  = visits[-1]['visit_date'] if visits else None
    days_tracked = _days_between(first_date, last_date) if (first_date and last_date) else 0

    # Run all analyses
    bp_trend     = analyze_bp_trend(visits)
    risk_traj    = analyze_risk_trajectory(visits)
    adherence    = analyze_adherence_trajectory(visits)
    deviations   = detect_first_deviations(visits)
    pathway_hist = analyze_pathway_history(visits)
    symptoms     = analyze_symptom_frequency(visits)
    sudden_esc   = detect_sudden_escalations(visits)
    alerts       = generate_clinical_alerts(
        bp_trend, risk_traj, adherence, deviations,
        pathway_hist, symptoms, sudden_esc
    )
    narrative    = generate_doctor_summary(
        patient, visits, bp_trend, risk_traj, adherence,
        pathway_hist, symptoms, days_tracked
    )

    # Absence / continuity intelligence
    continuity = analyze_continuity(patient_id)

    # Merge continuity alerts into the clinical alert list
    for ca in continuity.get('alerts', []):
        msg = ca.get('message', '')
        if msg:
            prefix = {
                'CRITICAL': 'CONTINUITY CRITICAL',
                'HIGH':     'CONTINUITY HIGH',
                'MEDIUM':   'CONTINUITY MEDIUM',
            }.get(ca.get('severity', 'MEDIUM'), 'CONTINUITY')
            merged_alert = f"{prefix}: {msg}"
            if merged_alert not in alerts:
                alerts.insert(0 if ca['severity'] == 'CRITICAL' else len(alerts), merged_alert)

    # Population-level cluster intelligence for this patient's village
    try:
        from services.cluster_engine import get_cluster_alerts_for_village
        village = patient.get('village') or ''
        cluster_alerts = get_cluster_alerts_for_village(village)
        for ca in cluster_alerts:
            if ca not in alerts:
                alerts.insert(0, ca)
    except Exception:
        pass

    return {
        'patient_id':       patient_id,
        'patient_name':     patient.get('full_name'),
        'total_visits':     n,
        'first_visit_date': _fmt_date(first_date),
        'last_visit_date':  _fmt_date(last_date),
        'days_tracked':     days_tracked,

        'bp_trend':          bp_trend,
        'risk_trajectory':   risk_traj,
        'adherence':         adherence,
        'first_deviations':  deviations,
        'pathway_history':   pathway_hist,
        'symptom_frequency': symptoms,
        'sudden_escalations':sudden_esc,
        'continuity':        continuity,

        'clinical_alerts':   alerts,
        'doctor_summary':    narrative,
        'computed_at':       datetime.now(timezone.utc).isoformat(),
    }


def build_snapshot(patient_id: int) -> dict:
    """
    Lightweight longitudinal snapshot — fast enough to include in
    every visit detail response without expensive full analysis.

    Returns only direction labels, alert count, and key narrative points.
    Always includes continuity intelligence even for patients with no visits.
    """
    patient, visits = load_patient_visits(patient_id)
    if patient is None:
        return {'total_visits': 0, 'has_data': False}

    if not visits:
        continuity = analyze_continuity(patient_id)
        return {
            'has_data':           False,
            'total_visits':       0,
            'continuity_score':   continuity.get('continuity_score'),
            'continuity_grade':   continuity.get('continuity_grade', 'NO_DATA'),
            'missed_streak':      continuity.get('missed_streak', 0),
            'escalation_flag':    continuity.get('escalation_flag', False),
            'absence_count':      continuity.get('absence_count', 0),
        }

    bp     = analyze_bp_trend(visits)
    risk   = analyze_risk_trajectory(visits)
    adh    = analyze_adherence_trajectory(visits)
    pw_h   = analyze_pathway_history(visits)
    devia  = detect_first_deviations(visits)
    symp   = analyze_symptom_frequency(visits)
    sudden = detect_sudden_escalations(visits)
    alerts = generate_clinical_alerts(bp, risk, adh, devia, pw_h, symp, sudden)

    continuity = analyze_continuity(patient_id)

    return {
        'has_data':           True,
        'total_visits':       len(visits),
        'days_tracked':       _days_between(visits[0]['visit_date'], visits[-1]['visit_date']) if len(visits) > 1 else 0,
        'bp_trend':           bp.get('direction', 'NO_DATA'),
        'risk_direction':     risk.get('direction', 'NO_DATA'),
        'adherence_pct':      adh.get('adherence_pct'),
        'adherence_trend':    adh.get('trend'),
        'crisis_events':      pw_h.get('crisis_events', 0),
        'unique_pathways':    pw_h.get('unique_pathways', []),
        'alert_count':        len(alerts),
        'top_alerts':         alerts[:3],
        'continuity_score':   continuity.get('continuity_score'),
        'continuity_grade':   continuity.get('continuity_grade', 'NO_DATA'),
        'missed_streak':      continuity.get('missed_streak', 0),
        'escalation_flag':    continuity.get('escalation_flag', False),
    }
