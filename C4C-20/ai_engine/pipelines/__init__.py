"""
AarogyaNet AI Pipeline — Feature engineering layer.

Extends (does not replace) the existing deterministic preprocessing in
ai_engine/preprocessing.py with ML-grade feature extraction:
  - Longitudinal features across visit sequences
  - Adherence trajectory features
  - BP trend / slope features
  - Demographic features
  - SHAP-compatible feature vectors
"""
from ai_engine.pipelines.feature_pipeline import FeaturePipeline
from ai_engine.pipelines.feature_store import FeatureStore

__all__ = ["FeaturePipeline", "FeatureStore"]
