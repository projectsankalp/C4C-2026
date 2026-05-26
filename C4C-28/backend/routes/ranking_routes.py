from flask import Blueprint, request
from services.ranking_service import (
    generate_ranking, get_rankings, get_current_ranking,
    get_village_ranking, update_reward_status
)
from utils.responses import success_response, error_response
from utils.security import token_required, admin_required

ranking_bp = Blueprint('rankings', __name__, url_prefix='/api/rankings')

@ranking_bp.route('', methods=['GET'])
@token_required
def list_rankings(current_user):
    """All authenticated users: Get rankings."""
    filters = {
        'quarter': request.args.get('quarter'),
        'year': request.args.get('year', type=int),
        'reward_status': request.args.get('reward_status')
    }
    # Clean None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    success, result = get_rankings(filters)
    if success:
        return success_response("Rankings retrieved", data={"rankings": result})
    else:
        return error_response(result, status_code=500)

@ranking_bp.route('/current', methods=['GET'])
@token_required
def get_current(current_user):
    """All authenticated users: Get latest active quarter ranking."""
    success, result = get_current_ranking()
    if success:
        return success_response("Current ranking retrieved", data={"rankings": result})
    else:
        return error_response(result, status_code=404)

@ranking_bp.route('/village/<string:village_name>', methods=['GET'])
@token_required
def get_village_history(current_user, village_name):
    """All authenticated users: Get ranking history of one village."""
    success, result = get_village_ranking(village_name)
    if success:
        return success_response(f"Ranking history for {village_name}", data={"rankings": result})
    else:
        return error_response(result, status_code=500)

@ranking_bp.route('/generate', methods=['POST'])
@token_required
@admin_required
def trigger_generation(current_user):
    """Admin only: Generate ranking for selected quarter/year."""
    data = request.get_json()
    if not data or 'quarter' not in data or 'year' not in data:
        return error_response("quarter (e.g. Q1) and year required", status_code=400)
        
    quarter = data['quarter']
    if quarter.upper() not in ['Q1', 'Q2', 'Q3', 'Q4']:
        return error_response("Invalid quarter format. Use Q1, Q2, Q3, or Q4.", status_code=400)
        
    success, msg = generate_ranking(quarter, int(data['year']))
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)

@ranking_bp.route('/<int:ranking_id>/reward', methods=['PUT'])
@token_required
@admin_required
def change_reward_status(current_user, ranking_id):
    """Admin/Officer only: Update reward status."""
    data = request.get_json()
    if not data or 'reward_status' not in data:
        return error_response("reward_status required", status_code=400)
        
    success, msg = update_reward_status(ranking_id, data['reward_status'])
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)
