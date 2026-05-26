"""
AarogyaNet — Pima Indians Diabetes Dataset Preprocessor.

Handles:
  - Zeros-as-missing replacement for 5 clinically impossible columns
  - Median imputation via sklearn SimpleImputer
  - Feature normalization via sklearn StandardScaler
  - 70 / 15 / 15 train / validation / test split

The fitted sklearn Pipeline is saved alongside the model artifact so
that EXACTLY the same transformation is applied at inference time.

Pima feature name mapping (CSV → internal lowercase canonical names):
    Pregnancies            → pregnancies
    Glucose                → glucose
    BloodPressure          → blood_pressure
    SkinThickness          → skin_thickness
    Insulin                → insulin
    BMI                    → bmi
    DiabetesPedigreeFunction → diabetes_pedigree
    Age                    → age
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

PIMA_CSV_COLUMNS: list[str] = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

PIMA_TARGET_COLUMN: str = "Outcome"

PIMA_FEATURE_NAMES: list[str] = [
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
    "diabetes_pedigree",
    "age",
]

PIMA_COLUMN_MAP: dict[str, str] = {
    "Pregnancies":             "pregnancies",
    "Glucose":                 "glucose",
    "BloodPressure":           "blood_pressure",
    "SkinThickness":           "skin_thickness",
    "Insulin":                 "insulin",
    "BMI":                     "bmi",
    "DiabetesPedigreeFunction": "diabetes_pedigree",
    "Age":                     "age",
}

ZERO_AS_MISSING: list[str] = [
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
]


# ─────────────────────────────────────────────────────────────────────────────
# PimaPreprocessor
# ─────────────────────────────────────────────────────────────────────────────

class PimaPreprocessor:
    """
    Full preprocessing pipeline for the Pima Indians Diabetes Dataset.

    At training time:
        pp = PimaPreprocessor()
        X_train, X_val, X_test, y_train, y_val, y_test = pp.fit_transform(df)
        pp.save("path/to/preprocessor.joblib")

    At inference time:
        pp = PimaPreprocessor.load("path/to/preprocessor.joblib")
        X = pp.transform_single(feature_dict)  # → numpy array (1, 8)
    """

    def __init__(self):
        self._pipeline = None      # sklearn Pipeline: Imputer → Scaler
        self._is_fitted = False
        self._train_medians: dict[str, float] = {}

    # ── Training-time ─────────────────────────────────────────────────────────

    def load_raw_csv(self, path: str | Path) -> pd.DataFrame:
        """Load Pima CSV and return a clean DataFrame with canonical column names."""
        df = pd.read_csv(path)

        missing = [c for c in PIMA_CSV_COLUMNS + [PIMA_TARGET_COLUMN] if c not in df.columns]
        if missing:
            raise ValueError(
                f"[PimaPreprocessor] Pima CSV missing expected columns: {missing}. "
                f"Found: {list(df.columns)}"
            )

        df = df[PIMA_CSV_COLUMNS + [PIMA_TARGET_COLUMN]].copy()
        df = df.rename(columns=PIMA_COLUMN_MAP)
        return df

    def replace_zeros_as_nan(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Replace 0 with NaN in columns where zero is clinically impossible.
        These zeros encode missing data in the original Pima dataset.
        """
        df = df.copy()
        for col in ZERO_AS_MISSING:
            if col in df.columns:
                zero_count = (df[col] == 0).sum()
                if zero_count > 0:
                    df.loc[df[col] == 0, col] = np.nan
        return df

    def fit_transform(
        self,
        df: pd.DataFrame,
        val_size: float = 0.15,
        test_size: float = 0.15,
        random_state: int = 42,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray,
               np.ndarray, np.ndarray, np.ndarray]:
        """
        Full fit-and-transform for training.

        Returns:
            (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        from sklearn.impute import SimpleImputer
        from sklearn.model_selection import train_test_split
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import StandardScaler

        df = self.replace_zeros_as_nan(df)

        X = df[PIMA_FEATURE_NAMES].astype(np.float64)
        y = df[PIMA_TARGET_COLUMN].astype(np.float64).values

        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state,
            stratify=y,
        )
        relative_val = val_size / (1.0 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=relative_val,
            random_state=random_state,
            stratify=y_temp,
        )

        self._pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler",  StandardScaler()),
        ])
        X_train_t = self._pipeline.fit_transform(X_train)
        X_val_t   = self._pipeline.transform(X_val)
        X_test_t  = self._pipeline.transform(X_test)

        medians = self._pipeline.named_steps["imputer"].statistics_
        self._train_medians = dict(zip(PIMA_FEATURE_NAMES, medians.tolist()))
        self._is_fitted = True

        print(
            f"[PimaPreprocessor] Split — Train: {len(X_train_t):,} | "
            f"Val: {len(X_val_t):,} | Test: {len(X_test_t):,}"
        )
        return X_train_t, X_val_t, X_test_t, y_train, y_val, y_test

    # ── Inference-time ────────────────────────────────────────────────────────

    def transform_single(self, features: dict[str, float]) -> np.ndarray:
        """
        Transform a single feature dict for inference.

        Handles:
          - Missing keys → 0.0 sentinel → NaN → median imputation
          - Zeros in zero-as-missing columns → NaN → median imputation
          - StandardScaler normalization

        Args:
            features: Dict with keys from PIMA_FEATURE_NAMES.
                      Missing keys treated as 0 (not measured).

        Returns:
            numpy array of shape (1, 8), dtype float64.
        """
        if not self._is_fitted or self._pipeline is None:
            raise RuntimeError(
                "[PimaPreprocessor] Pipeline not fitted. "
                "Call fit_transform() or load() first."
            )

        row = {}
        for name in PIMA_FEATURE_NAMES:
            val = features.get(name, 0.0)
            try:
                val = float(val)
            except (TypeError, ValueError):
                val = 0.0
            row[name] = val

        row_df = pd.DataFrame([row], columns=PIMA_FEATURE_NAMES)

        for col in ZERO_AS_MISSING:
            row_df.loc[row_df[col] == 0.0, col] = np.nan

        transformed = self._pipeline.transform(row_df.astype(np.float64))
        return transformed

    def get_data_completeness(self, features: dict[str, float]) -> dict:
        """
        Return which features are known vs imputed for transparency.

        Used to include a data_completeness field in inference output.
        """
        known, imputed = [], []
        for name in PIMA_FEATURE_NAMES:
            val = features.get(name, 0.0)
            try:
                fv = float(val)
            except (TypeError, ValueError):
                fv = 0.0
            is_zero_missing = name in ZERO_AS_MISSING and fv == 0.0
            is_missing      = fv == 0.0 and name not in ZERO_AS_MISSING
            if not is_zero_missing and not is_missing:
                known.append(name)
            else:
                imputed.append(name)
        pct = round(len(known) / len(PIMA_FEATURE_NAMES) * 100)
        return {
            "known_features":   known,
            "imputed_features": imputed,
            "completeness_pct": pct,
            "note": (
                f"{len(known)}/{len(PIMA_FEATURE_NAMES)} features provided. "
                f"Missing features imputed with training-set medians."
            ) if imputed else "All features provided.",
        }

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self, path: str | Path) -> Path:
        import joblib
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            "pipeline":       self._pipeline,
            "train_medians":  self._train_medians,
            "feature_names":  PIMA_FEATURE_NAMES,
            "zero_as_missing": ZERO_AS_MISSING,
        }, path)
        print(f"[PimaPreprocessor] Saved: {path}")
        return path

    @classmethod
    def load(cls, path: str | Path) -> "PimaPreprocessor":
        import joblib
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"[PimaPreprocessor] File not found: {path}")
        payload    = joblib.load(path)
        pp         = cls()
        pp._pipeline      = payload["pipeline"]
        pp._train_medians = payload.get("train_medians", {})
        pp._is_fitted     = True
        print(f"[PimaPreprocessor] Loaded: {path}")
        return pp

    @property
    def train_medians(self) -> dict[str, float]:
        return dict(self._train_medians)
