from flask import Blueprint
from services.prediction_service import get_latest_predictions, predict_node_aqi
from utils.responses import success_response, error_response
from utils.security import token_required

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api/prediction')

@prediction_bp.route('/latest', methods=['GET'])
@token_required
def latest_predictions(current_user):
    """Get AI predictions for all active nodes."""
    success, result = get_latest_predictions()
    if success:
        return success_response("Predictions retrieved successfully", data={"predictions": result})
    else:
        return error_response(result, status_code=500)

@prediction_bp.route('/node/<int:node_id>', methods=['GET'])
@token_required
def node_prediction(current_user, node_id):
    """Get AI prediction for a specific node."""
    success, result = predict_node_aqi(node_id)
    if success:
        return success_response("Prediction retrieved successfully", data=result)
    else:
        return error_response(result, status_code=500)
