"""
AarogyaNet AI Pipeline — I/O utilities.

Thin, safe wrappers around pandas file I/O and JSON serialisation.
All path handling uses pathlib. Creates parent directories automatically.

No PHI is written by these helpers directly — callers are responsible
for calling strip_phi() before saving data.
"""

import json
import os
from pathlib import Path
from typing import Any

import pandas as pd


# ─────────────────────────────────────────────────────────────────────────────
# Directory helpers
# ─────────────────────────────────────────────────────────────────────────────

def ensure_dir(path: str | Path) -> Path:
    """Create directory (and parents) if it doesn't exist. Returns Path."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


# ─────────────────────────────────────────────────────────────────────────────
# Dataset loading
# ─────────────────────────────────────────────────────────────────────────────

def safe_load_csv(
    path: str | Path,
    encoding: str = "utf-8",
    low_memory: bool = False,
    **kwargs,
) -> pd.DataFrame:
    """
    Load a CSV file into a DataFrame with safe defaults.

    Args:
        path:        File path (str or Path).
        encoding:    Character encoding (default utf-8; falls back to latin-1).
        low_memory:  Passed to pd.read_csv (default False for type stability).
        **kwargs:    Additional keyword args forwarded to pd.read_csv.

    Returns:
        DataFrame with stripped column names.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError:        If the file cannot be parsed as CSV.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    try:
        df = pd.read_csv(path, encoding=encoding, low_memory=low_memory, **kwargs)
    except UnicodeDecodeError:
        df = pd.read_csv(path, encoding="latin-1", low_memory=low_memory, **kwargs)

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    print(f"[DataIO] Loaded CSV: {path.name} — {len(df):,} rows × {len(df.columns)} columns")
    return df


def safe_load_xlsx(
    path: str | Path,
    sheet_name: str | int = 0,
    **kwargs,
) -> pd.DataFrame:
    """
    Load an Excel (XLSX/XLS) file into a DataFrame.

    Args:
        path:       File path.
        sheet_name: Sheet name or 0-indexed integer (default: first sheet).
        **kwargs:   Additional keyword args forwarded to pd.read_excel.

    Returns:
        DataFrame with stripped column names.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_excel(path, sheet_name=sheet_name, **kwargs)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    print(f"[DataIO] Loaded XLSX: {path.name} — {len(df):,} rows × {len(df.columns)} columns")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# JSON persistence (feature store, metadata, model configs)
# ─────────────────────────────────────────────────────────────────────────────

def save_json(data: Any, path: str | Path, indent: int = 2) -> Path:
    """
    Serialise data to a JSON file, creating parent directories as needed.

    Args:
        data:   Any JSON-serialisable object.
        path:   Destination file path.
        indent: JSON indentation level.

    Returns:
        Resolved Path of the written file.
    """
    path = Path(path)
    ensure_dir(path.parent)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, default=str)

    print(f"[DataIO] Saved JSON: {path}")
    return path


def load_json(path: str | Path) -> Any:
    """
    Load a JSON file. Returns None if the file does not exist.

    Args:
        path: Source file path.

    Returns:
        Parsed Python object, or None if file is missing.
    """
    path = Path(path)
    if not path.exists():
        return None

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────────────────────────────────────────
# Feature store I/O shortcuts
# ─────────────────────────────────────────────────────────────────────────────

FEATURE_STORE_DIR = Path(__file__).parent.parent / "datasets" / "feature_store"


def save_feature_vector(anon_patient_id: str, vector: dict, metadata: dict | None = None) -> Path:
    """
    Persist a patient feature vector to the feature store directory.

    The file is named by anonymised patient ID so no raw PK is exposed.
    Always call strip_phi() or anonymise_patient_id() before calling this.

    Args:
        anon_patient_id: Anonymised (hashed) patient identifier.
        vector:          Feature dict {feature_name: value}.
        metadata:        Optional metadata dict appended to the stored object.

    Returns:
        Path of the written file.
    """
    payload = {
        "anon_patient_id": anon_patient_id,
        "features":        vector,
        "metadata":        metadata or {},
    }
    dest = FEATURE_STORE_DIR / f"{anon_patient_id}.json"
    return save_json(payload, dest)


def load_feature_vector(anon_patient_id: str) -> dict | None:
    """
    Load a patient feature vector from the feature store.

    Returns None if the vector has not been generated yet.
    """
    path = FEATURE_STORE_DIR / f"{anon_patient_id}.json"
    return load_json(path)
