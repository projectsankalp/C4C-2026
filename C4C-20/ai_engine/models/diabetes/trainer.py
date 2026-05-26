"""
AarogyaNet — Diabetes Risk Model Trainer.

Trains an XGBoost classifier on the Pima Indians Diabetes Dataset,
computes full evaluation metrics, runs SHAP global importance, and
saves all artifacts.

Saved artifacts:
    ai_engine/models/artifacts/diabetes_risk_v1.joblib         — XGBoost model
    ai_engine/models/artifacts/diabetes_preprocessor_v1.joblib — sklearn Pipeline
    ai_engine/models/artifacts/diabetes_eval_report.json       — metrics + SHAP

Usage:
    python -m ai_engine.models.diabetes
    # or:
    from ai_engine.models.diabetes.trainer import DiabetesTrainer
    trainer = DiabetesTrainer()
    results = trainer.train_and_save()
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from ai_engine.models.diabetes.model import (
    DiabetesRiskModel,
    MODEL_ARTIFACT,
    PREPROCESSOR_ARTIFACT,
    EVAL_REPORT_PATH,
)
from ai_engine.models.diabetes.preprocessor import PimaPreprocessor, PIMA_FEATURE_NAMES
from ai_engine.utils.io import save_json, ensure_dir


RAW_DATASET_PATH = Path("ai_engine/datasets/raw/Pima_Indians_Diabetes_Database.csv")


class DiabetesTrainer:
    """
    Full training pipeline for the AarogyaNet diabetes risk model.

    Steps:
      1. Load and preprocess Pima dataset (zeros → NaN → impute → scale)
      2. Train XGBoost with class-imbalance weighting
      3. Evaluate: AUC-ROC, sensitivity, specificity, F1, confusion matrix, calibration
      4. SHAP global feature importance
      5. Save model, preprocessor, and evaluation report
    """

    def __init__(self, dataset_path: str | Path | None = None):
        self.dataset_path = Path(dataset_path or RAW_DATASET_PATH)
        self._preprocessor = PimaPreprocessor()
        self._model: DiabetesRiskModel | None = None

    def train_and_save(self) -> dict:
        """
        Run the full training pipeline.

        Returns:
            Evaluation report dict (also saved to disk).
        """
        print("\n" + "═" * 60)
        print("  AarogyaNet — Diabetes Risk Model Training")
        print("═" * 60)

        ensure_dir(MODEL_ARTIFACT.parent)

        print(f"\n[Trainer] Loading dataset: {self.dataset_path}")
        df = self._preprocessor.load_raw_csv(self.dataset_path)
        print(f"[Trainer] Dataset: {len(df):,} rows × {len(df.columns)} columns")
        print(f"[Trainer] Class distribution — 0: {(df['Outcome']==0).sum()} | 1: {(df['Outcome']==1).sum()}")

        print("\n[Trainer] Step 1: Preprocessing (zeros → NaN → impute → scale)")
        X_train, X_val, X_test, y_train, y_val, y_test = self._preprocessor.fit_transform(df)

        print("\n[Trainer] Step 2: Training XGBoost classifier")
        estimator = self._train_xgboost(X_train, y_train, X_val, y_val)

        print("\n[Trainer] Step 3: Evaluation")
        metrics = self._evaluate(estimator, X_test, y_test, X_val, y_val)

        print("\n[Trainer] Step 4: SHAP global feature importance")
        global_importance = self._compute_shap_importance(estimator, X_train)

        print("\n[Trainer] Step 5: Saving artifacts")
        report = self._save_all(estimator, metrics, global_importance, df, y_train, y_test)

        print("\n" + "═" * 60)
        print("  Training complete!")
        print(f"  AUC-ROC    : {metrics['auc_roc']:.4f}")
        print(f"  F1 Score   : {metrics['f1']:.4f}")
        print(f"  Sensitivity: {metrics['sensitivity']:.4f}  (Recall — true positives)")
        print(f"  Specificity: {metrics['specificity']:.4f}  (True negatives)")
        print(f"  Brier Score: {metrics['brier_score']:.4f}  (calibration quality)")
        print("═" * 60 + "\n")

        return report

    # ── Step 2: XGBoost training ──────────────────────────────────────────────

    def _train_xgboost(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val:   np.ndarray,
        y_val:   np.ndarray,
    ) -> Any:
        import xgboost as xgb

        n_neg = (y_train == 0).sum()
        n_pos = (y_train == 1).sum()
        scale_pos_weight = n_neg / n_pos if n_pos > 0 else 1.0
        print(f"[Trainer] Class weight ratio (neg/pos): {scale_pos_weight:.2f}")

        estimator = xgb.XGBClassifier(
            n_estimators=400,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos_weight,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            use_label_encoder=False,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
            early_stopping_rounds=30,
        )

        estimator.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )
        n_trees = estimator.best_iteration if hasattr(estimator, "best_iteration") and estimator.best_iteration else estimator.n_estimators
        print(f"[Trainer] XGBoost trained — best iteration: {n_trees}")
        return estimator

    # ── Step 3: Evaluation ────────────────────────────────────────────────────

    def _evaluate(
        self,
        estimator: Any,
        X_test:    np.ndarray,
        y_test:    np.ndarray,
        X_val:     np.ndarray,
        y_val:     np.ndarray,
    ) -> dict:
        from sklearn.metrics import (
            roc_auc_score, f1_score, confusion_matrix,
            brier_score_loss, precision_score, recall_score,
        )

        y_proba_test = estimator.predict_proba(X_test)[:, 1]
        y_pred_test  = (y_proba_test >= 0.5).astype(int)

        auc = roc_auc_score(y_test, y_proba_test)
        cm  = confusion_matrix(y_test, y_pred_test).tolist()

        tn, fp, fn, tp = confusion_matrix(y_test, y_pred_test).ravel()
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

        f1        = f1_score(y_test, y_pred_test)
        precision = precision_score(y_test, y_pred_test, zero_division=0)
        brier     = brier_score_loss(y_test, y_proba_test)

        ece = self._expected_calibration_error(y_test, y_proba_test)

        print(f"  AUC-ROC:     {auc:.4f}")
        print(f"  F1:          {f1:.4f}")
        print(f"  Sensitivity: {sensitivity:.4f}")
        print(f"  Specificity: {specificity:.4f}")
        print(f"  Precision:   {precision:.4f}")
        print(f"  Brier Score: {brier:.4f}")
        print(f"  ECE:         {ece:.4f}")

        return {
            "auc_roc":          round(float(auc), 4),
            "f1":               round(float(f1), 4),
            "sensitivity":      round(float(sensitivity), 4),
            "specificity":      round(float(specificity), 4),
            "precision":        round(float(precision), 4),
            "brier_score":      round(float(brier), 4),
            "expected_calibration_error": round(float(ece), 4),
            "confusion_matrix": cm,
            "n_test":           int(len(y_test)),
            "threshold_used":   0.5,
        }

    def _expected_calibration_error(
        self,
        y_true: np.ndarray,
        y_proba: np.ndarray,
        n_bins: int = 10,
    ) -> float:
        """Compute Expected Calibration Error (ECE)."""
        bins = np.linspace(0, 1, n_bins + 1)
        ece  = 0.0
        n    = len(y_true)
        for i in range(n_bins):
            lo, hi = bins[i], bins[i + 1]
            mask   = (y_proba >= lo) & (y_proba < hi)
            if mask.sum() == 0:
                continue
            acc  = y_true[mask].mean()
            conf = y_proba[mask].mean()
            ece += (mask.sum() / n) * abs(acc - conf)
        return float(ece)

    # ── Step 4: SHAP importance ───────────────────────────────────────────────

    def _compute_shap_importance(
        self,
        estimator: Any,
        X_train:   np.ndarray,
    ) -> dict[str, float]:
        from ai_engine.models.diabetes.explainer import DiabetesExplainer
        explainer   = DiabetesExplainer(estimator, PIMA_FEATURE_NAMES)
        importance  = explainer.global_importance(X_train)
        print("  Top features by SHAP importance:")
        for fname, val in list(importance.items())[:5]:
            bar = "█" * int(val / max(importance.values()) * 20)
            print(f"    {fname:<22} {bar} {val:.4f}")
        return importance

    # ── Step 5: Save all artifacts ────────────────────────────────────────────

    def _save_all(
        self,
        estimator:          Any,
        metrics:            dict,
        global_importance:  dict,
        df,
        y_train:            np.ndarray,
        y_test:             np.ndarray,
    ) -> dict:
        self._preprocessor.save(PREPROCESSOR_ARTIFACT)

        model = DiabetesRiskModel()
        model._estimator        = estimator
        model._preprocessor     = self._preprocessor
        model._eval_metrics     = metrics
        model._global_importance = global_importance
        model._is_loaded        = True
        model.save_to_disk(MODEL_ARTIFACT)

        from ai_engine.models.registry import ModelRegistry
        try:
            ModelRegistry.register("diabetes_risk", DiabetesRiskModel)
            ModelRegistry._definitions["diabetes_risk"].update({
                "status":  "trained",
                "version": DiabetesRiskModel.VERSION,
                "artifact": str(MODEL_ARTIFACT),
            })
        except Exception as e:
            print(f"[Trainer] Registry update non-critical: {e}")

        report = {
            "model_type":       "diabetes_risk",
            "version":          DiabetesRiskModel.VERSION,
            "algorithm":        "XGBoost (Gradient Boosted Trees)",
            "training_dataset": "Pima Indians Diabetes Database",
            "trained_at":       datetime.now(timezone.utc).isoformat(),
            "feature_names":    PIMA_FEATURE_NAMES,
            "target_column":    "Outcome",
            "n_total":          len(df),
            "n_train":          int(len(y_train)),
            "n_test":           int(len(y_test)),
            "class_distribution": {
                "0_non_diabetic": int((df["Outcome"] == 0).sum()),
                "1_diabetic":     int((df["Outcome"] == 1).sum()),
            },
            "metrics":              metrics,
            "shap_global_importance": global_importance,
            "artifact_paths": {
                "model":        str(MODEL_ARTIFACT),
                "preprocessor": str(PREPROCESSOR_ARTIFACT),
                "eval_report":  str(EVAL_REPORT_PATH),
            },
            "clinical_note": (
                "This model is a clinical decision-support augmentation layer. "
                "It does not produce medical diagnoses. All outputs must be "
                "interpreted by qualified healthcare professionals."
            ),
        }
        save_json(report, EVAL_REPORT_PATH)
        print(f"[Trainer] Evaluation report saved: {EVAL_REPORT_PATH}")
        return report
