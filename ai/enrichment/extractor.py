"""
extractor.py -- Deterministic field extractor for Anvaya Enrichment Pipeline

WHAT: Extracts structured fields from the raw columns using regex and
      string-parsing rules. No AI involved -- pure pattern matching.

WHY:  Several output fields can be derived directly from the 6 raw columns
      without needing external data or semantic understanding:
      - MANUFACTURER_PART_NUMBER from Mfg_Part_Num
      - Distributor name and code from Part_Manuf
      - Product Name (product type) from Part_Desc
      - INVOICE_DESC (ALL-CAPS abbreviated) from Part_Desc
      - Dimensions, grit, piece-count from Part_Desc

HOW:  Each extraction function takes a row (or Series) and returns the
      extracted value plus a confidence score and rule name for traceability.

EXAMPLE:
    Part_Manuf = "Freud Inc (2435)"
      -> distributor_name = "Freud Inc"
      -> distributor_code = "2435"

    Part_Desc = "DCB518ASTS06G Diablo 1/2\"x18\" - Sanding Belt 6pc"
      -> product_name = "Sanding Belt"
      -> piece_count = "6"
"""

import re
import pandas as pd
import numpy as np
from dataclasses import dataclass


# -------------------------------------------------------------------------
# Extraction result -- one per field extracted
# -------------------------------------------------------------------------
@dataclass
class ExtractionResult:
    """A single extracted value with traceability metadata."""
    value: str | None
    confidence: float       # 0.0 to 1.0
    rule: str               # which extraction rule produced this
    source_column: str      # which raw column was the source
    source_value: str       # the raw value that was parsed

    @property
    def status(self) -> str:
        """AUTO_APPROVED if confidence >= 0.8, else HUMAN_REVIEW_REQUIRED."""
        return "AUTO_APPROVED" if self.confidence >= 0.8 else "HUMAN_REVIEW_REQUIRED"


# -------------------------------------------------------------------------
# Part_Manuf parser: "Name (CODE)" -> name, code
# -------------------------------------------------------------------------
_MANUF_PATTERN = re.compile(r"^(.+?)\s*\(([^)]+)\)\s*$")


def extract_distributor_info(part_manuf: str) -> tuple[ExtractionResult, ExtractionResult]:
    """
    Parse Part_Manuf like "Freud Inc (2435)" into name and code.

    Returns:
        Tuple of (name_result, code_result).
    """
    if not part_manuf or part_manuf.strip() == "-":
        empty = ExtractionResult(
            value=None, confidence=0.0,
            rule="distributor_parse_empty", source_column="Part_Manuf",
            source_value=str(part_manuf),
        )
        return empty, empty

    match = _MANUF_PATTERN.match(part_manuf.strip())
    if match:
        name = match.group(1).strip()
        code = match.group(2).strip()
        return (
            ExtractionResult(
                value=name, confidence=1.0,
                rule="distributor_parse_name", source_column="Part_Manuf",
                source_value=part_manuf,
            ),
            ExtractionResult(
                value=code, confidence=1.0,
                rule="distributor_parse_code", source_column="Part_Manuf",
                source_value=part_manuf,
            ),
        )

    # No parenthesized code found -- treat whole string as name
    return (
        ExtractionResult(
            value=part_manuf.strip(), confidence=0.6,
            rule="distributor_parse_no_code", source_column="Part_Manuf",
            source_value=part_manuf,
        ),
        ExtractionResult(
            value=None, confidence=0.0,
            rule="distributor_parse_no_code", source_column="Part_Manuf",
            source_value=part_manuf,
        ),
    )


# -------------------------------------------------------------------------
# MANUFACTURER_PART_NUMBER from Mfg_Part_Num
# -------------------------------------------------------------------------
def extract_manufacturer_part_number(mfg_part_num: str) -> ExtractionResult:
    """
    For now, MANUFACTURER_PART_NUMBER == Mfg_Part_Num.
    Ground truth confirms this: PDSH4816AF -> PDSH4816AF.
    """
    return ExtractionResult(
        value=mfg_part_num.strip() if mfg_part_num else None,
        confidence=1.0,
        rule="mfg_part_num_passthrough",
        source_column="Mfg_Part_Num",
        source_value=str(mfg_part_num),
    )


# -------------------------------------------------------------------------
# Product Name -- extract the core product type from Part_Desc
# -------------------------------------------------------------------------
# Common product-type keywords found in the dataset
_PRODUCT_KEYWORDS = [
    "Sanding Belt", "Grinding Wheel", "Flap Disc", "Cut Off Wheel",
    "Sanding Disc", "Sanding Sheet",
    "Dishwasher", "Microwave", "Refrigerator", "Range", "Oven",
    "Chandelier", "Pendant", "Sconce", "Vanity", "Flush Mount",
    "Led Wrap Light", "Led Light", "Light",
    "Blower", "Drill", "Driver", "Saw", "Sander", "Grinder", "Router",
    "Laser", "Level",
    "Decking", "Railing", "Fence", "Trim",
    "Cord Grip", "Switch", "Outlet", "Receptacle", "Box Cover",
    "Pencil", "Tape Measure", "Clamp",
    "Safety Glasses", "Eyewear",
]

# Pre-compile patterns for speed
_PRODUCT_PATTERNS = [
    (re.compile(rf"\b{re.escape(kw)}\b", re.IGNORECASE), kw)
    for kw in sorted(_PRODUCT_KEYWORDS, key=len, reverse=True)  # longest first
]


def extract_product_name(part_desc: str) -> ExtractionResult:
    """
    Extract the product type from Part_Desc.
    Uses keyword matching (longest match wins).

    Example: "PDSH4816AF Dishwasher SS" -> "Dishwasher"
    """
    if not part_desc:
        return ExtractionResult(
            value=None, confidence=0.0,
            rule="product_name_empty", source_column="Part_Desc",
            source_value=str(part_desc),
        )

    for pattern, keyword in _PRODUCT_PATTERNS:
        if pattern.search(part_desc):
            return ExtractionResult(
                value=keyword, confidence=0.9,
                rule="product_name_keyword_match",
                source_column="Part_Desc",
                source_value=part_desc,
            )

    # No keyword matched -- could not determine product name
    return ExtractionResult(
        value=None, confidence=0.0,
        rule="product_name_no_match",
        source_column="Part_Desc",
        source_value=part_desc,
    )


# -------------------------------------------------------------------------
# INVOICE_DESC -- ALL-CAPS abbreviated version of Part_Desc
# -------------------------------------------------------------------------
def extract_invoice_desc(part_desc: str) -> ExtractionResult:
    """
    Generate an ALL-CAPS abbreviated description.

    Ground truth pattern observed:
      "PDSH4816AF Dishwasher SS - Display Only"
      -> "DISHWASHER LEG 5 SST 120V 15A 50-1/4IN"

    Since the ground truth INVOICE_DESC includes specs NOT in Part_Desc
    (voltage, amperage, mounting type), a fully accurate INVOICE_DESC
    requires external data. For now, we uppercase the Part_Desc minus
    the part number prefix and flag for review.
    """
    if not part_desc:
        return ExtractionResult(
            value=None, confidence=0.0,
            rule="invoice_desc_empty", source_column="Part_Desc",
            source_value=str(part_desc),
        )

    # Remove leading part-number-like token (alphanumeric with dashes)
    text = re.sub(r"^[A-Za-z0-9\-]+\s+", "", part_desc.strip())
    text = text.upper().strip()

    if not text:
        text = part_desc.upper().strip()

    return ExtractionResult(
        value=text,
        confidence=0.4,  # low -- missing specs that ground truth includes
        rule="invoice_desc_uppercase_partial",
        source_column="Part_Desc",
        source_value=part_desc,
    )


# -------------------------------------------------------------------------
# Dimension / spec extraction from Part_Desc
# -------------------------------------------------------------------------
_DIM_PATTERN = re.compile(
    r'(\d+[\-]?\d*/?\d*)\s*"\s*x\s*(\d+[\-]?\d*/?\d*)\s*"'
)
_PIECE_COUNT_PATTERN = re.compile(r"(\d+)\s*(?:pc|pcs|PCS)\b", re.IGNORECASE)
_GRIT_PATTERN = re.compile(r"\b[Pp](\d{2,3})\b")


def extract_dimensions(part_desc: str) -> list[ExtractionResult]:
    """
    Extract dimension-like patterns from Part_Desc.
    Returns a list of ExtractionResults (may be empty).

    Patterns recognized:
      - WxH dimensions:  1/2"x18"  -> width="1/2 in", height="18 in"
      - Piece count:     6pc       -> quantity=6
      - Grit:            P150      -> grit=150
    """
    results = []
    if not part_desc:
        return results

    # WxH dimensions
    dim_match = _DIM_PATTERN.search(part_desc)
    if dim_match:
        results.append(ExtractionResult(
            value=f"{dim_match.group(1)} in x {dim_match.group(2)} in",
            confidence=0.9,
            rule="dimension_wxh",
            source_column="Part_Desc",
            source_value=part_desc,
        ))

    # Piece count
    pc_match = _PIECE_COUNT_PATTERN.search(part_desc)
    if pc_match:
        results.append(ExtractionResult(
            value=pc_match.group(1),
            confidence=0.95,
            rule="piece_count",
            source_column="Part_Desc",
            source_value=part_desc,
        ))

    # Grit
    grit_match = _GRIT_PATTERN.search(part_desc)
    if grit_match:
        results.append(ExtractionResult(
            value=grit_match.group(1),
            confidence=0.9,
            rule="grit_value",
            source_column="Part_Desc",
            source_value=part_desc,
        ))

    return results


# -------------------------------------------------------------------------
# Batch extraction: run all extractors on a DataFrame
# -------------------------------------------------------------------------
def extract_all(df: pd.DataFrame) -> pd.DataFrame:
    """
    Run all extractors on every row of the input DataFrame.
    Returns a new DataFrame with the extracted columns added.

    New columns added:
      - _distributor_name, _distributor_code  (from Part_Manuf)
      - MANUFACTURER_PART_NUMBER              (from Mfg_Part_Num)
      - Product Name                          (from Part_Desc)
      - INVOICE_DESC                          (from Part_Desc)
      - _extracted_dimensions                 (from Part_Desc, as string)
      - _confidence_*  columns for traceability
    """
    result = df.copy()

    # Pre-allocate new columns
    dist_names = []
    dist_codes = []
    mfg_parts = []
    prod_names = []
    invoice_descs = []
    dims_list = []

    # Confidence tracking
    prod_name_conf = []
    invoice_conf = []

    for _, row in df.iterrows():
        # Distributor info
        name_r, code_r = extract_distributor_info(str(row["Part_Manuf"]))
        dist_names.append(name_r.value)
        dist_codes.append(code_r.value)

        # Manufacturer part number
        mfg_r = extract_manufacturer_part_number(str(row["Mfg_Part_Num"]))
        mfg_parts.append(mfg_r.value)

        # Product name
        pn_r = extract_product_name(str(row["Part_Desc"]))
        prod_names.append(pn_r.value)
        prod_name_conf.append(pn_r.confidence)

        # Invoice desc
        inv_r = extract_invoice_desc(str(row["Part_Desc"]))
        invoice_descs.append(inv_r.value)
        invoice_conf.append(inv_r.confidence)

        # Dimensions
        dim_results = extract_dimensions(str(row["Part_Desc"]))
        dims_str = "; ".join(
            f"{d.rule}={d.value}" for d in dim_results
        ) if dim_results else None
        dims_list.append(dims_str)

    result["_distributor_name"] = dist_names
    result["_distributor_code"] = dist_codes
    result["MANUFACTURER_PART_NUMBER"] = mfg_parts
    result["Product Name"] = prod_names
    result["INVOICE_DESC"] = invoice_descs
    result["_extracted_dimensions"] = dims_list
    result["_confidence_product_name"] = prod_name_conf
    result["_confidence_invoice_desc"] = invoice_conf

    return result


# -------------------------------------------------------------------------
# CLI entry point
# -------------------------------------------------------------------------
def main():
    from ai.enrichment.loader import load_raw

    print("Field Extractor -- Quick Test")
    print("=" * 50)

    raw = load_raw()
    extracted = extract_all(raw)

    # Stats
    prod_name_filled = extracted["Product Name"].notna().sum()
    dims_filled = extracted["_extracted_dimensions"].notna().sum()
    dist_name_filled = extracted["_distributor_name"].notna().sum()

    print(f"\nRows processed: {len(extracted)}")
    print(f"Product Name extracted:  {prod_name_filled}/{len(extracted)} "
          f"({prod_name_filled/len(extracted)*100:.1f}%)")
    print(f"Dimensions extracted:    {dims_filled}/{len(extracted)} "
          f"({dims_filled/len(extracted)*100:.1f}%)")
    print(f"Distributor name parsed: {dist_name_filled}/{len(extracted)} "
          f"({dist_name_filled/len(extracted)*100:.1f}%)")

    # Show examples
    print("\nSample extractions (first 10 with Product Name):")
    has_name = extracted[extracted["Product Name"].notna()].head(10)
    for _, row in has_name.iterrows():
        print(f"  Part_Desc: {row['Part_Desc'][:60]}")
        print(f"    -> Product Name: {row['Product Name']}")
        print(f"    -> INVOICE_DESC: {row['INVOICE_DESC'][:60]}")
        if row["_extracted_dimensions"]:
            print(f"    -> Dimensions: {row['_extracted_dimensions']}")
        print()

    print("\nSample distributor parsing (first 5):")
    for _, row in extracted.head(5).iterrows():
        print(f"  Part_Manuf: {row['Part_Manuf']}")
        print(f"    -> Name: {row['_distributor_name']}, Code: {row['_distributor_code']}")


if __name__ == "__main__":
    main()
