"""
AarogyaNet AI Pipeline — Model Registry.

Central registry for managing ML model definitions and loaded instances.

Future workflow:
  1. Define a subclass of AarogyaModelBase (e.g. DiabetesRiskModel)
  2. Register it: ModelRegistry.register("diabetes_risk", DiabetesRiskModel, config={})
  3. Train and save: model.save_to_disk("ai_engine/models/diabetes_v1.joblib")
  4. Load at runtime:  model = ModelRegistry.load("diabetes_risk")
  5. Predict:          result = model.predict(feature_vector)

The registry is a singleton. Only one instance of each model is loaded
at a time to conserve memory.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Type

from ai_engine.models.base import AarogyaModelBase, ModelNotTrainedError


# ─────────────────────────────────────────────────────────────────────────────
# Default model definitions (not yet trained)
# ─────────────────────────────────────────────────────────────────────────────

#
# Each entry describes a future model:
#   class_path   — dotted import path of the AarogyaModelBase subclass
#   description  — human-readable summary
#   target       — what the model predicts
#   dataset      — which dataset to train on
#   artifact     — expected joblib artifact path (relative to project root)
#   status       — "planned" | "trained" | "deprecated"
#

MODEL_DEFINITIONS: dict[str, dict[str, Any]] = {
    "diabetes_risk": {
        "description":  "XGBoost binary classifier — diabetes risk from Pima clinical vitals (SHAP-explainable)",
        "target":       "Outcome (binary: 0=non-diabetic, 1=diabetic)",
        "dataset":      "pima_diabetes",
        "artifact":     "ai_engine/models/artifacts/diabetes_risk_v1.joblib",
        "preprocessor": "ai_engine/models/artifacts/diabetes_preprocessor_v1.joblib",
        "eval_report":  "ai_engine/models/artifacts/diabetes_eval_report.json",
        "status":       "trained",
        "version":      "1.0.0",
        "algorithm":    "XGBoost",
        "explainability": "SHAP TreeExplainer",
        "features":     [
            "pregnancies", "glucose", "blood_pressure", "skin_thickness",
            "insulin", "bmi", "diabetes_pedigree", "age",
        ],
    },
    "bp_trajectory": {
        "description":  "Regression — future BP trajectory from longitudinal visit history",
        "target":       "bp_systolic_next",
        "dataset":      "aarogyanet_visits",
        "artifact":     "ai_engine/models/artifacts/bp_trajectory_v1.joblib",
        "status":       "planned",
        "version":      "0.1.0",
    },
    "outbreak_risk": {
        "description":  "Time-series anomaly scorer — village-level outbreak probability",
        "target":       "outbreak_probability",
        "dataset":      "hmis",
        "artifact":     "ai_engine/models/artifacts/outbreak_risk_v1.joblib",
        "status":       "planned",
        "version":      "0.1.0",
    },
    "adherence_predictor": {
        "description":  "Binary classifier — likelihood of next-visit medication miss",
        "target":       "medicine_missed_next",
        "dataset":      "aarogyanet_visits",
        "artifact":     "ai_engine/models/artifacts/adherence_v1.joblib",
        "status":       "planned",
        "version":      "0.1.0",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# ModelRegistry
# ─────────────────────────────────────────────────────────────────────────────

class ModelRegistry:
    """
    Singleton registry for model class definitions and loaded instances.

    Class-level attributes are shared across all calls — only one instance
    per model key is held in memory.
    """

    _definitions: dict[str, dict]              = dict(MODEL_DEFINITIONS)
    _classes:     dict[str, Type[AarogyaModelBase]] = {}
    _instances:   dict[str, AarogyaModelBase]  = {}

    # ── Registration ──────────────────────────────────────────────────────────

    @classmethod
    def register(
        cls,
        key:         str,
        model_class: Type[AarogyaModelBase],
        config:      dict | None = None,
    ) -> None:
        """
        Register a model class under a given key.

        Args:
            key:         Unique model identifier (e.g. "diabetes_risk").
            model_class: AarogyaModelBase subclass (not an instance).
            config:      Optional additional metadata to merge into the definition.
        """
        cls._classes[key] = model_class
        if key not in cls._definitions:
            cls._definitions[key] = {}
        if config:
            cls._definitions[key].update(config)
        print(f"[ModelRegistry] Registered model: '{key}' → {model_class.__name__}")

    # ── Loading ───────────────────────────────────────────────────────────────

    @classmethod
    def load(cls, key: str, artifact_path: str | Path | None = None) -> AarogyaModelBase:
        """
        Load a trained model from disk and cache the instance.

        Returns the cached instance on subsequent calls (no double loading).

        Args:
            key:           Registered model key.
            artifact_path: Override joblib path (falls back to definition's artifact).

        Returns:
            Loaded AarogyaModelBase instance.

        Raises:
            KeyError:           If the model key is not registered.
            ModelNotTrainedError: If no artifact exists at the given path.
        """
        if key in cls._instances:
            return cls._instances[key]

        if key not in cls._classes:
            raise KeyError(
                f"Model '{key}' is not registered. "
                f"Available: {list(cls._classes.keys())}"
            )

        defn    = cls._definitions.get(key, {})
        art_path = Path(artifact_path or defn.get("artifact", f"{key}.joblib"))

        model_class = cls._classes[key]
        instance    = model_class.load_from_disk(art_path)
        cls._instances[key] = instance
        return instance

    # ── Introspection ─────────────────────────────────────────────────────────

    @classmethod
    def list_models(cls) -> list[dict]:
        """
        Return a list of all defined models with their status and metadata.

        Includes models not yet trained (status = "planned").
        """
        result = []
        for key, defn in cls._definitions.items():
            artifact = Path(defn.get("artifact", ""))
            result.append({
                "key":         key,
                "description": defn.get("description", ""),
                "target":      defn.get("target", ""),
                "dataset":     defn.get("dataset", ""),
                "status":      defn.get("status", "planned"),
                "version":     defn.get("version", "0.0.0"),
                "is_loaded":   key in cls._instances,
                "artifact_exists": artifact.exists() if artifact.name else False,
            })
        return result

    @classmethod
    def is_loaded(cls, key: str) -> bool:
        """Return True if the model is currently loaded in memory."""
        return key in cls._instances

    @classmethod
    def unload(cls, key: str) -> None:
        """Remove a model from the in-memory cache (frees RAM)."""
        cls._instances.pop(key, None)

    @classmethod
    def unload_all(cls) -> None:
        """Unload all cached model instances."""
        cls._instances.clear()

    @classmethod
    def status_report(cls) -> dict:
        """
        Return a full status report for health checks and admin views.
        """
        return {
            "registered_classes": list(cls._classes.keys()),
            "defined_models":     len(cls._definitions),
            "loaded_models":      list(cls._instances.keys()),
            "models":             cls.list_models(),
        }
