"""
AarogyaNet AI Pipeline — Model abstraction layer.

Provides joblib-compatible model loader interfaces and a model registry
for future ML models:
  - Diabetes risk model
  - BP trajectory prediction model
  - Outbreak intelligence model

No models are trained or loaded here yet — interfaces only.
"""
from ai_engine.models.base import AarogyaModelBase, ModelNotTrainedError
from ai_engine.models.registry import ModelRegistry

__all__ = ["AarogyaModelBase", "ModelNotTrainedError", "ModelRegistry"]
