import glob
import os

import numpy as np
import pandas as pd

from intelligence.reasoning_engine import (
    BiomechanicalReasoningEngine
)

from intelligence.gemini_reporter import (
    GeminiReporter
)


# -----------------------------------
# LOAD LATEST SESSION
# -----------------------------------

def load_latest_session():

    session_files = glob.glob(
        "data/session_logs/*.csv"
    )

    if not session_files:

        return None


    latest_file = max(
        session_files,
        key=os.path.getctime
    )

    return pd.read_csv(latest_file)


# -----------------------------------
# ANALYZE SESSION
# -----------------------------------

def generate_analysis_report():

    df = load_latest_session()

    if df is None:

        return {

            "error":
            "No session files found."
        }


    if df.empty:

        return {

            "error":
            "Session file empty."
        }


    df = df.replace(
        [np.inf, -np.inf],
        np.nan
    )

    df = df.dropna()


    # -----------------------------------
    # SAFE EXTRACTION
    # -----------------------------------

    cadence_values = (
        df["cadence"]
        .astype(float)
        .values
    )

    knee_angles = (
        df["knee_angle"]
        .astype(float)
        .values
    )

    gait_intervals = (
        df["gait_interval"]
        .astype(float)
        .values
    )

    confidence_values = (
        df["confidence"]
        .astype(float)
        .values
    )


    # -----------------------------------
    # REASONING ENGINE
    # -----------------------------------

    brain = (
        BiomechanicalReasoningEngine()
    )


    report = brain.analyze_session(

        cadence_values=cadence_values,

        knee_angles=knee_angles,

        gait_intervals=gait_intervals,

        walking_speed=1.1
    )


    # -----------------------------------
    # EXTRA METRICS
    # -----------------------------------

    report["valid_frames"] = int(
        len(df)
    )

    report["mean_confidence"] = round(

        float(
            np.mean(confidence_values)
        ),

        3
    )


    # -----------------------------------
    # GEMINI REPORT
    # -----------------------------------

    try:

        gemini = GeminiReporter()

        technical_summary = (
            gemini.generate_report(report)
        )

    except Exception:

        technical_summary = (

            "Gemini analysis unavailable.\n\n"

            + report["summary"]
        )


    report["technical_summary"] = (
        technical_summary
    )


    return report


# -----------------------------------
# TERMINAL EXECUTION
# -----------------------------------

if __name__ == "__main__":

    report = generate_analysis_report()

    print(
        "\n===== BIOMECHANICAL REPORT =====\n"
    )

    for key, value in report.items():

        print(f"{key}: {value}")