"""SQLite offline sync simulation for ASHA workers in low-connectivity areas."""
import sqlite3
import json
import os
from config import Config

def get_sqlite_conn():
    """Return a SQLite connection for offline storage."""
    conn = sqlite3.connect(Config.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_sqlite():
    """Initialize SQLite tables for offline-first operation."""
    conn = get_sqlite_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS offline_visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            asha_worker_id INTEGER NOT NULL,
            visit_date TEXT DEFAULT (datetime('now')),
            dizziness INTEGER DEFAULT 0,
            chest_pain INTEGER DEFAULT 0,
            medicine_missed INTEGER DEFAULT 0,
            bp_systolic INTEGER,
            bp_diastolic INTEGER,
            temperature REAL,
            pulse INTEGER,
            notes TEXT,
            gcpe_data TEXT,
            visit_hash TEXT,
            latitude REAL,
            longitude REAL,
            visit_timestamp REAL,
            synced INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # GPS migration for pre-existing SQLite DBs that lack these columns
    for col_def in [
        ("latitude",        "REAL"),
        ("longitude",       "REAL"),
        ("visit_timestamp", "REAL"),
    ]:
        try:
            cur.execute(f"ALTER TABLE offline_visits ADD COLUMN {col_def[0]} {col_def[1]}")
        except Exception:
            pass  # Column already exists

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sync_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            record_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            synced_at TEXT,
            error_msg TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS offline_absences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            asha_worker_id INTEGER,
            absence_type TEXT NOT NULL,
            notes TEXT,
            expected_date TEXT,
            latest_risk_level TEXT DEFAULT 'LOW',
            synced INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS offline_emergencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT NOT NULL,
            patient_id INTEGER,
            asha_worker_id INTEGER,
            emergency_type TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            notes TEXT,
            client_timestamp REAL,
            synced INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()


def save_absence_offline(data: dict) -> int:
    """Queue an absence event to SQLite when offline. Returns the offline record ID."""
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO offline_absences
            (patient_id, asha_worker_id, absence_type, notes, expected_date, latest_risk_level)
        VALUES (?,?,?,?,?,?)
    """, (
        data.get('patient_id'),
        data.get('asha_worker_id'),
        data.get('absence_type', 'patient_unavailable'),
        data.get('notes', ''),
        data.get('expected_date'),
        data.get('latest_risk_level', 'LOW'),
    ))
    record_id = cur.lastrowid
    cur.execute("""
        INSERT INTO sync_log (table_name, record_id, action, status)
        VALUES ('offline_absences', ?, 'INSERT', 'pending')
    """, (record_id,))
    conn.commit()
    conn.close()
    return record_id


def get_pending_absences() -> list:
    """Return all unsynced offline absence events."""
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute("SELECT * FROM offline_absences WHERE synced = 0")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def mark_absence_synced(offline_id: int):
    """Mark an offline absence as synced to PostgreSQL."""
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute("UPDATE offline_absences SET synced = 1 WHERE id = ?", (offline_id,))
    cur.execute("""
        UPDATE sync_log SET status = 'synced', synced_at = datetime('now')
        WHERE table_name = 'offline_absences' AND record_id = ?
    """, (offline_id,))
    conn.commit()
    conn.close()


def save_emergency_offline(event_data: dict) -> int:
    """Queue an SOS event to SQLite when offline. Returns the offline record ID."""
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO offline_emergencies
            (event_id, patient_id, asha_worker_id, emergency_type,
             latitude, longitude, notes, client_timestamp)
        VALUES (?,?,?,?,?,?,?,?)
    """, (
        event_data.get('event_id'),
        event_data.get('patient_id'),
        event_data.get('asha_worker_id'),
        event_data.get('emergency_type'),
        event_data.get('latitude'),
        event_data.get('longitude'),
        event_data.get('notes', ''),
        event_data.get('client_timestamp'),
    ))
    record_id = cur.lastrowid
    cur.execute("""
        INSERT INTO sync_log (table_name, record_id, action, status)
        VALUES ('offline_emergencies', ?, 'INSERT', 'pending')
    """, (record_id,))
    conn.commit()
    conn.close()
    return record_id


def get_pending_emergencies() -> list:
    """Return all unsynced offline emergency events."""
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM offline_emergencies WHERE synced = 0")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def mark_emergency_synced(offline_id: int):
    """Mark an offline emergency as synced to PostgreSQL."""
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("UPDATE offline_emergencies SET synced = 1 WHERE id = ?", (offline_id,))
    cur.execute("""
        UPDATE sync_log SET status = 'synced', synced_at = datetime('now')
        WHERE table_name = 'offline_emergencies' AND record_id = ?
    """, (offline_id,))
    conn.commit()
    conn.close()


def save_visit_offline(visit_data: dict) -> int:
    """Save a visit to SQLite when offline. Returns the offline record ID."""
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO offline_visits
            (patient_id, asha_worker_id, dizziness, chest_pain, medicine_missed,
             bp_systolic, bp_diastolic, temperature, pulse, notes, gcpe_data,
             visit_hash, latitude, longitude, visit_timestamp)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        visit_data.get('patient_id'), visit_data.get('asha_worker_id'),
        int(visit_data.get('dizziness', False)),
        int(visit_data.get('chest_pain', False)),
        int(visit_data.get('medicine_missed', False)),
        visit_data.get('bp_systolic'), visit_data.get('bp_diastolic'),
        visit_data.get('temperature'), visit_data.get('pulse'),
        visit_data.get('notes'),
        json.dumps(visit_data.get('gcpe_data', {})),
        visit_data.get('visit_hash', ''),
        visit_data.get('latitude'),
        visit_data.get('longitude'),
        visit_data.get('visit_timestamp'),
    ))
    record_id = cur.lastrowid
    cur.execute("""
        INSERT INTO sync_log (table_name, record_id, action, status)
        VALUES ('offline_visits', ?, 'INSERT', 'pending')
    """, (record_id,))
    conn.commit()
    conn.close()
    return record_id


def get_pending_syncs() -> list:
    """Return all unsynced offline visits."""
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM offline_visits WHERE synced = 0")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def mark_synced(offline_id: int):
    """Mark an offline visit as synced to PostgreSQL."""
    conn = get_sqlite_conn()
    cur = conn.cursor()
    cur.execute("UPDATE offline_visits SET synced = 1 WHERE id = ?", (offline_id,))
    cur.execute("""
        UPDATE sync_log SET status = 'synced', synced_at = datetime('now')
        WHERE table_name = 'offline_visits' AND record_id = ?
    """, (offline_id,))
    conn.commit()
    conn.close()
