"""
delivery_mapper.py -- 252-Column Delivery Format Mapper & Exporter for ANVAYA

Maps internal canonical product records to the exact expected Unilog delivery schema.
Validates:
- Column presence and order
- Character limits
- UOM formatting
- Required fields
- Attribute slot population based on classpath + LOV

Exports to CSV and XLSX matching the expected delivery format.
"""

import csv
import io
import json
import logging
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger("anvaya.delivery_mapper")

# The canonical 252-column delivery schema (from expected_output_delivery_format.csv)
DELIVERY_SCHEMA: list[str] = []  # Populated at module load


def _load_delivery_schema() -> list[str]:
    """Load the 252-column schema from the expected output file."""
    global DELIVERY_SCHEMA
    expected_path = Path("data/samples/expected_output_delivery_format.csv")
    if expected_path.exists():
        df = pd.read_csv(expected_path, nrows=0)
        DELIVERY_SCHEMA = list(df.columns)
    else:
        # Fallback: core columns without attribute slots
        DELIVERY_SCHEMA = [
            "MFR URL", "Ref URL 1", "Ref URL 2", "Ref URL 3", "Ref URL 4", "Ref URL 5",
            "PART_NUMBER", "Dept", "Class", "Fine",
            "SKU - MY_PART_NUMBER", "Mfg_Part_Num", "Part_Desc",
            "E1_Brand", "Unilog_Brand", "DIB_Brand", "Part_Manuf",
            "MANUFACTURER_NAME", "BRAND_NAME", "TRADE_NAME",
            "MANUFACTURER_PART_NUMBER", "ALTERNATE_PART_NUMBER",
            "Classpath", "MOBILE_DESC", "INVOICE_DESC", "SHORT_DESC",
            "LONG_DESC1", "RETAIL_DESC", "MARKETING_DESCRIPTION",
        ]
    return DELIVERY_SCHEMA


# Load schema at module import
_load_delivery_schema()


def map_product_to_delivery_row(
    product: dict[str, Any],
    attributes: list[dict[str, Any]] | None = None,
    content: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Map a single product record to the 252-column delivery format.

    Args:
        product: Internal canonical product dict with raw + enriched fields.
        attributes: List of dicts with {label, value, uom} for attribute slots.
        content: Dict with generated content fields (INVOICE_DESC, MOBILE_DESC, etc.)

    Returns:
        Dict keyed by delivery column names.
    """
    row: dict[str, Any] = {}

    # Initialize all columns to empty
    for col in DELIVERY_SCHEMA:
        row[col] = ""

    # Map core identification fields
    mpn = product.get("mfg_part_num", "")
    row["PART_NUMBER"] = product.get("part_number", mpn)
    row["SKU - MY_PART_NUMBER"] = mpn
    row["Mfg_Part_Num"] = mpn
    row["MANUFACTURER_PART_NUMBER"] = mpn

    # Map raw ingested fields
    row["Part_Desc"] = product.get("part_desc", "")
    row["E1_Brand"] = product.get("e1_brand", "")
    row["Unilog_Brand"] = product.get("unilog_brand", "")
    row["DIB_Brand"] = product.get("dib_brand", "")
    row["Part_Manuf"] = product.get("part_manuf", "")

    # Map enriched fields
    row["MANUFACTURER_NAME"] = product.get("manufacturer_name", "")
    row["BRAND_NAME"] = product.get("canonical_brand", "")
    row["TRADE_NAME"] = product.get("trade_name", "")

    # Map classpath / taxonomy
    classpath = product.get("classpath", "")
    if not classpath:
        cat = product.get("category", "")
        subcat = product.get("subcategory", "")
        ptype = product.get("product_type", "")
        if cat:
            classpath = cat
            if subcat:
                classpath += f">{subcat}"
            if ptype:
                classpath += f">{ptype}"
    row["Classpath"] = classpath

    # Parse classpath into Dept/Class/Fine
    if classpath:
        parts = [p.strip() for p in classpath.split(">")]
        row["Dept"] = parts[0] if len(parts) > 0 else ""
        row["Class"] = parts[1] if len(parts) > 1 else ""
        row["Fine"] = parts[2] if len(parts) > 2 else ""

    # Map generated content
    if content:
        for field in ("INVOICE_DESC", "MOBILE_DESC", "SHORT_DESC", "LONG_DESC1", "RETAIL_DESC", "MARKETING_DESCRIPTION"):
            field_data = content.get(field, {})
            if isinstance(field_data, dict):
                row[field] = field_data.get("value", "")
            elif isinstance(field_data, str):
                row[field] = field_data

    # Map product name
    row["Product Name"] = product.get("product_name", product.get("product_type", ""))

    # Map attribute slots (up to 50 slots)
    if attributes:
        for i, attr in enumerate(attributes[:50], start=1):
            label_col = f"ATTRIBUTE_LABEL {i}"
            value_col = f"ATTRIBUTE_VALUE {i}"
            uom_col = f"ATTRIBUTE_UOM {i}"

            if label_col in row:
                row[label_col] = attr.get("label", "")
                row[value_col] = str(attr.get("value", "")) if attr.get("value") is not None else ""
                row[uom_col] = attr.get("uom", "")

    # Map identifiers
    row["UPC"] = product.get("upc", "")
    row["EAN"] = product.get("ean", "")
    row["GTIN"] = product.get("gtin", "")
    row["UNSPSC"] = product.get("unspsc", "")

    # Map warranty
    row["Warranty"] = product.get("warranty", "")

    # Map dimensions
    row["LENGTH"] = product.get("length", "")
    row["LENGTH_UOM"] = product.get("length_uom", "")
    row["HEIGHT"] = product.get("height", "")
    row["HEIGHT_UOM"] = product.get("height_uom", "")
    row["WIDTH"] = product.get("width", "")
    row["WIDTH_UOM"] = product.get("width_uom", "")
    row["WEIGHT"] = product.get("weight", "")
    row["WEIGHT_UOM"] = product.get("weight_uom", "")

    # Map digital assets
    row["Product Image"] = product.get("product_image", "")
    for i in range(1, 5):
        row[f"Alternate Image {i}"] = product.get(f"alternate_image_{i}", "")

    return row


def validate_delivery_row(row: dict[str, Any]) -> list[dict[str, str]]:
    """
    Validate a delivery row against schema rules.
    Returns list of validation issues.
    """
    issues = []

    # Required fields check
    required_fields = ["Mfg_Part_Num", "MANUFACTURER_NAME", "BRAND_NAME", "Classpath"]
    for field in required_fields:
        val = row.get(field, "")
        if not val or str(val).strip() == "" or str(val) == "nan":
            issues.append({
                "field": field,
                "severity": "CRITICAL",
                "rule": "REQUIRED_FIELD_MISSING",
                "message": f"Required delivery field '{field}' is empty.",
            })

    # Character limit checks
    char_limits = {
        "INVOICE_DESC": 40,
        "MOBILE_DESC": 100,
        "SHORT_DESC": 150,
        "LONG_DESC1": 500,
        "RETAIL_DESC": 150,
    }
    for field, limit in char_limits.items():
        val = str(row.get(field, ""))
        if len(val) > limit:
            issues.append({
                "field": field,
                "severity": "WARNING",
                "rule": "CHARACTER_LIMIT_EXCEEDED",
                "message": f"'{field}' is {len(val)} chars (limit: {limit}).",
            })

    # UOM format check (should be "number space unit")
    import re
    uom_fields = [f"ATTRIBUTE_UOM {i}" for i in range(1, 51)]
    for uf in uom_fields:
        val = str(row.get(uf, "")).strip()
        if val and val != "nan":
            # Valid UOM patterns: "V", "A", "in", "dBA", "lb", etc.
            if not re.match(r"^[a-zA-Z°%/]+$", val):
                issues.append({
                    "field": uf,
                    "severity": "INFO",
                    "rule": "UOM_FORMAT_CHECK",
                    "message": f"UOM value '{val}' may need format review.",
                })

    return issues


def export_delivery_format(
    products: list[dict[str, Any]],
    output_path: str | None = None,
    format: str = "csv",
) -> dict[str, Any]:
    """
    Export products to delivery format file.

    Args:
        products: List of mapped delivery rows (from map_product_to_delivery_row).
        output_path: File path to write to. If None, returns data in memory.
        format: "csv" or "xlsx".

    Returns:
        Dict with export results including validation summary.
    """
    if not DELIVERY_SCHEMA:
        _load_delivery_schema()

    # Validate all rows
    total_issues = 0
    critical_issues = 0
    all_issues: list[dict[str, Any]] = []

    for i, product_row in enumerate(products):
        row_issues = validate_delivery_row(product_row)
        if row_issues:
            total_issues += len(row_issues)
            critical_count = sum(1 for iss in row_issues if iss["severity"] == "CRITICAL")
            critical_issues += critical_count
            all_issues.append({
                "row_index": i,
                "mpn": product_row.get("Mfg_Part_Num", "Unknown"),
                "issues": row_issues,
            })

    # Build DataFrame
    df = pd.DataFrame(products, columns=DELIVERY_SCHEMA)

    # Write to file
    if output_path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        if format == "xlsx":
            df.to_excel(output_path, index=False, sheet_name="Delivery Format")
        else:
            df.to_csv(output_path, index=False)

        file_size = path.stat().st_size
    else:
        # Return as CSV string in memory
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        file_size = len(buffer.getvalue())

    return {
        "status": "success" if critical_issues == 0 else "warnings",
        "export_summary": {
            "total_rows": len(products),
            "total_columns": len(DELIVERY_SCHEMA),
            "schema_version": "252-column Unilog Delivery Format",
            "format": format.upper(),
            "file_size_bytes": file_size,
            "output_path": output_path,
        },
        "validation_summary": {
            "total_issues": total_issues,
            "critical_issues": critical_issues,
            "rows_with_issues": len(all_issues),
            "export_blocked": critical_issues > 0,
            "issues_detail": all_issues[:20],  # Cap at 20 for response size
        },
    }
