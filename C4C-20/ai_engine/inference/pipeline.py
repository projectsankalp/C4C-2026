"""
AarogyaNet AI Pipeline — Inference Pipeline Skeleton.

Defines the end-to-end inference flow that will be activated once models
are trained and registered. Currently a skeleton with full validation,
preprocessing consistency, and output formatting logic in place.

Flow:
  1. validate_input(features)     — schema check, range guards
  2. preprocess(features)         — ensure consistency with training transforms
  3. predict(features, model_key) — NOT YET IMPLEMENTED (raises placeholder)
  4. format_output(raw, info)     — structured result with confidence envelope

Safety:
  - PHI validation at the boundary before any inference call
  - ModelNotTrainedError is surfaced cleanly (never silently falls back)
  - All inference results include a `deterministic_override` field that
    indicates whether the existing clinical rule engine should take precedence
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import numpy as np

from ai_engine.models.base import AarogyaModelBase, ModelNotTrainedError
from ai_engine.models.registry import ModelRegistry
from ai_engine.pipelines.feature_pipeline import FeaturePipeline, FEATURE_NAMES
from ai_engine.utils.privacy import assert_phi_free, validate_no_phi


# ─────────────────────────────────────────────────────────────────────────────
# Exceptions
# ─────────────────────────────────────────────────────────────────────────────

class InferenceNotAvailableError(RuntimeError):
    """
    Raised when an inference request is made but no trained model is available.

    This is the expected state during the foundation phase — callers should
    fall back to the deterministic risk engine (ai_engine/risk_engine.py).
    """
    pass


class InferenceValidationError(ValueError):
    """Raised when a feature vector fails pre-inference validation."""
    pass


# ─────────────────────────────────────────────────────────────────────────────
# Feature range guards (clinical plausibility)
# ─────────────────────────────────────────────────────────────────────────────

FEATURE_RANGES: dict[str, tuple[float, float]] = {
    "bp_systolic":             (50.0,  300.0),
    "bp_diastolic":            (30.0,  200.0),
    "pulse":                   (20.0,  300.0),
    "temperature":             (32.0,   44.0),
    "pulse_pressure":          (0.0,   200.0),
    "mean_arterial_pressure":  (30.0,  250.0),
    "dizziness":               (0.0,    1.0),
    "chest_pain":              (0.0,    1.0),
    "medicine_missed":         (0.0,    1.0),
    "bp_stage":                (0.0,    4.0),
    "adherence_rate":          (0.0,    1.0),
    "age":                     (0.0,  120.0),
    "age_band":               (-1.0,    4.0),
    "gender_encoded":         (-1.0,    1.0),
}


# ─────────────────────────────────────────────────────────────────────────────
# InferencePipeline
# ─────────────────────────────────────────────────────────────────────────────

class InferencePipeline:
    """
    Unified inference pipeline with validation, preprocessing, and formatting.

    Usage (once models are trained):
        pipeline = InferencePipeline()
        result   = pipeline.predict(feature_vector, model_key="diabetes_risk")

    Current state (foundation phase):
        validate_input() and preprocess() are fully implemented.
        predict() raises InferenceNotAvailableError until a model is registered.
        Callers should use the deterministic risk_engine as the fallback.
    """

    def __init__(self):
        self._feature_pipeline = FeaturePipeline()

    # ── Input validation ──────────────────────────────────────────────────────

    def validate_input(
        self,
        features:       dict[str, float],
        required_names: list[str] | None = None,
    ) -> tuple[bool, list[str]]:
        """
        Validate a feature dict before inference.

        Checks:
          1. No PHI keys present
          2. All required features are present
          3. Numeric values within clinically plausible ranges

        Args:
            features:       Feature dict from FeaturePipeline.
            required_names: Feature names the target model requires.
                            Defaults to full FEATURE_NAMES list.

        Returns:
            (is_valid: bool, issues: list[str])
            issues is empty when is_valid is True.
        """
        issues: list[str] = []

        # PHI check
        phi_clean, phi_found = validate_no_phi(features)
        if not phi_clean:
            issues.append(f"PHI detected in feature dict: {phi_found}")

        # Required features check
        required = required_names or FEATURE_NAMES
        missing  = [k for k in required if k not in features]
        if missing:
            issues.append(f"Missing required features: {missing}")

        # Range checks — 0.0 is a valid sentinel meaning "not recorded"
        for feat, (lo, hi) in FEATURE_RANGES.items():
            val = features.get(feat)
            if val is not None:
                try:
                    fv = float(val)
                    # Skip range check for sentinel 0.0 (feature not measured this visit)
                    if fv == 0.0:
                        continue
                    if not (lo <= fv <= hi):
                        issues.append(
                            f"Feature '{feat}' value {fv} outside plausible range [{lo}, {hi}]"
                        )
                except (TypeError, ValueError):
                    issues.append(f"Feature '{feat}' is not numeric: {val!r}")

        return (len(issues) == 0), issues

    # ── Preprocessing consistency ─────────────────────────────────────────────

    def preprocess(
        self,
        features:      dict[str, float],
        model_key:     str = "diabetes_risk",
    ) -> np.ndarray:
        """
        Convert a validated feature dict to a numpy array in the canonical
        column order defined by FeaturePipeline.

        Ensures that inference uses the identical feature ordering as training.

        Args:
            features:  Validated feature dict.
            model_key: Target model (used to retrieve its feature name list
                       if it differs from the full FEATURE_NAMES list).

        Returns:
            numpy array of shape (1, n_features), dtype float64.
        """
        # Check if a loaded model specifies its own feature order
        feature_names = FEATURE_NAMES
        if ModelRegistry.is_loaded(model_key):
            model = ModelRegistry._instances[model_key]
            feature_names = model.get_feature_names()

        ordered = [float(features.get(name, 0.0)) for name in feature_names]
        return np.array([ordered], dtype=np.float64)

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(
        self,
        features:  dict[str, float],
        model_key: str = "diabetes_risk",
    ) -> dict:
        """
        Run end-to-end inference: validate → preprocess → model.predict().

        Currently raises InferenceNotAvailableError because no models are
        trained yet. Once a model is registered and its artifact is present,
        this will activate automatically.

        Args:
            features:  Feature dict from FeaturePipeline.
            model_key: Registered model key (see ModelRegistry).

        Returns:
            Structured inference result (see format_output()).

        Raises:
            InferenceValidationError:  If feature validation fails.
            InferenceNotAvailableError: If no trained model is available.
        """
        # 1. Validate
        is_valid, issues = self.validate_input(features)
        if not is_valid:
            raise InferenceValidationError(
                f"Inference input validation failed: {issues}"
            )

        # 2. Try to load model from registry
        try:
            model = ModelRegistry.load(model_key)
        except (KeyError, FileNotFoundError) as e:
            raise InferenceNotAvailableError(
                f"Model '{model_key}' is not yet trained or registered. "
                f"Foundation phase: use the deterministic risk engine instead. "
                f"Detail: {e}"
            ) from e
        except ModelNotTrainedError as e:
            raise InferenceNotAvailableError(str(e)) from e

        # 3. Preprocess
        X = self.preprocess(features, model_key)

        # 4. Predict
        raw_proba    = model.predict_proba({"_array": X})
        raw_result   = model.predict(features)

        # 5. Format output
        return self.format_output(raw_result, model.get_model_info(), raw_proba)

    # ── Output formatting ─────────────────────────────────────────────────────

    def format_output(
        self,
        raw_prediction: dict,
        model_info:     dict,
        probabilities:  np.ndarray | None = None,
    ) -> dict:
        """
        Standardise inference output into a structured clinical result.

        Args:
            raw_prediction: Dict from model.predict().
            model_info:     Dict from model.get_model_info().
            probabilities:  Class probabilities (shape 1 × n_classes), if available.

        Returns:
            Standardised result dict with clinical confidence framing.
        """
        confidence = None
        if probabilities is not None:
            try:
                proba_list = probabilities.flatten().tolist()
                confidence = {
                    "probabilities": proba_list,
                    "max_class_confidence": max(proba_list),
                }
            except Exception:
                pass

        return {
            "model_type":    model_info.get("model_type", "unknown"),
            "model_version": model_info.get("version", "0.0.0"),
            "prediction":    raw_prediction,
            "confidence":    confidence,
            # Flag ensures clinicians know to apply the deterministic engine too
            "deterministic_override": (
                "This ML prediction is an augmentation layer. "
                "The AarogyaNet clinical rules engine (risk_engine.py) "
                "takes precedence for all safety-critical decisions."
            ),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ── Status ────────────────────────────────────────────────────────────────

    def status(self) -> dict:
        """
        Return the current inference pipeline readiness status.

        Used by health-check endpoints and admin dashboards.
        """
        registry_status = ModelRegistry.status_report()
        trained_models  = [
            m for m in registry_status["models"]
            if m["status"] == "trained" and m["artifact_exists"]
        ]

        return {
            "inference_ready":    len(trained_models) > 0,
            "available_models":   [m["key"] for m in trained_models],
            "planned_models":     [
                m["key"] for m in registry_status["models"]
                if m["status"] == "planned"
            ],
            "registry":           registry_status,
            "phase":              "foundation" if not trained_models else "operational",
            "note": (
                "Foundation phase: inference not yet available. "
                "Train models using ai_engine/training/ then register with ModelRegistry."
            ) if not trained_models else None,
        }
