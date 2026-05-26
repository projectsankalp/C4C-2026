"""
ASHA visit routes — create, list, and view hypertension assessment visits.
Each completed visit triggers risk scoring and blockchain mining.

Endpoints:
  POST /api/visits          — create a live visit (online path)
  GET  /api/visits          — list visits (role-filtered)
  GET  /api/visits/<id>     — single visit detail + longitudinal snapshot
  GET  /api/visits/patient/<id> — all visits for a patient
  POST /api/visits/sync     — replay offline SQLite queue into PostgreSQL
"""
import json
import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import psycopg2.extras
from database.postgres import get_db_connection
from database.sqlite_sync import get_pending_syncs, mark_synced
from utils.helpers import generate_visit_hash, serialize_row, rows_to_list
from utils.validators import validate_bp, sanitize_text, validate_coordinates
from ai_engine.risk_engine import calculate_risk_score, get_risk_summary
from blockchain.blockchain import add_visit_block

log = logging.getLogger(__name__)

visit_bp = Blueprint('visits', __name__, url_prefix='/api/visits')


@visit_bp.route('', methods=['POST'])
@jwt_required()
def create_visit():
    """
    Create a new ASHA visit with GCPE data.
    Steps:
      1. Save visit to PostgreSQL
      2. Calculate risk score
      3. Mine a blockchain block
      4. Link block index back to visit
    """
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') not in ('asha', 'admin'):
        return jsonify({'error': 'Only ASHA workers can record visits'}), 403

    data = request.get_json(force=True)
    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id is required'}), 400

    # Validate BP if provided
    bp_s = data.get('bp_systolic')
    bp_d = data.get('bp_diastolic')
    if bp_s and bp_d:
        ok, msg = validate_bp(bp_s, bp_d)
        if not ok:
            return jsonify({'error': msg}), 400

    # Extract and validate GPS coordinates (null is accepted — graceful fallback)
    import time as _time
    lat = data.get('latitude')
    lon = data.get('longitude')
    lat = float(lat) if lat is not None else None
    lon = float(lon) if lon is not None else None
    gps_ok, gps_msg = validate_coordinates(lat, lon)
    if not gps_ok:
        return jsonify({'error': f'GPS validation failed: {gps_msg}'}), 400

    # Canonical visit timestamp (Unix float) — used in hash for replay protection
    visit_timestamp = float(data.get('visit_timestamp') or _time.time())

    # 1. Calculate risk
    risk_score, risk_level = calculate_risk_score(data)
    risk_info = get_risk_summary(risk_score, risk_level, data)

    # 2. Compute visit hash — includes GPS + timestamp so any tampering breaks it
    visit_payload = {
        'patient_id': patient_id,
        'asha_worker_id': user_id,
        'visit_timestamp': visit_timestamp,
        'latitude': lat,
        'longitude': lon,
        'bp_systolic': bp_s,
        'bp_diastolic': bp_d,
        'dizziness': data.get('dizziness', False),
        'chest_pain': data.get('chest_pain', False),
        'medicine_missed': data.get('medicine_missed', False),
        'pulse': data.get('pulse'),
        'temperature': data.get('temperature'),
        'notes': sanitize_text(data.get('notes', '')),
        'risk_score': risk_score,
        'risk_level': risk_level,
    }
    visit_hash = generate_visit_hash(visit_payload)

    # 3. Insert visit into DB
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO asha_visits
                (patient_id, asha_worker_id, dizziness, chest_pain, medicine_missed,
                 bp_systolic, bp_diastolic, temperature, pulse, notes,
                 risk_score, risk_level, gcpe_data, visit_hash,
                 latitude, longitude, visit_timestamp)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
        """, (
            patient_id, user_id,
            bool(data.get('dizziness')), bool(data.get('chest_pain')),
            bool(data.get('medicine_missed')),
            bp_s, bp_d,
            data.get('temperature'), data.get('pulse'),
            sanitize_text(data.get('notes', '')),
            risk_score, risk_level,
            json.dumps(data.get('gcpe_data', {})),
            visit_hash,
            lat, lon, visit_timestamp
        ))
        visit_id = cur.fetchone()[0]

        # Update patient's last_visit timestamp
        cur.execute("UPDATE patients SET last_visit = NOW() WHERE id = %s", (patient_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': f'Failed to save visit: {str(e)}'}), 500

    # 4. Mine blockchain block (done after DB commit)
    block = None
    blockchain_mined = False
    blockchain_error = None
    try:
        block = add_visit_block(visit_payload)
        blockchain_mined = True
        # Link block_index back to visit
        cur2 = conn.cursor()
        cur2.execute("""
            UPDATE asha_visits
            SET block_index = %s, synced_to_blockchain = TRUE
            WHERE id = %s
        """, (block.index, visit_id))
        conn.commit()
        cur2.close()
    except Exception as e:
        blockchain_error = str(e)
        print(f"[WARNING] Blockchain mining failed for visit {visit_id}: {e}")
    finally:
        cur.close()
        conn.close()

    return jsonify({
        'id': visit_id,
        'visit_hash': visit_hash,
        'risk': risk_info,
        'block_index': block.index if block else None,
        'blockchain_mined': blockchain_mined,
        'blockchain_error': blockchain_error,
        'message': 'Visit recorded and block mined successfully' if blockchain_mined else 'Visit recorded; blockchain mining failed',
    }), 201


@visit_bp.route('', methods=['GET'])
@jwt_required()
def list_visits():
    """List visits — filtered by role."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get('role', '')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if role == 'asha':
        cur.execute("""
            SELECT v.*, p.full_name as patient_name, p.patient_id as patient_code
            FROM asha_visits v
            JOIN patients p ON p.id = v.patient_id
            WHERE v.asha_worker_id = %s
            ORDER BY v.visit_date DESC LIMIT 50
        """, (user_id,))
    elif role in ('doctor', 'admin'):
        cur.execute("""
            SELECT v.*, p.full_name as patient_name, p.patient_id as patient_code,
                   u.full_name as asha_name
            FROM asha_visits v
            JOIN patients p ON p.id = v.patient_id
            JOIN users u ON u.id = v.asha_worker_id
            ORDER BY v.risk_score DESC, v.visit_date DESC LIMIT 100
        """)
    else:
        cur.execute("""
            SELECT v.*, p.full_name as patient_name
            FROM asha_visits v
            JOIN patients p ON p.id = v.patient_id
            WHERE p.phone = (SELECT phone FROM users WHERE id = %s)
            ORDER BY v.visit_date DESC LIMIT 20
        """, (user_id,))

    rows = rows_to_list(cur.fetchall())
    cur.close()
    conn.close()
    return jsonify(rows)


@visit_bp.route('/<int:visit_id>', methods=['GET'])
@jwt_required()
def get_visit(visit_id):
    """Get a single visit's full details including risk summary and longitudinal snapshot."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT v.*, p.full_name as patient_name, p.patient_id as patient_code,
               u.full_name as asha_name
        FROM asha_visits v
        JOIN patients p ON p.id = v.patient_id
        JOIN users u ON u.id = v.asha_worker_id
        WHERE v.id = %s
    """, (visit_id,))
    visit = cur.fetchone()
    cur.close()
    conn.close()
    if not visit:
        return jsonify({'error': 'Visit not found'}), 404
    result = serialize_row(visit)

    # Attach pathway-aware risk summary
    result['risk_summary'] = get_risk_summary(
        result.get('risk_score', 0),
        result.get('risk_level', 'LOW'),
        result
    )

    # Attach lightweight longitudinal snapshot for the doctor dashboard
    try:
        from services.longitudinal_engine import build_snapshot
        result['longitudinal_snapshot'] = build_snapshot(result['patient_id'])
    except Exception as e:
        result['longitudinal_snapshot'] = {'has_data': False, 'error': str(e)}

    return jsonify(result)


@visit_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def patient_visits(patient_id):
    """All visits for a specific patient."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT v.*, u.full_name as asha_name
        FROM asha_visits v
        JOIN users u ON u.id = v.asha_worker_id
        WHERE v.patient_id = %s
        ORDER BY v.visit_date DESC
    """, (patient_id,))
    rows = rows_to_list(cur.fetchall())
    cur.close()
    conn.close()
    return jsonify(rows)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/visits/sync
# Offline visit replay — flushes the SQLite queue into PostgreSQL.
#
# Each pending offline visit is replayed through the IDENTICAL pipeline as a
# live visit: risk scoring → DB insert → blockchain mining → block linkage.
#
# Guarantees:
#   • Original visit_timestamp / visit_date preserved (not overwritten by sync time)
#   • Partial failure safety: one bad record never aborts the batch
#   • Each successful visit mines a real PoW blockchain block
#   • Cluster recalculation is triggered once after the batch completes
#   • Visited records are marked synced to prevent duplicate replay
# ─────────────────────────────────────────────────────────────────────────────
@visit_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_offline_visits():
    """
    Replay all pending offline visits from SQLite into PostgreSQL.

    Caller: ASHA worker app after connectivity is restored.
    Roles allowed: asha, admin.

    Returns a per-visit breakdown of what succeeded, what failed, and which
    blockchain blocks were mined.
    """
    claims = get_jwt()
    if claims.get('role') not in ('asha', 'admin'):
        return jsonify({'error': 'Only ASHA workers can sync offline visits'}), 403

    caller_id = int(get_jwt_identity())

    pending = get_pending_syncs()
    if not pending:
        return jsonify({
            'success':         True,
            'message':         'No offline visits pending sync',
            'synced_count':    0,
            'failed_count':    0,
            'synced_visit_ids': [],
            'failed_visits':   [],
            'mined_blocks':    [],
        })

    synced_visit_ids = []
    failed_visits    = []
    mined_blocks     = []

    for record in pending:
        offline_id = record['id']
        try:
            # ── Reconstruct visit data from SQLite record ─────────────────
            gcpe_raw = record.get('gcpe_data') or '{}'
            try:
                if isinstance(gcpe_raw, str):
                    gcpe_data = json.loads(gcpe_raw)
                    # save_visit_offline double-encodes when caller passes a
                    # pre-serialised string; unwrap the second layer if needed.
                    if isinstance(gcpe_data, str):
                        gcpe_data = json.loads(gcpe_data)
                else:
                    gcpe_data = gcpe_raw or {}
                if not isinstance(gcpe_data, dict):
                    gcpe_data = {}
            except (json.JSONDecodeError, TypeError):
                gcpe_data = {}

            # patient_id may be stored as string or int
            patient_id = int(record['patient_id'])

            # Preserve original ASHA worker; fall back to caller if absent
            asha_worker_id = int(record['asha_worker_id'] or caller_id)

            # Original timestamp is preserved — do NOT use current time
            visit_timestamp = record.get('visit_timestamp')
            if visit_timestamp:
                visit_timestamp = float(visit_timestamp)
            else:
                # Fall back: parse visit_date string to epoch
                import time as _time
                from datetime import datetime as _dt
                vd = record.get('visit_date', '')
                try:
                    visit_timestamp = _dt.fromisoformat(str(vd)).timestamp()
                except Exception:
                    visit_timestamp = _time.time()

            lat = record.get('latitude')
            lon = record.get('longitude')
            lat = float(lat) if lat is not None else None
            lon = float(lon) if lon is not None else None

            bp_s = record.get('bp_systolic')
            bp_d = record.get('bp_diastolic')

            # Build canonical visit payload (matches online path exactly)
            visit_data = {
                'patient_id':      patient_id,
                'asha_worker_id':  asha_worker_id,
                'visit_timestamp': visit_timestamp,
                'latitude':        lat,
                'longitude':       lon,
                'bp_systolic':     bp_s,
                'bp_diastolic':    bp_d,
                'dizziness':       bool(record.get('dizziness')),
                'chest_pain':      bool(record.get('chest_pain')),
                'medicine_missed': bool(record.get('medicine_missed')),
                'pulse':           record.get('pulse'),
                'temperature':     record.get('temperature'),
                'notes':           sanitize_text(record.get('notes') or ''),
                'gcpe_data':       gcpe_data,
            }

            # ── Layer 1: risk scoring ─────────────────────────────────────
            risk_score, risk_level = calculate_risk_score(visit_data)
            visit_data['risk_score'] = risk_score
            visit_data['risk_level'] = risk_level

            # ── Layer 2: visit hash (use stored hash if present, else recompute) ──
            stored_hash = (record.get('visit_hash') or '').strip()
            visit_hash = stored_hash if stored_hash else generate_visit_hash(visit_data)

            # ── Layer 3: PostgreSQL insert — use original visit_date ──────
            # visit_date from SQLite is the original ASHA-recorded timestamp.
            visit_date_raw = record.get('visit_date')
            if visit_date_raw:
                from datetime import datetime as _dt2
                try:
                    visit_date = _dt2.fromisoformat(str(visit_date_raw))
                except Exception:
                    from datetime import datetime as _dt2
                    visit_date = _dt2.utcnow()
            else:
                from datetime import datetime as _dt2
                visit_date = _dt2.utcnow()

            conn = get_db_connection()
            cur  = conn.cursor()
            try:
                cur.execute("""
                    INSERT INTO asha_visits
                        (patient_id, asha_worker_id, visit_date,
                         dizziness, chest_pain, medicine_missed,
                         bp_systolic, bp_diastolic, temperature, pulse, notes,
                         risk_score, risk_level, gcpe_data, visit_hash,
                         latitude, longitude, visit_timestamp)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING id
                """, (
                    patient_id, asha_worker_id, visit_date,
                    visit_data['dizziness'], visit_data['chest_pain'],
                    visit_data['medicine_missed'],
                    bp_s, bp_d,
                    visit_data['temperature'], visit_data['pulse'],
                    visit_data['notes'],
                    risk_score, risk_level,
                    json.dumps(gcpe_data),
                    visit_hash,
                    lat, lon, visit_timestamp,
                ))
                visit_id = cur.fetchone()[0]

                # Update patient last_visit with the original visit date
                cur.execute("""
                    UPDATE patients
                       SET last_visit = GREATEST(COALESCE(last_visit, %s), %s)
                     WHERE id = %s
                """, (visit_date, visit_date, patient_id))
                conn.commit()
            except Exception as db_err:
                conn.rollback()
                raise db_err
            finally:
                cur.close()

            # ── Layer 4: blockchain mining ────────────────────────────────
            block_index      = None
            blockchain_mined = False
            try:
                block = add_visit_block(visit_data)
                blockchain_mined = True
                block_index = block.index

                # Link block back to visit row
                cur2 = conn.cursor()
                cur2.execute("""
                    UPDATE asha_visits
                       SET block_index = %s, synced_to_blockchain = TRUE
                     WHERE id = %s
                """, (block_index, visit_id))
                conn.commit()
                cur2.close()

                mined_blocks.append({
                    'visit_id':    visit_id,
                    'block_index': block_index,
                    'visit_hash':  visit_hash,
                })
            except Exception as bc_err:
                log.warning('[sync] Blockchain mining failed for offline visit %s (visit_id=%s): %s',
                            offline_id, visit_id, bc_err)
            finally:
                conn.close()

            # ── Layer 5: mark SQLite record as synced ─────────────────────
            mark_synced(offline_id)

            synced_visit_ids.append({
                'offline_id':      offline_id,
                'visit_id':        visit_id,
                'patient_id':      patient_id,
                'visit_date':      visit_date.isoformat(),
                'risk_level':      risk_level,
                'risk_score':      risk_score,
                'blockchain_mined': blockchain_mined,
                'block_index':     block_index,
            })

        except Exception as exc:
            log.error('[sync] Failed to replay offline visit id=%s: %s', offline_id, exc,
                      exc_info=True)
            failed_visits.append({
                'offline_id': offline_id,
                'patient_id': record.get('patient_id'),
                'error':      str(exc),
            })
            # Do NOT mark as synced — it remains in the queue for the next attempt

    # ── Post-batch: trigger cluster recalculation ─────────────────────────────
    if synced_visit_ids:
        try:
            from services.cluster_engine import detect_clusters
            detect_clusters(lookback_days=30)
        except Exception as ce:
            log.warning('[sync] Cluster recalculation after sync failed: %s', ce)

    synced_count = len(synced_visit_ids)
    failed_count = len(failed_visits)

    return jsonify({
        'success':          failed_count == 0,
        'message':          (
            f'{synced_count} visit(s) synced successfully'
            + (f', {failed_count} failed' if failed_count else '')
        ),
        'synced_count':     synced_count,
        'failed_count':     failed_count,
        'synced_visit_ids': synced_visit_ids,
        'failed_visits':    failed_visits,
        'mined_blocks':     mined_blocks,
    }), 200 if failed_count == 0 else 207
