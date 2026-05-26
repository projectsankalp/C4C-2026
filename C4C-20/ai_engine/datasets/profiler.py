"""
AarogyaNet Dataset Profiling & Inspection Layer.

Professional healthcare dataset governance before model training.

Answers:
  - Which datasets are usable for ML?
  - Which labels exist?
  - Which features are clinically valuable?
  - Which datasets are dangerous / noisy?
  - What preprocessing is needed before training?

Usage (programmatic):
    from ai_engine.datasets.profiler import DatasetProfiler
    profiler = DatasetProfiler()
    report   = profiler.profile(df, dataset_key="pima_diabetes", filename="Pima_Indians_Diabetes_Database.csv")
    profiler.save_report(report)
    print(report.to_summary_text())

Usage (CLI):
    python -m ai_engine.datasets.profiler
    python -m ai_engine.datasets.profiler --file path/to/data.csv --key my_dataset
    python -m ai_engine.datasets.profiler --all    # profile every file in datasets/raw/
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from ai_engine.utils.privacy import PHI_COLUMNS, _is_phi_column
from ai_engine.utils.io import save_json, ensure_dir


# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────

_BASE        = Path(__file__).parent
RAW_DIR      = _BASE / "raw"
REPORTS_DIR  = _BASE / "metadata" / "reports"


# ─────────────────────────────────────────────────────────────────────────────
# Target label keywords
# ─────────────────────────────────────────────────────────────────────────────

TARGET_KEYWORDS = [
    "outcome", "diagnosis", "diabetes", "diabetic",
    "heart", "cardiac", "disease", "risk", "category",
    "label", "class", "target", "death", "mortality",
    "status", "result", "event", "flag", "indicator",
    "hypertension", "htn", "tb", "num",
]

# Columns that look like database IDs (not useful as features)
ID_KEYWORDS = [
    "id", "index", "serial", "record", "row", "no_", "number",
    "patient_id", "subject_id", "case_id", "respondent", "nikshay",
]


# ─────────────────────────────────────────────────────────────────────────────
# Healthcare impossible-value thresholds
# ─────────────────────────────────────────────────────────────────────────────

HEALTHCARE_RANGES: dict[str, tuple[float, float]] = {
    # BP
    "bloodpressure":         (50, 300),
    "bp_systolic":           (50, 300),
    "systolic":              (50, 300),
    "trestbps":              (50, 300),   # Heart UCI: resting BP
    "bp_diastolic":          (30, 200),
    "diastolic":             (30, 200),

    # Glucose
    "glucose":               (20, 800),
    "fasting_glucose":       (20, 800),
    "postprandial_glucose":  (30, 900),

    # HbA1c
    "hba1c":                 (3.0, 20.0),

    # BMI
    "bmi":                   (10.0, 70.0),

    # Age
    "age":                   (0, 120),
    "age_exact":             (0, 120),

    # Pulse / heart rate
    "pulse":                 (20, 300),
    "thalch":                (40, 250),   # Heart UCI: max heart rate achieved

    # Cholesterol
    "chol":                  (50, 700),
    "total_cholesterol":     (50, 700),

    # Insulin
    "insulin":               (0, 900),

    # Skin thickness (mm)
    "skinthickness":         (0, 100),

    # Pregnancies
    "pregnancies":           (0, 25),
}

# Fields where zero is clinically impossible (i.e. a coding artifact)
ZERO_IMPOSSIBLE = {
    "glucose", "bloodpressure", "skinthickness",
    "bmi", "trestbps", "chol", "thalch",
}

# Correlation thresholds
HIGH_CORR_THRESHOLD    = 0.85   # warn if two features are this correlated
LEAKAGE_CORR_THRESHOLD = 0.95   # flag as leakage risk if corr with target this high


# ─────────────────────────────────────────────────────────────────────────────
# Column classification helpers
# ─────────────────────────────────────────────────────────────────────────────

def _classify_column(series: pd.Series) -> str:
    """
    Return a column type label:
      'binary', 'categorical_low', 'categorical_high',
      'continuous', 'datetime', 'id_column', 'text', 'boolean'
    """
    name  = series.name.lower().strip()
    dtype = str(series.dtype)

    if any(k in name for k in ID_KEYWORDS) and series.nunique() == len(series):
        return "id_column"

    if "bool" in dtype:
        return "boolean"

    if "datetime" in dtype:
        return "datetime"

    if "object" in dtype or "string" in dtype or "category" in dtype:
        n_unique = series.nunique()
        if n_unique == 2:
            return "binary"
        if n_unique <= 20:
            return "categorical_low"
        if series.str.len().mean() > 30 if hasattr(series, "str") else False:
            return "text"
        return "categorical_high"

    # Numeric
    n_unique = series.nunique()
    if n_unique == 2:
        return "binary"
    if n_unique <= 10:
        return "categorical_low"
    return "continuous"


def _feature_usability_score(
    series:    pd.Series,
    col_type:  str,
    null_pct:  float,
    is_phi:    bool,
) -> tuple[float, list[str]]:
    """
    Score a feature's ML usability from 0.0 (unusable) to 10.0 (ideal).

    Deductions:
      - PHI column:               -10 (disqualified)
      - ID column:                -10 (disqualified)
      - > 50% missing:            -5
      - 20–50% missing:           -2
      - 5–20% missing:            -1
      - Zero variance:            -5
      - Near-zero variance (<3 unique): -2
      - High cardinality text:    -3
      - All-zero column:          -2
    Bonuses:
      - Binary target candidate:  +1
      - Continuous, low null:     +1

    Returns: (score, list_of_notes)
    """
    if is_phi or col_type == "id_column":
        return 0.0, ["PHI or ID column — must be excluded from ML pipeline"]

    score  = 10.0
    notes  = []

    # Missingness
    if null_pct > 50:
        score -= 5
        notes.append(f"{null_pct:.1f}% missing — severely incomplete")
    elif null_pct > 20:
        score -= 2
        notes.append(f"{null_pct:.1f}% missing — moderate imputation needed")
    elif null_pct > 5:
        score -= 1
        notes.append(f"{null_pct:.1f}% missing — minor imputation needed")

    # Variance
    if col_type == "continuous":
        try:
            std = series.dropna().std()
            if std == 0:
                score -= 5
                notes.append("Zero variance — constant column, useless for ML")
            elif series.nunique() < 3:
                score -= 2
                notes.append("Near-zero variance — very few unique values")
        except Exception:
            pass

    # All-zeros (clinical coding artifact)
    try:
        non_null = series.dropna()
        if len(non_null) > 0 and (non_null == 0).all():
            score -= 2
            notes.append("All zeros — likely a coding artifact or unmeasured field")
        elif series.name.lower() in ZERO_IMPOSSIBLE:
            zero_pct = (non_null == 0).mean() * 100
            if zero_pct > 1:
                score -= 1
                notes.append(
                    f"{zero_pct:.1f}% zero values in '{series.name}' — "
                    "zeros are clinically impossible here; treat as missing"
                )
    except Exception:
        pass

    # High cardinality text
    if col_type in ("categorical_high", "text"):
        score -= 3
        notes.append("High-cardinality text — requires encoding or NLP preprocessing")

    # Bonuses
    if col_type in ("binary", "boolean") and null_pct == 0:
        score += 0.5
        notes.append("Binary, fully populated — ideal target or flag feature")

    if col_type == "continuous" and null_pct < 5:
        score += 0.5

    return round(max(0.0, min(10.0, score)), 1), notes


# ─────────────────────────────────────────────────────────────────────────────
# ProfileReport
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class ProfileReport:
    """Complete dataset profile with all quality dimensions."""

    # ── Identity ──────────────────────────────────────────────────────────────
    dataset_key:    str  = ""
    filename:       str  = ""
    profiled_at:    str  = ""
    file_hash_md5:  str  = ""   # MD5 of raw file for reproducibility

    # ── Shape ─────────────────────────────────────────────────────────────────
    row_count:      int  = 0
    column_count:   int  = 0
    duplicate_rows: int  = 0
    duplicate_pct:  float = 0.0

    # ── Missingness summary ────────────────────────────────────────────────────
    overall_null_pct:    float = 0.0
    columns_gt50pct_null: list = field(default_factory=list)
    columns_complete:     list = field(default_factory=list)   # 0% missing

    # ── Column profiles ────────────────────────────────────────────────────────
    columns: dict = field(default_factory=dict)
    # {col_name: {dtype, col_type, null_count, null_pct, unique_count,
    #             cardinality_ratio, is_phi, usability_score, usability_notes,
    #             sample_values, stats}}

    # ── Target label discovery ─────────────────────────────────────────────────
    target_candidates: list = field(default_factory=list)
    # [{name, reason, class_distribution, class_balance_ok, cardinality}]

    # ── Correlation warnings ───────────────────────────────────────────────────
    high_correlation_pairs:  list = field(default_factory=list)
    # [{col_a, col_b, correlation}]
    leakage_risk_features:   list = field(default_factory=list)
    # [{feature, target, correlation, risk_level}]

    # ── Healthcare validation ──────────────────────────────────────────────────
    healthcare_issues: list = field(default_factory=list)
    # [{column, issue_type, detail, severity, row_count}]

    # ── PHI audit ─────────────────────────────────────────────────────────────
    phi_columns_detected: list = field(default_factory=list)
    id_columns_detected:  list = field(default_factory=list)

    # ── Dataset-level verdict ──────────────────────────────────────────────────
    ml_readiness_score:   float = 0.0   # 0–10 composite
    ml_readiness_verdict: str   = ""    # "ready" | "needs_cleaning" | "not_recommended"
    preprocessing_steps:  list  = field(default_factory=list)
    warnings:             list  = field(default_factory=list)
    critical_issues:      list  = field(default_factory=list)

    # ─────────────────────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        return asdict(self)

    def to_summary_text(self) -> str:
        """Human-readable single-page report."""
        lines = [
            "╔══════════════════════════════════════════════════════════════╗",
            f"  AarogyaNet Dataset Profile — {self.dataset_key or self.filename}",
            "╚══════════════════════════════════════════════════════════════╝",
            f"  Profiled : {self.profiled_at}",
            f"  File     : {self.filename}",
            "",
            "── SHAPE ──────────────────────────────────────────────────────",
            f"  Rows    : {self.row_count:,}",
            f"  Columns : {self.column_count}",
            f"  Dupes   : {self.duplicate_rows:,} ({self.duplicate_pct:.1f}%)",
            "",
            "── MISSINGNESS ────────────────────────────────────────────────",
            f"  Overall missing : {self.overall_null_pct:.1f}%",
        ]
        if self.columns_gt50pct_null:
            lines.append(f"  ⚠ > 50% missing : {', '.join(self.columns_gt50pct_null)}")
        if self.columns_complete:
            lines.append(f"  ✓ Complete cols  : {len(self.columns_complete)}")

        lines += ["", "── TARGET LABELS ──────────────────────────────────────────────"]
        if self.target_candidates:
            for t in self.target_candidates:
                bal = "✓ balanced" if t.get("class_balance_ok") else "⚠ imbalanced"
                lines.append(f"  [{bal}] '{t['name']}' — {t['reason']}")
                dist = t.get("class_distribution", {})
                for i, (k, v) in enumerate(dist.items()):
                    if i >= 5:
                        lines.append(f"             … ({len(dist) - 5} more classes)")
                        break
                    lines.append(f"             {k}: {v:.1%}")
        else:
            lines.append("  None detected automatically — check column list.")

        lines += ["", "── HEALTHCARE VALIDATION ──────────────────────────────────────"]
        if self.healthcare_issues:
            for issue in self.healthcare_issues:
                sev = {"critical": "🔴", "warning": "🟡", "info": "🔵"}.get(issue["severity"], "⚪")
                lines.append(
                    f"  {sev} {issue['column']} — {issue['issue_type']}: "
                    f"{issue['detail']} ({issue['row_count']:,} rows)"
                )
        else:
            lines.append("  ✓ No healthcare validation issues found.")

        lines += ["", "── PHI AUDIT ──────────────────────────────────────────────────"]
        if self.phi_columns_detected:
            lines.append(f"  🔴 PHI columns detected: {', '.join(self.phi_columns_detected)}")
            lines.append("     → These MUST be stripped before any ML pipeline.")
        else:
            lines.append("  ✓ No PHI columns detected.")
        if self.id_columns_detected:
            lines.append(f"  ⚠ ID columns detected : {', '.join(self.id_columns_detected)}")

        lines += ["", "── CORRELATION & LEAKAGE ──────────────────────────────────────"]
        if self.high_correlation_pairs:
            lines.append(f"  ⚠ High-correlation pairs (>{HIGH_CORR_THRESHOLD}):")
            for pair in self.high_correlation_pairs[:5]:
                lines.append(
                    f"     {pair['col_a']} ↔ {pair['col_b']}  r={pair['correlation']:.3f}"
                )
        else:
            lines.append("  ✓ No high-correlation pairs found.")
        if self.leakage_risk_features:
            lines.append(f"  🔴 Leakage risk features (>{LEAKAGE_CORR_THRESHOLD} with target):")
            for lr in self.leakage_risk_features:
                lines.append(
                    f"     '{lr['feature']}' → '{lr['target']}'  r={lr['correlation']:.3f}"
                )

        lines += [
            "",
            "── ML READINESS ───────────────────────────────────────────────",
            f"  Score   : {self.ml_readiness_score:.1f} / 10",
            f"  Verdict : {self.ml_readiness_verdict.upper()}",
        ]
        if self.preprocessing_steps:
            lines.append("  Required preprocessing:")
            for step in self.preprocessing_steps:
                lines.append(f"    • {step}")
        if self.critical_issues:
            lines.append("  Critical issues:")
            for ci in self.critical_issues:
                lines.append(f"    🔴 {ci}")
        if self.warnings:
            lines.append("  Warnings:")
            for w in self.warnings[:5]:
                lines.append(f"    ⚠ {w}")

        lines += [
            "",
            "── FEATURE USABILITY SCORES ───────────────────────────────────",
        ]
        col_scores = sorted(
            [(col, meta.get("usability_score", 0)) for col, meta in self.columns.items()],
            key=lambda x: x[1], reverse=True,
        )
        for col, score in col_scores:
            bar    = "█" * int(score) + "░" * (10 - int(score))
            is_phi = self.columns[col].get("is_phi", False)
            phi_tag = " [PHI]" if is_phi else ""
            lines.append(f"  {bar} {score:4.1f}  {col}{phi_tag}")

        lines.append("")
        return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# DatasetProfiler
# ─────────────────────────────────────────────────────────────────────────────

class DatasetProfiler:
    """
    Healthcare ML dataset profiler and governance auditor.

    Produces ProfileReport objects and saves them as JSON + human-readable
    summary text to ai_engine/datasets/metadata/reports/.
    """

    def __init__(self, reports_dir: str | Path | None = None):
        self._reports_dir = Path(reports_dir) if reports_dir else REPORTS_DIR
        ensure_dir(self._reports_dir)

    # ── Main entry point ──────────────────────────────────────────────────────

    def profile(
        self,
        df:          pd.DataFrame,
        dataset_key: str  = "",
        filename:    str  = "",
        file_path:   Path | None = None,
    ) -> ProfileReport:
        """
        Run the full profiling pipeline on a DataFrame.

        Args:
            df:          DataFrame to profile (may contain PHI — will be flagged).
            dataset_key: Logical key (e.g. 'pima_diabetes').
            filename:    Original filename for the report header.
            file_path:   If provided, used to compute the MD5 hash.

        Returns:
            Complete ProfileReport.
        """
        df = df.copy()
        # Normalise column names for internal analysis
        df.columns = [c.strip() for c in df.columns]

        report = ProfileReport(
            dataset_key  = dataset_key,
            filename     = filename,
            profiled_at  = datetime.now(timezone.utc).isoformat(),
            file_hash_md5 = self._md5(file_path) if file_path else "",
        )

        # ── 1. Shape + duplicates ─────────────────────────────────────────────
        report.row_count     = len(df)
        report.column_count  = len(df.columns)
        report.duplicate_rows = int(df.duplicated().sum())
        report.duplicate_pct  = round(report.duplicate_rows / len(df) * 100, 2) if len(df) else 0.0

        if report.duplicate_rows > 0:
            report.warnings.append(
                f"{report.duplicate_rows:,} duplicate rows ({report.duplicate_pct:.1f}%) — "
                "deduplicate before training to avoid data leakage."
            )

        # ── 2. Column profiles ────────────────────────────────────────────────
        total_cells      = report.row_count * report.column_count
        total_null_count = 0

        for col in df.columns:
            series    = df[col]
            col_lower = col.lower().strip()

            null_count       = int(series.isna().sum())
            null_pct         = round(null_count / len(df) * 100, 2) if len(df) else 0.0
            total_null_count += null_count
            unique_count     = int(series.nunique())
            cardinality_ratio = round(unique_count / len(df), 4) if len(df) else 0.0
            col_type         = _classify_column(series)
            is_phi           = _is_phi_column(col)
            is_id            = col_type == "id_column"

            usability_score, usability_notes = _feature_usability_score(
                series, col_type, null_pct, is_phi
            )

            # Descriptive stats for numeric columns
            stats: dict[str, Any] = {}
            if "float" in str(series.dtype) or "int" in str(series.dtype):
                non_null = series.dropna()
                if len(non_null) > 0:
                    stats = {
                        "mean":   round(float(non_null.mean()), 4),
                        "std":    round(float(non_null.std()), 4),
                        "min":    round(float(non_null.min()), 4),
                        "p25":    round(float(non_null.quantile(0.25)), 4),
                        "median": round(float(non_null.median()), 4),
                        "p75":    round(float(non_null.quantile(0.75)), 4),
                        "max":    round(float(non_null.max()), 4),
                        "zeros":  int((non_null == 0).sum()),
                        "zeros_pct": round((non_null == 0).mean() * 100, 2),
                    }

            # Value distribution for categoricals
            value_dist: dict = {}
            if col_type in ("binary", "categorical_low", "boolean"):
                vc = series.value_counts(normalize=True, dropna=False)
                value_dist = {str(k): round(float(v), 4) for k, v in vc.head(10).items()}

            report.columns[col] = {
                "dtype":            str(series.dtype),
                "col_type":         col_type,
                "null_count":       null_count,
                "null_pct":         null_pct,
                "unique_count":     unique_count,
                "cardinality_ratio": cardinality_ratio,
                "is_phi":           is_phi,
                "is_id_column":     is_id,
                "usability_score":  usability_score,
                "usability_notes":  usability_notes,
                "stats":            stats,
                "value_distribution": value_dist,
                "sample_values": [
                    str(v) for v in series.dropna().head(3).tolist()
                ],
            }

            if is_phi:
                report.phi_columns_detected.append(col)
            if is_id:
                report.id_columns_detected.append(col)
            if null_pct > 50:
                report.columns_gt50pct_null.append(col)
            if null_pct == 0:
                report.columns_complete.append(col)

        # Overall missingness
        report.overall_null_pct = round(
            total_null_count / total_cells * 100, 2
        ) if total_cells else 0.0

        # ── 3. Healthcare validation ──────────────────────────────────────────
        report.healthcare_issues = self._run_healthcare_checks(df)

        # ── 4. Target label discovery ─────────────────────────────────────────
        report.target_candidates = self._detect_targets(df, report.columns)

        # ── 5. Correlation analysis ───────────────────────────────────────────
        report.high_correlation_pairs, report.leakage_risk_features = (
            self._correlation_analysis(df, report.target_candidates, report.columns)
        )

        # ── 6. ML readiness verdict ───────────────────────────────────────────
        report = self._compute_readiness(report)

        return report

    # ── Healthcare validation ─────────────────────────────────────────────────

    def _run_healthcare_checks(self, df: pd.DataFrame) -> list[dict]:
        """Run all healthcare-specific validation checks."""
        issues = []

        for col in df.columns:
            col_lower = col.lower().strip()

            # Range checks against known medical fields
            for pattern, (lo, hi) in HEALTHCARE_RANGES.items():
                if pattern not in col_lower:
                    continue
                numeric = pd.to_numeric(df[col], errors="coerce").dropna()
                if len(numeric) == 0:
                    break
                out_of_range = ((numeric < lo) | (numeric > hi)).sum()
                if out_of_range > 0:
                    issues.append({
                        "column":     col,
                        "issue_type": "impossible_value",
                        "detail":     f"Expected [{lo}, {hi}]; {out_of_range:,} values out of range",
                        "severity":   "critical",
                        "row_count":  int(out_of_range),
                    })
                break

            # Zero-impossible fields (zeros are coded missing, not actual zero)
            if col_lower in ZERO_IMPOSSIBLE:
                numeric = pd.to_numeric(df[col], errors="coerce").dropna()
                if len(numeric) > 0:
                    zero_count = int((numeric == 0).sum())
                    if zero_count > 0:
                        issues.append({
                            "column":     col,
                            "issue_type": "zero_as_missing",
                            "detail":     (
                                f"{zero_count:,} zeros ({zero_count/len(numeric)*100:.1f}%) — "
                                "zeros are clinically impossible here; replace with NaN before training"
                            ),
                            "severity":   "warning",
                            "row_count":  zero_count,
                        })

        # All-zero columns
        for col in df.columns:
            try:
                numeric = pd.to_numeric(df[col], errors="coerce").dropna()
                if len(numeric) > 0 and (numeric == 0).all():
                    issues.append({
                        "column":     col,
                        "issue_type": "all_zero_column",
                        "detail":     "Entire column is zero — unmeasured field or coding error",
                        "severity":   "warning",
                        "row_count":  len(numeric),
                    })
            except Exception:
                pass

        # Suspicious age ranges
        age_cols = [c for c in df.columns if c.lower() in ("age", "age_exact", "age_years")]
        for col in age_cols:
            numeric = pd.to_numeric(df[col], errors="coerce").dropna()
            if len(numeric) == 0:
                continue
            extreme = ((numeric < 0) | (numeric > 120)).sum()
            if extreme > 0:
                issues.append({
                    "column":     col,
                    "issue_type": "impossible_age",
                    "detail":     f"{extreme} rows with age < 0 or > 120",
                    "severity":   "critical",
                    "row_count":  int(extreme),
                })

        # Detect potential duplicate patient records (by subset of key clinical columns)
        clinical_subset = [
            c for c in df.columns
            if c.lower() in (
                "age", "glucose", "bloodpressure", "bmi",
                "age", "trestbps", "chol", "thalch",
            )
        ]
        if len(clinical_subset) >= 3:
            dupe_clinical = int(df[clinical_subset].duplicated().sum())
            if dupe_clinical > 0:
                issues.append({
                    "column":     ", ".join(clinical_subset),
                    "issue_type": "duplicate_clinical_fingerprint",
                    "detail":     (
                        f"{dupe_clinical:,} rows share identical values across "
                        f"{len(clinical_subset)} clinical columns — possible duplicate patients"
                    ),
                    "severity":   "warning",
                    "row_count":  dupe_clinical,
                })

        return issues

    # ── Target detection ──────────────────────────────────────────────────────

    def _detect_targets(
        self,
        df:      pd.DataFrame,
        col_meta: dict,
    ) -> list[dict]:
        """Identify likely supervised learning targets."""
        candidates = []

        for col in df.columns:
            col_lower = col.lower().strip()
            meta      = col_meta.get(col, {})
            col_type  = meta.get("col_type", "")

            # Must not be PHI or ID
            if meta.get("is_phi") or meta.get("is_id_column"):
                continue

            # Check keyword match
            keyword_match = any(kw in col_lower for kw in TARGET_KEYWORDS)
            if not keyword_match and col_type not in ("binary", "boolean"):
                continue

            # Must be binary, boolean, or low-cardinality categorical.
            # Continuous columns are NEVER targets even if their name matches
            # a keyword (e.g. DiabetesPedigreeFunction is a feature, not a label).
            if col_type == "continuous":
                continue
            if col_type not in ("binary", "boolean", "categorical_low"):
                if not keyword_match:
                    continue

            series = df[col]
            n_unique = series.nunique()

            # Class distribution
            vc = series.value_counts(normalize=True, dropna=True)
            dist = {str(k): round(float(v), 4) for k, v in vc.items()}

            # Balance check: flag if minority class < 15%
            min_class_pct = min(dist.values()) if dist else 0.0
            balance_ok    = min_class_pct >= 0.15

            # Build reason string
            reasons = []
            if keyword_match:
                reasons.append(f"name matches target keyword")
            if col_type == "binary":
                reasons.append("binary column")
            if col_type == "boolean":
                reasons.append("boolean column")
            if n_unique <= 5:
                reasons.append(f"{n_unique} unique values (low cardinality)")

            candidates.append({
                "name":               col,
                "reason":             "; ".join(reasons),
                "cardinality":        n_unique,
                "col_type":           col_type,
                "class_distribution": dist,
                "class_balance_ok":   balance_ok,
                "minority_class_pct": round(min_class_pct * 100, 1),
                "null_pct":           meta.get("null_pct", 0.0),
                "usability_score":    meta.get("usability_score", 0.0),
            })

        # Sort: binary keyword-matched, fully populated columns first
        candidates.sort(
            key=lambda c: (
                -c["usability_score"],
                c["null_pct"],
                -int(any(kw in c["name"].lower() for kw in TARGET_KEYWORDS)),
            )
        )
        return candidates

    # ── Correlation analysis ──────────────────────────────────────────────────

    def _correlation_analysis(
        self,
        df:         pd.DataFrame,
        targets:    list[dict],
        col_meta:   dict,
    ) -> tuple[list[dict], list[dict]]:
        """Compute inter-feature correlations and leakage risk scores."""
        # Work only with numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.shape[1] < 2:
            return [], []

        try:
            corr = numeric_df.corr(method="pearson").abs()
        except Exception:
            return [], []

        # High-correlation pairs (upper triangle only)
        high_corr_pairs = []
        cols = list(corr.columns)
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                c = float(corr.iloc[i, j])
                if c >= HIGH_CORR_THRESHOLD and not np.isnan(c):
                    high_corr_pairs.append({
                        "col_a":       cols[i],
                        "col_b":       cols[j],
                        "correlation": round(c, 4),
                    })
        high_corr_pairs.sort(key=lambda x: -x["correlation"])

        # Leakage risk: features correlated > LEAKAGE_CORR_THRESHOLD with any target
        leakage = []
        target_names = [t["name"] for t in targets if t["name"] in corr.columns]
        for tgt in target_names:
            for feat in cols:
                if feat == tgt:
                    continue
                try:
                    c = float(corr.loc[feat, tgt])
                except (KeyError, Exception):
                    continue
                if c >= LEAKAGE_CORR_THRESHOLD and not np.isnan(c):
                    risk = "HIGH" if c >= 0.98 else "MEDIUM"
                    leakage.append({
                        "feature":     feat,
                        "target":      tgt,
                        "correlation": round(c, 4),
                        "risk_level":  risk,
                        "note":        (
                            f"'{feat}' is {c:.3f} correlated with target '{tgt}' — "
                            "may be a derived version of the label (data leakage)."
                        ),
                    })
        leakage.sort(key=lambda x: -x["correlation"])

        return high_corr_pairs, leakage

    # ── ML Readiness ──────────────────────────────────────────────────────────

    def _compute_readiness(self, report: ProfileReport) -> ProfileReport:
        """Compute the overall ML readiness score and preprocessing checklist."""
        score  = 10.0
        steps  = []
        crits  = []

        # No target candidates
        if not report.target_candidates:
            score -= 3
            crits.append("No supervised learning target detected — dataset may be aggregate/summary data.")

        # PHI present
        if report.phi_columns_detected:
            score -= 2
            steps.append(f"Strip PHI columns: {', '.join(report.phi_columns_detected)}")
            crits.append(f"PHI present: {report.phi_columns_detected}")

        # Heavy missingness
        if report.columns_gt50pct_null:
            penalty = min(3.0, len(report.columns_gt50pct_null) * 0.5)
            score -= penalty
            steps.append(
                f"Drop or impute high-missingness columns: "
                f"{', '.join(report.columns_gt50pct_null)}"
            )
            if len(report.columns_gt50pct_null) > 3:
                crits.append(
                    f"{len(report.columns_gt50pct_null)} columns have > 50% missing values."
                )

        # Duplicates
        if report.duplicate_pct > 5:
            score -= 1
            steps.append(f"Remove {report.duplicate_rows:,} duplicate rows ({report.duplicate_pct:.1f}%).")

        # Healthcare issues
        critical_health = [i for i in report.healthcare_issues if i["severity"] == "critical"]
        if critical_health:
            score -= min(2.0, len(critical_health) * 0.5)
            for issue in critical_health:
                steps.append(
                    f"Fix '{issue['column']}': {issue['issue_type']} — {issue['detail']}"
                )

        # Zeros-as-missing
        zero_issues = [i for i in report.healthcare_issues if i["issue_type"] == "zero_as_missing"]
        if zero_issues:
            score -= 0.5
            for zi in zero_issues:
                steps.append(f"Replace zeros with NaN in '{zi['column']}' before imputation.")

        # Leakage
        if report.leakage_risk_features:
            score -= 1
            for lr in report.leakage_risk_features:
                crits.append(
                    f"Leakage risk: '{lr['feature']}' corr={lr['correlation']:.3f} with '{lr['target']}'."
                )

        # ID columns still present
        if report.id_columns_detected:
            steps.append(f"Drop ID columns: {', '.join(report.id_columns_detected)}")

        # Overall null pct
        if report.overall_null_pct > 30:
            score -= 1
            steps.append("High overall missingness — consider imputation strategy document.")

        # No rows
        if report.row_count < 100:
            score -= 3
            crits.append(f"Only {report.row_count} rows — insufficient for ML training.")

        score = round(max(0.0, min(10.0, score)), 1)

        if score >= 7:
            verdict = "ready"
        elif score >= 4:
            verdict = "needs_cleaning"
        else:
            verdict = "not_recommended"

        report.ml_readiness_score   = score
        report.ml_readiness_verdict = verdict
        report.preprocessing_steps  = steps
        report.critical_issues      = crits

        return report

    # ── Save ──────────────────────────────────────────────────────────────────

    def save_report(self, report: ProfileReport, overwrite_latest: bool = True) -> tuple[Path, Path]:
        """
        Save a ProfileReport to disk as JSON + human-readable text.

        Saves two copies:
          - <dataset_key>_report.json           (always overwritten — latest)
          - <dataset_key>_summary.txt           (always overwritten — latest)

        Args:
            report:            ProfileReport to save.
            overwrite_latest:  If True (default), also overwrite the _latest file.

        Returns:
            (json_path, txt_path) of the written files.
        """
        ensure_dir(self._reports_dir)
        key = report.dataset_key or "unknown"

        json_path = self._reports_dir / f"{key}_report.json"
        txt_path  = self._reports_dir / f"{key}_summary.txt"

        save_json(report.to_dict(), json_path)

        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(report.to_summary_text())

        print(f"[Profiler] Report saved: {json_path.name} + {txt_path.name}")
        return json_path, txt_path

    # ── Convenience: profile from file path ───────────────────────────────────

    def profile_file(
        self,
        path:        str | Path,
        dataset_key: str = "",
        encoding:    str = "utf-8",
    ) -> ProfileReport:
        """
        Load a CSV/XLSX file and profile it in one call.

        Automatically falls back to latin-1 encoding if UTF-8 fails.

        Args:
            path:        Path to CSV or XLSX file.
            dataset_key: Optional logical key; defaults to filename stem.
            encoding:    Preferred encoding (default UTF-8).

        Returns:
            ProfileReport.
        """
        path = Path(path)
        key  = dataset_key or path.stem.lower().replace(" ", "_").replace("-", "_")

        # Load
        if path.suffix.lower() in (".xlsx", ".xls"):
            df = pd.read_excel(path)
        else:
            try:
                df = pd.read_csv(path, encoding=encoding, low_memory=False)
            except UnicodeDecodeError:
                df = pd.read_csv(path, encoding="latin-1", low_memory=False)

        print(f"[Profiler] Loaded: {path.name} — {len(df):,} rows × {len(df.columns)} columns")
        return self.profile(df, dataset_key=key, filename=path.name, file_path=path)

    # ── CLI: scan all raw datasets ────────────────────────────────────────────

    def profile_all_raw(self, save: bool = True) -> list[ProfileReport]:
        """
        Scan every CSV/XLSX file in datasets/raw/ and profile each one.

        Args:
            save: If True (default), save JSON + text reports for each file.

        Returns:
            List of ProfileReport objects.
        """
        raw_files = list(RAW_DIR.glob("*.csv")) + list(RAW_DIR.glob("*.xlsx"))
        if not raw_files:
            print(f"[Profiler] No files found in {RAW_DIR}")
            return []

        reports = []
        for fpath in sorted(raw_files):
            print(f"\n[Profiler] Profiling: {fpath.name}")
            try:
                report = self.profile_file(fpath)
                if save:
                    self.save_report(report)
                reports.append(report)
            except Exception as e:
                print(f"[Profiler] ERROR profiling {fpath.name}: {e}")
        return reports

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _md5(path: Path | None) -> str:
        if path is None or not path.exists():
            return ""
        h = hashlib.md5()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()

    # ── Cross-dataset summary ─────────────────────────────────────────────────

    def build_dataset_catalogue(self, reports: list[ProfileReport]) -> dict:
        """
        Build a cross-dataset catalogue from a list of reports.

        Useful for comparing multiple datasets before deciding which to
        use for training.
        """
        return {
            "generated_at":   datetime.now(timezone.utc).isoformat(),
            "total_datasets": len(reports),
            "ready":          [r.dataset_key for r in reports if r.ml_readiness_verdict == "ready"],
            "needs_cleaning": [r.dataset_key for r in reports if r.ml_readiness_verdict == "needs_cleaning"],
            "not_recommended":[r.dataset_key for r in reports if r.ml_readiness_verdict == "not_recommended"],
            "datasets": [
                {
                    "key":             r.dataset_key,
                    "filename":        r.filename,
                    "rows":            r.row_count,
                    "columns":         r.column_count,
                    "overall_null_pct": r.overall_null_pct,
                    "ml_readiness_score": r.ml_readiness_score,
                    "ml_readiness_verdict": r.ml_readiness_verdict,
                    "target_candidates": [t["name"] for t in r.target_candidates],
                    "phi_detected":    bool(r.phi_columns_detected),
                    "critical_issues": len(r.critical_issues),
                    "healthcare_issues": len(r.healthcare_issues),
                }
                for r in reports
            ],
        }
