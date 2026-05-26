from flask import Blueprint, request
from services.map_service import (
    get_map_nodes, update_node_location, get_heatmap_data, 
    get_danger_zones, get_offline_nodes
)
from utils.responses import success_response, error_response
from utils.security import token_required, admin_required

map_bp = Blueprint('map', __name__, url_prefix='/api/map')

@map_bp.route('/nodes', methods=['GET'])
@token_required
def get_all_nodes(current_user):
    """All authenticated users: Get all map nodes."""
    success, result = get_map_nodes()
    if success:
        return success_response("Map nodes retrieved", data={"nodes": result})
    else:
        return error_response(result, status_code=500)

@map_bp.route('/village/<string:village_name>', methods=['GET'])
@token_required
def get_village_nodes(current_user, village_name):
    """All authenticated users: Get map nodes for a village."""
    success, result = get_map_nodes({"village": village_name})
    if success:
        return success_response(f"Map nodes for {village_name}", data={"nodes": result})
    else:
        return error_response(result, status_code=500)

@map_bp.route('/node/<int:node_id>/location', methods=['PUT'])
@token_required
@admin_required
def update_location(current_user, node_id):
    """Admin only: Update a node's coordinates."""
    data = request.get_json()
    if not data or 'latitude' not in data or 'longitude' not in data:
        return error_response("latitude and longitude required", status_code=400)
        
    success, msg = update_node_location(node_id, data['latitude'], data['longitude'])
    if success:
        return success_response(msg)
    else:
        return error_response(msg, status_code=400)

@map_bp.route('/heatmap', methods=['GET'])
@token_required
def get_heatmap(current_user):
    """All authenticated users: Get heatmap intensity points."""
    success, result = get_heatmap_data()
    if success:
        return success_response("Heatmap data retrieved", data={"heatmap": result})
    else:
        return error_response(result, status_code=500)

@map_bp.route('/danger-zones', methods=['GET'])
@token_required
def danger_zones(current_user):
    """All authenticated users: Get dangerous or critical zones."""
    success, result = get_danger_zones()
    if success:
        return success_response("Danger zones retrieved", data={"danger_zones": result})
    else:
        return error_response(result, status_code=500)

@map_bp.route('/offline-nodes', methods=['GET'])
@token_required
def offline_nodes(current_user):
    """All authenticated users: Get nodes needing maintenance."""
    success, result = get_offline_nodes()
    if success:
        return success_response("Offline nodes retrieved", data={"offline_nodes": result})
    else:
        return error_response(result, status_code=500)
