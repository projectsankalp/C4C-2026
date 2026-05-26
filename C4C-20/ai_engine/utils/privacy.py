"""
AarogyaNet AI Pipeline — PHI safety guards.

Ensures that Protected Health Information (PHI) never leaks into
model artifacts, feature vectors, or training datasets.

Rules:
  1. PHI_COLUMNS — exhaustive list of column names that must never appear
     in a feature vector or dataset used for ML training.
  2. strip_phi(df) — removes all PHI columns from a DataFrame.
  3. validate_no_phi(feature_dict) — asserts no PHI key exists in a dict.
  4. anonymise_patient_id(patient_id) — one-way SHA-256 hash for
     cross-referencing without exposing the raw integer primary key.

PHI separation is enforced at the pipeline boundary:
  ai_engine/training/ and ai_engine/pipelines/ call strip_phi()
  before any feature vector is persisted to disk.
"""

import hashlib
import re

import pandas as pd

# ─────────────────────────────────────────────────────────────────────────────
# Canonical PHI column name list
# ─────────────────────────────────────────────────────────────────────────────

PHI_COLUMNS: list[str] = [
    # Identity
    "full_name", "name", "patient_name", "first_name", "last_name",
    "father_name", "husband_name", "guardian_name",

    # Contact
    "phone", "mobile", "telephone", "email", "email_address",
    "address", "house_number", "street", "locality",

    # Government IDs
    "aadhaar", "aadhaar_number", "voter_id", "pan", "ration_card",
    "abha_id", "ayushman_id", "beneficiary_id",

    # Exact location (cluster centroids are OK; individual home GPS is PHI)
    "latitude", "longitude", "lat", "lng", "geo_lat", "geo_lng",

    # Temporal identifiers that could allow re-identification
    "date_of_birth", "dob", "birth_date", "age_exact",

    # Relationship identifiers
    "asha_worker_id", "doctor_id", "asha_name", "doctor_name",

    # Raw database PKs (use anonymised hash instead)
    "patient_id", "id", "user_id",
]

# Compiled pattern for fuzzy matching (catches variations like "phone_number")
_PHI_PATTERNS: list[re.Pattern] = [
    re.compile(r"\bphone\b", re.IGNORECASE),
    re.compile(r"\bname\b",  re.IGNORECASE),
    re.compile(r"\baadhaar\b", re.IGNORECASE),
    re.compile(r"\bemail\b",  re.IGNORECASE),
    re.compile(r"\baddress\b", re.IGNORECASE),
    re.compile(r"latitude|longitude", re.IGNORECASE),
    re.compile(r"\bdob\b|date_of_birth", re.IGNORECASE),
]


# ─────────────────────────────────────────────────────────────────────────────
# PHI detection helpers
# ─────────────────────────────────────────────────────────────────────────────

def _is_phi_column(col: str) -> bool:
    """Return True if the column name matches any known PHI identifier."""
    col_lower = col.lower().strip()
    if col_lower in {c.lower() for c in PHI_COLUMNS}:
        return True
    return any(p.search(col) for p in _PHI_PATTERNS)


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def strip_phi(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove all PHI columns from a DataFrame.

    Operates on a copy — the original DataFrame is not mutated.
    Logs which columns were dropped for auditability.

    Args:
        df: Input DataFrame which may contain PHI columns.

    Returns:
        A new DataFrame with all detected PHI columns removed.
    """
    phi_found = [col for col in df.columns if _is_phi_column(col)]
    if phi_found:
        print(f"[PHI Guard] Stripping PHI columns: {phi_found}")
    return df.drop(columns=phi_found, errors="ignore")


def validate_no_phi(feature_dict: dict) -> tuple[bool, list[str]]:
    """
    Validate that a feature dictionary contains no PHI keys.

    Args:
        feature_dict: Dict of feature_name → value.

    Returns:
        (is_clean: bool, phi_keys_found: list[str])
        If is_clean is True, phi_keys_found is empty.
    """
    phi_keys = [k for k in feature_dict if _is_phi_column(k)]
    return (len(phi_keys) == 0), phi_keys


def anonymise_patient_id(patient_id: int | str, salt: str = "aarogyanet-v1") -> str:
    """
    One-way SHA-256 hash of a patient primary key.

    Use this in place of raw patient_id when storing feature vectors,
    so that model artifacts cannot be reverse-mapped to individual patients.

    The salt prevents trivial rainbow-table lookups.

    Args:
        patient_id: Raw integer or string patient identifier.
        salt:       Deployment-specific salt (change per environment).

    Returns:
        16-character hex string — truncated SHA-256.
    """
    raw = f"{salt}:{patient_id}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def assert_phi_free(feature_dict: dict, context: str = "") -> None:
    """
    Raise ValueError if any PHI key is found.

    Call this at pipeline boundaries before persisting feature vectors.

    Args:
        feature_dict: Dict to check.
        context:      Optional label for error messages (e.g. "TrainingPipeline").
    """
    clean, phi_keys = validate_no_phi(feature_dict)
    if not clean:
        prefix = f"[{context}] " if context else ""
        raise ValueError(
            f"{prefix}PHI leak detected — feature dict contains: {phi_keys}. "
            "Call strip_phi() before building feature vectors."
        )
