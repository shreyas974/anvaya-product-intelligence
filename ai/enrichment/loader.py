"""
loader.py — Data Loader & Column Diff Reporter for Anvaya Enrichment Pipeline

WHAT: Loads the raw input CSV and the expected output CSV, prints their shapes,
      columns, missing values, and computes the column diff (shared / raw-only /
      output-only). This diff is the foundation for scoping the entire pipeline.

WHY: Before writing any enrichment code, we need to know exactly:
     - Which columns pass through unchanged (shared columns)
     - Which columns exist only in raw input (consumed or dropped)
     - Which columns exist only in the expected output (must be generated)

HOW: Uses pandas to read both CSVs and set operations on column names.

RUN:  python -m ai.enrichment.loader   (from repo root, with venv active)
"""

import pandas as pd
from pathlib import Path


# ---------------------------------------------------------------------------
# Paths (relative to repo root)
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent.parent  # ai/enrichment/../../
RAW_PATH = REPO_ROOT / "data" / "raw" / "sample_1000_items.csv"
EXPECTED_PATH = REPO_ROOT / "data" / "samples" / "expected_output_delivery_format.csv"


def load_raw() -> pd.DataFrame:
    """Load the raw catalogue input CSV."""
    return pd.read_csv(RAW_PATH)


def load_expected() -> pd.DataFrame:
    """Load the expected output (ground truth) CSV."""
    return pd.read_csv(EXPECTED_PATH)


def report_dataframe(name: str, df: pd.DataFrame) -> None:
    """Print shape, columns, and missing-value counts for a DataFrame."""
    print(f"\n{'=' * 60}")
    print(f"  {name}")
    print(f"{'=' * 60}")
    print(f"  Shape : {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"  Columns: {list(df.columns)}")
    print(f"\n  Missing values per column:")
    missing = df.isnull().sum()
    for col, n in missing.items():
        pct = n / len(df) * 100
        marker = " (!)" if pct > 0 else ""
        print(f"    {col:40s}  {n:>5d}  ({pct:5.1f}%){marker}")


def column_diff(raw: pd.DataFrame, expected: pd.DataFrame) -> dict:
    """
    Compute the three-way column diff:
      - shared:     columns in BOTH raw input and expected output
      - only_raw:   columns in raw input but NOT in expected output
      - only_expected: columns in expected output but NOT in raw input
    Returns a dict with sorted lists for each category.
    """
    raw_cols = set(raw.columns)
    exp_cols = set(expected.columns)

    return {
        "shared": sorted(raw_cols & exp_cols),
        "only_raw": sorted(raw_cols - exp_cols),
        "only_expected": sorted(exp_cols - raw_cols),
    }


def report_column_diff(diff: dict) -> None:
    """Pretty-print the column diff."""
    print(f"\n{'=' * 60}")
    print("  COLUMN DIFF: Raw Input vs Expected Output")
    print(f"{'=' * 60}")

    print(f"\n  [SHARED] columns ({len(diff['shared'])}) -- present in both files:")
    for c in diff["shared"]:
        print(f"      {c}")

    print(f"\n  [RAW-ONLY] columns ({len(diff['only_raw'])}) -- consumed or dropped:")
    if diff["only_raw"]:
        for c in diff["only_raw"]:
            print(f"      {c}")
    else:
        print("      (none -- every raw column also appears in expected output)")

    # Group expected-only columns for readability
    only_exp = diff["only_expected"]
    attr_cols = [c for c in only_exp if c.startswith("ATTRIBUTE_")]
    feature_cols = [c for c in only_exp if c.startswith("ITEM_FEATURES_")]
    other_cols = [c for c in only_exp if c not in attr_cols and c not in feature_cols]

    print(f"\n  [NEW] ONLY IN EXPECTED OUTPUT ({len(only_exp)}) -- must be generated/enriched:")
    print(f"\n    Core enrichment fields ({len(other_cols)}):")
    for c in other_cols:
        print(f"      {c}")
    print(f"\n    Item features ({len(feature_cols)}):")
    for c in feature_cols:
        print(f"      {c}")
    print(f"\n    Attribute triplets (LABEL/VALUE/UOM × 50 = {len(attr_cols)}):")
    print(f"      ATTRIBUTE_LABEL 1 .. ATTRIBUTE_LABEL 50")
    print(f"      ATTRIBUTE_VALUE 1 .. ATTRIBUTE_VALUE 50")
    print(f"      ATTRIBUTE_UOM 1   .. ATTRIBUTE_UOM 50")


def main():
    print("Anvaya Enrichment Pipeline — Data Loader & Column Diff")
    print("=" * 60)

    # Load
    raw = load_raw()
    expected = load_expected()

    # Report each dataset
    report_dataframe("RAW INPUT  (data/raw/sample_1000_items.csv)", raw)
    report_dataframe("EXPECTED OUTPUT  (data/samples/expected_output_delivery_format.csv)", expected)

    # Column diff
    diff = column_diff(raw, expected)
    report_column_diff(diff)

    # Check overlap on Mfg_Part_Num
    raw_mpns = set(raw["Mfg_Part_Num"])
    exp_mpns = set(expected["Mfg_Part_Num"])
    overlap = raw_mpns & exp_mpns
    print(f"\n{'=' * 60}")
    print(f"  Mfg_Part_Num OVERLAP")
    print(f"{'=' * 60}")
    print(f"  Raw has {len(raw_mpns)} unique part numbers")
    print(f"  Expected output has {len(exp_mpns)} unique part numbers")
    print(f"  Overlapping: {len(overlap)}  ->  {sorted(overlap)}")
    if overlap:
        print("  >> These rows can be used for before/after comparison")

    print("\nDone.")


if __name__ == "__main__":
    main()
