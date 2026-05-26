from flask import Blueprint, request
from services.node_service import (
    add_node, get_all_nodes, get_node_by_id, 
    update_node, deactivate_node, get_nodes_by_village, get_node_stats
)
from utils.responses import success_response, error_response
from utils.security import token_required, admin_required

node_bp = Blueprint('nodes', __name__, url_prefix='/api/nodes')

@node_bp.route('', methods=['POST'])
@token_required
@admin_required
def create_node(current_user):
    """Admin only: Add a new node."""
    data = request.get_json()
    if not data:
        return error_response("Invalid JSON data provided.", status_code=400)
    
    success, result = add_node(data, current_user['id'])
    
    if success:
        return success_response(result['message'], data={"node_id": result['node_id']})
    else:
        return error_response(result, status_code=400)

@node_bp.route('', methods=['GET'])
@token_required
def list_nodes(current_user):
    """All authenticated users: Get all nodes."""
    success, nodes = get_all_nodes()
    if success:
        return success_response("Nodes retrieved successfully", data={"nodes": nodes})
    else:
        return error_response(nodes, status_code=500)

@node_bp.route('/<int:node_id>', methods=['GET'])
@token_required
def get_node(current_user, node_id):
    """All authenticated users: Get a specific node."""
    success, node = get_node_by_id(node_id)
    if success:
        return success_response("Node retrieved successfully", data={"node": node})
    else:
        return error_response(node, status_code=404)

@node_bp.route('/<int:node_id>', methods=['PUT'])
@token_required
@admin_required
def edit_node(current_user, node_id):
    """Admin only: Edit a node's details (name, village, location)."""
    data = request.get_json()
    if not data:
        return error_response("Invalid JSON data provided.", status_code=400)
        
    success, message = update_node(node_id, data)
    if success:
        return success_response(message)
    else:
        return error_response(message, status_code=400)

@node_bp.route('/<int:node_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_node(current_user, node_id):
    """Admin only: Deactivate a node."""
    success, message = deactivate_node(node_id)
    if success:
        return success_response(message)
    else:
        return error_response(message, status_code=400)

@node_bp.route('/village/<string:village>', methods=['GET'])
@token_required
def get_village_nodes(current_user, village):
    """All authenticated users: Get nodes for a specific village."""
    success, nodes = get_nodes_by_village(village)
    if success:
        return success_response(f"Nodes retrieved for village {village}", data={"nodes": nodes})
    else:
        return error_response(nodes, status_code=500)

@node_bp.route('/status', methods=['GET'])
@token_required
def node_status(current_user):
    """All authenticated users: Get aggregate node status counts."""
    success, stats = get_node_stats()
    if success:
        return success_response("Node statistics retrieved successfully", data={"stats": stats})
    else:
        return error_response(stats, status_code=500)
