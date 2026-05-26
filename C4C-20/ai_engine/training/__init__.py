"""
AarogyaNet AI Pipeline — Training skeleton.

Dataset preparation and training interfaces. PHI stripping is applied
before any feature vectors are used in training. No actual model
training is performed until datasets are loaded and validated.
"""
from ai_engine.training.base import TrainingPipeline

__all__ = ["TrainingPipeline"]
