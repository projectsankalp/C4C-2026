"""
AarogyaNet AI Pipeline — Model Abstraction Layer.

Defines the AarogyaModelBase abstract interface that all future ML models
must implement. Provides:

  - joblib-compatible load/save
  - SHAP-compatible predict_proba interface
  - Model metadata and feature name contracts
  - Clear separation between clinical deterministic logic and ML inference

Supported future model types:
  - Diabetes risk classifier
  - BP trajectory predictor
  - Outbreak probability estimator

No models are trained or loaded yet — interfaces only.
"""

from __future__ import annotations

import abc
from pathlib import Path
from typing import Any

import numpy as np


# ─────────────────────────────────────────────────────────────────────────────
# Exceptions
# ─────────────────────────────────────────────────────────────────────────────

class ModelNotTrainedError(RuntimeError):
    """Raised when attempting inference on a model that has not been loaded."""
    pass


class ModelCompatibilityError(ValueError):
    """Raised when a feature vector does not match the model's expected schema."""
    pass


# ─────────────────────────────────────────────────────────────────────────────
# Abstract base
# ─────────────────────────────────────────────────────────────────────────────

class AarogyaModelBase(abc.ABC):
    """
    Abstract base class for all AarogyaNet ML models.

    Subclasses must implement:
      - get_feature_names() → list[str]
      - get_model_info()    → dict
      - predict(features)   → dict
      - predict_proba(features) → np.ndarray  (SHAP-compatible)

    Subclasses may optionally override:
      - validate_features(features) for schema-specific validation
      - preprocess(features) for model-specific preprocessing

    joblib compatibility:
      Use load_from_disk() and save_to_disk() for persistence.
      The underlying sklearn estimator should be stored as self._estimator
      so joblib can serialise it correctly.
    """

    MODEL_TYPE: str = "base"     # Override in each subclass
    VERSION:    str = "0.0.0"    # Semantic version of the model interface

    def __init__(self):
        self._estimator = None   # sklearn estimator — populated by load_from_disk()
        self._is_loaded  = False

    # ── Abstract interface ────────────────────────────────────────────────────

    @abc.abstractmethod
    def get_feature_names(self) -> list[str]:
        """
        Return the ordered list of feature names this model expects.

        Must match the output of FeaturePipeline.get_feature_names() for the
        features relevant to this model type.
        """

    @abc.abstractmethod
    def get_model_info(self) -> dict:
        """
        Return a structured metadata dict describing this model.

        Should include at minimum:
          model_type, version, feature_names, training_dataset,
          target_variable, performance_metrics (empty if not yet trained).
        """

    @abc.abstractmethod
    def predict(self, features: dict[str, float]) -> dict:
        """
        Run inference on a single feature dict.

        Args:
            features: Feature dict — must contain all keys from get_feature_names().

        Returns:
            Structured prediction dict (model-specific format).

        Raises:
            ModelNotTrainedError: If no model has been loaded.
            ModelCompatibilityError: If features are incompatible.
        """

    @abc.abstractmethod
    def predict_proba(self, features: dict[str, float]) -> np.ndarray:
        """
        Return class probability array — SHAP-compatible interface.

        Args:
            features: Feature dict.

        Returns:
            numpy array of shape (1, n_classes).

        Raises:
            ModelNotTrainedError: If no model has been loaded.
        """

    # ── Concrete helpers ──────────────────────────────────────────────────────

    def validate_features(self, features: dict[str, float]) -> tuple[bool, list[str]]:
        """
        Check that all required features are present.

        Returns:
            (is_valid: bool, missing_features: list[str])
        """
        required   = set(self.get_feature_names())
        provided   = set(features.keys())
        missing    = sorted(required - provided)
        return (len(missing) == 0), missing

    def preprocess(self, features: dict[str, float]) -> np.ndarray:
        """
        Convert a feature dict to a 2D numpy array in the correct column order.

        Validates feature completeness before conversion.

        Args:
            features: Feature dict from FeaturePipeline.

        Returns:
            numpy array of shape (1, n_features).

        Raises:
            ModelCompatibilityError: If required features are missing.
        """
        is_valid, missing = self.validate_features(features)
        if not is_valid:
            raise ModelCompatibilityError(
                f"[{self.MODEL_TYPE}] Missing features: {missing}. "
                "Ensure FeaturePipeline is used consistently."
            )
        ordered = [float(features[name]) for name in self.get_feature_names()]
        return np.array([ordered], dtype=np.float64)

    def _assert_loaded(self) -> None:
        if not self._is_loaded or self._estimator is None:
            raise ModelNotTrainedError(
                f"Model '{self.MODEL_TYPE}' has not been loaded. "
                "Train and save the model first, then call load_from_disk()."
            )

    # ── joblib persistence ────────────────────────────────────────────────────

    def save_to_disk(self, path: str | Path) -> Path:
        """
        Serialise the model to disk using joblib.

        Args:
            path: File path ending in .joblib or .pkl.

        Returns:
            Resolved Path of the written file.

        Raises:
            ModelNotTrainedError: If no estimator is loaded.
        """
        import joblib

        self._assert_loaded()
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {"estimator": self._estimator, "model_info": self.get_model_info()},
            path,
        )
        print(f"[{self.MODEL_TYPE}] Model saved: {path}")
        return path

    @classmethod
    def load_from_disk(cls, path: str | Path) -> "AarogyaModelBase":
        """
        Load a serialised model from disk.

        Args:
            path: Path to a .joblib file saved by save_to_disk().

        Returns:
            Instance of the calling subclass with _estimator populated.

        Raises:
            FileNotFoundError: If the file does not exist.
        """
        import joblib

        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")

        payload = joblib.load(path)
        instance = cls()
        instance._estimator = payload["estimator"]
        instance._is_loaded  = True
        print(f"[{cls.MODEL_TYPE}] Model loaded from: {path}")
        return instance

    # ── SHAP interface document ────────────────────────────────────────────────

    def get_shap_interface(self) -> dict:
        """
        Return metadata describing the SHAP-compatible interface.

        This is a documentation helper — SHAP explainers can be attached
        once a model is trained:

            import shap
            model = DiabetesRiskModel.load_from_disk("models/diabetes_v1.joblib")
            explainer = shap.TreeExplainer(model._estimator)
            X = pd.DataFrame([features], columns=model.get_feature_names())
            shap_values = explainer(X)

        Returns:
            Dict describing the interface contract.
        """
        return {
            "model_type":    self.MODEL_TYPE,
            "version":       self.VERSION,
            "feature_names": self.get_feature_names(),
            "shap_ready":    self._is_loaded,
            "predict_method": "predict_proba",
            "shap_explainer_types": [
                "shap.TreeExplainer",
                "shap.LinearExplainer",
                "shap.KernelExplainer",
            ],
            "note": (
                "Attach a SHAP explainer to model._estimator after loading. "
                "feature_names must match FeaturePipeline.get_feature_names()."
            ),
        }
