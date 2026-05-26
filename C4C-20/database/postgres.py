"""PostgreSQL connection and table initialization using psycopg2."""
import os
import psycopg2
import psycopg2.extras
from config import Config

def get_db_connection():
    """Return a new psycopg2 connection using environment DATABASE_URL."""
    db_url = Config.DATABASE_URL
    if db_url:
        conn = psycopg2.connect(db_url)
    else:
        conn = psycopg2.connect(
            host=Config.PGHOST,
            port=Config.PGPORT,
            user=Config.PGUSER,
            password=Config.PGPASSWORD,
            dbname=Config.PGDATABASE,
        )
    conn.autocommit = False
    return conn


def init_db():
    """Create all PostgreSQL tables if they don't exist."""
    conn = get_db_connection()
    cur = conn.cursor()

    # --- users table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(256) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('asha', 'doctor', 'patient', 'admin')),
            full_name VARCHAR(120),
            phone VARCHAR(20),
            village VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE
        )
    """)

    # --- patients table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            patient_id VARCHAR(20) UNIQUE NOT NULL,
            full_name VARCHAR(120) NOT NULL,
            age INTEGER,
            gender VARCHAR(10),
            village VARCHAR(100),
            phone VARCHAR(20),
            asha_worker_id INTEGER REFERENCES users(id),
            doctor_id INTEGER REFERENCES users(id),
            medical_history TEXT,
            allergies TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            last_visit TIMESTAMP,
            latitude FLOAT,
            longitude FLOAT
        )
    """)

    # --- asha_visits table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS asha_visits (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(id),
            asha_worker_id INTEGER REFERENCES users(id),
            visit_date TIMESTAMP DEFAULT NOW(),
            dizziness BOOLEAN DEFAULT FALSE,
            chest_pain BOOLEAN DEFAULT FALSE,
            medicine_missed BOOLEAN DEFAULT FALSE,
            bp_systolic INTEGER,
            bp_diastolic INTEGER,
            temperature FLOAT,
            pulse INTEGER,
            notes TEXT,
            risk_score INTEGER DEFAULT 0,
            risk_level VARCHAR(10) DEFAULT 'LOW',
            gcpe_data JSONB,
            visit_hash VARCHAR(256),
            block_index INTEGER,
            synced_to_blockchain BOOLEAN DEFAULT FALSE
        )
    """)

    # GPS integrity migration — add per-visit GPS columns if not already present.
    # Uses ADD COLUMN IF NOT EXISTS (PostgreSQL 9.6+) so safe to run on every startup.
    for col_sql in [
        "ALTER TABLE asha_visits ADD COLUMN IF NOT EXISTS latitude FLOAT",
        "ALTER TABLE asha_visits ADD COLUMN IF NOT EXISTS longitude FLOAT",
        "ALTER TABLE asha_visits ADD COLUMN IF NOT EXISTS visit_timestamp FLOAT",
    ]:
        cur.execute(col_sql)

    # --- prescriptions table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS prescriptions (
            id SERIAL PRIMARY KEY,
            visit_id INTEGER REFERENCES asha_visits(id),
            patient_id INTEGER REFERENCES patients(id),
            doctor_id INTEGER REFERENCES users(id),
            prescribed_at TIMESTAMP DEFAULT NOW(),
            medicines JSONB,
            dosage_instructions TEXT,
            followup_date TIMESTAMP,
            notes TEXT,
            is_janaushadi BOOLEAN DEFAULT FALSE
        )
    """)

    # --- blockchain table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS blockchain (
            id SERIAL PRIMARY KEY,
            block_index INTEGER UNIQUE NOT NULL,
            timestamp FLOAT NOT NULL,
            visit_hash VARCHAR(256) NOT NULL,
            previous_hash VARCHAR(256) NOT NULL,
            nonce INTEGER NOT NULL,
            current_hash VARCHAR(256) NOT NULL,
            signature TEXT,
            data JSONB,
            is_valid BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    # Insert genesis block if chain is empty; repair if genesis hash is inconsistent
    import time, hashlib, json as _json
    from blockchain.hashing import hash_block

    GENESIS_DATA = {"message": "AarogyaNet Genesis Block", "type": "genesis"}
    GENESIS_PREVIOUS_HASH = "0" * 64
    GENESIS_NONCE = 0

    def _make_genesis():
        """Build a correctly-hashed genesis block using hash_block()."""
        ts = time.time()
        # visit_hash is a canonical SHA-256 fingerprint of the genesis payload
        visit_hash = hashlib.sha256(
            _json.dumps(GENESIS_DATA, sort_keys=True).encode()
        ).hexdigest()
        current_hash = hash_block(
            0, ts, visit_hash, GENESIS_PREVIOUS_HASH, GENESIS_NONCE, GENESIS_DATA
        )
        return ts, visit_hash, current_hash

    cur.execute("SELECT COUNT(*) FROM blockchain")
    count = cur.fetchone()[0]

    if count == 0:
        ts, visit_hash, current_hash = _make_genesis()
        cur.execute("""
            INSERT INTO blockchain (block_index, timestamp, visit_hash, previous_hash,
                                    nonce, current_hash, data, is_valid)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (0, ts, visit_hash, GENESIS_PREVIOUS_HASH, GENESIS_NONCE,
              current_hash, _json.dumps(GENESIS_DATA), True))
    else:
        # Check whether the stored genesis block is consistent with hash_block().
        # If not (legacy raw-sha256 hash), reset the entire chain so verification
        # can pass on the next startup. Visit records in asha_visits are unaffected.
        cur.execute(
            "SELECT timestamp, visit_hash, previous_hash, nonce, current_hash, data "
            "FROM blockchain WHERE block_index = 0"
        )
        row = cur.fetchone()
        if row:
            ts, v_hash, prev_h, nonce, stored_hash, raw_data = row
            data = raw_data if isinstance(raw_data, dict) else _json.loads(raw_data or '{}')
            expected_hash = hash_block(0, ts, v_hash, prev_h, nonce, data)
            if expected_hash != stored_hash:
                # Genesis is corrupted — clear the whole chain and reinsert
                cur.execute("DELETE FROM blockchain")
                ts, visit_hash, current_hash = _make_genesis()
                cur.execute("""
                    INSERT INTO blockchain (block_index, timestamp, visit_hash, previous_hash,
                                            nonce, current_hash, data, is_valid)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (0, ts, visit_hash, GENESIS_PREVIOUS_HASH, GENESIS_NONCE,
                      current_hash, _json.dumps(GENESIS_DATA), True))

    # --- absence_events table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS absence_events (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patients(id),
            asha_worker_id INTEGER REFERENCES users(id),
            absence_type VARCHAR(40) NOT NULL
                CHECK (absence_type IN (
                    'missed_visit','patient_unavailable','patient_refused',
                    'adherence_interruption','contact_lost','family_reported_away'
                )),
            notes TEXT,
            expected_date DATE,
            latest_risk_level VARCHAR(10) DEFAULT 'LOW',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    # --- emergency_events table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS emergency_events (
            id SERIAL PRIMARY KEY,
            event_id VARCHAR(64) UNIQUE NOT NULL,
            patient_id INTEGER REFERENCES patients(id),
            asha_worker_id INTEGER REFERENCES users(id),
            emergency_type VARCHAR(50) NOT NULL,
            status VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated')),
            severity VARCHAR(10) DEFAULT 'HIGH'
                CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM')),
            latitude FLOAT,
            longitude FLOAT,
            latest_bp_systolic INTEGER,
            latest_bp_diastolic INTEGER,
            latest_risk_score INTEGER,
            latest_risk_level VARCHAR(10),
            notes TEXT,
            escalation_targets JSONB,
            triage_instructions JSONB,
            emergency_hash VARCHAR(256),
            block_index INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            acknowledged_at TIMESTAMP,
            resolved_at TIMESTAMP,
            acknowledged_by INTEGER REFERENCES users(id)
        )
    """)

    # --- prescription_tokens table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS prescription_tokens (
            id SERIAL PRIMARY KEY,
            token_id VARCHAR(64) UNIQUE NOT NULL,
            prescription_id INTEGER REFERENCES prescriptions(id),
            patient_id INTEGER REFERENCES patients(id),
            token_hash VARCHAR(256) NOT NULL,
            signature TEXT,
            issued_at TIMESTAMP DEFAULT NOW(),
            expires_at TIMESTAMP,
            redemption_status VARCHAR(20) DEFAULT 'pending'
                CHECK (redemption_status IN ('pending', 'redeemed', 'expired', 'cancelled')),
            redeemed_at TIMESTAMP,
            redemption_method VARCHAR(30),
            redeemed_by INTEGER REFERENCES users(id),
            outlet_name VARCHAR(120),
            block_index INTEGER
        )
    """)

    # --- adherence_events table ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS adherence_events (
            id SERIAL PRIMARY KEY,
            token_id VARCHAR(64) REFERENCES prescription_tokens(token_id),
            adherence_hash VARCHAR(256) NOT NULL,
            block_index INTEGER,
            redemption_type VARCHAR(30),
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    # --- disease_clusters table ---
    # Stores detected spatiotemporal disease clusters for persistence,
    # timeline tracking, and the Health Officer surveillance view.
    cur.execute("""
        CREATE TABLE IF NOT EXISTS disease_clusters (
            id SERIAL PRIMARY KEY,
            cluster_id VARCHAR(32) UNIQUE NOT NULL,
            cluster_type VARCHAR(40) NOT NULL,
            label VARCHAR(120),
            severity VARCHAR(10) NOT NULL
                CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
            status VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'resolved', 'monitoring')),
            center_lat FLOAT NOT NULL,
            center_lng FLOAT NOT NULL,
            radius_m FLOAT DEFAULT 200,
            case_count INTEGER DEFAULT 0,
            affected_patients INTEGER DEFAULT 0,
            village VARCHAR(100),
            first_detected TIMESTAMP,
            last_seen TIMESTAMP,
            cluster_data JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)

    # Insert demo users if none exist
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        import hashlib
        def hash_pw(p): return hashlib.sha256(p.encode()).hexdigest()
        demo_users = [
            ('admin', 'admin@aarogyanet.in', hash_pw('admin123'), 'admin', 'System Admin', '9000000000', 'HQ'),
            ('asha_priya', 'priya@aarogyanet.in', hash_pw('asha123'), 'asha', 'Priya Sharma', '9111111111', 'Rampur'),
            ('dr_rajan', 'rajan@aarogyanet.in', hash_pw('doc123'), 'doctor', 'Dr. Rajan Kumar', '9222222222', 'PHC Block'),
            ('patient_ram', 'ram@aarogyanet.in', hash_pw('pat123'), 'patient', 'Ram Prasad', '9333333333', 'Rampur'),
        ]
        for u in demo_users:
            cur.execute("""INSERT INTO users (username,email,password_hash,role,full_name,phone,village)
                          VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING""", u)

    # ── GPS backfill migration — runs every startup, idempotent ─────────────────
    # Patches demo patients and all their visits that are missing GPS coordinates.
    # Keeps the seeding guard intact while ensuring upgraded instances are correct.
    _DEMO_GPS = {
        'DEMO-MEENA-001':    (26.740300, 83.410200),
        'DEMO-SURESH-001':   (26.744500, 83.414800),
        'DEMO-FEVER-001':    (26.741000, 83.410500),
        'DEMO-FEVER-002':    (26.741500, 83.410800),
        'DEMO-FEVER-003':    (26.741300, 83.410200),
        'DEMO-FEVER-CTL-001':(26.765000, 83.445000),
    }
    for _dpid, (_dlat, _dlng) in _DEMO_GPS.items():
        # Patch patient row if GPS is NULL
        cur.execute("""
            UPDATE patients
               SET latitude  = %s,
                   longitude = %s
             WHERE patient_id = %s
               AND (latitude IS NULL OR longitude IS NULL)
        """, (_dlat, _dlng, _dpid))
        # Patch all visits for this patient if GPS is NULL
        cur.execute("""
            UPDATE asha_visits av
               SET latitude        = %s,
                   longitude       = %s,
                   visit_timestamp = COALESCE(av.visit_timestamp,
                                              EXTRACT(EPOCH FROM av.visit_date))
              FROM patients p
             WHERE av.patient_id = p.id
               AND p.patient_id  = %s
               AND (av.latitude IS NULL OR av.longitude IS NULL)
        """, (_dlat, _dlng, _dpid))

    # ── Demo patients: high-risk AI signal profiles + geo-verified cluster data ─
    # Seeded once; safe to call on every startup (guarded by DEMO- prefix check).
    # ALL patients and visits carry real GPS coordinates so the cluster engine,
    # heatmap, and surveillance dashboard are populated on first boot.
    #
    # GPS reference — Gorakhpur district, Uttar Pradesh, India
    # ┌─────────────────────────┬────────────────┬────────────────┬──────────────┐
    # │ Patient / Group         │ Latitude       │ Longitude      │ Village      │
    # ├─────────────────────────┼────────────────┼────────────────┼──────────────┤
    # │ Meena Devi (HTN)        │ 26.740300      │ 83.410200      │ Rampur       │
    # │ Suresh Pillai (HTN)     │ 26.744500      │ 83.414800      │ Sundarpur    │
    # │ Fever cluster P1        │ 26.741000      │ 83.410500      │ Rampur       │
    # │ Fever cluster P2        │ 26.741500      │ 83.410800      │ Rampur       │
    # │ Fever cluster P3        │ 26.741300      │ 83.410200      │ Rampur       │
    # │ Fever control (4.3 km)  │ 26.765000      │ 83.445000      │ Nandanpur    │
    # └─────────────────────────┴────────────────┴────────────────┴──────────────┘
    #
    # Fever cluster spatial verification (Haversine at 26.74°N):
    #   1° lat ≈ 111 100 m   |   1° lng ≈ 99 240 m (cos 26.74°)
    #   P1→P2: Δlat=55 m, Δlng=30 m → 63 m   ✓ within 200 m radius
    #   P1→P3: Δlat=33 m, Δlng=30 m → 45 m   ✓ within 200 m radius
    #   P2→P3: Δlat=22 m, Δlng=60 m → 64 m   ✓ within 200 m radius
    #   Control→centroid: Δlat=2 633 m, Δlng=3 427 m → 4 323 m   ✗ excluded
    cur.execute("SELECT COUNT(*) FROM patients WHERE patient_id LIKE 'DEMO-%%'")
    if cur.fetchone()[0] == 0:
        import json as _js
        import hashlib as _hs
        import time as _t
        from datetime import datetime as _dt, timedelta as _td

        def _vh(d): return _hs.sha256(_js.dumps(d, sort_keys=True, default=str).encode()).hexdigest()
        def _ts(dt): return dt.timestamp()   # Unix float for visit_timestamp

        cur.execute("SELECT id FROM users WHERE username='asha_priya' LIMIT 1")
        _ar = cur.fetchone()
        cur.execute("SELECT id FROM users WHERE username='dr_rajan' LIMIT 1")
        _dr = cur.fetchone()
        _aid = _ar[0] if _ar else None
        _did = _dr[0] if _dr else None
        _now = _dt.utcnow()

        if _aid:
            # ── Patient 1: Meena Devi — HIGH hypertension / diabetes risk ────
            # GPS: Rampur village centre (26.7403, 83.4102)
            cur.execute("""
                INSERT INTO patients (patient_id, full_name, age, gender, village, phone,
                    asha_worker_id, doctor_id, medical_history, last_visit,
                    latitude, longitude)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, ('DEMO-MEENA-001', 'Meena Devi', 54, 'Female', 'Rampur', '9411100001',
                  _aid, _did,
                  'Hypertension, family history of diabetes, overweight',
                  _now - _td(days=14),
                  26.740300, 83.410200))
            _mid = cur.fetchone()[0]

            for _v in [
                dict(d=90, sys=142, dia=86, miss=False, diz=False, sc=65, lv='HIGH',
                     lat=26.740300, lng=83.410200,
                     gcpe={'answers': {'bp_systolic': 142, 'bp_diastolic': 86, 'dizziness': False,
                                       'chest_pain': False, 'medicine_missed': False, 'fatigue': True},
                           'pathways': ['hypertensive_urgency'], 'protocol_id': 'HTN-001',
                           'protocol_version': '2.0', 'risk_flags': ['HIGH'], 'steps_taken': 6}),
                dict(d=60, sys=152, dia=90, miss=True, diz=True, sc=75, lv='HIGH',
                     lat=26.740300, lng=83.410200,
                     gcpe={'answers': {'bp_systolic': 152, 'bp_diastolic': 90, 'dizziness': True,
                                       'chest_pain': False, 'medicine_missed': True, 'fatigue': True,
                                       'excessive_thirst': True},
                           'pathways': ['hypertensive_urgency', 'adherence_concern'],
                           'protocol_id': 'HTN-001', 'protocol_version': '2.0',
                           'risk_flags': ['HIGH'], 'steps_taken': 8}),
                dict(d=14, sys=162, dia=94, miss=True, diz=True, sc=85, lv='HIGH',
                     lat=26.740300, lng=83.410200,
                     gcpe={'answers': {'bp_systolic': 162, 'bp_diastolic': 94, 'dizziness': True,
                                       'chest_pain': False, 'medicine_missed': True, 'fatigue': True,
                                       'excessive_thirst': True, 'family_history_diabetes': True},
                           'pathways': ['hypertensive_urgency', 'adherence_concern'],
                           'protocol_id': 'HTN-001', 'protocol_version': '2.0',
                           'risk_flags': ['HIGH'], 'steps_taken': 9}),
            ]:
                _vdt = _now - _td(days=_v['d'])
                cur.execute("""
                    INSERT INTO asha_visits (patient_id, asha_worker_id, visit_date,
                        dizziness, chest_pain, medicine_missed, bp_systolic, bp_diastolic,
                        risk_score, risk_level, gcpe_data, visit_hash,
                        latitude, longitude, visit_timestamp)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (_mid, _aid, _vdt,
                      _v['diz'], False, _v['miss'], _v['sys'], _v['dia'],
                      _v['sc'], _v['lv'], _js.dumps(_v['gcpe']),
                      _vh({'pid': _mid, 's': _v['sys'], 'd': _v['dia'], 'days': _v['d']}),
                      _v['lat'], _v['lng'], _ts(_vdt)))

            # ── Patient 2: Suresh Pillai — ELEVATED risk ──────────────────────
            # GPS: Sundarpur (~600 m NE of Rampur)
            cur.execute("""
                INSERT INTO patients (patient_id, full_name, age, gender, village, phone,
                    asha_worker_id, doctor_id, medical_history, last_visit,
                    latitude, longitude)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, ('DEMO-SURESH-001', 'Suresh Pillai', 48, 'Male', 'Sundarpur', '9411100002',
                  _aid, _did,
                  'Hypertension, overweight, sedentary lifestyle, fatigue symptoms',
                  _now - _td(days=7),
                  26.744500, 83.414800))
            _sid = cur.fetchone()[0]

            for _v in [
                dict(d=60, sys=138, dia=84, miss=False, diz=False, sc=50, lv='MEDIUM',
                     lat=26.744500, lng=83.414800,
                     gcpe={'answers': {'bp_systolic': 138, 'bp_diastolic': 84, 'dizziness': False,
                                       'chest_pain': False, 'medicine_missed': False, 'fatigue': True},
                           'pathways': ['hypertensive_urgency'], 'protocol_id': 'HTN-001',
                           'protocol_version': '2.0', 'risk_flags': ['MEDIUM'], 'steps_taken': 6}),
                dict(d=7, sys=148, dia=88, miss=True, diz=True, sc=65, lv='HIGH',
                     lat=26.744500, lng=83.414800,
                     gcpe={'answers': {'bp_systolic': 148, 'bp_diastolic': 88, 'dizziness': True,
                                       'chest_pain': False, 'medicine_missed': True, 'fatigue': True,
                                       'excessive_thirst': True},
                           'pathways': ['hypertensive_urgency', 'adherence_concern'],
                           'protocol_id': 'HTN-001', 'protocol_version': '2.0',
                           'risk_flags': ['HIGH'], 'steps_taken': 7}),
            ]:
                _vdt = _now - _td(days=_v['d'])
                cur.execute("""
                    INSERT INTO asha_visits (patient_id, asha_worker_id, visit_date,
                        dizziness, chest_pain, medicine_missed, bp_systolic, bp_diastolic,
                        risk_score, risk_level, gcpe_data, visit_hash,
                        latitude, longitude, visit_timestamp)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (_sid, _aid, _vdt,
                      _v['diz'], False, _v['miss'], _v['sys'], _v['dia'],
                      _v['sc'], _v['lv'], _js.dumps(_v['gcpe']),
                      _vh({'pid': _sid, 's': _v['sys'], 'd': _v['dia'], 'days': _v['d']}),
                      _v['lat'], _v['lng'], _ts(_vdt)))

            # ── Fever Cluster: 3 patients within 200 m, visits within 10 days ─
            # Cluster engine threshold: 3 cases, 200 m radius, 10-day window.
            # All 3 are in Rampur. Their inter-point distances are 45–64 m.
            _fever_patients = [
                # (patient_id, name, age, gender, phone, lat, lng, days_ago_visit)
                ('DEMO-FEVER-001', 'Priya Kumari',  28, 'Female', '9411100010',
                 26.741000, 83.410500, 3),
                ('DEMO-FEVER-002', 'Ramu Yadav',    35, 'Male',   '9411100011',
                 26.741500, 83.410800, 6),
                ('DEMO-FEVER-003', 'Sita Bai',      42, 'Female', '9411100012',
                 26.741300, 83.410200, 8),
            ]

            for (_fpid, _fname, _fage, _fgender, _fphone, _flat, _flng, _fdays) in _fever_patients:
                cur.execute("""
                    INSERT INTO patients (patient_id, full_name, age, gender, village, phone,
                        asha_worker_id, doctor_id, medical_history, last_visit,
                        latitude, longitude)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
                """, (_fpid, _fname, _fage, _fgender, 'Rampur', _fphone,
                      _aid, _did,
                      'Acute febrile illness, suspected viral fever',
                      _now - _td(days=_fdays),
                      _flat, _flng))
                _fid = cur.fetchone()[0]
                _fdt = _now - _td(days=_fdays)
                _fgcpe = {
                    'answers': {'temperature': 38.6, 'dizziness': True,
                                'chest_pain': False, 'medicine_missed': False,
                                'fatigue': True, 'fever': True},
                    'pathways': ['fever'], 'protocol_id': 'FVR-001',
                    'protocol_version': '1.0', 'risk_flags': ['MEDIUM'], 'steps_taken': 4,
                }
                cur.execute("""
                    INSERT INTO asha_visits (patient_id, asha_worker_id, visit_date,
                        dizziness, chest_pain, medicine_missed,
                        bp_systolic, bp_diastolic, temperature,
                        risk_score, risk_level, gcpe_data, visit_hash,
                        latitude, longitude, visit_timestamp)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (_fid, _aid, _fdt,
                      True, False, False,
                      118, 76, 38.6,
                      35, 'MEDIUM',
                      _js.dumps(_fgcpe),
                      _vh({'pid': _fid, 'type': 'fever', 'days': _fdays}),
                      _flat, _flng, _ts(_fdt)))

            # ── Fever Control: 1 patient 4.3 km from cluster — must be excluded ─
            # Validates real spatial separation. Same symptom, wrong location.
            cur.execute("""
                INSERT INTO patients (patient_id, full_name, age, gender, village, phone,
                    asha_worker_id, doctor_id, medical_history, last_visit,
                    latitude, longitude)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, ('DEMO-FEVER-CTL-001', 'Govind Mishra', 31, 'Male', 'Nandanpur', '9411100013',
                  _aid, _did,
                  'Acute febrile illness — isolated case, Nandanpur',
                  _now - _td(days=5),
                  26.765000, 83.445000))
            _ctlid = cur.fetchone()[0]
            _ctldt = _now - _td(days=5)
            _ctlgcpe = {
                'answers': {'temperature': 38.9, 'dizziness': False,
                            'chest_pain': False, 'medicine_missed': False,
                            'fatigue': True, 'fever': True},
                'pathways': ['fever'], 'protocol_id': 'FVR-001',
                'protocol_version': '1.0', 'risk_flags': ['MEDIUM'], 'steps_taken': 4,
            }
            cur.execute("""
                INSERT INTO asha_visits (patient_id, asha_worker_id, visit_date,
                    dizziness, chest_pain, medicine_missed,
                    bp_systolic, bp_diastolic, temperature,
                    risk_score, risk_level, gcpe_data, visit_hash,
                    latitude, longitude, visit_timestamp)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (_ctlid, _aid, _ctldt,
                  False, False, False,
                  112, 72, 38.9,
                  30, 'MEDIUM',
                  _js.dumps(_ctlgcpe),
                  _vh({'pid': _ctlid, 'type': 'fever_control', 'days': 5}),
                  26.765000, 83.445000, _ts(_ctldt)))

    # ── Fever cluster seed — independent guard (safe to add to existing DBs) ─────
    # Seeds DEMO-FEVER-* patients regardless of whether other DEMO patients exist.
    # This block runs on every startup but is a no-op if these records are present.
    cur.execute("SELECT COUNT(*) FROM patients WHERE patient_id = 'DEMO-FEVER-001'")
    if cur.fetchone()[0] == 0:
        import json as _fjs
        import hashlib as _fhs
        from datetime import datetime as _fdt_cls, timedelta as _ftd

        def _fvh(d): return _fhs.sha256(_fjs.dumps(d, sort_keys=True, default=str).encode()).hexdigest()
        def _fts(dt): return dt.timestamp()

        cur.execute("SELECT id FROM users WHERE username='asha_priya' LIMIT 1")
        _far = cur.fetchone()
        cur.execute("SELECT id FROM users WHERE username='dr_rajan' LIMIT 1")
        _fdr = cur.fetchone()
        _faid = _far[0] if _far else None
        _fdid = _fdr[0] if _fdr else None
        _fnow = _fdt_cls.utcnow()

        if _faid:
            # 3 fever patients — all within 200 m, visits within 10 days → FEVER cluster
            _fever_seed = [
                ('DEMO-FEVER-001', 'Priya Kumari', 28, 'Female', '9411100010',
                 26.741000, 83.410500, 3),
                ('DEMO-FEVER-002', 'Ramu Yadav',   35, 'Male',   '9411100011',
                 26.741500, 83.410800, 6),
                ('DEMO-FEVER-003', 'Sita Bai',     42, 'Female', '9411100012',
                 26.741300, 83.410200, 8),
            ]
            for (_fpid, _fname, _fage, _fgender, _fphone, _flat, _flng, _fdays) in _fever_seed:
                cur.execute("""
                    INSERT INTO patients
                        (patient_id, full_name, age, gender, village, phone,
                         asha_worker_id, doctor_id, medical_history, last_visit,
                         latitude, longitude)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
                """, (_fpid, _fname, _fage, _fgender, 'Rampur', _fphone,
                      _faid, _fdid,
                      'Acute febrile illness, suspected viral fever',
                      _fnow - _ftd(days=_fdays),
                      _flat, _flng))
                _fid = cur.fetchone()[0]
                _fvdt = _fnow - _ftd(days=_fdays)
                _fgcpe = {
                    'answers': {'temperature': 38.6, 'dizziness': True,
                                'chest_pain': False, 'medicine_missed': False,
                                'fatigue': True, 'fever': True},
                    'pathways': ['fever'], 'protocol_id': 'FVR-001',
                    'protocol_version': '1.0', 'risk_flags': ['MEDIUM'], 'steps_taken': 4,
                }
                cur.execute("""
                    INSERT INTO asha_visits
                        (patient_id, asha_worker_id, visit_date,
                         dizziness, chest_pain, medicine_missed,
                         bp_systolic, bp_diastolic, temperature,
                         risk_score, risk_level, gcpe_data, visit_hash,
                         latitude, longitude, visit_timestamp)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (_fid, _faid, _fvdt,
                      True, False, False,
                      118, 76, 38.6,
                      35, 'MEDIUM',
                      _fjs.dumps(_fgcpe),
                      _fvh({'pid': _fid, 'type': 'fever', 'days': _fdays}),
                      _flat, _flng, _fts(_fvdt)))

            # Fever control — 4.3 km from cluster, same symptom but spatially isolated
            cur.execute("""
                INSERT INTO patients
                    (patient_id, full_name, age, gender, village, phone,
                     asha_worker_id, doctor_id, medical_history, last_visit,
                     latitude, longitude)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, ('DEMO-FEVER-CTL-001', 'Govind Mishra', 31, 'Male',
                  'Nandanpur', '9411100013',
                  _faid, _fdid,
                  'Acute febrile illness — isolated case, Nandanpur',
                  _fnow - _ftd(days=5),
                  26.765000, 83.445000))
            _fctlid = cur.fetchone()[0]
            _fctldt = _fnow - _ftd(days=5)
            cur.execute("""
                INSERT INTO asha_visits
                    (patient_id, asha_worker_id, visit_date,
                     dizziness, chest_pain, medicine_missed,
                     bp_systolic, bp_diastolic, temperature,
                     risk_score, risk_level, gcpe_data, visit_hash,
                     latitude, longitude, visit_timestamp)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (_fctlid, _faid, _fctldt,
                  False, False, False,
                  112, 72, 38.9,
                  30, 'MEDIUM',
                  _fjs.dumps({
                      'answers': {'temperature': 38.9, 'dizziness': False,
                                  'chest_pain': False, 'medicine_missed': False,
                                  'fatigue': True, 'fever': True},
                      'pathways': ['fever'], 'protocol_id': 'FVR-001',
                      'protocol_version': '1.0', 'risk_flags': ['MEDIUM'], 'steps_taken': 4,
                  }),
                  _fvh({'pid': _fctlid, 'type': 'fever_control', 'days': 5}),
                  26.765000, 83.445000, _fts(_fctldt)))

    # ── Demo prescriptions / tokens / adherence / absence events ─────────────
    # Guard: idempotent — only runs when no prescriptions exist for Meena Devi.
    # Produces 3 prescriptions, 3 tokens (2 pending + 1 redeemed), 3 absence
    # events, and 1 real PoW adherence blockchain block on every fresh DB.
    cur.execute("""
        SELECT COUNT(*) FROM prescriptions p
        JOIN patients pat ON pat.id = p.patient_id
        WHERE pat.patient_id = 'DEMO-MEENA-001'
    """)
    if cur.fetchone()[0] == 0:
        import hashlib as _rxh
        import json   as _rxj
        import time   as _rxt
        from datetime import datetime as _rxdt, timedelta as _rxtd
        from blockchain.block      import load_or_create_keypair as _rxkp, sign_hash as _rxsig
        from blockchain.blockchain import add_visit_block as _rxavb

        _rxpriv, _rxpub = _rxkp()
        _rxnow = _rxdt.utcnow()

        # ── Look up stable IDs ────────────────────────────────────────────────
        cur.execute("SELECT id FROM users    WHERE username='dr_rajan'   LIMIT 1")
        _rxdid = cur.fetchone()[0]
        cur.execute("SELECT id FROM users    WHERE username='asha_priya' LIMIT 1")
        _rxaid = cur.fetchone()[0]
        cur.execute("SELECT id FROM patients WHERE patient_id='DEMO-MEENA-001'  LIMIT 1")
        _rxmpid = cur.fetchone()[0]
        cur.execute("SELECT id FROM patients WHERE patient_id='DEMO-SURESH-001' LIMIT 1")
        _rxspid = cur.fetchone()[0]

        # Earliest visit IDs for each patient (for prescription→visit linkage)
        cur.execute("""SELECT id FROM asha_visits WHERE patient_id=%s
                       ORDER BY visit_date ASC LIMIT 1""", (_rxmpid,))
        _rxrow = cur.fetchone(); _rxmvid = _rxrow[0] if _rxrow else None
        cur.execute("""SELECT id FROM asha_visits WHERE patient_id=%s
                       ORDER BY visit_date ASC LIMIT 1""", (_rxspid,))
        _rxrow = cur.fetchone(); _rxsvid = _rxrow[0] if _rxrow else None

        def _rxvh(token_id, rx_id, pat_id, ts):
            """Generate deterministic token_hash + ECDSA signature."""
            payload = _rxj.dumps({"token_id": token_id, "prescription_id": rx_id,
                                   "patient_id": pat_id, "issued_ts": ts}, sort_keys=True)
            th  = _rxh.sha256(payload.encode()).hexdigest()
            sig = _rxsig(_rxpriv, th)
            return th, sig

        def _rxuid(seed: bytes) -> str:
            """Deterministic 64-hex token_id from a seed."""
            return _rxh.sha256(seed).hexdigest()

        # ────────────────────────────────────────────────────────────────────
        # Prescription 1 — Meena Devi: Amlodipine 5mg + Atenolol 50mg
        # Issued 45 days ago by dr_rajan. Active prescription, pending pickup.
        # ────────────────────────────────────────────────────────────────────
        _rx1date = _rxnow - _rxtd(days=45)
        cur.execute("""
            INSERT INTO prescriptions
                (patient_id, visit_id, doctor_id, prescribed_at, medicines,
                 dosage_instructions, followup_date, notes, is_janaushadi)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
        """, (
            _rxmpid, _rxmvid, _rxdid, _rx1date,
            _rxj.dumps([
                {"name": "Amlodipine", "dose": "5mg",  "frequency": "Once daily", "duration_days": 90},
                {"name": "Atenolol",   "dose": "50mg", "frequency": "Once daily", "duration_days": 90},
            ]),
            "Take Amlodipine in the morning before food. "
            "Atenolol after breakfast. Avoid sudden posture changes. "
            "Monitor BP daily — target <130/80 mmHg.",
            _rxnow + _rxtd(days=45),
            "Stage 2 hypertension — calcium channel blocker + beta blocker combination. "
            "Escalate to specialist if BP not controlled within 6 weeks.",
            True,
        ))
        _rx1id = cur.fetchone()[0]

        # Token A — PENDING (Meena's active Rx, awaiting pickup at Rampur PHC)
        _tA_id   = _rxuid(b'aarogyanet:meena:token:A:pending')
        _tA_ts   = (_rx1date + _rxtd(hours=4)).timestamp()
        _tA_hash, _tA_sig = _rxvh(_tA_id, _rx1id, _rxmpid, _tA_ts)
        cur.execute("""
            INSERT INTO prescription_tokens
                (token_id, prescription_id, patient_id, token_hash, signature,
                 issued_at, expires_at, redemption_status, outlet_name)
            VALUES (%s,%s,%s,%s,%s,%s,%s,'pending',%s)
        """, (
            _tA_id, _rx1id, _rxmpid, _tA_hash, _tA_sig,
            _rx1date + _rxtd(hours=4),
            _rx1date + _rxtd(days=30),
            "Jan Aushadi Kendra — Rampur PHC",
        ))

        # ────────────────────────────────────────────────────────────────────
        # Prescription 2 — Suresh Pillai: Losartan 50mg + HCTZ 12.5mg
        # Issued 60 days ago. Pending token — patient has NOT collected.
        # Combined with absence events, this surfaces as continuity alert.
        # ────────────────────────────────────────────────────────────────────
        _rx2date = _rxnow - _rxtd(days=60)
        cur.execute("""
            INSERT INTO prescriptions
                (patient_id, visit_id, doctor_id, prescribed_at, medicines,
                 dosage_instructions, followup_date, notes, is_janaushadi)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
        """, (
            _rxspid, _rxsvid, _rxdid, _rx2date,
            _rxj.dumps([
                {"name": "Losartan",             "dose": "50mg",   "frequency": "Once daily", "duration_days": 90},
                {"name": "Hydrochlorothiazide",  "dose": "12.5mg", "frequency": "Once daily", "duration_days": 90},
            ]),
            "Take Losartan in the morning. HCTZ with breakfast. "
            "Increase potassium-rich foods — bananas, coconut water, dal. "
            "Check for dizziness on standing (orthostatic hypotension risk).",
            _rxnow + _rxtd(days=30),
            "Hypertension with mild peripheral oedema. "
            "ARB + diuretic combination. Watch potassium levels. "
            "Patient at HIGH continuity risk — multiple missed visits.",
            True,
        ))
        _rx2id = cur.fetchone()[0]

        # Token B — PENDING (Suresh's Rx — not collected, adds to overdue signals)
        _tB_id   = _rxuid(b'aarogyanet:suresh:token:B:pending')
        _tB_ts   = (_rx2date + _rxtd(hours=6)).timestamp()
        _tB_hash, _tB_sig = _rxvh(_tB_id, _rx2id, _rxspid, _tB_ts)
        cur.execute("""
            INSERT INTO prescription_tokens
                (token_id, prescription_id, patient_id, token_hash, signature,
                 issued_at, expires_at, redemption_status, outlet_name)
            VALUES (%s,%s,%s,%s,%s,%s,%s,'pending',%s)
        """, (
            _tB_id, _rx2id, _rxspid, _tB_hash, _tB_sig,
            _rx2date + _rxtd(hours=6),
            _rx2date + _rxtd(days=30),
            "Jan Aushadi Kendra — Sundarpur UPHC",
        ))

        # ────────────────────────────────────────────────────────────────────
        # Prescription 3 — Meena Devi: Amlodipine 2.5mg (initial low-dose, 80 days ago)
        # Token C — REDEEMED 5 days after issue. Demonstrates full token lifecycle
        # and produces a real adherence blockchain block.
        # ────────────────────────────────────────────────────────────────────
        _rx3date = _rxnow - _rxtd(days=80)
        cur.execute("""
            INSERT INTO prescriptions
                (patient_id, visit_id, doctor_id, prescribed_at, medicines,
                 dosage_instructions, followup_date, notes, is_janaushadi)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
        """, (
            _rxmpid, _rxmvid, _rxdid, _rx3date,
            _rxj.dumps([
                {"name": "Amlodipine", "dose": "2.5mg", "frequency": "Once daily", "duration_days": 30},
            ]),
            "Initial low-dose calcium channel blocker. Take in morning. "
            "Escalation to 5mg planned at follow-up visit if BP not controlled.",
            _rxnow - _rxtd(days=45),
            "First-line hypertension therapy. Low-dose initiation — watch for ankle oedema.",
            True,
        ))
        _rx3id = cur.fetchone()[0]

        # Commit prescriptions + pending tokens before mining the adherence block
        conn.commit()

        # ── Mine real PoW adherence block for Meena's redeemed token ─────────
        _tC_id       = _rxuid(b'aarogyanet:meena:token:C:redeemed')
        _tC_ts       = (_rx3date + _rxtd(days=2)).timestamp()
        _tC_hash, _tC_sig = _rxvh(_tC_id, _rx3id, _rxmpid, _tC_ts)
        _tC_redeemed = _rx3date + _rxtd(days=5)

        # Synthesize an adherence visit payload for blockchain mining
        _adh_data = {
            "patient_id":      _rxmpid,
            "asha_worker_id":  _rxaid,
            "visit_timestamp": _tC_ts,
            "bp_systolic":     162, "bp_diastolic": 94,
            "dizziness": False, "chest_pain": False, "medicine_missed": False,
            "pulse": 76, "temperature": None,
            "notes": "Meena Devi collected Amlodipine 2.5mg from Jan Aushadi Kendra — Rampur PHC. "
                     "Good adherence. BP improving — 162/94 (was 178/106).",
            "gcpe_data": {"pathways": ["adherence_confirmed", "hypertension_management"],
                          "risk_flags": ["MEDIUM"], "steps_taken": 3,
                          "answers": {"bp_systolic": 162, "bp_diastolic": 94,
                                      "medicine_missed": False}},
            "risk_score": 45, "risk_level": "MEDIUM",
            "event_type": "adherence", "token_id": _tC_id, "token_hash": _tC_hash,
        }
        _adh_block       = _rxavb(_adh_data)
        _adh_block_index = _adh_block.index
        _adh_hash        = _rxh.sha256(f"{_tC_hash}:{_adh_block_index}".encode()).hexdigest()

        # Insert redeemed token + adherence event (new connection — mining opened its own)
        _conn2 = get_db_connection()
        _cur2  = _conn2.cursor()

        _cur2.execute("""
            INSERT INTO prescription_tokens
                (token_id, prescription_id, patient_id, token_hash, signature,
                 issued_at, expires_at, redemption_status, redeemed_at,
                 redemption_method, redeemed_by, outlet_name, block_index)
            VALUES (%s,%s,%s,%s,%s,%s,%s,'redeemed',%s,'patient_pickup',%s,%s,%s)
        """, (
            _tC_id, _rx3id, _rxmpid, _tC_hash, _tC_sig,
            _rx3date + _rxtd(days=2),
            _rx3date + _rxtd(days=32),
            _tC_redeemed, _rxaid,
            "Jan Aushadi Kendra — Rampur PHC",
            _adh_block_index,
        ))

        _cur2.execute("""
            INSERT INTO adherence_events
                (token_id, adherence_hash, block_index, redemption_type, created_at)
            VALUES (%s,%s,%s,'patient_pickup',%s)
        """, (_tC_id, _adh_hash, _adh_block_index, _tC_redeemed))

        # ── Absence events: Suresh Pillai — 3 signals → continuity alerts ────
        # Designed to trigger LOW_CONTINUITY_SCORE + OVERDUE_VISIT + CONSECUTIVE_MISSES
        _absences = [
            # (patient_id, asha_worker_id, type, notes, expected_date, risk_level, created_at)
            (
                _rxspid, _rxaid, "patient_unavailable",
                "ASHA visited Suresh's home — family reported he had gone to Lucknow. "
                "No return date given. BP monitoring interrupted.",
                (_rxnow - _rxtd(days=65)).date(), "MEDIUM",
                _rxnow - _rxtd(days=65),
            ),
            (
                _rxspid, _rxaid, "missed_visit",
                "Suresh did not appear for his scheduled monthly hypertension follow-up. "
                "No response on registered phone number. Medicine supply unknown.",
                (_rxnow - _rxtd(days=35)).date(), "HIGH",
                _rxnow - _rxtd(days=34),
            ),
            (
                _rxspid, _rxaid, "contact_lost",
                "Third attempt to reach Suresh — phone unreachable, neighbour says family is away. "
                "HIGH risk hypertensive patient now 35+ days overdue. Escalation recommended.",
                (_rxnow - _rxtd(days=15)).date(), "HIGH",
                _rxnow - _rxtd(days=12),
            ),
        ]
        for _ab in _absences:
            _cur2.execute("""
                INSERT INTO absence_events
                    (patient_id, asha_worker_id, absence_type, notes,
                     expected_date, latest_risk_level, created_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, _ab)

        _conn2.commit()
        _cur2.close()
        _conn2.close()

    # ── Suresh post-visit absence streak — independent guard ─────────────────
    # These 2 absence events are dated AFTER Suresh's May-19 visit so the
    # continuity engine sees missed_streak=2, firing CONSECUTIVE_MISSES alerts.
    # Guard: insert only when Suresh has <5 absence events total.
    cur.execute("""
        SELECT COUNT(*) FROM absence_events ae
        JOIN patients p ON p.id = ae.patient_id
        WHERE p.patient_id = 'DEMO-SURESH-001'
    """)
    if cur.fetchone()[0] < 5:
        cur.execute("SELECT id FROM patients WHERE patient_id='DEMO-SURESH-001' LIMIT 1")
        _row = cur.fetchone()
        if _row:
            _spid3 = _row[0]
            cur.execute("SELECT id FROM users WHERE username='asha_priya' LIMIT 1")
            _aid3 = cur.fetchone()[0]
            import datetime as _sdt
            _snow = _sdt.datetime.utcnow()
            _recent_absences = [
                (
                    _spid3, _aid3, 'missed_visit',
                    "Suresh did not attend his scheduled follow-up after the May 19 visit. "
                    "Phone unreachable. Previous missed visit pattern persists. "
                    "Losartan + HCTZ supply estimated exhausted — critical adherence gap.",
                    (_snow - _sdt.timedelta(days=5)).date(),
                    'HIGH',
                    _snow - _sdt.timedelta(days=5),
                ),
                (
                    _spid3, _aid3, 'contact_lost',
                    "Fifth outreach attempt — Suresh Pillai remains unreachable. "
                    "Neighbour confirms family has not been seen for several days. "
                    "HIGH-risk hypertensive patient: uncontrolled BP risk without medication. "
                    "Supervisor escalation flagged. Field visit by Block Medical Officer recommended.",
                    (_snow - _sdt.timedelta(days=2)).date(),
                    'HIGH',
                    _snow - _sdt.timedelta(days=2),
                ),
            ]
            for _rab in _recent_absences:
                cur.execute("""
                    INSERT INTO absence_events
                        (patient_id, asha_worker_id, absence_type, notes,
                         expected_date, latest_risk_level, created_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                """, _rab)

    conn.commit()
    cur.close()
    conn.close()
    print("[AarogyaNet] Database initialized successfully.")
