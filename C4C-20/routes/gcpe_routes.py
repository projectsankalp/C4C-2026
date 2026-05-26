"""
GCPE API routes — Guided Clinical Protocol Engine.

GET  /api/gcpe/protocol/<protocol_id>   — return full protocol JSON
POST /api/gcpe/next                     — evaluate one step and return next
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from gcpe.engine import (
    load_protocol, get_entry_step, get_step,
    advance_step, validate_answer, build_summary
)

gcpe_bp = Blueprint('gcpe', __name__, url_prefix='/api/gcpe')


@gcpe_bp.route('/protocol/<protocol_id>', methods=['GET'])
@jwt_required()
def get_protocol(protocol_id):
    """Return the full protocol definition (steps, entry point, metadata)."""
    try:
        protocol = load_protocol(protocol_id)
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    return jsonify(protocol)


@gcpe_bp.route('/next', methods=['POST'])
@jwt_required()
def next_step():
    """
    Advance the protocol by one step.

    Request body:
      {
        "protocol_id": "hypertension_protocol",
        "current_step_id": "q_chest_pain",
        "answer": true,
        "answers": { ...all answers collected so far including this one... }
      }

    Response:
      {
        "next_step": { ...step object or null if complete },
        "completed": false,
        "risk_flags": [...],
        "alerts": [...]
      }
    """
    data = request.get_json(force=True)
    protocol_id     = data.get('protocol_id', 'hypertension_protocol')
    current_step_id = data.get('current_step_id')
    answer          = data.get('answer')
    answers         = data.get('answers', {})

    try:
        protocol = load_protocol(protocol_id)
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404

    step = get_step(protocol, current_step_id)
    if not step:
        return jsonify({'error': f"Step '{current_step_id}' not found"}), 404

    # Validate the answer
    ok, msg = validate_answer(step, answer)
    if not ok:
        return jsonify({'error': msg}), 400

    # Merge current answer into accumulated answers for condition evaluation
    if step.get('field') and answer is not None:
        answers[step['field']] = answer

    next_step_obj = advance_step(protocol, current_step_id, answer, answers)

    risk_flags = [step.get('risk_flag')] if step.get('risk_flag') else []
    alerts     = [step.get('alert')]     if step.get('alert')     else []

    return jsonify({
        'next_step': next_step_obj,
        'completed': next_step_obj is None,
        'risk_flags': risk_flags,
        'alerts': alerts,
    })


@gcpe_bp.route('/summary', methods=['POST'])
@jwt_required()
def get_summary():
    """
    Build a clinical summary from a completed session.

    Request body:
      {
        "protocol_id": "hypertension_protocol",
        "session": { ...full session state... }
      }
    """
    data = request.get_json(force=True)
    protocol_id = data.get('protocol_id', 'hypertension_protocol')
    session     = data.get('session', {})

    try:
        protocol = load_protocol(protocol_id)
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404

    summary = build_summary(protocol, session)
    return jsonify(summary)
