"""
AarogyaNet AI Pipeline — Healthcare ML Evaluation Metrics.

Standard evaluation metrics for binary classifiers in a clinical context.
Emphasises sensitivity (recall) and specificity, plus positive / negative
predictive values, since the cost of a false negative (missed disease) in
rural healthcare is substantially higher than a false positive.

All functions are pure — they depend only on numpy and standard sklearn,
never on the AarogyaNet database or patient records.

Metrics produced:
  Binary classification:
    - AUC-ROC (discrimination)
    - Sensitivity (recall / true positive rate)
    - Specificity (true negative rate)
    - PPV (precision / positive predictive value)
    - NPV (negative predictive value)
    - Accuracy, F1, Matthews Correlation Coefficient
    - Balanced accuracy (important for class-imbalanced rural datasets)

  Calibration:
    - Brier score (probability calibration quality)
    - Expected calibration error (ECE) with configurable bins

  Clinical utility:
    - Net Benefit at a given risk threshold (decision curve analysis)
    - Number Needed to Screen (NNS) at a given sensitivity target
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any

import numpy as np


# ─────────────────────────────────────────────────────────────────────────────
# MetricsReport dataclass
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class MetricsReport:
    """
    Structured metrics container for a binary classifier evaluation.

    All float fields default to None (not computed) until the corresponding
    evaluation function is called.
    """

    # Discrimination
    auc_roc:           float | None = None
    auc_pr:            float | None = None   # Area under precision-recall curve

    # Threshold-dependent (at default threshold = 0.5 unless overridden)
    threshold:         float = 0.5
    sensitivity:       float | None = None   # True positive rate / recall
    specificity:       float | None = None   # True negative rate
    ppv:               float | None = None   # Positive predictive value / precision
    npv:               float | None = None   # Negative predictive value
    accuracy:          float | None = None
    f1_score:          float | None = None
    mcc:               float | None = None   # Matthews Correlation Coefficient
    balanced_accuracy: float | None = None

    # Confusion matrix
    tp:                int | None = None
    tn:                int | None = None
    fp:                int | None = None
    fn:                int | None = None

    # Calibration
    brier_score:       float | None = None
    ece:               float | None = None   # Expected Calibration Error

    # Clinical utility
    net_benefit:       float | None = None
    nns:               float | None = None   # Number Needed to Screen

    # Metadata
    n_samples:         int   = 0
    n_positives:       int   = 0
    prevalence:        float | None = None
    model_key:         str   = ""
    evaluated_at:      str   = ""
    notes:             list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Serialise to a plain dict (all values JSON-safe)."""
        return asdict(self)

    def summary(self) -> str:
        """Return a one-line human-readable summary."""
        parts = [f"n={self.n_samples}"]
        if self.auc_roc is not None:
            parts.append(f"AUC={self.auc_roc:.3f}")
        if self.sensitivity is not None:
            parts.append(f"Sens={self.sensitivity:.3f}")
        if self.specificity is not None:
            parts.append(f"Spec={self.specificity:.3f}")
        if self.f1_score is not None:
            parts.append(f"F1={self.f1_score:.3f}")
        if self.brier_score is not None:
            parts.append(f"Brier={self.brier_score:.3f}")
        return " | ".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# Binary classification metrics
# ─────────────────────────────────────────────────────────────────────────────

def compute_binary_metrics(
    y_true:     np.ndarray,
    y_pred_proba: np.ndarray,
    threshold:  float = 0.5,
    model_key:  str   = "",
) -> MetricsReport:
    """
    Compute a full suite of binary classification metrics.

    Args:
        y_true:       Ground truth labels (0/1), shape (n_samples,).
        y_pred_proba: Predicted probabilities for the positive class,
                      shape (n_samples,).
        threshold:    Decision threshold for binary predictions (default 0.5).
        model_key:    Optional model identifier for the report.

    Returns:
        MetricsReport with all fields populated.
    """
    from datetime import datetime, timezone
    from sklearn.metrics import (
        roc_auc_score, average_precision_score,
        f1_score, matthews_corrcoef, balanced_accuracy_score,
        confusion_matrix,
    )

    y_true  = np.asarray(y_true,       dtype=np.int32)
    y_proba = np.asarray(y_pred_proba, dtype=np.float64)
    y_pred  = (y_proba >= threshold).astype(np.int32)

    n         = len(y_true)
    n_pos     = int(y_true.sum())
    prevalence = round(n_pos / n, 4) if n > 0 else None

    report = MetricsReport(
        n_samples   = n,
        n_positives = n_pos,
        prevalence  = prevalence,
        threshold   = threshold,
        model_key   = model_key,
        evaluated_at = datetime.now(timezone.utc).isoformat(),
    )

    # AUC-ROC (requires both classes present)
    if len(np.unique(y_true)) == 2:
        try:
            report.auc_roc = round(float(roc_auc_score(y_true, y_proba)), 4)
            report.auc_pr  = round(float(average_precision_score(y_true, y_proba)), 4)
        except Exception as e:
            report.notes.append(f"AUC computation failed: {e}")

    # Confusion matrix
    try:
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        report.tp, report.tn, report.fp, report.fn = int(tp), int(tn), int(fp), int(fn)

        # Sensitivity / recall
        report.sensitivity = round(tp / (tp + fn), 4) if (tp + fn) > 0 else None

        # Specificity
        report.specificity = round(tn / (tn + fp), 4) if (tn + fp) > 0 else None

        # PPV
        report.ppv = round(tp / (tp + fp), 4) if (tp + fp) > 0 else None

        # NPV
        report.npv = round(tn / (tn + fn), 4) if (tn + fn) > 0 else None

        # Accuracy
        report.accuracy = round((tp + tn) / n, 4)
    except ValueError as e:
        report.notes.append(f"Confusion matrix failed: {e}")

    # F1, MCC, Balanced Accuracy
    try:
        report.f1_score          = round(float(f1_score(y_true, y_pred, zero_division=0)), 4)
        report.mcc               = round(float(matthews_corrcoef(y_true, y_pred)), 4)
        report.balanced_accuracy = round(float(balanced_accuracy_score(y_true, y_pred)), 4)
    except Exception as e:
        report.notes.append(f"F1/MCC computation failed: {e}")

    # Clinical note: flag if sensitivity is below 0.80 (rural healthcare standard)
    if report.sensitivity is not None and report.sensitivity < 0.80:
        report.notes.append(
            f"⚠ Sensitivity {report.sensitivity:.3f} is below the 0.80 rural-health target. "
            "Consider adjusting the decision threshold to reduce false negatives."
        )

    return report


# ─────────────────────────────────────────────────────────────────────────────
# Calibration metrics
# ─────────────────────────────────────────────────────────────────────────────

def compute_calibration(
    y_true:       np.ndarray,
    y_pred_proba: np.ndarray,
    n_bins:       int = 10,
) -> dict[str, Any]:
    """
    Compute calibration quality of predicted probabilities.

    Args:
        y_true:       Ground truth labels (0/1).
        y_pred_proba: Predicted probabilities for the positive class.
        n_bins:       Number of bins for ECE computation (default 10).

    Returns:
        Dict with brier_score, ece, and per-bin calibration data.
    """
    y_true  = np.asarray(y_true,       dtype=np.float64)
    y_proba = np.asarray(y_pred_proba, dtype=np.float64)
    n       = len(y_true)

    # Brier score
    brier = float(np.mean((y_proba - y_true) ** 2))

    # Expected calibration error (ECE)
    bins     = np.linspace(0.0, 1.0, n_bins + 1)
    bin_data = []
    ece      = 0.0

    for i in range(n_bins):
        lo, hi = bins[i], bins[i + 1]
        mask   = (y_proba >= lo) & (y_proba < hi)
        if i == n_bins - 1:
            mask = (y_proba >= lo) & (y_proba <= hi)

        n_bin = int(mask.sum())
        if n_bin == 0:
            bin_data.append({"bin": f"{lo:.1f}–{hi:.1f}", "count": 0,
                              "mean_predicted": None, "mean_actual": None})
            continue

        mean_pred   = float(y_proba[mask].mean())
        mean_actual = float(y_true[mask].mean())
        ece        += (n_bin / n) * abs(mean_pred - mean_actual)

        bin_data.append({
            "bin":            f"{lo:.1f}–{hi:.1f}",
            "count":          n_bin,
            "mean_predicted": round(mean_pred, 4),
            "mean_actual":    round(mean_actual, 4),
            "gap":            round(abs(mean_pred - mean_actual), 4),
        })

    return {
        "brier_score": round(brier, 4),
        "ece":         round(ece, 4),
        "n_bins":      n_bins,
        "calibration_bins": bin_data,
        "interpretation": (
            "Brier < 0.10 = excellent, 0.10–0.20 = good, > 0.25 = poor. "
            "ECE < 0.05 = well-calibrated for clinical deployment."
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Clinical utility metrics
# ─────────────────────────────────────────────────────────────────────────────

def compute_clinical_utility(
    y_true:           np.ndarray,
    y_pred_proba:     np.ndarray,
    risk_threshold:   float = 0.3,
    sensitivity_target: float = 0.90,
) -> dict[str, Any]:
    """
    Compute decision-curve analysis and number-needed-to-screen.

    Designed for rural healthcare contexts where:
      - Prevalence is often low
      - False negatives (missed disease) are more costly than false positives
      - Screening resources are constrained (NNS matters)

    Args:
        y_true:             Ground truth labels (0/1).
        y_pred_proba:       Predicted probabilities.
        risk_threshold:     Probability threshold for a positive screening decision.
        sensitivity_target: Target recall level for NNS calculation.

    Returns:
        Dict with net_benefit, nns, and sensitivity/specificity at each threshold.
    """
    y_true  = np.asarray(y_true,       dtype=np.float64)
    y_proba = np.asarray(y_pred_proba, dtype=np.float64)
    n       = len(y_true)
    prev    = float(y_true.mean())

    # Net benefit at the specified risk threshold
    # NB = (TP/n) - (FP/n) × (pt / (1 - pt))   where pt = risk_threshold
    y_pred = (y_proba >= risk_threshold).astype(np.float64)
    tp     = float((y_pred * y_true).sum())
    fp     = float((y_pred * (1 - y_true)).sum())
    net_benefit = (tp / n) - (fp / n) * (risk_threshold / (1 - risk_threshold)) \
                  if risk_threshold < 1.0 else float("nan")

    # Number Needed to Screen at a sensitivity target
    # Find the threshold that achieves sensitivity_target; NNS = 1 / PPV at that threshold
    nns = None
    thresholds = np.linspace(0, 1, 200)
    for th in thresholds:
        yp   = (y_proba >= th).astype(np.float64)
        tp_t = float((yp * y_true).sum())
        fn_t = float(((1 - yp) * y_true).sum())
        fp_t = float((yp * (1 - y_true)).sum())
        sens = tp_t / (tp_t + fn_t) if (tp_t + fn_t) > 0 else 0.0
        if sens >= sensitivity_target:
            ppv  = tp_t / (tp_t + fp_t) if (tp_t + fp_t) > 0 else None
            nns  = round(1 / ppv, 1) if ppv and ppv > 0 else None
            break

    # Threshold scan (for decision curve)
    scan_points = []
    for th in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]:
        yp   = (y_proba >= th).astype(np.float64)
        tp_t = float((yp * y_true).sum())
        fp_t = float((yp * (1 - y_true)).sum())
        nb   = (tp_t / n) - (fp_t / n) * (th / (1 - th)) if th < 1.0 else float("nan")
        scan_points.append({"threshold": th, "net_benefit": round(nb, 4)})

    return {
        "risk_threshold":     risk_threshold,
        "net_benefit":        round(net_benefit, 4) if not np.isnan(net_benefit) else None,
        "sensitivity_target": sensitivity_target,
        "nns_at_target":      nns,
        "prevalence":         round(prev, 4),
        "threshold_scan":     scan_points,
        "interpretation": (
            f"Net benefit > 0 at threshold {risk_threshold} means screening "
            f"is beneficial vs. treating nobody. "
            f"NNS = number of patients screened per true case identified at "
            f"sensitivity ≥ {sensitivity_target:.0%}."
        ),
    }
