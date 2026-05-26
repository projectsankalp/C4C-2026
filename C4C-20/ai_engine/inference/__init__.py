"""
AarogyaNet AI Pipeline — Inference skeleton.

Prediction interfaces, validation hooks, and preprocessing consistency
layer. No actual inference is performed until models are trained and
registered.
"""
from ai_engine.inference.pipeline import InferencePipeline, InferenceNotAvailableError

__all__ = ["InferencePipeline", "InferenceNotAvailableError"]
