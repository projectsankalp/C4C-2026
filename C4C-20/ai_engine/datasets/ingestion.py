"""
AarogyaNet AI Pipeline — Dataset Ingestion Utilities.

Provides a unified DatasetIngestion class for:
  - Loading CSV / XLSX datasets safely
  - Schema inspection and validation
  - Missing-value analysis
  - Column normalisation (rename + dtype coercion)
  - Metadata extraction and persistence

Supports all four target datasets:
  ICMR Diabetes | NFHS | NIKSHAY | HMIS

Privacy: PHI columns are flagged during ingestion but NOT automatically
stripped here — call strip_phi() from ai_engine.utils.privacy before
creating feature vectors.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from ai_engine.datasets.metadata.schemas import DATASET_REGISTRY
from ai_engine.utils.io import (
    safe_load_csv,
    safe_load_xlsx,
    save_json,
    ensure_dir,
    FEATURE_STORE_DIR,
)
from ai_engine.utils.privacy import PHI_COLUMNS


# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────

_BASE = Path(__file__).parent
RAW_DIR       = _BASE / "raw"
PROCESSED_DIR = _BASE / "processed"
METADATA_DIR  = _BASE / "metadata"


# ─────────────────────────────────────────────────────────────────────────────
# DatasetIngestion
# ─────────────────────────────────────────────────────────────────────────────

class DatasetIngestion:
    """
    Load, inspect, normalise, and catalogue a public health dataset.

    Usage:
        ing = DatasetIngestion("icmr_diabetes")
        df  = ing.load_csv("path/to/icmr_data.csv")
        meta = ing.inspect_schema(df)
        mv   = ing.analyze_missing_values(df)
        df   = ing.normalize_columns(df)
        ing.save_metadata(meta)
    """

    def __init__(self, dataset_key: str):
        """
        Args:
            dataset_key: One of 'icmr_diabetes', 'nfhs', 'nikshay', 'hmis'.
                         Pass None for ad-hoc ingestion without a registered schema.
        """
        if dataset_key is not None and dataset_key not in DATASET_REGISTRY:
            valid = list(DATASET_REGISTRY.keys())
            raise ValueError(
                f"Unknown dataset key '{dataset_key}'. Valid keys: {valid}"
            )
        self.dataset_key = dataset_key
        self.schema      = DATASET_REGISTRY.get(dataset_key) if dataset_key else {}
        self._df: pd.DataFrame | None = None

    # ── Loaders ──────────────────────────────────────────────────────────────

    def load_csv(self, path: str | Path, **kwargs) -> pd.DataFrame:
        """Load a CSV file and store internally. Returns the DataFrame."""
        self._df = safe_load_csv(path, **kwargs)
        return self._df

    def load_xlsx(self, path: str | Path, sheet_name: str | int = 0, **kwargs) -> pd.DataFrame:
        """Load an XLSX file and store internally. Returns the DataFrame."""
        self._df = safe_load_xlsx(path, sheet_name=sheet_name, **kwargs)
        return self._df

    # ── Schema inspection ────────────────────────────────────────────────────

    def inspect_schema(self, df: pd.DataFrame | None = None) -> dict[str, Any]:
        """
        Return a structured schema description of the DataFrame.

        Includes: column names, dtypes, null counts, unique value counts,
        and whether each column is likely PHI.

        Args:
            df: DataFrame to inspect (uses internally stored df if None).

        Returns:
            Schema dict with per-column metadata.
        """
        df = df if df is not None else self._df
        if df is None:
            raise RuntimeError("No DataFrame loaded. Call load_csv() or load_xlsx() first.")

        phi_set = {c.lower() for c in PHI_COLUMNS}

        columns_meta = {}
        for col in df.columns:
            col_lower = col.lower().strip()
            is_phi    = col_lower in phi_set or any(
                p in col_lower for p in ["name", "phone", "address", "aadhaar", "lat", "lon"]
            )
            columns_meta[col] = {
                "dtype":        str(df[col].dtype),
                "null_count":   int(df[col].isna().sum()),
                "null_pct":     round(df[col].isna().mean() * 100, 2),
                "unique_count": int(df[col].nunique()),
                "sample_values": [
                    str(v) for v in df[col].dropna().head(3).tolist()
                ],
                "is_phi_suspect": is_phi,
            }

        schema = {
            "dataset_key":    self.dataset_key,
            "source_name":    self.schema.get("source_name", "unknown"),
            "row_count":      len(df),
            "column_count":   len(df.columns),
            "columns":        columns_meta,
            "inspected_at":   datetime.now(timezone.utc).isoformat(),
        }

        # Check which expected columns are missing
        if self.schema.get("expected_columns"):
            expected = set(self.schema["expected_columns"])
            found    = set(df.columns)
            schema["missing_expected"] = sorted(expected - found)
            schema["extra_columns"]    = sorted(found - expected)

        return schema

    # ── Missing value analysis ────────────────────────────────────────────────

    def analyze_missing_values(self, df: pd.DataFrame | None = None) -> dict[str, Any]:
        """
        Produce a missing-value report for all columns.

        Returns:
            Dict with total stats and per-column analysis including
            recommended imputation strategy from the schema (if any).
        """
        df = df if df is not None else self._df
        if df is None:
            raise RuntimeError("No DataFrame loaded.")

        strategy_map = self.schema.get("missing_value_strategy", {})
        report       = {}

        for col in df.columns:
            null_count = int(df[col].isna().sum())
            null_pct   = round(df[col].isna().mean() * 100, 2)
            dtype      = str(df[col].dtype)

            # Recommend imputation strategy
            if col in strategy_map:
                recommended = strategy_map[col]
            elif null_pct == 0:
                recommended = "none"
            elif "float" in dtype or "int" in dtype:
                recommended = "median"
            elif "object" in dtype or "category" in dtype:
                recommended = "mode"
            else:
                recommended = "drop"

            report[col] = {
                "null_count":          null_count,
                "null_pct":            null_pct,
                "recommended_strategy": recommended,
            }

        total_missing = sum(v["null_count"] for v in report.values())
        total_cells   = len(df) * len(df.columns)

        return {
            "total_missing":    total_missing,
            "total_cells":      total_cells,
            "overall_null_pct": round(total_missing / total_cells * 100, 2) if total_cells else 0,
            "columns":          report,
        }

    # ── Column normalisation ──────────────────────────────────────────────────

    def normalize_columns(
        self,
        df: pd.DataFrame | None = None,
        column_map: dict[str, str] | None = None,
    ) -> pd.DataFrame:
        """
        Rename columns using the schema's column_map (or a custom map).

        Also applies basic dtype coercions:
          - Numeric columns in continuous_cols → float
          - Categorical columns in categorical_cols → Categorical

        Args:
            df:         DataFrame to normalise.
            column_map: Optional override map {raw_name: normalised_name}.

        Returns:
            New DataFrame with normalised column names and dtypes.
        """
        df  = (df if df is not None else self._df).copy()
        cmap = column_map or self.schema.get("column_map", {})

        if cmap:
            df.rename(columns=cmap, inplace=True, errors="ignore")

        # Coerce continuous columns
        for col in self.schema.get("continuous_cols", []):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # Coerce categorical columns
        for col in self.schema.get("categorical_cols", []):
            if col in df.columns:
                df[col] = df[col].astype("category")

        return df

    # ── Metadata extraction ───────────────────────────────────────────────────

    def extract_metadata(
        self,
        df: pd.DataFrame | None = None,
        extra: dict | None = None,
    ) -> dict[str, Any]:
        """
        Extract a compact metadata record for the dataset.

        Includes schema info, row/column counts, null stats summary,
        and optional caller-supplied extra fields.

        Args:
            df:    DataFrame (uses internally stored df if None).
            extra: Additional fields to merge into the metadata dict.

        Returns:
            Metadata dict ready for JSON serialisation.
        """
        df = df if df is not None else self._df
        if df is None:
            raise RuntimeError("No DataFrame loaded.")

        mv = self.analyze_missing_values(df)

        meta = {
            "dataset_key":      self.dataset_key,
            "source_name":      self.schema.get("source_name", "unknown"),
            "description":      self.schema.get("description", ""),
            "version":          self.schema.get("version", "unknown"),
            "row_count":        len(df),
            "column_count":     len(df.columns),
            "columns":          list(df.columns),
            "target_column":    self.schema.get("target_column"),
            "feature_count":    len(self.schema.get("feature_columns", [])),
            "overall_null_pct": mv["overall_null_pct"],
            "extracted_at":     datetime.now(timezone.utc).isoformat(),
            "phi_columns_in_schema": self.schema.get("phi_columns", []),
        }

        if extra:
            meta.update(extra)

        return meta

    # ── Persistence ──────────────────────────────────────────────────────────

    def save_metadata(self, metadata: dict, filename: str | None = None) -> Path:
        """
        Write metadata to ai_engine/datasets/metadata/<dataset_key>.json.

        Args:
            metadata: Dict returned by extract_metadata().
            filename: Optional custom filename (without directory).

        Returns:
            Path of the written file.
        """
        name = filename or f"{self.dataset_key or 'dataset'}_metadata.json"
        dest = METADATA_DIR / name
        ensure_dir(METADATA_DIR)
        return save_json(metadata, dest)

    def save_processed(self, df: pd.DataFrame, filename: str | None = None) -> Path:
        """
        Save a processed (PHI-stripped) DataFrame as CSV in the processed/ directory.

        Args:
            df:       DataFrame to save (must have PHI removed before calling).
            filename: Optional filename override.

        Returns:
            Path of the written file.
        """
        ensure_dir(PROCESSED_DIR)
        name = filename or f"{self.dataset_key or 'dataset'}_processed.csv"
        dest = PROCESSED_DIR / name
        df.to_csv(dest, index=False)
        print(f"[DataIngestion] Saved processed dataset: {dest}")
        return dest

    # ── Convenience class method ──────────────────────────────────────────────

    @classmethod
    def from_csv(cls, path: str | Path, dataset_key: str | None = None) -> "DatasetIngestion":
        """
        Convenience factory: create an ingestion object and load a CSV in one call.

        Returns:
            DatasetIngestion instance with the DataFrame already loaded.
        """
        ing = cls(dataset_key)
        ing.load_csv(path)
        return ing
