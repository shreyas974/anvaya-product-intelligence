"""
profiling_service.py -- Dataset Profiling & Schema Discovery for ANVAYA

Analyzes uploaded datasets to produce:
- File statistics (rows, columns, sheets)
- Missing value analysis per column
- Duplicate detection (IDs, rows)
- Unique value counts
- Placeholder detection
- Semantic column role detection (product ID, SKU, manufacturer, brand, description)
- Data Health Score
"""

import re
import logging
from typing import Any
from pathlib import Path

import pandas as pd

logger = logging.getLogger("anvaya.profiling")

# Known placeholder values that should be treated as empty
PLACEHOLDER_VALUES = {
    "-- unbranded --",
    "-- no unilog brand --",
    "-- no dib brand --",
    "nan",
    "none",
    "n/a",
    "na",
    "",
    "null",
    "unknown",
    "tbd",
    "tba",
    "not specified",
    "not available",
}

# Heuristic column role detection patterns
COLUMN_ROLE_PATTERNS: dict[str, list[str]] = {
    "product_id": ["part_number", "part_num", "sku", "item_id", "product_id", "item_number", "item_no"],
    "manufacturer_part_number": ["mfg_part_num", "manufacturer_part", "mpn", "mfr_part", "part_num"],
    "description": ["part_desc", "description", "product_description", "item_description", "product_name", "title"],
    "manufacturer": ["part_manuf", "manufacturer", "mfr", "mfg", "manufacturer_name", "vendor"],
    "brand": ["brand", "brand_name", "e1_brand", "unilog_brand", "dib_brand", "trade_name"],
    "category": ["category", "class", "dept", "department", "classpath", "product_type", "fine"],
    "upc": ["upc", "ean", "gtin", "barcode"],
    "price": ["price", "list_price", "cost", "msrp", "selling_price"],
}


def detect_column_role(col_name: str) -> tuple[str, float]:
    """
    Detect the semantic role of a column based on its name.
    Returns (role, confidence).
    """
    col_lower = col_name.lower().strip().replace(" ", "_")

    # 1. First pass: exact matches
    for role, patterns in COLUMN_ROLE_PATTERNS.items():
        for pattern in patterns:
            if col_lower == pattern:
                return role, 0.98

    # 2. Second pass: substring matches
    for role, patterns in COLUMN_ROLE_PATTERNS.items():
        for pattern in patterns:
            if pattern in col_lower:
                return role, 0.85
            if col_lower in pattern:
                return role, 0.75

    return "unknown", 0.0


def count_placeholders(series: pd.Series) -> int:
    """Count how many values in a series are placeholder/empty values."""
    count = 0
    for val in series:
        if pd.isna(val):
            count += 1
        elif str(val).strip().lower() in PLACEHOLDER_VALUES:
            count += 1
    return count


def detect_inconsistent_casing(series: pd.Series) -> int:
    """Detect values that appear in multiple casing variants."""
    non_null = series.dropna().astype(str)
    lower_groups: dict[str, set[str]] = {}
    for val in non_null:
        key = val.strip().lower()
        if key and key not in PLACEHOLDER_VALUES:
            lower_groups.setdefault(key, set()).add(val.strip())
    return sum(1 for variants in lower_groups.values() if len(variants) > 1)


def detect_inconsistent_units(series: pd.Series) -> int:
    """Detect values with inconsistent unit formatting (e.g. '24in' vs '24 in')."""
    pattern = re.compile(r"\d+(?:in|ft|mm|cm|lb|kg|oz|v|a|w)(?:\b|$)", re.IGNORECASE)
    count = 0
    for val in series.dropna().astype(str):
        if pattern.search(val.strip()):
            count += 1
    return count


def profile_dataset(
    file_path: str | None = None,
    df: pd.DataFrame | None = None,
    dataset_name: str = "uploaded_dataset",
) -> dict[str, Any]:
    """
    Profile a dataset from file or DataFrame.
    Returns comprehensive profiling report.
    """
    if df is None:
        if file_path is None:
            return {"status": "error", "message": "No file path or DataFrame provided."}

        path = Path(file_path)
        if not path.exists():
            return {"status": "error", "message": f"File not found: {file_path}"}

        ext = path.suffix.lower()
        if ext == ".csv":
            df = pd.read_csv(path)
        elif ext in (".xlsx", ".xls"):
            df = pd.read_excel(path, sheet_name=0)
        elif ext == ".json":
            df = pd.read_json(path)
        else:
            return {"status": "error", "message": f"Unsupported file type: {ext}"}

    total_rows = len(df)
    total_cols = len(df.columns)

    # Per-column analysis
    column_profiles = []
    total_missing = 0
    total_placeholders = 0
    total_casing_issues = 0
    total_unit_issues = 0

    for col in df.columns:
        series = df[col]
        missing = int(series.isna().sum())
        placeholders = count_placeholders(series)
        unique_count = int(series.nunique())
        dtype = str(series.dtype)

        role, role_confidence = detect_column_role(col)
        casing_issues = detect_inconsistent_casing(series) if dtype == "object" else 0
        unit_issues = detect_inconsistent_units(series) if dtype == "object" else 0

        total_missing += missing
        total_placeholders += placeholders
        total_casing_issues += casing_issues
        total_unit_issues += unit_issues

        fill_rate = round(((total_rows - missing) / total_rows) * 100, 1) if total_rows > 0 else 0.0

        column_profiles.append({
            "column": col,
            "data_type": dtype,
            "fill_rate": fill_rate,
            "missing_count": missing,
            "placeholder_count": placeholders,
            "unique_values": unique_count,
            "casing_inconsistencies": casing_issues,
            "unit_inconsistencies": unit_issues,
            "detected_role": role,
            "role_confidence": role_confidence,
            "sample_values": [str(v) for v in series.dropna().head(3).tolist()],
        })

    # Duplicate detection
    id_columns = [cp["column"] for cp in column_profiles if cp["detected_role"] == "manufacturer_part_number" or cp["detected_role"] == "product_id"]
    duplicate_ids = 0
    if id_columns:
        primary_id_col = id_columns[0]
        duplicate_ids = int(df[primary_id_col].duplicated().sum())

    duplicate_rows = int(df.duplicated().sum())

    # Column mapping suggestions
    column_mappings = []
    for cp in column_profiles:
        if cp["detected_role"] != "unknown":
            column_mappings.append({
                "source_column": cp["column"],
                "detected_role": cp["detected_role"],
                "confidence": cp["role_confidence"],
            })

    # Data Health Score (0-100)
    total_cells = total_rows * total_cols
    missing_rate = (total_missing / total_cells) if total_cells > 0 else 0
    placeholder_rate = (total_placeholders / total_cells) if total_cells > 0 else 0
    dup_rate = (duplicate_ids / total_rows) if total_rows > 0 else 0

    completeness = max(0, (1 - missing_rate) * 100)
    cleanliness = max(0, (1 - placeholder_rate) * 100)
    uniqueness = max(0, (1 - dup_rate) * 100)
    consistency = max(0, 100 - total_casing_issues - total_unit_issues)

    health_score = round(
        (completeness * 0.35 + cleanliness * 0.25 + uniqueness * 0.20 + consistency * 0.20),
        1,
    )

    return {
        "status": "success",
        "dataset_name": dataset_name,
        "file_stats": {
            "rows": total_rows,
            "columns": total_cols,
            "file_type": Path(file_path).suffix if file_path else "DataFrame",
        },
        "health_score": min(100, health_score),
        "health_dimensions": {
            "completeness": round(completeness, 1),
            "cleanliness": round(cleanliness, 1),
            "uniqueness": round(uniqueness, 1),
            "consistency": round(min(100, consistency), 1),
        },
        "summary": {
            "total_missing_values": total_missing,
            "missing_rate_pct": round(missing_rate * 100, 1),
            "total_placeholders": total_placeholders,
            "duplicate_ids": duplicate_ids,
            "duplicate_rows": duplicate_rows,
            "casing_inconsistencies": total_casing_issues,
            "unit_inconsistencies": total_unit_issues,
            "rows_requiring_review": duplicate_ids + total_casing_issues,
        },
        "column_profiles": column_profiles,
        "column_mappings": column_mappings,
    }
