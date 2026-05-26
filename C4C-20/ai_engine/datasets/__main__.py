"""
AarogyaNet Dataset Profiler — CLI Entrypoint.

Usage:
    # Profile all datasets in datasets/raw/ (default)
    python -m ai_engine.datasets

    # Profile a specific file
    python -m ai_engine.datasets --file path/to/data.csv

    # Profile a specific file with a custom dataset key
    python -m ai_engine.datasets --file path/to/data.csv --key my_dataset

    # Print summary to stdout only (no file save)
    python -m ai_engine.datasets --no-save

    # Profile all + print cross-dataset catalogue
    python -m ai_engine.datasets --catalogue
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Ensure the workspace root is on the path when run as a module
_ROOT = Path(__file__).parent.parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from ai_engine.datasets.profiler import DatasetProfiler
from ai_engine.utils.io import save_json, ensure_dir


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="python -m ai_engine.datasets.profiler",
        description="AarogyaNet healthcare dataset profiler and governance auditor.",
    )
    p.add_argument(
        "--file", "-f",
        type=str,
        default=None,
        help="Path to a specific CSV or XLSX file to profile.",
    )
    p.add_argument(
        "--key", "-k",
        type=str,
        default="",
        help="Logical dataset key (e.g. pima_diabetes). Defaults to filename stem.",
    )
    p.add_argument(
        "--no-save",
        action="store_true",
        default=False,
        help="Print summary only — do not write report files.",
    )
    p.add_argument(
        "--catalogue",
        action="store_true",
        default=False,
        help="After profiling, save a cross-dataset catalogue JSON.",
    )
    p.add_argument(
        "--all",
        action="store_true",
        default=False,
        help="Profile all CSV/XLSX files in datasets/raw/ (default behaviour).",
    )
    return p


def main(argv: list[str] | None = None) -> int:
    parser  = _build_parser()
    args    = parser.parse_args(argv)
    profiler = DatasetProfiler()
    save     = not args.no_save

    reports = []

    if args.file:
        fpath = Path(args.file)
        if not fpath.exists():
            print(f"[Profiler] ERROR: File not found: {fpath}", file=sys.stderr)
            return 1
        print(f"\n{'='*64}")
        print(f"  Profiling: {fpath.name}")
        print(f"{'='*64}")
        report = profiler.profile_file(fpath, dataset_key=args.key)
        print(report.to_summary_text())
        if save:
            profiler.save_report(report)
        reports.append(report)
    else:
        # Default: profile everything in raw/
        from ai_engine.datasets.profiler import RAW_DIR
        raw_files = sorted(list(RAW_DIR.glob("*.csv")) + list(RAW_DIR.glob("*.xlsx")))
        if not raw_files:
            print(f"[Profiler] No CSV/XLSX files found in {RAW_DIR}")
            print("           Add datasets to ai_engine/datasets/raw/ and re-run.")
            return 0

        print(f"\n{'='*64}")
        print(f"  AarogyaNet Dataset Profiler — scanning {len(raw_files)} file(s)")
        print(f"{'='*64}\n")

        for fpath in raw_files:
            print(f"\n{'─'*64}")
            print(f"  {fpath.name}")
            print(f"{'─'*64}")
            try:
                report = profiler.profile_file(fpath)
                print(report.to_summary_text())
                if save:
                    profiler.save_report(report)
                reports.append(report)
            except Exception as e:
                print(f"  [ERROR] {fpath.name}: {e}", file=sys.stderr)

    # Cross-dataset catalogue
    if args.catalogue and len(reports) > 1:
        from ai_engine.datasets.profiler import REPORTS_DIR
        catalogue = profiler.build_dataset_catalogue(reports)
        cat_path  = REPORTS_DIR / "dataset_catalogue.json"
        ensure_dir(REPORTS_DIR)
        save_json(catalogue, cat_path)
        print(f"\n[Profiler] Catalogue saved: {cat_path}")
        print(f"\n{'='*64}")
        print("  CROSS-DATASET SUMMARY")
        print(f"{'='*64}")
        for entry in catalogue["datasets"]:
            verdict_icon = {
                "ready":           "✅",
                "needs_cleaning":  "🟡",
                "not_recommended": "🔴",
            }.get(entry["ml_readiness_verdict"], "⚪")
            print(
                f"  {verdict_icon}  {entry['filename'][:40]:<40}  "
                f"score={entry['ml_readiness_score']:4.1f}  "
                f"rows={entry['rows']:,}  "
                f"null={entry['overall_null_pct']:.1f}%"
            )
        print(f"\n  Ready for ML   : {catalogue['ready']}")
        print(f"  Needs cleaning : {catalogue['needs_cleaning']}")
        print(f"  Not recommended: {catalogue['not_recommended']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
