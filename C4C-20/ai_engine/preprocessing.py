"""
Data preprocessing utilities for the AarogyaNet AI risk engine.
Normalises and validates raw visit data before scoring.
"""
import pandas as pd
import numpy as np

def preprocess_visit(visit_data: dict) -> dict:
    """
    Clean and normalise a raw visit dict before passing to the risk engine.
    Handles missing values by substituting safe defaults.
    """
    def safe_int(val, default=0):
        try:
            return int(val) if val is not None else default
        except (ValueError, TypeError):
            return default

    def safe_bool(val):
        if isinstance(val, bool):
            return val
        if isinstance(val, int):
            return bool(val)
        if isinstance(val, str):
            return val.lower() in ('true', '1', 'yes')
        return False

    return {
        'bp_systolic':     safe_int(visit_data.get('bp_systolic'), 0),
        'bp_diastolic':    safe_int(visit_data.get('bp_diastolic'), 0),
        'pulse':           safe_int(visit_data.get('pulse'), 0),
        'temperature':     float(visit_data.get('temperature') or 0.0),
        'dizziness':       safe_bool(visit_data.get('dizziness')),
        'chest_pain':      safe_bool(visit_data.get('chest_pain')),
        'medicine_missed': safe_bool(visit_data.get('medicine_missed')),
    }


def build_feature_matrix(visits: list) -> pd.DataFrame:
    """
    Convert a list of visit dicts into a pandas DataFrame for batch analysis.
    Useful for training/evaluating scikit-learn models offline.
    """
    records = [preprocess_visit(v) for v in visits]
    df = pd.DataFrame(records)
    df.replace({None: np.nan}, inplace=True)
    df.fillna(0, inplace=True)
    return df
