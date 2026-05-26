"""
AarogyaNet Disease Cluster Intelligence Engine.

Deterministic spatiotemporal clustering — no ML, no AI, no prediction.

Cluster detection uses Haversine-based proximity grouping combined with
configurable time windows per symptom type.

Cluster Types:
  fever | respiratory | hypertension_crisis |
  medication_shortage | gastrointestinal | unknown_anomaly

Severity:
  CRITICAL  — >=5 cases, or any hypertension_crisis cluster >=3 cases
  HIGH      — >=3 cases
  MEDIUM    — >=2 cases (emerging signal)

Privacy: patient names and exact visit coordinates are never exposed.
         Only cluster centroids and aggregated counts are returned.

Offline-first: detection loads visits ordered by visit_date ASC so that
delayed-sync records are placed into the correct temporal window once
they arrive in PostgreSQL.
"""

import hashlib
import json
import math
from datetime import datetime, timezone
from typing import Callable

import psycopg2.extras

from database.postgres import get_db_connection


# ─────────────────────────────────────────────────────────────────────────────
# Haversine distance
# ─────────────────────────────────────────────────────────────────────────────

def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two GPS coordinates."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi       = math.radians(lat2 - lat1)
    dlambda    = math.radians(lon2 - lon1)
    a = (math.sin(dphi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(a))


# ─────────────────────────────────────────────────────────────────────────────
# GCPE pathway helpers
# ─────────────────────────────────────────────────────────────────────────────

def _gcpe_data(visit: dict) -> dict:
    gd = visit.get('gcpe_data') or {}
    if isinstance(gd, str):
        try:
            gd = json.loads(gd)
        except Exception:
            gd = {}
    return gd


def _has_pathway(visit: dict, keys: list[str]) -> bool:
    """Return True if any of keys appear in visit GCPE pathways or answers."""
    gcpe     = _gcpe_data(visit)
    pathways = [str(p).lower() for p in gcpe.get('pathways', [])]
    answers  = {str(k).lower(): str(v).lower() for k, v in gcpe.get('answers', {}).items()}
    for k in keys:
        kl = k.lower()
        if any(kl in p for p in pathways):
            return True
        if any(kl in ak or kl in av for ak, av in answers.items()):
            return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
# Cluster rule definitions
# ─────────────────────────────────────────────────────────────────────────────

def _fever_check(v: dict) -> bool:
    temp = v.get('temperature')
    if temp is not None:
        try:
            if float(temp) >= 38.0:
                return True
        except (TypeError, ValueError):
            pass
    return _has_pathway(v, ['fever', 'febrile', 'pyrexia'])


def _respiratory_check(v: dict) -> bool:
    return _has_pathway(v, ['respiratory', 'cough', 'breathlessness', 'dyspnoea', 'wheeze', 'chest_tightness'])


def _crisis_check(v: dict) -> bool:
    try:
        bp_s = int(v.get('bp_systolic') or 0)
        bp_d = int(v.get('bp_diastolic') or 0)
        if bp_s >= 180 or bp_d >= 110:
            return True
    except (TypeError, ValueError):
        pass
    return _has_pathway(v, ['hypertensive_crisis', 'crisis_escalation', 'cardiac_emergency'])


def _shortage_check(v: dict) -> bool:
    return bool(v.get('medicine_missed'))


def _gi_check(v: dict) -> bool:
    return _has_pathway(v, ['gastrointestinal', 'diarrhoea', 'vomiting', 'nausea', 'gi_complaint', 'abdominal'])


def _anomaly_check(v: dict) -> bool:
    """High-risk visits not explained by any named cluster type."""
    if v.get('risk_level') != 'HIGH':
        return False
    if _fever_check(v) or _respiratory_check(v) or _crisis_check(v) or _gi_check(v):
        return False
    try:
        bp_s = int(v.get('bp_systolic') or 0)
        if bp_s >= 160:
            return False
    except (TypeError, ValueError):
        pass
    return True


CLUSTER_RULES: dict[str, dict] = {
    'fever': {
        'label':        'Fever Cluster',
        'threshold':    3,
        'window_days':  10,
        'radius_m':     200,
        'check':        _fever_check,
        'icon':         'fa-thermometer-three-quarters',
        'color':        '#ef4444',
        'bg':           '#fee2e2',
    },
    'respiratory': {
        'label':        'Respiratory Cluster',
        'threshold':    3,
        'window_days':  14,
        'radius_m':     300,
        'check':        _respiratory_check,
        'icon':         'fa-lungs',
        'color':        '#f97316',
        'bg':           '#ffedd5',
    },
    'hypertension_crisis': {
        'label':        'Hypertension Crisis Cluster',
        'threshold':    3,
        'window_days':  10,
        'radius_m':     500,
        'check':        _crisis_check,
        'icon':         'fa-heart-pulse',
        'color':        '#dc2626',
        'bg':           '#fee2e2',
    },
    'medication_shortage': {
        'label':        'Medication Shortage Pattern',
        'threshold':    4,
        'window_days':  14,
        'radius_m':     1000,
        'check':        _shortage_check,
        'icon':         'fa-pills',
        'color':        '#a855f7',
        'bg':           '#f3e8ff',
    },
    'gastrointestinal': {
        'label':        'Gastrointestinal Cluster',
        'threshold':    3,
        'window_days':  7,
        'radius_m':     200,
        'check':        _gi_check,
        'icon':         'fa-bacterium',
        'color':        '#65a30d',
        'bg':           '#ecfccb',
    },
    'unknown_anomaly': {
        'label':        'Unknown Anomaly Cluster',
        'threshold':    3,
        'window_days':  7,
        'radius_m':     200,
        'check':        _anomaly_check,
        'icon':         'fa-circle-exclamation',
        'color':        '#94a3b8',
        'bg':           '#f1f5f9',
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Visit data loading
# ─────────────────────────────────────────────────────────────────────────────

def _load_geo_visits(lookback_days: int = 90) -> list[dict]:
    """
    Load visits with GPS coordinates for the past lookback_days.
    Uses visit-level GPS first, falls back to patient home GPS.
    Ordered oldest → newest so delayed-sync records land in correct windows.
    """
    conn = get_db_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(f"""
        SELECT
            v.id              AS visit_id,
            v.patient_id,
            v.visit_date,
            v.bp_systolic, v.bp_diastolic,
            v.temperature, v.pulse,
            v.dizziness, v.chest_pain, v.medicine_missed,
            v.risk_score, v.risk_level,
            v.gcpe_data,
            COALESCE(v.latitude,  p.latitude)  AS latitude,
            COALESCE(v.longitude, p.longitude) AS longitude,
            p.village
        FROM asha_visits v
        JOIN patients p ON p.id = v.patient_id
        WHERE v.visit_date >= NOW() - INTERVAL '{lookback_days} days'
          AND (
                (v.latitude  IS NOT NULL AND v.longitude  IS NOT NULL)
             OR (p.latitude  IS NOT NULL AND p.longitude  IS NOT NULL)
          )
        ORDER BY v.visit_date ASC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()

    for v in rows:
        gd = v.get('gcpe_data')
        if isinstance(gd, str):
            try:
                v['gcpe_data'] = json.loads(gd)
            except Exception:
                v['gcpe_data'] = {}
        elif gd is None:
            v['gcpe_data'] = {}

    return rows


# ─────────────────────────────────────────────────────────────────────────────
# Spatiotemporal grouping
# ─────────────────────────────────────────────────────────────────────────────

def _normalise_dt(val) -> datetime | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.replace(tzinfo=timezone.utc) if val.tzinfo is None else val
    if isinstance(val, str):
        try:
            dt = datetime.fromisoformat(val)
            return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
        except Exception:
            return None
    return None


def _group_into_clusters(
    visits:       list[dict],
    check:        Callable[[dict], bool],
    window_days:  int,
    radius_m:     float,
    threshold:    int,
) -> list[dict]:
    """
    Greedy spatiotemporal clustering:
      A visit joins an existing group when:
        (a) Haversine(visit, group_centroid) <= radius_m, AND
        (b) |visit_date - group_first_date| <= window_days
      Otherwise it seeds a new group.

    Centroid is recalculated as the arithmetic mean of all member coordinates
    after each addition, ensuring the cluster centre drifts with the data.

    Only groups with case_count >= threshold are returned.
    Ordering by visit_date ASC guarantees correct temporal placement of
    delayed-sync records.
    """
    matching = [
        v for v in visits
        if check(v)
           and v.get('latitude') is not None
           and v.get('longitude') is not None
           and _normalise_dt(v.get('visit_date')) is not None
    ]

    groups: list[dict] = []

    for v in matching:
        lat = float(v['latitude'])
        lng = float(v['longitude'])
        vdt = _normalise_dt(v['visit_date'])

        placed = False
        for g in groups:
            dist      = _haversine_m(lat, lng, g['c_lat'], g['c_lng'])
            days_span = abs((vdt - g['first_dt']).days)
            if dist <= radius_m and days_span <= window_days:
                g['visits'].append(v)
                lats = [float(x['latitude'])  for x in g['visits']]
                lngs = [float(x['longitude']) for x in g['visits']]
                g['c_lat']   = sum(lats) / len(lats)
                g['c_lng']   = sum(lngs) / len(lngs)
                g['last_dt'] = max(g['last_dt'], vdt)
                placed = True
                break

        if not placed:
            groups.append({
                'visits':   [v],
                'c_lat':    lat,
                'c_lng':    lng,
                'first_dt': vdt,
                'last_dt':  vdt,
            })

    return [g for g in groups if len(g['visits']) >= threshold]


# ─────────────────────────────────────────────────────────────────────────────
# Severity classification
# ─────────────────────────────────────────────────────────────────────────────

_SEV_ORDER = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}


def sev_rank(s: str) -> int:
    return _SEV_ORDER.get(s, 9)


def _classify_severity(cluster_type: str, case_count: int) -> str:
    if cluster_type == 'hypertension_crisis':
        return 'CRITICAL' if case_count >= 3 else 'HIGH'
    if case_count >= 5:
        return 'CRITICAL'
    if case_count >= 3:
        return 'HIGH'
    return 'MEDIUM'


# ─────────────────────────────────────────────────────────────────────────────
# Cluster ID (deterministic, stable across re-runs)
# ─────────────────────────────────────────────────────────────────────────────

def _cluster_id(ctype: str, lat: float, lng: float, first_dt: datetime) -> str:
    raw = f"{ctype}|{lat:.3f}|{lng:.3f}|{first_dt.date()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


# ─────────────────────────────────────────────────────────────────────────────
# Main detection API
# ─────────────────────────────────────────────────────────────────────────────

def detect_clusters(lookback_days: int = 30) -> list[dict]:
    """
    Run full cluster detection across all cluster types.

    Returns a list of cluster dicts (severity-sorted, CRITICAL first).
    Patient names and individual GPS coordinates are never returned.
    """
    visits   = _load_geo_visits(lookback_days)
    clusters = []

    for ctype, rule in CLUSTER_RULES.items():
        groups = _group_into_clusters(
            visits,
            check=rule['check'],
            window_days=rule['window_days'],
            radius_m=rule['radius_m'],
            threshold=rule['threshold'],
        )
        for g in groups:
            case_count = len(g['visits'])
            severity   = _classify_severity(ctype, case_count)
            cid        = _cluster_id(ctype, g['c_lat'], g['c_lng'], g['first_dt'])

            # Most common village (aggregated — no patient names)
            village_list = [v.get('village') for v in g['visits'] if v.get('village')]
            village = max(set(village_list), key=village_list.count) if village_list else '—'

            # Deduplicated patient count (not names)
            affected_patients = len(set(v['patient_id'] for v in g['visits']))

            # Timeline: date + risk level only — no patient identity
            timeline = []
            for v in sorted(g['visits'], key=lambda x: x.get('visit_date') or ''):
                vdate = v.get('visit_date')
                if hasattr(vdate, 'strftime'):
                    ds = vdate.strftime('%Y-%m-%d')
                else:
                    ds = str(vdate)[:10]
                timeline.append({
                    'date':       ds,
                    'risk_level': v.get('risk_level', 'LOW'),
                    'village':    v.get('village', '—'),
                })

            clusters.append({
                'cluster_id':        cid,
                'cluster_type':      ctype,
                'label':             rule['label'],
                'severity':          severity,
                'status':            'active',
                'center_lat':        round(g['c_lat'], 6),
                'center_lng':        round(g['c_lng'], 6),
                'radius_m':          rule['radius_m'],
                'case_count':        case_count,
                'affected_patients': affected_patients,
                'first_detected':    g['first_dt'].isoformat(),
                'last_seen':         g['last_dt'].isoformat(),
                'village':           village,
                'icon':              rule['icon'],
                'color':             rule['color'],
                'bg':                rule['bg'],
                'timeline':          timeline,
            })

    clusters.sort(key=lambda c: (sev_rank(c['severity']), -c['case_count']))
    return clusters


# ─────────────────────────────────────────────────────────────────────────────
# Surveillance summary (Health Officer view)
# ─────────────────────────────────────────────────────────────────────────────

def get_surveillance_summary(lookback_days: int = 30) -> dict:
    """
    District-level surveillance summary.
    Aggregates cluster data for the Health Officer dashboard.
    """
    clusters = detect_clusters(lookback_days)

    critical_count = sum(1 for c in clusters if c['severity'] == 'CRITICAL')
    high_count     = sum(1 for c in clusters if c['severity'] == 'HIGH')
    total_cases    = sum(c['case_count'] for c in clusters)

    # Per-type summary
    type_summary: dict[str, dict] = {}
    for c in clusters:
        t = c['cluster_type']
        if t not in type_summary:
            type_summary[t] = {
                'label':    c['label'],
                'clusters': 0,
                'cases':    0,
                'color':    c['color'],
                'icon':     c['icon'],
            }
        type_summary[t]['clusters'] += 1
        type_summary[t]['cases']    += c['case_count']

    # Village breakdown
    village_map: dict[str, dict] = {}
    for c in clusters:
        vil = c['village']
        if vil not in village_map:
            village_map[vil] = {'village': vil, 'clusters': 0, 'cases': 0, 'severity': 'MEDIUM'}
        village_map[vil]['clusters'] += 1
        village_map[vil]['cases']    += c['case_count']
        if sev_rank(c['severity']) < sev_rank(village_map[vil]['severity']):
            village_map[vil]['severity'] = c['severity']

    return {
        'total_clusters':    len(clusters),
        'total_cases':       total_cases,
        'critical_count':    critical_count,
        'high_count':        high_count,
        'active_clusters':   clusters,
        'type_summary':      list(type_summary.values()),
        'village_breakdown': sorted(village_map.values(),
                                    key=lambda x: sev_rank(x['severity'])),
        'lookback_days':     lookback_days,
        'generated_at':      datetime.now(timezone.utc).isoformat(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Longitudinal integration hook
# ─────────────────────────────────────────────────────────────────────────────

def get_cluster_alerts_for_village(village: str) -> list[str]:
    """
    Return human-readable cluster alerts relevant to a given village.
    Called by the longitudinal engine to surface population-level context
    alongside per-patient clinical intelligence.
    """
    if not village:
        return []
    try:
        clusters = detect_clusters(30)
        alerts   = []
        for c in clusters:
            if c.get('village') == village and c['severity'] in ('CRITICAL', 'HIGH'):
                alerts.append(
                    f"POPULATION ALERT [{c['severity']}]: {c['label']} detected in {village} "
                    f"({c['case_count']} cases, first detected {c['first_detected'][:10]}). "
                    "Coordinate with district health officer."
                )
        return alerts
    except Exception:
        return []
