"""
AarogyaNet AI Pipeline — Feature Store.

Manages model-ready feature vectors for individual patients.

Storage layout:
  ai_engine/datasets/feature_store/<anon_patient_id>.json

Each stored file contains:
  {
    "anon_patient_id": "<16-char-sha256-hex>",
    "schema_version":  "1.0",
    "features":        {feature_name: float, ...},
    "feature_names":   [...],
    "metadata":        {patient_visit_count, generated_at, ...}
  }

Privacy: raw patient_id is never stored — only its anonymised hash.
The feature store is safe to use in training pipelines without PHI exposure.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from ai_engine.pipelines.feature_pipeline import FeaturePipeline, FEATURE_NAMES
from ai_engine.utils.io import (
    save_json,
    load_json,
    ensure_dir,
    FEATURE_STORE_DIR,
)
from ai_engine.utils.privacy import anonymise_patient_id, assert_phi_free


SCHEMA_VERSION = "1.0"

_pipeline = FeaturePipeline()


# ─────────────────────────────────────────────────────────────────────────────
# FeatureStore
# ─────────────────────────────────────────────────────────────────────────────

class FeatureStore:
    """
    Persist and retrieve ML-ready feature vectors.

    Usage:
        store = FeatureStore()

        # Build and save
        vector = store.build(patient_dict, visits_list)
        store.save(patient_id=42, vector=vector, metadata={"visit_count": 7})

        # Load later
        entry = store.load(patient_id=42)
        if entry:
            features = entry["features"]
    """

    def __init__(self, store_dir: str | Path | None = None):
        self._dir = Path(store_dir) if store_dir else FEATURE_STORE_DIR
        ensure_dir(self._dir)

    # ── Build ─────────────────────────────────────────────────────────────────

    def build(
        self,
        patient:      dict,
        visits:       list[dict],
        latest_visit: dict | None = None,
    ) -> dict[str, float]:
        """
        Build a feature vector for a patient using FeaturePipeline.

        Args:
            patient:      Patient record (name/phone/GPS fields ignored).
            visits:       Full visit history (oldest → newest).
            latest_visit: Most recent visit for visit-level features.

        Returns:
            Feature dict — all values float, no PHI.
        """
        vector = _pipeline.extract_patient_features(patient, visits, latest_visit)
        # Safety: confirm no PHI crept in
        assert_phi_free(vector, context="FeatureStore.build")
        return vector

    # ── Save ──────────────────────────────────────────────────────────────────

    def save(
        self,
        patient_id: int | str,
        vector:     dict[str, float],
        metadata:   dict | None = None,
    ) -> Path:
        """
        Persist a feature vector to the store, keyed by anonymised patient ID.

        Args:
            patient_id: Raw integer primary key (will be hashed, never stored raw).
            vector:     Feature dict from build().
            metadata:   Optional dict (e.g. visit_count, generated_at).

        Returns:
            Path of the stored file.
        """
        assert_phi_free(vector, context="FeatureStore.save")

        anon_id = anonymise_patient_id(patient_id)
        payload = {
            "anon_patient_id": anon_id,
            "schema_version":  SCHEMA_VERSION,
            "feature_names":   FEATURE_NAMES,
            "features":        vector,
            "metadata":        {
                **(metadata or {}),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            },
        }

        dest = self._dir / f"{anon_id}.json"
        return save_json(payload, dest)

    # ── Load ──────────────────────────────────────────────────────────────────

    def load(self, patient_id: int | str) -> dict | None:
        """
        Load a stored feature vector by raw patient_id (hashed internally).

        Returns None if no vector has been stored yet for this patient.

        Args:
            patient_id: Raw integer primary key.

        Returns:
            Stored feature entry dict, or None.
        """
        anon_id = anonymise_patient_id(patient_id)
        path    = self._dir / f"{anon_id}.json"
        return load_json(path)

    # ── Build + Save ──────────────────────────────────────────────────────────

    def build_and_save(
        self,
        patient_id:   int | str,
        patient:      dict,
        visits:       list[dict],
        latest_visit: dict | None = None,
    ) -> dict[str, float]:
        """
        Convenience: build and immediately persist. Returns the feature vector.

        Args:
            patient_id: Raw patient primary key.
            patient:    Patient record.
            visits:     All visits (oldest → newest).
            latest_visit: Override most-recent visit.

        Returns:
            Feature dict.
        """
        vector = self.build(patient, visits, latest_visit)
        self.save(
            patient_id=patient_id,
            vector=vector,
            metadata={"visit_count": len(visits)},
        )
        return vector

    # ── Catalogue ─────────────────────────────────────────────────────────────

    def list_stored(self) -> list[str]:
        """Return a list of all anonymised patient IDs in the store."""
        return [p.stem for p in self._dir.glob("*.json")]

    def count(self) -> int:
        """Return the number of feature vectors currently stored."""
        return len(list(self._dir.glob("*.json")))

    def describe(self) -> dict:
        """
        Return a summary of the feature store state.

        Useful for health-check endpoints and pipeline status reporting.
        """
        stored = self.list_stored()
        return {
            "store_dir":      str(self._dir),
            "schema_version": SCHEMA_VERSION,
            "vector_count":   len(stored),
            "feature_count":  len(FEATURE_NAMES),
            "feature_names":  FEATURE_NAMES,
        }
