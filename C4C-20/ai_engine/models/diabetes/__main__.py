"""
AarogyaNet — Diabetes Risk Model CLI.

Usage:
    python -m ai_engine.models.diabetes              # train and save artifacts
    python -m ai_engine.models.diabetes --status     # show model status
    python -m ai_engine.models.diabetes --test       # run a test prediction
    python -m ai_engine.models.diabetes --eval       # print evaluation report
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def cmd_train(args) -> None:
    from ai_engine.models.diabetes.trainer import DiabetesTrainer
    trainer = DiabetesTrainer(dataset_path=args.dataset)
    report  = trainer.train_and_save()

    if args.verbose:
        print("\n── Full Evaluation Report ──")
        print(json.dumps(report["metrics"], indent=2))
        print("\n── SHAP Global Feature Importance ──")
        for feat, val in report["shap_global_importance"].items():
            bar = "█" * int(val / max(report["shap_global_importance"].values()) * 30)
            print(f"  {feat:<22} {bar} {val:.4f}")


def cmd_status(args) -> None:
    from ai_engine.models.diabetes.model import get_model_status
    status = get_model_status()
    print("\n── Diabetes Risk Model Status ──────────────────────────────")
    print(f"  Loaded in memory : {status['is_loaded_in_memory']}")
    print(f"  Model artifact   : {'✓' if status['artifact_exists'] else '✗'}  {status['artifact_path']}")
    print(f"  Preprocessor     : {'✓' if status['preprocessor_exists'] else '✗'}  {status['preprocessor_path']}")
    print(f"  Eval report      : {'✓' if status['eval_report_exists'] else '✗'}  {status['eval_report_path']}")
    if status["artifact_exists"]:
        mi = status.get("model_info", {})
        pm = mi.get("performance_metrics", {})
        if pm:
            print(f"\n  AUC-ROC:     {pm.get('auc_roc', '—')}")
            print(f"  F1:          {pm.get('f1', '—')}")
            print(f"  Sensitivity: {pm.get('sensitivity', '—')}")
            print(f"  Specificity: {pm.get('specificity', '—')}")
    else:
        print("\n  Model not yet trained. Run: python -m ai_engine.models.diabetes")


def cmd_test(args) -> None:
    from ai_engine.models.diabetes.model import predict_diabetes_risk

    test_cases = [
        {
            "label": "Typical low-risk patient",
            "features": {
                "pregnancies": 1, "glucose": 89, "blood_pressure": 66,
                "skin_thickness": 23, "insulin": 94, "bmi": 28.1,
                "diabetes_pedigree": 0.167, "age": 21,
            },
        },
        {
            "label": "Higher-risk patient (elevated glucose, BMI)",
            "features": {
                "pregnancies": 6, "glucose": 148, "blood_pressure": 72,
                "skin_thickness": 35, "insulin": 0, "bmi": 33.6,
                "diabetes_pedigree": 0.627, "age": 50,
            },
        },
        {
            "label": "Partial data (age + BP only — typical ASHA visit)",
            "features": {
                "pregnancies": 0, "glucose": 0, "blood_pressure": 80,
                "skin_thickness": 0, "insulin": 0, "bmi": 0,
                "diabetes_pedigree": 0, "age": 45,
            },
        },
    ]

    print("\n── Diabetes Risk Model — Test Predictions ───────────────────")
    for tc in test_cases:
        print(f"\n  Patient: {tc['label']}")
        result = predict_diabetes_risk(tc["features"])
        print(f"  Risk Probability : {result['risk_probability_pct']}")
        print(f"  Risk Band        : {result['risk_band']}")
        print(f"  Above Threshold  : {result['confidence_above_threshold']}")
        print(f"  Recommendation   : {result['recommendation'][:80]}...")
        print(f"  Completeness     : {result['data_completeness']['completeness_pct']}%")
        if result.get("contributing_factors"):
            top = result["contributing_factors"][0]
            print(f"  Top Factor       : {top['display_name']} ({top['direction'].replace('_',' ')}, SHAP={top['shap_value']:.3f})")


def cmd_eval(args) -> None:
    from ai_engine.models.diabetes.model import EVAL_REPORT_PATH
    if not EVAL_REPORT_PATH.exists():
        print(f"[ERROR] Eval report not found: {EVAL_REPORT_PATH}")
        print("Train the model first: python -m ai_engine.models.diabetes")
        sys.exit(1)
    with open(EVAL_REPORT_PATH) as f:
        report = json.load(f)
    print(f"\n── Diabetes Risk Model — Evaluation Report ──────────────────")
    print(f"  Trained At : {report.get('trained_at', '—')}")
    print(f"  Algorithm  : {report.get('algorithm', '—')}")
    print(f"  Dataset    : {report.get('training_dataset', '—')}")
    print(f"  N Train    : {report.get('n_train', '—')}")
    print(f"  N Test     : {report.get('n_test', '—')}")
    print()
    m = report.get("metrics", {})
    metrics = [
        ("AUC-ROC",     m.get("auc_roc")),
        ("F1 Score",    m.get("f1")),
        ("Sensitivity", m.get("sensitivity")),
        ("Specificity", m.get("specificity")),
        ("Precision",   m.get("precision")),
        ("Brier Score", m.get("brier_score")),
        ("ECE",         m.get("expected_calibration_error")),
    ]
    for label, val in metrics:
        bar = "█" * int((val or 0) * 20) if val else ""
        print(f"  {label:<14} {bar:<22} {val:.4f}" if val else f"  {label:<14} —")
    gi = report.get("shap_global_importance", {})
    if gi:
        print("\n  SHAP Global Feature Importance:")
        max_val = max(gi.values())
        for feat, val in gi.items():
            bar = "█" * int(val / max_val * 25)
            print(f"    {feat:<24} {bar:<27} {val:.4f}")


def main():
    parser = argparse.ArgumentParser(
        description="AarogyaNet Diabetes Risk Model — train, evaluate, and test.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--status",  action="store_true",
        help="Show model artifact status without training",
    )
    parser.add_argument(
        "--test",    action="store_true",
        help="Run test predictions on sample patients",
    )
    parser.add_argument(
        "--eval",    action="store_true",
        help="Print the saved evaluation report",
    )
    parser.add_argument(
        "--dataset", type=str, default=None,
        help="Path to Pima CSV (default: ai_engine/datasets/raw/Pima_Indians_Diabetes_Database.csv)",
    )
    parser.add_argument(
        "--verbose", action="store_true",
        help="Print extended output after training",
    )

    args = parser.parse_args()

    if args.status:
        cmd_status(args)
    elif args.test:
        cmd_test(args)
    elif args.eval:
        cmd_eval(args)
    else:
        cmd_train(args)


if __name__ == "__main__":
    main()
