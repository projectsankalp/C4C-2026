"""
AarogyaNet AI Pipeline — Dataset layer.

Provides utilities for loading, inspecting, normalising, profiling, and
tracking metadata for external public health datasets:
  - ICMR Diabetes Registry
  - NFHS (National Family Health Survey)
  - NIKSHAY (TB surveillance)
  - HMIS (Health Management Information System)

No PHI from AarogyaNet's patient database is ever written here.
"""
from ai_engine.datasets.ingestion import DatasetIngestion
from ai_engine.datasets.profiler import DatasetProfiler, ProfileReport
from ai_engine.datasets.metadata.schemas import (
    ICMR_DIABETES_SCHEMA,
    NFHS_SCHEMA,
    NIKSHAY_SCHEMA,
    HMIS_SCHEMA,
    DATASET_REGISTRY,
)

__all__ = [
    "DatasetIngestion",
    "DatasetProfiler",
    "ProfileReport",
    "ICMR_DIABETES_SCHEMA",
    "NFHS_SCHEMA",
    "NIKSHAY_SCHEMA",
    "HMIS_SCHEMA",
    "DATASET_REGISTRY",
]
