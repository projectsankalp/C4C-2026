"""
AarogyaNet — SHAP Explainability for Diabetes Risk Model.

Provides:
  - Global feature importance (mean |SHAP| over training set)
  - Per-patient SHAP explanation (top-N contributing factors with direction)

Uses shap.TreeExplainer — exact, fast, and natively compatible with XGBoost.

Safety note:
  SHAP values explain WHY the model produced a probability. They do NOT
  constitute a clinical diagnosis. All explanations must be interpreted
  by qualified healthcare professionals alongside clinical context.
"""

from __future__ import annotations

from typing import Any

import numpy as np


# ─────────────────────────────────────────────────────────────────────────────
# Human-readable feature display names
# ─────────────────────────────────────────────────────────────────────────────

FEATURE_DISPLAY_NAMES: dict[str, str] = {
    "pregnancies":      "Number of Pregnancies",
    "glucose":          "Glucose Level",
    "blood_pressure":   "Diastolic Blood Pressure",
    "skin_thickness":   "Skin Thickness",
    "insulin":          "Insulin Level",
    "bmi":              "Body Mass Index (BMI)",
    "diabetes_pedigree": "Diabetes Family History Score",
    "age":              "Age",
}

FEATURE_UNITS: dict[str, str] = {
    "pregnancies":      "",
    "glucose":          "mg/dL",
    "blood_pressure":   "mmHg",
    "skin_thickness":   "mm",
    "insulin":          "μU/mL",
    "bmi":              "kg/m²",
    "diabetes_pedigree": "",
    "age":              "years",
}


# ─────────────────────────────────────────────────────────────────────────────
# DiabetesExplainer
# ─────────────────────────────────────────────────────────────────────────────

class DiabetesExplainer:
    """
    SHAP-based explainer for the DiabetesRiskModel.

    Usage:
        explainer = DiabetesExplainer(xgb_estimator, feature_names)

        # Global importance (call once after training):
        importance = explainer.global_importance(X_train)

        # Per-patient explanation (call at inference time):
        explanation = explainer.explain_patient(X_single, raw_feature_dict)
    """

    def __init__(self, estimator: Any, feature_names: list[str]):
        import shap
        self._estimator    = estimator
        self._feature_names = feature_names
        self._shap_explainer = shap.TreeExplainer(
            estimator,
            feature_perturbation="tree_path_dependent",
        )

    # ── Global feature importance ─────────────────────────────────────────────

    def global_importance(self, X_train: np.ndarray) -> dict[str, float]:
        """
        Compute mean absolute SHAP values across the training set.

        Returns:
            Dict {feature_name: mean_abs_shap}, sorted descending.
        """
        shap_values = self._shap_explainer.shap_values(X_train)

        if isinstance(shap_values, list):
            sv = np.abs(shap_values[1])
        else:
            sv = np.abs(shap_values)

        mean_abs = sv.mean(axis=0)
        importance = {
            name: round(float(val), 6)
            for name, val in zip(self._feature_names, mean_abs)
        }
        return dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

    # ── Per-patient explanation ───────────────────────────────────────────────

    def explain_patient(
        self,
        X_single:          np.ndarray,
        raw_features:      dict[str, float],
        top_n:             int = 5,
    ) -> list[dict]:
        """
        Compute per-patient SHAP explanation for a single prediction row.

        Args:
            X_single:     Preprocessed feature array, shape (1, n_features).
            raw_features: Original feature dict (pre-preprocessing) for display.
            top_n:        Number of top factors to return.

        Returns:
            List of dicts, sorted by |SHAP| descending:
                {
                    feature:        str   — internal feature name
                    display_name:   str   — human-readable label
                    value:          float — raw (unscaled) input value
                    unit:           str   — clinical unit
                    shap_value:     float — SHAP contribution (positive = increases risk)
                    direction:      str   — "increases_risk" | "decreases_risk" | "neutral"
                    magnitude:      str   — "strong" | "moderate" | "mild"
                    imputed:        bool  — True if value was imputed (was 0/missing)
                }
        """
        shap_values = self._shap_explainer.shap_values(X_single)

        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        ZERO_AS_MISSING = {"glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"}

        factors = []
        for name, shap_val in zip(self._feature_names, sv):
            raw_val = raw_features.get(name, 0.0)
            try:
                raw_val = float(raw_val)
            except (TypeError, ValueError):
                raw_val = 0.0

            imputed = (
                name in ZERO_AS_MISSING and raw_val == 0.0
            ) or raw_val == 0.0

            abs_shap = abs(float(shap_val))
            if abs_shap < 1e-6:
                direction = "neutral"
            elif float(shap_val) > 0:
                direction = "increases_risk"
            else:
                direction = "decreases_risk"

            if abs_shap >= 0.30:
                magnitude = "strong"
            elif abs_shap >= 0.10:
                magnitude = "moderate"
            else:
                magnitude = "mild"

            factors.append({
                "feature":      name,
                "display_name": FEATURE_DISPLAY_NAMES.get(name, name.replace("_", " ").title()),
                "value":        raw_val,
                "unit":         FEATURE_UNITS.get(name, ""),
                "shap_value":   round(float(shap_val), 4),
                "direction":    direction,
                "magnitude":    magnitude,
                "imputed":      imputed,
            })

        factors.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        return factors[:top_n]

    # ── Expected value ────────────────────────────────────────────────────────

    @property
    def expected_value(self) -> float:
        """
        Return the base SHAP expected value (model output with no features).
        Corresponds to the population-level base rate in log-odds space.
        """
        ev = self._shap_explainer.expected_value
        if isinstance(ev, (list, np.ndarray)):
            return float(ev[1]) if len(ev) > 1 else float(ev[0])
        return float(ev)
