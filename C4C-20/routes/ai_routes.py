"""
AarogyaNet — AI Inference API Routes.

Endpoints:
    POST /api/ai/diabetes-risk      — diabetes risk stratification inference
    GET  /api/ai/status             — AI model registry status
    GET  /api/ai/diabetes/explain   — global feature importance

Safety:
    - All outputs include a deterministic_override field.
    - No diagnosis language used anywhere in this layer.
    - Confidence threshold gate on the doctor dashboard integration.
"""

from __future__ import annotations

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ai_engine.models.diabetes.preprocessor import PIMA_FEATURE_NAMES

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/ai/diabetes-risk
# ─────────────────────────────────────────────────────────────────────────────

@ai_bp.route("/diabetes-risk", methods=["POST"])
@jwt_required()
def diabetes_risk():
    """
    Run diabetes risk stratification on submitted clinical features.

    Request body (all fields optional — missing fields are imputed):
        {
            "pregnancies":       int,    // number of pregnancies
            "glucose":           float,  // plasma glucose mg/dL
            "blood_pressure":    float,  // diastolic BP mmHg
            "skin_thickness":    float,  // triceps skin fold mm
            "insulin":           float,  // 2-hour serum insulin μU/mL
            "bmi":               float,  // body mass index kg/m²
            "diabetes_pedigree": float,  // diabetes pedigree function score
            "age":               float,  // age in years
        }

    Returns 200 with structured risk output, or 503 if model not trained.
    """
    try:
        from ai_engine.models.diabetes.model import predict_diabetes_risk, get_model_status
    except ImportError as e:
        return jsonify({"error": "AI module not available", "detail": str(e)}), 503

    body = request.get_json(silent=True) or {}

    features = {}
    for feat in PIMA_FEATURE_NAMES:
        val = body.get(feat, 0.0)
        try:
            features[feat] = float(val)
        except (TypeError, ValueError):
            features[feat] = 0.0

    try:
        result = predict_diabetes_risk(features)
        return jsonify(result), 200

    except FileNotFoundError as e:
        status = get_model_status()
        return jsonify({
            "error":   "model_not_trained",
            "message": (
                "The diabetes risk model has not been trained yet. "
                "Run: python -m ai_engine.models.diabetes"
            ),
            "detail":  str(e),
            "status":  status,
        }), 503

    except Exception as e:
        return jsonify({
            "error":   "inference_error",
            "message": "An error occurred during risk assessment.",
            "detail":  str(e),
        }), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ai/status
# ─────────────────────────────────────────────────────────────────────────────

@ai_bp.route("/status", methods=["GET"])
@jwt_required()
def ai_status():
    """
    Return the current AI inference layer status.

    Includes:
    - Which models are trained / loaded in memory
    - Artifact file existence
    - Performance metrics summary
    """
    try:
        from ai_engine.models.diabetes.model import get_model_status
        diabetes_status = get_model_status()
    except Exception as e:
        diabetes_status = {"error": str(e)}

    try:
        from ai_engine.models.registry import ModelRegistry
        registry = ModelRegistry.status_report()
    except Exception as e:
        registry = {"error": str(e)}

    return jsonify({
        "ai_layer":     "AarogyaNet Clinical Decision Support",
        "phase":        "operational" if diabetes_status.get("artifact_exists") else "training_required",
        "models": {
            "diabetes_risk": diabetes_status,
        },
        "registry":     registry,
        "safety_note": (
            "All AI outputs are clinical augmentation signals only. "
            "The AarogyaNet deterministic rule engine takes precedence "
            "for all safety-critical decisions."
        ),
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ai/diabetes/explain
# ─────────────────────────────────────────────────────────────────────────────

@ai_bp.route("/diabetes/explain", methods=["GET"])
@jwt_required()
def diabetes_global_explain():
    """
    Return global SHAP feature importance for the diabetes risk model.

    Used to power the feature importance visualisation in the doctor dashboard.
    """
    try:
        from ai_engine.models.diabetes.model import get_model_status, MODEL_ARTIFACT, DiabetesRiskModel
        import json
        from ai_engine.models.diabetes.model import EVAL_REPORT_PATH

        if not EVAL_REPORT_PATH.exists():
            return jsonify({
                "error": "eval_report_not_found",
                "message": "Model not yet trained. Run: python -m ai_engine.models.diabetes",
            }), 503

        with open(EVAL_REPORT_PATH) as f:
            report = json.load(f)

        return jsonify({
            "feature_importance": report.get("shap_global_importance", {}),
            "metrics":            report.get("metrics", {}),
            "feature_names":      PIMA_FEATURE_NAMES,
            "trained_at":         report.get("trained_at"),
            "model_version":      report.get("version"),
            "dataset":            report.get("training_dataset"),
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
