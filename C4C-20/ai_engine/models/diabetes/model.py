"""
AarogyaNet — Diabetes Risk Stratification Model.

Implements DiabetesRiskModel(AarogyaModelBase) — a SHAP-explainable
XGBoost binary classifier for diabetes risk stratification.

IMPORTANT: This is a clinical decision-support augmentation layer.
  - It does NOT produce diagnoses.
  - Outputs must be interpreted by qualified healthcare professionals.
  - The AarogyaNet deterministic risk engine (risk_engine.py) takes
    precedence for all safety-critical decisions.

Artifact paths:
    ai_engine/models/artifacts/diabetes_risk_v1.joblib       — XGBoost model
    ai_engine/models/artifacts/diabetes_preprocessor_v1.joblib — sklearn Pipeline

Public function:
    predict_diabetes_risk(features: dict) -> dict
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from ai_engine.models.base import AarogyaModelBase, ModelNotTrainedError, ModelCompatibilityError
from ai_engine.models.diabetes.preprocessor import (
    PimaPreprocessor,
    PIMA_FEATURE_NAMES,
    ZERO_AS_MISSING,
)


# ─────────────────────────────────────────────────────────────────────────────
# Artifact paths
# ─────────────────────────────────────────────────────────────────────────────

ARTIFACTS_DIR        = Path("ai_engine/models/artifacts")
MODEL_ARTIFACT       = ARTIFACTS_DIR / "diabetes_risk_v1.joblib"
PREPROCESSOR_ARTIFACT = ARTIFACTS_DIR / "diabetes_preprocessor_v1.joblib"
EVAL_REPORT_PATH     = ARTIFACTS_DIR / "diabetes_eval_report.json"


# ─────────────────────────────────────────────────────────────────────────────
# Risk band thresholds and clinical messaging
# ─────────────────────────────────────────────────────────────────────────────

RISK_BANDS: list[tuple[float, str]] = [
    (0.30, "LOW"),
    (0.50, "MODERATE"),
    (0.70, "ELEVATED"),
    (1.01, "HIGH"),
]

RISK_RECOMMENDATIONS: dict[str, str] = {
    "LOW": (
        "Maintain healthy lifestyle practices. "
        "Routine monitoring at scheduled visits is advised."
    ),
    "MODERATE": (
        "Consider fasting glucose monitoring at next clinical visit. "
        "Lifestyle review (diet, physical activity) is recommended."
    ),
    "ELEVATED": (
        "Clinical review is advised. "
        "Fasting glucose and HbA1c assessment may be warranted."
    ),
    "HIGH": (
        "Prioritise clinical evaluation at the earliest opportunity. "
        "Consider HbA1c screening and comprehensive metabolic assessment."
    ),
}

CONFIDENCE_THRESHOLD = 0.70


# ─────────────────────────────────────────────────────────────────────────────
# DiabetesRiskModel
# ─────────────────────────────────────────────────────────────────────────────

class DiabetesRiskModel(AarogyaModelBase):
    """
    XGBoost-based diabetes risk stratification model.

    Features (8):
        pregnancies, glucose, blood_pressure, skin_thickness,
        insulin, bmi, diabetes_pedigree, age

    Output:
        risk_probability, risk_band, contributing_factors,
        recommendation, deterministic_override

    Training dataset: Pima Indians Diabetes Database (768 samples)
    """

    MODEL_TYPE = "diabetes_risk"
    VERSION    = "1.0.0"

    def __init__(self):
        super().__init__()
        self._preprocessor: PimaPreprocessor | None = None
        self._explainer = None
        self._eval_metrics: dict = {}
        self._global_importance: dict = {}

    # ── AarogyaModelBase interface ────────────────────────────────────────────

    def get_feature_names(self) -> list[str]:
        return list(PIMA_FEATURE_NAMES)

    def get_model_info(self) -> dict:
        return {
            "model_type":        self.MODEL_TYPE,
            "version":           self.VERSION,
            "feature_names":     self.get_feature_names(),
            "n_features":        len(PIMA_FEATURE_NAMES),
            "training_dataset":  "Pima Indians Diabetes Database",
            "target_variable":   "Outcome (binary: 0=non-diabetic, 1=diabetic)",
            "algorithm":         "XGBoost (Gradient Boosted Trees)",
            "explainability":    "SHAP TreeExplainer",
            "risk_bands":        {b: str(t) for t, b in RISK_BANDS},
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            "performance_metrics": self._eval_metrics,
            "global_feature_importance": self._global_importance,
            "clinical_note": (
                "This model provides a clinical decision-support signal only. "
                "It must not be used as a standalone diagnostic tool. "
                "All outputs require clinical interpretation."
            ),
            "is_loaded": self._is_loaded,
        }

    def predict(self, features: dict[str, float]) -> dict:
        """
        Run inference on a feature dict. Returns a structured clinical output.
        Handles the '_array' key internally (used by InferencePipeline).
        """
        self._assert_loaded()
        return self._run_prediction(features)

    def predict_proba(self, features: dict[str, float]) -> np.ndarray:
        """SHAP-compatible probability array, shape (1, 2)."""
        self._assert_loaded()

        if "_array" in features:
            X = features["_array"]
        else:
            X = self._preprocessor.transform_single(features)

        proba = self._estimator.predict_proba(X)
        return proba

    # ── Core prediction logic ─────────────────────────────────────────────────

    def _run_prediction(self, features: dict[str, float]) -> dict:
        """Full prediction pipeline: preprocess → predict → explain → format."""

        X = self._preprocessor.transform_single(features)

        proba     = self._estimator.predict_proba(X)[0]
        risk_prob = float(proba[1])

        risk_band = "LOW"
        for threshold, band in RISK_BANDS:
            if risk_prob < threshold:
                risk_band = band
                break

        try:
            from ai_engine.models.diabetes.explainer import DiabetesExplainer
            if self._explainer is None:
                self._explainer = DiabetesExplainer(
                    self._estimator, PIMA_FEATURE_NAMES
                )
            contributing_factors = self._explainer.explain_patient(X, features)
        except Exception as e:
            contributing_factors = []
            print(f"[DiabetesRiskModel] SHAP explain failed (non-critical): {e}")

        completeness = self._preprocessor.get_data_completeness(features)

        return {
            "risk_probability":        round(risk_prob, 4),
            "risk_probability_pct":    f"{risk_prob * 100:.1f}%",
            "risk_band":               risk_band,
            "contributing_factors":    contributing_factors,
            "recommendation":          RISK_RECOMMENDATIONS[risk_band],
            "data_completeness":       completeness,
            "confidence_above_threshold": risk_prob >= CONFIDENCE_THRESHOLD,
            "model_version":           self.VERSION,
            "deterministic_override": (
                "SAFETY: This ML output is an augmentation layer only. "
                "The AarogyaNet clinical rules engine (risk_engine.py) takes "
                "precedence for all safety-critical decisions. This signal does "
                "not constitute a medical diagnosis."
            ),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ── Persistence (extends base class) ─────────────────────────────────────

    def save_to_disk(self, path: str | Path) -> Path:
        import joblib
        self._assert_loaded()
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            "estimator":          self._estimator,
            "model_info":         self.get_model_info(),
            "eval_metrics":       self._eval_metrics,
            "global_importance":  self._global_importance,
        }, path)
        print(f"[DiabetesRiskModel] Model saved: {path}")
        return path

    @classmethod
    def load_from_disk(
        cls,
        path:               str | Path,
        preprocessor_path:  str | Path | None = None,
    ) -> "DiabetesRiskModel":
        import joblib

        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"[DiabetesRiskModel] Model not found: {path}")

        payload         = joblib.load(path)
        instance        = cls()
        instance._estimator      = payload["estimator"]
        instance._eval_metrics   = payload.get("eval_metrics", {})
        instance._global_importance = payload.get("global_importance", {})
        instance._is_loaded      = True

        pp_path = Path(preprocessor_path or PREPROCESSOR_ARTIFACT)
        if pp_path.exists():
            instance._preprocessor = PimaPreprocessor.load(pp_path)
        else:
            raise FileNotFoundError(
                f"[DiabetesRiskModel] Preprocessor not found: {pp_path}. "
                "Train the model first using: python -m ai_engine.models.diabetes"
            )

        print(f"[DiabetesRiskModel] Loaded from: {path}")
        return instance


# ─────────────────────────────────────────────────────────────────────────────
# Public inference function
# ─────────────────────────────────────────────────────────────────────────────

_cached_model: DiabetesRiskModel | None = None


def predict_diabetes_risk(features: dict[str, float]) -> dict:
    """
    Run diabetes risk stratification inference.

    This is the primary public interface for the diabetes risk model.
    The model is loaded once and cached in memory.

    Args:
        features: Dict with any subset of PIMA_FEATURE_NAMES.
                  Missing / zero values are imputed with training medians.
                  Keys: pregnancies, glucose, blood_pressure, skin_thickness,
                        insulin, bmi, diabetes_pedigree, age

    Returns:
        {
            risk_probability:         float   (0.0 – 1.0)
            risk_probability_pct:     str     ("34.5%")
            risk_band:                str     ("LOW" | "MODERATE" | "ELEVATED" | "HIGH")
            contributing_factors:     list    (top-5 SHAP factors)
            recommendation:           str     (clinical support text)
            data_completeness:        dict    (known vs imputed features)
            confidence_above_threshold: bool  (True if prob ≥ 0.70)
            model_version:            str
            deterministic_override:   str     (safety disclaimer)
            generated_at:             str     (ISO timestamp)
        }

    Raises:
        FileNotFoundError: If model artifacts not found (train first).
        RuntimeError:      If model loading fails.
    """
    global _cached_model

    if _cached_model is None:
        if not MODEL_ARTIFACT.exists():
            raise FileNotFoundError(
                f"Diabetes risk model artifact not found: {MODEL_ARTIFACT}. "
                "Train the model first: python -m ai_engine.models.diabetes"
            )
        _cached_model = DiabetesRiskModel.load_from_disk(MODEL_ARTIFACT)

    return _cached_model._run_prediction(features)


def get_model_status() -> dict:
    """Return the current load status and metadata for the diabetes risk model."""
    artifact_exists      = MODEL_ARTIFACT.exists()
    preprocessor_exists  = PREPROCESSOR_ARTIFACT.exists()
    eval_exists          = EVAL_REPORT_PATH.exists()

    if _cached_model is not None:
        info = _cached_model.get_model_info()
    elif artifact_exists:
        info = {"status": "trained_on_disk", "version": DiabetesRiskModel.VERSION}
    else:
        info = {"status": "not_trained"}

    return {
        "model_key":             "diabetes_risk",
        "model_type":            DiabetesRiskModel.MODEL_TYPE,
        "version":               DiabetesRiskModel.VERSION,
        "is_loaded_in_memory":   _cached_model is not None,
        "artifact_exists":       artifact_exists,
        "preprocessor_exists":   preprocessor_exists,
        "eval_report_exists":    eval_exists,
        "artifact_path":         str(MODEL_ARTIFACT),
        "preprocessor_path":     str(PREPROCESSOR_ARTIFACT),
        "eval_report_path":      str(EVAL_REPORT_PATH),
        "feature_names":         PIMA_FEATURE_NAMES,
        "confidence_threshold":  CONFIDENCE_THRESHOLD,
        "model_info":            info,
    }
