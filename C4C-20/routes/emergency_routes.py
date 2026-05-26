"""
AarogyaNet SOS Emergency Escalation Routes.

POST /api/emergency                        — create SOS event (ASHA / patient)
GET  /api/emergency                        — list (role-aware)
GET  /api/emergency/types                  — available emergency type enum
GET  /api/emergency/<event_id>             — single event detail
POST /api/emergency/<event_id>/acknowledge — doctor acknowledges
POST /api/emergency/<event_id>/resolve     — resolve emergency
GET  /api/emergency/patient/<int:pid>      — all events for a patient
POST /api/emergency/offline/sync           — sync offline-queued emergencies
GET  /api/emergency/offline/pending        — pending offline queue count
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from services.emergency_service import (
    create_emergency_event,
    acknowledge_emergency,
    resolve_emergency,
    update_emergency_block,
    get_emergency_by_id,
    get_active_emergencies,
    get_emergencies_for_patient,
    get_emergencies_for_asha,
    get_triage_instructions,
    get_emergency_types,
    EMERGENCY_TYPES,
)
from blockchain.blockchain import add_emergency_block
from database.sqlite_sync import (
    save_emergency_offline,
    get_pending_emergencies,
    mark_emergency_synced,
)

emergency_bp = Blueprint('emergency', __name__, url_prefix='/api/emergency')


# ---------------------------------------------------------------------------
# GET /api/emergency/types
# ---------------------------------------------------------------------------
@emergency_bp.route('/types', methods=['GET'])
def emergency_types():
    """Return all supported emergency types (no auth needed for offline use)."""
    return jsonify(get_emergency_types())


# ---------------------------------------------------------------------------
# POST /api/emergency
# ---------------------------------------------------------------------------
@emergency_bp.route('', methods=['POST'])
@jwt_required()
def create_sos():
    """
    Create an SOS emergency event.
    Body: { patient_id, emergency_type, latitude?, longitude?,
            notes?, client_timestamp? }
    """
    user_id = int(get_jwt_identity())
    claims  = get_jwt()
    role    = claims.get('role', '')

    data = request.get_json(force=True) or {}
    patient_id     = data.get('patient_id')
    emergency_type = (data.get('emergency_type') or 'other').strip()
    latitude       = data.get('latitude')
    longitude      = data.get('longitude')
    notes          = (data.get('notes') or '').strip()
    client_ts      = data.get('client_timestamp')

    if not patient_id:
        return jsonify({'error': 'patient_id is required'}), 400

    try:
        event = create_emergency_event(
            patient_id=int(patient_id),
            asha_worker_id=user_id,
            emergency_type=emergency_type,
            latitude=latitude,
            longitude=longitude,
            notes=notes,
            client_timestamp=client_ts,
        )
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500

    # Mine blockchain emergency proof in background-style (synchronous but optional)
    block_index = None
    try:
        block, _ = add_emergency_block(
            event['event_id'],
            emergency_type,
            event['emergency_hash'],
        )
        block_index = block.index
        update_emergency_block(event['event_id'], block_index)
        event['block_index'] = block_index
    except Exception as exc:
        event['blockchain_warning'] = str(exc)

    return jsonify({
        'message': 'SOS emergency created and escalated',
        'event': event,
        'triage_instructions': event.get('triage_instructions', []),
        'escalation_targets': event.get('escalation_targets', {}),
        'block_index': block_index,
    }), 201


# ---------------------------------------------------------------------------
# GET /api/emergency
# ---------------------------------------------------------------------------
@emergency_bp.route('', methods=['GET'])
@jwt_required()
def list_emergencies():
    """Role-aware emergency listing."""
    user_id = int(get_jwt_identity())
    claims  = get_jwt()
    role    = claims.get('role', '')

    if role in ('doctor', 'admin'):
        return jsonify(get_active_emergencies())
    elif role == 'asha':
        return jsonify(get_emergencies_for_asha(user_id))
    else:
        return jsonify([])


# ---------------------------------------------------------------------------
# GET /api/emergency/<event_id>
# ---------------------------------------------------------------------------
@emergency_bp.route('/<event_id>', methods=['GET'])
@jwt_required()
def get_emergency(event_id):
    event = get_emergency_by_id(event_id)
    if not event:
        return jsonify({'error': 'Emergency event not found'}), 404
    return jsonify(event)


# ---------------------------------------------------------------------------
# POST /api/emergency/<event_id>/acknowledge
# ---------------------------------------------------------------------------
@emergency_bp.route('/<event_id>/acknowledge', methods=['POST'])
@jwt_required()
def ack_emergency(event_id):
    claims = get_jwt()
    if claims.get('role') not in ('doctor', 'admin'):
        return jsonify({'error': 'Doctors and admins only'}), 403
    user_id = int(get_jwt_identity())
    event = acknowledge_emergency(event_id, user_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    return jsonify({'message': 'Emergency acknowledged', 'event': event})


# ---------------------------------------------------------------------------
# POST /api/emergency/<event_id>/resolve
# ---------------------------------------------------------------------------
@emergency_bp.route('/<event_id>/resolve', methods=['POST'])
@jwt_required()
def res_emergency(event_id):
    claims = get_jwt()
    if claims.get('role') not in ('doctor', 'admin', 'asha'):
        return jsonify({'error': 'Unauthorized'}), 403
    event = resolve_emergency(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    return jsonify({'message': 'Emergency resolved', 'event': event})


# ---------------------------------------------------------------------------
# GET /api/emergency/patient/<int:patient_id>
# ---------------------------------------------------------------------------
@emergency_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def patient_emergencies(patient_id):
    return jsonify(get_emergencies_for_patient(patient_id))


# ---------------------------------------------------------------------------
# GET /api/emergency/offline/pending
# ---------------------------------------------------------------------------
@emergency_bp.route('/offline/pending', methods=['GET'])
@jwt_required()
def offline_pending():
    pending = get_pending_emergencies()
    return jsonify({'count': len(pending), 'events': pending})


# ---------------------------------------------------------------------------
# POST /api/emergency/offline/sync
# ---------------------------------------------------------------------------
@emergency_bp.route('/offline/sync', methods=['POST'])
@jwt_required()
def offline_sync():
    """
    Sync queued offline emergency events to PostgreSQL.
    Each event is replayed through create_emergency_event preserving original timestamps.
    """
    user_id = int(get_jwt_identity())
    pending = get_pending_emergencies()
    synced, failed = 0, 0

    for record in pending:
        try:
            event = create_emergency_event(
                patient_id=record['patient_id'],
                asha_worker_id=record['asha_worker_id'] or user_id,
                emergency_type=record['emergency_type'],
                latitude=record.get('latitude'),
                longitude=record.get('longitude'),
                notes=record.get('notes', ''),
                client_timestamp=record.get('client_timestamp'),
            )
            # Mine block for offline event
            try:
                block, _ = add_emergency_block(
                    event['event_id'],
                    record['emergency_type'],
                    event['emergency_hash'],
                )
                update_emergency_block(event['event_id'], block.index)
            except Exception:
                pass
            mark_emergency_synced(record['id'])
            synced += 1
        except Exception:
            failed += 1

    return jsonify({
        'message': f'{synced} event(s) synced, {failed} failed',
        'synced': synced,
        'failed': failed,
    })
