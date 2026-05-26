"""
AarogyaNet AI Pipeline — Feature Engineering Pipeline.

Extends (does NOT replace) ai_engine/preprocessing.py with ML-grade
feature extraction across multiple dimensions:

  1. Visit-level features     — normalised vitals + symptom flags
  2. Longitudinal features    — BP slope, risk trajectory slope
  3. Adherence features       — adherence rate, consecutive miss streak
  4. Demographic features     — age bands, gender encoding
  5. Derived clinical features— pulse pressure, MAP, BP stage encoding

Design principles:
  - Deterministic: same inputs always produce the same outputs
  - PHI-safe: no patient names, phone numbers, or exact GPS in vectors
  - SHAP-compatible: all features are named, documented, and float-typed
  - Backward-compatible: imports preprocess_visit() from existing engine

SHAP compatibility:
  The pipeline exposes get_feature_names() → list[str], and all outputs
  are numpy float64 arrays, so SHAP explainers can be attached directly
  to any scikit-learn model trained on these features.
"""

from __future__ import annotations

import statistics
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd

from ai_engine.preprocessing import preprocess_visit  # existing engine — not modified


# ─────────────────────────────────────────────────────────────────────────────
# Feature group definitions
# ─────────────────────────────────────────────────────────────────────────────

# Ordered list of all feature names produced by this pipeline.
# This is the single source of truth — if you add a feature, add it here.
FEATURE_NAMES: list[str] = [
    # ── Visit-level vitals ─────────────────────────────────────────────────
    "bp_systolic",
    "bp_diastolic",
    "pulse",
    "temperature",
    "pulse_pressure",           # systolic − diastolic
    "mean_arterial_pressure",   # (systolic + 2×diastolic) / 3

    # ── Symptom flags (0/1 int) ────────────────────────────────────────────
    "dizziness",
    "chest_pain",
    "medicine_missed",

    # ── BP stage encoding (ordinal 0–4) ───────────────────────────────────
    "bp_stage",                 # 0=normal, 1=elevated, 2=stage1, 3=stage2, 4=crisis

    # ── Longitudinal BP features ──────────────────────────────────────────
    "bp_systolic_mean",         # mean across all visits
    "bp_systolic_std",          # standard deviation
    "bp_systolic_slope",        # linear regression slope (mmHg per visit)
    "bp_systolic_min",
    "bp_systolic_max",
    "bp_diastolic_mean",
    "bp_diastolic_slope",

    # ── Longitudinal risk score features ──────────────────────────────────
    "risk_score_mean",
    "risk_score_std",
    "risk_score_slope",
    "risk_score_max",
    "risk_score_last",

    # ── Adherence features ─────────────────────────────────────────────────
    "adherence_rate",           # fraction of visits with medicine NOT missed
    "missed_count",
    "consecutive_miss_streak",  # current run of consecutive missed doses
    "max_consecutive_miss",     # worst-ever consecutive miss streak

    # ── Visit pattern features ─────────────────────────────────────────────
    "total_visits",
    "visit_gap_mean_days",      # mean days between consecutive visits
    "visit_gap_std_days",

    # ── Demographic features ───────────────────────────────────────────────
    "age",
    "age_band",                 # 0=<30, 1=30–44, 2=45–59, 3=60–74, 4=≥75
    "gender_encoded",           # 0=female, 1=male, -1=unknown

    # ── Crisis / pathway flags ─────────────────────────────────────────────
    "crisis_event_count",       # hypertensive crises across visit history
    "chest_pain_count",
    "dizziness_count",
]


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _safe_float(val, default: float = 0.0) -> float:
    try:
        v = float(val)
        return v if np.isfinite(v) else default
    except (TypeError, ValueError):
        return default


def _linear_slope(values: list[float]) -> float:
    """
    Compute the slope of a simple OLS regression line through
    evenly-spaced observations (x = 0, 1, 2, ..., n-1).

    Returns 0.0 if fewer than 2 observations.
    """
    n = len(values)
    if n < 2:
        return 0.0
    x = list(range(n))
    x_mean = (n - 1) / 2.0
    y_mean = sum(values) / n
    num    = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, values))
    den    = sum((xi - x_mean) ** 2 for xi in x)
    return num / den if den != 0 else 0.0


def _bp_stage(systolic: float, diastolic: float) -> int:
    """Encode BP into ordinal stage (0–4)."""
    if systolic >= 180 or diastolic >= 110:
        return 4   # Hypertensive crisis
    if systolic >= 160 or diastolic >= 100:
        return 3   # Stage 2
    if systolic >= 140 or diastolic >= 90:
        return 2   # Stage 1
    if systolic >= 130 or diastolic >= 80:
        return 1   # Elevated / pre-hypertension
    return 0       # Normal


def _age_band(age: float) -> int:
    """Map age to ordinal band (0–4)."""
    if age < 30:  return 0
    if age < 45:  return 1
    if age < 60:  return 2
    if age < 75:  return 3
    return 4


def _gender_encode(gender: str | None) -> int:
    """Encode gender as int. -1 = unknown."""
    if not gender:
        return -1
    g = str(gender).strip().lower()
    if g in ("m", "male", "1"):
        return 1
    if g in ("f", "female", "0"):
        return 0
    return -1


def _parse_dt(val) -> datetime | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.replace(tzinfo=timezone.utc) if val.tzinfo is None else val
    if isinstance(val, str):
        try:
            dt = datetime.fromisoformat(val)
            return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
        except Exception:
            return None
    return None


def _visit_gaps(visits: list[dict]) -> list[float]:
    """Return list of inter-visit gaps in days (sorted by visit_date)."""
    dates = []
    for v in visits:
        dt = _parse_dt(v.get("visit_date"))
        if dt:
            dates.append(dt)
    dates.sort()
    if len(dates) < 2:
        return []
    return [abs((dates[i+1] - dates[i]).days) for i in range(len(dates) - 1)]


# ─────────────────────────────────────────────────────────────────────────────
# FeaturePipeline
# ─────────────────────────────────────────────────────────────────────────────

class FeaturePipeline:
    """
    ML-grade feature extractor for AarogyaNet patient data.

    Usage (patient with full visit history):
        pipeline = FeaturePipeline()
        vector = pipeline.extract_patient_features(patient_dict, visits_list)
        # → dict {feature_name: float}

    Usage (single visit, for real-time scoring):
        vector = pipeline.extract_visit_features(visit_dict)

    SHAP compatibility:
        The output dict keys match FEATURE_NAMES exactly, so you can
        construct a DataFrame and attach a SHAP explainer directly:
            df = pd.DataFrame([vector])
            shap_values = explainer(df)
    """

    def get_feature_names(self) -> list[str]:
        """Return the ordered list of all feature names this pipeline produces."""
        return list(FEATURE_NAMES)

    # ── Single-visit features ─────────────────────────────────────────────────

    def extract_visit_features(self, visit: dict) -> dict[str, float]:
        """
        Extract visit-level features from a single visit dict.

        Uses the existing preprocess_visit() for vitals normalisation,
        then augments with derived clinical features.

        Args:
            visit: Raw visit dict (same format as /api/visits POST body).

        Returns:
            Feature dict {feature_name: float}.
        """
        proc = preprocess_visit(visit)

        bp_s  = _safe_float(proc.get("bp_systolic"))
        bp_d  = _safe_float(proc.get("bp_diastolic"))
        pulse = _safe_float(proc.get("pulse"))
        temp  = _safe_float(proc.get("temperature"))

        return {
            "bp_systolic":           bp_s,
            "bp_diastolic":          bp_d,
            "pulse":                 pulse,
            "temperature":           temp,
            "pulse_pressure":        bp_s - bp_d,
            "mean_arterial_pressure": (bp_s + 2 * bp_d) / 3.0 if bp_s else 0.0,
            "dizziness":             float(bool(proc.get("dizziness"))),
            "chest_pain":            float(bool(proc.get("chest_pain"))),
            "medicine_missed":       float(bool(proc.get("medicine_missed"))),
            "bp_stage":              float(_bp_stage(bp_s, bp_d)),
        }

    # ── Longitudinal features ─────────────────────────────────────────────────

    def extract_longitudinal_features(self, visits: list[dict]) -> dict[str, float]:
        """
        Extract longitudinal features across all visits.

        Visits should be ordered oldest → newest (as returned by the DB).

        Args:
            visits: List of visit dicts from asha_visits.

        Returns:
            Feature dict covering BP trends, risk trajectory, and visit gaps.
        """
        if not visits:
            return {
                "bp_systolic_mean":   0.0, "bp_systolic_std":    0.0,
                "bp_systolic_slope":  0.0, "bp_systolic_min":    0.0,
                "bp_systolic_max":    0.0, "bp_diastolic_mean":  0.0,
                "bp_diastolic_slope": 0.0,
                "risk_score_mean":    0.0, "risk_score_std":     0.0,
                "risk_score_slope":   0.0, "risk_score_max":     0.0,
                "risk_score_last":    0.0,
                "total_visits":       0.0,
                "visit_gap_mean_days":0.0, "visit_gap_std_days": 0.0,
            }

        bp_sys   = [_safe_float(v.get("bp_systolic"))  for v in visits if v.get("bp_systolic")]
        bp_dia   = [_safe_float(v.get("bp_diastolic")) for v in visits if v.get("bp_diastolic")]
        r_scores = [_safe_float(v.get("risk_score"))   for v in visits]
        gaps     = _visit_gaps(visits)

        def _stats(lst: list[float]) -> tuple[float, float, float, float, float]:
            if not lst:
                return 0.0, 0.0, 0.0, 0.0, 0.0
            mean_ = statistics.mean(lst)
            std_  = statistics.stdev(lst) if len(lst) >= 2 else 0.0
            return mean_, std_, _linear_slope(lst), min(lst), max(lst)

        bp_s_mean, bp_s_std, bp_s_slope, bp_s_min, bp_s_max = _stats(bp_sys)
        bp_d_mean, _, bp_d_slope, _, _                       = _stats(bp_dia)
        r_mean,   r_std,   r_slope,  _,      r_max          = _stats(r_scores)
        g_mean, g_std = (
            (statistics.mean(gaps), statistics.stdev(gaps) if len(gaps) >= 2 else 0.0)
            if gaps else (0.0, 0.0)
        )

        return {
            "bp_systolic_mean":    bp_s_mean,
            "bp_systolic_std":     bp_s_std,
            "bp_systolic_slope":   bp_s_slope,
            "bp_systolic_min":     bp_s_min,
            "bp_systolic_max":     bp_s_max,
            "bp_diastolic_mean":   bp_d_mean,
            "bp_diastolic_slope":  bp_d_slope,
            "risk_score_mean":     r_mean,
            "risk_score_std":      r_std,
            "risk_score_slope":    r_slope,
            "risk_score_max":      r_max,
            "risk_score_last":     r_scores[-1] if r_scores else 0.0,
            "total_visits":        float(len(visits)),
            "visit_gap_mean_days": g_mean,
            "visit_gap_std_days":  g_std,
        }

    # ── Adherence features ────────────────────────────────────────────────────

    def extract_adherence_features(self, visits: list[dict]) -> dict[str, float]:
        """
        Compute medication adherence trajectory features.

        Args:
            visits: All patient visits (oldest → newest).

        Returns:
            Feature dict covering adherence rates and miss streaks.
        """
        if not visits:
            return {
                "adherence_rate":          1.0,
                "missed_count":            0.0,
                "consecutive_miss_streak": 0.0,
                "max_consecutive_miss":    0.0,
            }

        total   = len(visits)
        missed  = [bool(v.get("medicine_missed")) for v in visits]
        n_miss  = sum(missed)

        # Max consecutive miss streak
        max_run = run = 0
        for m in missed:
            if m:
                run += 1
                max_run = max(max_run, run)
            else:
                run = 0

        # Current consecutive miss streak (trailing)
        cur_streak = 0
        for m in reversed(missed):
            if m:
                cur_streak += 1
            else:
                break

        return {
            "adherence_rate":          round(1.0 - n_miss / total, 4),
            "missed_count":            float(n_miss),
            "consecutive_miss_streak": float(cur_streak),
            "max_consecutive_miss":    float(max_run),
        }

    # ── Demographic features ──────────────────────────────────────────────────

    def extract_demographic_features(self, patient: dict) -> dict[str, float]:
        """
        Extract demographic features from the patient record.

        PHI columns (name, phone, address, latitude, longitude) are
        explicitly excluded from the output.

        Args:
            patient: Patient dict from the patients table.

        Returns:
            Feature dict with age, age_band, and gender_encoded.
        """
        age = _safe_float(patient.get("age"), default=-1.0)
        return {
            "age":            age,
            "age_band":       float(_age_band(age)) if age >= 0 else -1.0,
            "gender_encoded": float(_gender_encode(patient.get("gender"))),
        }

    # ── Clinical event counts ─────────────────────────────────────────────────

    def extract_clinical_event_counts(self, visits: list[dict]) -> dict[str, float]:
        """
        Count clinically significant events across the full visit history.

        Args:
            visits: All patient visits.

        Returns:
            Feature dict with crisis_event_count, chest_pain_count, dizziness_count.
        """
        crisis_count    = 0
        chest_count     = 0
        dizziness_count = 0

        for v in visits:
            bp_s = _safe_float(v.get("bp_systolic"))
            bp_d = _safe_float(v.get("bp_diastolic"))
            if bp_s >= 180 or bp_d >= 110:
                crisis_count += 1
            if v.get("chest_pain"):
                chest_count += 1
            if v.get("dizziness"):
                dizziness_count += 1

        return {
            "crisis_event_count": float(crisis_count),
            "chest_pain_count":   float(chest_count),
            "dizziness_count":    float(dizziness_count),
        }

    # ── Full patient feature vector ───────────────────────────────────────────

    def extract_patient_features(
        self,
        patient:       dict,
        visits:        list[dict],
        latest_visit:  dict | None = None,
    ) -> dict[str, float]:
        """
        Build the complete ML-ready feature vector for a patient.

        Combines visit-level, longitudinal, adherence, demographic, and
        clinical event features into a single flat dict keyed by FEATURE_NAMES.

        Args:
            patient:       Patient record from the patients table.
            visits:        All visits for this patient (oldest → newest).
            latest_visit:  Most recent visit for per-visit vitals features.
                           Defaults to visits[-1] if not provided.

        Returns:
            Complete feature dict — all values are float, no PHI present.
        """
        lv = latest_visit or (visits[-1] if visits else {})

        visit_feats    = self.extract_visit_features(lv)
        long_feats     = self.extract_longitudinal_features(visits)
        adh_feats      = self.extract_adherence_features(visits)
        demo_feats     = self.extract_demographic_features(patient)
        clinical_feats = self.extract_clinical_event_counts(visits)

        combined = {
            **visit_feats,
            **long_feats,
            **adh_feats,
            **demo_feats,
            **clinical_feats,
        }

        # Return in canonical FEATURE_NAMES order, filling gaps with 0.0
        return {name: combined.get(name, 0.0) for name in FEATURE_NAMES}

    # ── Batch extraction ──────────────────────────────────────────────────────

    def build_feature_matrix(
        self,
        records: list[tuple[dict, list[dict]]],
    ) -> pd.DataFrame:
        """
        Build a feature matrix from a list of (patient, visits) tuples.

        Useful for offline training preparation. PHI is NOT automatically
        stripped here — caller must apply strip_phi() if needed.

        Args:
            records: List of (patient_dict, visits_list) pairs.

        Returns:
            DataFrame with one row per patient and columns = FEATURE_NAMES.
        """
        rows = []
        for patient, visits in records:
            vector = self.extract_patient_features(patient, visits)
            rows.append(vector)
        return pd.DataFrame(rows, columns=FEATURE_NAMES)
