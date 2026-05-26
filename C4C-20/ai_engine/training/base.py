"""
AarogyaNet AI Pipeline — Training Pipeline Skeleton.

Defines the base training pipeline that will be used once labelled datasets
are loaded and validated. Currently a skeleton — no training is performed.

PHI Safety:
  strip_phi() is called unconditionally before any feature matrix is built.
  The training pipeline will never see patient names, phone numbers, exact
  GPS coordinates, or Aadhaar numbers.

Clinical / ML Separation:
  The training pipeline works exclusively with the feature representations
  produced by FeaturePipeline — it never accesses the GCPE engine, the
  blockchain layer, or the deterministic risk engine directly.

Future usage (once datasets are ready):
    tp = TrainingPipeline(dataset_key="icmr_diabetes")
    df = tp.load_dataset("ai_engine/datasets/raw/icmr_2024.csv")
    X, y = tp.prepare_features(df)
    # → then call tp.train(X, y) once model training is activated
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from ai_engine.datasets.ingestion import DatasetIngestion
from ai_engine.datasets.metadata.schemas import DATASET_REGISTRY
from ai_engine.pipelines.feature_pipeline import FeaturePipeline, FEATURE_NAMES
from ai_engine.utils.io import save_json, ensure_dir
from ai_engine.utils.privacy import strip_phi, assert_phi_free


# ─────────────────────────────────────────────────────────────────────────────
# TrainingPipeline
# ─────────────────────────────────────────────────────────────────────────────

class TrainingPipeline:
    """
    Base training pipeline skeleton for AarogyaNet ML models.

    All subclasses must implement:
      - train(X, y)    — fit a model
      - evaluate(X, y) — compute metrics

    PHI is stripped unconditionally before any feature matrix is created.
    No PHI ever enters the training loop.
    """

    def __init__(self, dataset_key: str, target_column: str | None = None):
        """
        Args:
            dataset_key:    Registered dataset key (e.g. "icmr_diabetes").
            target_column:  Override target column (uses schema default if None).
        """
        if dataset_key not in DATASET_REGISTRY:
            raise ValueError(
                f"Unknown dataset key '{dataset_key}'. "
                f"Valid keys: {list(DATASET_REGISTRY.keys())}"
            )
        self.dataset_key    = dataset_key
        self.schema         = DATASET_REGISTRY[dataset_key]
        self.target_column  = target_column or self.schema.get("target_column")
        self._ingestion     = DatasetIngestion(dataset_key)
        self._feature_pipeline = FeaturePipeline()
        self._df: pd.DataFrame | None = None

    # ── Dataset loading ───────────────────────────────────────────────────────

    def load_dataset(self, path: str | Path) -> pd.DataFrame:
        """
        Load and normalise a raw dataset file (CSV or XLSX).

        Steps:
          1. Load file
          2. Normalise column names using schema column_map
          3. Strip all PHI columns
          4. Store internally

        Args:
            path: Path to raw dataset file.

        Returns:
            PHI-stripped, normalised DataFrame.
        """
        path = Path(path)
        if path.suffix.lower() in (".xlsx", ".xls"):
            df = self._ingestion.load_xlsx(path)
        else:
            df = self._ingestion.load_csv(path)

        # Normalise column names
        df = self._ingestion.normalize_columns(df)

        # PHI must be stripped before anything else
        df = strip_phi(df)
        print(
            f"[TrainingPipeline] Dataset loaded and PHI-stripped: "
            f"{len(df):,} rows × {len(df.columns)} columns"
        )

        self._df = df
        return df

    # ── Feature preparation ───────────────────────────────────────────────────

    def prepare_features(
        self,
        df:                pd.DataFrame | None = None,
        feature_columns:   list[str] | None = None,
        target_column:     str | None = None,
        test_size:         float = 0.2,
        random_state:      int = 42,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Split the dataset into train/test feature matrices and target arrays.

        Steps:
          1. Select feature columns (from schema or explicit list)
          2. Select target column
          3. Impute missing values (median for continuous, mode for categorical)
          4. One-hot encode categorical features
          5. Confirm no PHI in the final feature matrix
          6. Train/test split

        Args:
            df:              DataFrame (uses internally loaded df if None).
            feature_columns: Override feature column list.
            target_column:   Override target column.
            test_size:       Fraction to hold out for testing (default 0.2).
            random_state:    Random seed for reproducibility.

        Returns:
            (X_train, X_test, y_train, y_test) as numpy arrays.
        """
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder

        df = df if df is not None else self._df
        if df is None:
            raise RuntimeError("No dataset loaded. Call load_dataset() first.")

        feat_cols = feature_columns or self.schema.get("feature_columns", [])
        tgt_col   = target_column or self.target_column

        if not tgt_col:
            raise ValueError(
                "No target column specified. "
                "Pass target_column= or set it in the schema."
            )

        # Keep only available columns
        available_feats = [c for c in feat_cols if c in df.columns]
        if not available_feats:
            raise ValueError(
                f"None of the feature columns {feat_cols} are present in the "
                f"dataset. Available columns: {list(df.columns)}"
            )
        if tgt_col not in df.columns:
            raise ValueError(
                f"Target column '{tgt_col}' not found. "
                f"Available columns: {list(df.columns)}"
            )

        X_df = df[available_feats].copy()
        y    = df[tgt_col].copy()

        # Impute missing values
        cat_cols  = [c for c in self.schema.get("categorical_cols", []) if c in X_df.columns]
        cont_cols = [c for c in available_feats if c not in cat_cols]

        for col in cont_cols:
            X_df[col] = pd.to_numeric(X_df[col], errors="coerce")
            X_df[col].fillna(X_df[col].median(), inplace=True)

        for col in cat_cols:
            X_df[col].fillna(X_df[col].mode()[0] if len(X_df[col].mode()) else "unknown", inplace=True)

        # One-hot encode categoricals
        if cat_cols:
            X_df = pd.get_dummies(X_df, columns=cat_cols, drop_first=True)

        # Encode target
        if y.dtype == object or str(y.dtype) == "category":
            le = LabelEncoder()
            y  = le.fit_transform(y.astype(str))
        else:
            y = y.fillna(0).astype(np.float64).values

        X = X_df.astype(np.float64).values

        print(
            f"[TrainingPipeline] Feature matrix: {X.shape[0]:,} samples × "
            f"{X.shape[1]} features | Target: '{tgt_col}'"
        )

        # Final PHI guard on column names
        for col in X_df.columns:
            from ai_engine.utils.privacy import _is_phi_column
            if _is_phi_column(col):
                raise ValueError(
                    f"PHI column '{col}' found in feature matrix after strip_phi(). "
                    "This should never happen — check DatasetIngestion pipeline."
                )

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        print(
            f"[TrainingPipeline] Train: {len(X_train):,} | Test: {len(X_test):,}"
        )
        return X_train, X_test, y_train, y_test

    # ── Training stub ─────────────────────────────────────────────────────────

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        **kwargs,
    ) -> Any:
        """
        Fit the model to the training data.

        NOT YET IMPLEMENTED — subclasses must override this method.

        When implemented, this must:
          1. Confirm X_train contains no PHI (column names already stripped)
          2. Fit a joblib-serialisable sklearn estimator
          3. Return the fitted estimator

        Args:
            X_train: Feature matrix (n_samples × n_features).
            y_train: Target array (n_samples,).
            **kwargs: Model hyperparameters.

        Raises:
            NotImplementedError: Always, in the foundation phase.
        """
        raise NotImplementedError(
            "Training not yet implemented. "
            "Override train() in a subclass after selecting a model architecture. "
            "Foundation phase: prepare feature engineering, datasets, and schemas first."
        )

    # ── Evaluation stub ───────────────────────────────────────────────────────

    def evaluate(
        self,
        X_test:  np.ndarray,
        y_test:  np.ndarray,
        estimator: Any = None,
    ) -> dict:
        """
        Evaluate a trained model on the test split.

        NOT YET IMPLEMENTED — subclasses must override this method.

        When implemented, should call compute_binary_metrics() or
        compute_calibration() from ai_engine/evaluation/metrics.py.

        Raises:
            NotImplementedError: Always, in the foundation phase.
        """
        raise NotImplementedError(
            "Evaluation not yet implemented. "
            "Override evaluate() in a subclass. "
            "Use ai_engine.evaluation.metrics.compute_binary_metrics() as the base."
        )

    # ── Pipeline manifest ─────────────────────────────────────────────────────

    def get_pipeline_manifest(self) -> dict:
        """
        Return a manifest describing this training pipeline's current state.

        Useful for experiment tracking and reproducibility documentation.
        """
        return {
            "dataset_key":       self.dataset_key,
            "source_name":       self.schema.get("source_name"),
            "target_column":     self.target_column,
            "feature_columns":   self.schema.get("feature_columns", []),
            "categorical_cols":  self.schema.get("categorical_cols", []),
            "continuous_cols":   self.schema.get("continuous_cols", []),
            "phi_columns":       self.schema.get("phi_columns", []),
            "dataset_loaded":    self._df is not None,
            "row_count":         len(self._df) if self._df is not None else 0,
            "status":            "foundation_phase",
            "training_ready":    False,
            "manifest_at":       datetime.now(timezone.utc).isoformat(),
        }
