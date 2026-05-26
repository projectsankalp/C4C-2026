"""
AarogyaNet SOS Emergency Escalation Service.

Handles SOS event creation, triage instruction dispatch, escalation routing,
longitudinal timeline integration, and blockchain emergency proof generation.
"""
import hashlib
import json
import time
import uuid

import psycopg2.extras

from database.postgres import get_db_connection
from utils.helpers import serialize_row

# ---------------------------------------------------------------------------
# Emergency type definitions
# ---------------------------------------------------------------------------
EMERGENCY_TYPES = {
    "hypertensive_crisis":   "Hypertensive Crisis",
    "unconscious":           "Unconscious Patient",
    "breathing_difficulty":  "Breathing Difficulty",
    "chest_pain":            "Chest Pain",
    "severe_dizziness":      "Severe Dizziness",
    "medication_emergency":  "Medication Emergency",
    "other":                 "Other Emergency",
}

SEVERITY_MAP = {
    "hypertensive_crisis":  "CRITICAL",
    "unconscious":          "CRITICAL",
    "breathing_difficulty": "CRITICAL",
    "chest_pain":           "CRITICAL",
    "severe_dizziness":     "HIGH",
    "medication_emergency": "HIGH",
    "other":                "HIGH",
}

TRIAGE_INSTRUCTIONS = {
    "hypertensive_crisis": [
        "Keep patient seated upright — do NOT allow them to lie flat.",
        "Monitor blood pressure every 5 minutes if possible.",
        "Ensure prescribed antihypertensive medication is taken if not already.",
        "Loosen any tight clothing around neck and chest.",
        "Keep patient calm — reduce all external stimulation.",
        "Do NOT give extra doses of medication without doctor guidance.",
        "Arrange urgent transport to PHC immediately.",
        "Call assigned doctor for remote guidance while preparing transport.",
    ],
    "unconscious": [
        "Place patient in the recovery position (on their side).",
        "Check for breathing and pulse every 2 minutes.",
        "Do NOT give anything by mouth — airway must remain clear.",
        "Protect patient's head and keep spine aligned.",
        "Stay with patient at all times — do not leave alone.",
        "Call for immediate ambulance transport.",
        "Call assigned doctor immediately for telephonic guidance.",
    ],
    "breathing_difficulty": [
        "Sit patient upright or in a position they find most comfortable.",
        "Loosen all tight clothing around chest, neck, and waist.",
        "Ensure fresh air circulation — open windows or move outdoors.",
        "Monitor respiratory rate — count breaths per minute.",
        "Do NOT make patient lie flat if they prefer sitting.",
        "If not improving in 5 minutes, arrange urgent transport to PHC.",
        "Contact assigned doctor immediately.",
    ],
    "chest_pain": [
        "Make patient rest completely — zero physical exertion.",
        "Sit patient down or let them assume their most comfortable position.",
        "Loosen clothing around chest area.",
        "Monitor pulse and level of consciousness every 2 minutes.",
        "This may be a cardiac emergency — arrange URGENT transport now.",
        "Do NOT give food, water, or medication without doctor instruction.",
        "Call assigned doctor immediately for emergency guidance.",
    ],
    "severe_dizziness": [
        "Gently guide patient to a safe seated or lying position.",
        "Avoid any sudden movement or position changes.",
        "Keep patient away from stairs, edges, or hard surfaces.",
        "Offer sips of water if patient is fully conscious and can swallow.",
        "Monitor for progression to loss of consciousness.",
        "Check most recent blood pressure if equipment is available.",
        "Contact assigned doctor for guidance on next steps.",
    ],
    "medication_emergency": [
        "Identify which medication was involved and the exact dose.",
        "Note the time the incident occurred — record carefully.",
        "Do NOT administer additional doses without doctor authorisation.",
        "If patient is conscious, keep them calm and monitor vitals.",
        "Bring all medication packets/bottles when transporting patient.",
        "Contact assigned doctor immediately for instructions.",
        "If overdose is suspected, arrange immediate transport to PHC.",
    ],
    "other": [
        "Keep patient calm and as comfortable as possible.",
        "Monitor breathing and consciousness continuously.",
        "Record patient's current vital signs if equipment is available.",
        "Do not leave patient unattended.",
        "Contact assigned doctor for specific guidance.",
        "Be prepared to transport to the nearest Primary Health Centre.",
    ],
}

# Mock PHC contact info for escalation targets
MOCK_PHC_CONTACTS = {
    "Rampur":    "PHC Rampur — 0141-2345678",
    "Sundarpur": "UPHC Sundarpur — 0141-2345679",
    "Bhatpur":   "CHC Bhatpur — 0141-2345680",
}
DEFAULT_PHC = "District Hospital Emergency — 0141-2999999"
EMERGENCY_HELPLINE = "National Emergency — 112"


# ---------------------------------------------------------------------------
# Core service functions
# ---------------------------------------------------------------------------

def _make_event_id() -> str:
    return uuid.uuid4().hex


def _make_emergency_hash(event_id: str, emergency_type: str, ts: float) -> str:
    payload = json.dumps({
        "event_id": event_id,
        "emergency_type": emergency_type,
        "timestamp": ts,
    }, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def _get_patient_latest_vitals(patient_id: int, conn) -> dict:
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT bp_systolic, bp_diastolic, risk_score, risk_level
        FROM asha_visits
        WHERE patient_id = %s
        ORDER BY visit_date DESC LIMIT 1
    """, (patient_id,))
    row = cur.fetchone()
    cur.close()
    return dict(row) if row else {}


def _get_escalation_targets(patient_id: int, conn) -> dict:
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT p.village, u.full_name as doctor_name, u.phone as doctor_phone,
               u.id as doctor_id
        FROM patients p
        LEFT JOIN users u ON u.id = p.doctor_id
        WHERE p.id = %s
    """, (patient_id,))
    row = cur.fetchone()
    cur.close()
    if not row:
        return {}
    village = (row.get("village") or "").strip()
    phc = MOCK_PHC_CONTACTS.get(village, DEFAULT_PHC)
    return {
        "doctor": {
            "id": row.get("doctor_id"),
            "name": row.get("doctor_name") or "Assigned Doctor",
            "phone": row.get("doctor_phone") or "Not on file",
        },
        "phc": phc,
        "helpline": EMERGENCY_HELPLINE,
        "asha_supervisor": "ASHA Supervisor — 9800000000",
    }


def create_emergency_event(
    patient_id: int,
    asha_worker_id: int,
    emergency_type: str,
    latitude: float = None,
    longitude: float = None,
    notes: str = "",
    client_timestamp: float = None,
) -> dict:
    """
    Create and persist an SOS emergency event.
    Returns the full event dict including triage instructions and escalation targets.
    """
    if emergency_type not in EMERGENCY_TYPES:
        emergency_type = "other"

    event_id = _make_event_id()
    ts = client_timestamp or time.time()
    emergency_hash = _make_emergency_hash(event_id, emergency_type, ts)
    severity = SEVERITY_MAP.get(emergency_type, "HIGH")
    triage = TRIAGE_INSTRUCTIONS.get(emergency_type, TRIAGE_INSTRUCTIONS["other"])

    conn = get_db_connection()
    try:
        vitals = _get_patient_latest_vitals(patient_id, conn)
        targets = _get_escalation_targets(patient_id, conn)

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            INSERT INTO emergency_events
                (event_id, patient_id, asha_worker_id, emergency_type,
                 status, severity, latitude, longitude,
                 latest_bp_systolic, latest_bp_diastolic,
                 latest_risk_score, latest_risk_level,
                 notes, escalation_targets, triage_instructions, emergency_hash)
            VALUES (%s,%s,%s,%s,'active',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING *
        """, (
            event_id, patient_id, asha_worker_id, emergency_type,
            severity, latitude, longitude,
            vitals.get("bp_systolic"), vitals.get("bp_diastolic"),
            vitals.get("risk_score"), vitals.get("risk_level"),
            notes, json.dumps(targets), json.dumps(triage), emergency_hash,
        ))
        row = dict(cur.fetchone())
        conn.commit()
        cur.close()
    finally:
        conn.close()

    # Send mock notifications
    _dispatch_notifications(row, targets)

    return {
        **serialize_row(row),
        "triage_instructions": triage,
        "escalation_targets": targets,
        "emergency_type_label": EMERGENCY_TYPES.get(emergency_type, emergency_type),
    }


def _dispatch_notifications(event: dict, targets: dict) -> None:
    """Mock notification dispatch to all escalation targets."""
    from services.notification_service import notify_doctor
    doctor_id = (targets.get("doctor") or {}).get("id")
    if doctor_id:
        msg = (
            f"[SOS EMERGENCY] {EMERGENCY_TYPES.get(event['emergency_type'], event['emergency_type'])} "
            f"— Patient ID {event['patient_id']}. "
            f"Severity: {event['severity']}. Respond immediately."
        )
        notify_doctor(doctor_id, msg)
    print(f"[SOS] {event['severity']} emergency — type={event['emergency_type']} "
          f"patient={event['patient_id']} ASHA={event['asha_worker_id']} "
          f"PHC={targets.get('phc', '—')}")


def acknowledge_emergency(event_id: str, acknowledged_by: int) -> dict | None:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            UPDATE emergency_events
            SET status = 'acknowledged',
                acknowledged_at = NOW(),
                acknowledged_by = %s
            WHERE event_id = %s
            RETURNING *
        """, (acknowledged_by, event_id))
        row = cur.fetchone()
        conn.commit()
        return serialize_row(row) if row else None
    finally:
        cur.close()
        conn.close()


def resolve_emergency(event_id: str) -> dict | None:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            UPDATE emergency_events
            SET status = 'resolved', resolved_at = NOW()
            WHERE event_id = %s
            RETURNING *
        """, (event_id,))
        row = cur.fetchone()
        conn.commit()
        return serialize_row(row) if row else None
    finally:
        cur.close()
        conn.close()


def update_emergency_block(event_id: str, block_index: int) -> None:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE emergency_events SET block_index=%s WHERE event_id=%s",
            (block_index, event_id)
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()


def get_emergency_by_id(event_id: str) -> dict | None:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT ee.*,
                   p.full_name  AS patient_name,
                   p.village    AS patient_village,
                   u.full_name  AS asha_name,
                   a.full_name  AS acknowledged_by_name
            FROM emergency_events ee
            LEFT JOIN patients p ON p.id = ee.patient_id
            LEFT JOIN users    u ON u.id = ee.asha_worker_id
            LEFT JOIN users    a ON a.id = ee.acknowledged_by
            WHERE ee.event_id = %s
        """, (event_id,))
        row = cur.fetchone()
        return serialize_row(row) if row else None
    finally:
        cur.close()
        conn.close()


def get_active_emergencies() -> list:
    """All active/acknowledged emergencies — doctor dashboard view."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT ee.*,
                   p.full_name AS patient_name,
                   p.village   AS patient_village,
                   u.full_name AS asha_name
            FROM emergency_events ee
            LEFT JOIN patients p ON p.id = ee.patient_id
            LEFT JOIN users    u ON u.id = ee.asha_worker_id
            WHERE ee.status IN ('active', 'acknowledged', 'escalated')
            ORDER BY
                CASE ee.severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 ELSE 2 END,
                ee.created_at DESC
        """)
        return [serialize_row(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def get_emergencies_for_patient(patient_id: int) -> list:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT ee.*, u.full_name AS asha_name, a.full_name AS acknowledged_by_name
            FROM emergency_events ee
            LEFT JOIN users u ON u.id = ee.asha_worker_id
            LEFT JOIN users a ON a.id = ee.acknowledged_by
            WHERE ee.patient_id = %s
            ORDER BY ee.created_at DESC
        """, (patient_id,))
        return [serialize_row(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def get_emergencies_for_asha(asha_worker_id: int) -> list:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT ee.*,
                   p.full_name AS patient_name,
                   p.village   AS patient_village
            FROM emergency_events ee
            LEFT JOIN patients p ON p.id = ee.patient_id
            WHERE ee.asha_worker_id = %s
            ORDER BY ee.created_at DESC
            LIMIT 20
        """, (asha_worker_id,))
        return [serialize_row(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def get_triage_instructions(emergency_type: str) -> list:
    return TRIAGE_INSTRUCTIONS.get(emergency_type, TRIAGE_INSTRUCTIONS["other"])


def get_emergency_types() -> dict:
    return EMERGENCY_TYPES
