"""
AarogyaNet AI Engine — Public API Surface.

This package has two distinct layers:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 1 — Deterministic Clinical Engine (EXISTING — DO NOT MODIFY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ai_engine.preprocessing   — visit normalisation  (preprocess_visit)
  ai_engine.risk_engine     — 3-layer clinical scoring (calculate_risk_score)

These are the production-grade rule engines used by ASHA workers and
doctors today. They are deterministic, auditable, and clinically validated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 2 — AI Infrastructure Foundation (NEW — ADDITIVE ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ai_engine.utils           — privacy guards + I/O helpers
  ai_engine.datasets        — ingestion + metadata schemas
  ai_engine.pipelines       — feature engineering + feature store
  ai_engine.models          — model abstraction + registry
  ai_engine.inference       — inference pipeline skeleton
  ai_engine.training        — training pipeline skeleton
  ai_engine.evaluation      — healthcare ML metrics

Status: Foundation phase. No models are trained yet.
The AI layer is an augmentation, not a replacement for Layer 1.
"""

# ── Layer 1: Deterministic engine (unchanged) ──────────────────────────────
from ai_engine.preprocessing import preprocess_visit, build_feature_matrix
from ai_engine.risk_engine import (
    calculate_risk_score,
    get_risk_summary,
    extract_gcpe_context,
)

# ── Layer 2: AI infrastructure ─────────────────────────────────────────────
from ai_engine.utils.privacy import (
    PHI_COLUMNS,
    strip_phi,
    validate_no_phi,
    anonymise_patient_id,
    assert_phi_free,
)
from ai_engine.utils.io import (
    safe_load_csv,
    safe_load_xlsx,
    save_json,
    load_json,
    ensure_dir,
    save_feature_vector,
    load_feature_vector,
)
from ai_engine.pipelines.feature_pipeline import FeaturePipeline, FEATURE_NAMES
from ai_engine.pipelines.feature_store import FeatureStore
from ai_engine.models.base import AarogyaModelBase, ModelNotTrainedError
from ai_engine.models.registry import ModelRegistry
from ai_engine.inference.pipeline import InferencePipeline, InferenceNotAvailableError
from ai_engine.evaluation.metrics import (
    compute_binary_metrics,
    compute_calibration,
    compute_clinical_utility,
    MetricsReport,
)

__all__ = [
    # Layer 1 — deterministic engine
    "preprocess_visit",
    "build_feature_matrix",
    "calculate_risk_score",
    "get_risk_summary",
    "extract_gcpe_context",

    # Layer 2 — privacy
    "PHI_COLUMNS",
    "strip_phi",
    "validate_no_phi",
    "anonymise_patient_id",
    "assert_phi_free",

    # Layer 2 — I/O
    "safe_load_csv",
    "safe_load_xlsx",
    "save_json",
    "load_json",
    "ensure_dir",
    "save_feature_vector",
    "load_feature_vector",

    # Layer 2 — feature engineering
    "FeaturePipeline",
    "FEATURE_NAMES",
    "FeatureStore",

    # Layer 2 — model abstraction
    "AarogyaModelBase",
    "ModelNotTrainedError",
    "ModelRegistry",

    # Layer 2 — inference
    "InferencePipeline",
    "InferenceNotAvailableError",

    # Layer 2 — evaluation
    "compute_binary_metrics",
    "compute_calibration",
    "compute_clinical_utility",
    "MetricsReport",
]
