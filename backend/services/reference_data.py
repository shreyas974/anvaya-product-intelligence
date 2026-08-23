"""
reference_data.py -- Authoritative Reference Governance Layer for ANVAYA

Encapsulates:
- Decimal_Fraction conversion mappings
- Unilog Master UOM Standards & Formatting
- Fittings_LOV category vocabulary (Fitting Types, Connection Types, Materials)
- UniCat Manufacturer & Brand normalization rules
- Conflict Detection logic
"""

from typing import Any
import re

# 1. Decimal & Fraction Normalization Dictionary
DECIMAL_FRACTION_MAP = {
    "0.0625": "1/16",
    "0.125": "1/8",
    "0.1875": "3/16",
    "0.25": "1/4",
    "0.3125": "5/16",
    "0.375": "3/8",
    "0.4375": "7/16",
    "0.5": "1/2",
    "0.5625": "9/16",
    "0.625": "5/8",
    "0.6875": "11/16",
    "0.75": "3/4",
    "0.8125": "13/16",
    "0.875": "7/8",
    "0.9375": "15/16",
}

FRACTION_DECIMAL_MAP = {v: k for k, v in DECIMAL_FRACTION_MAP.items()}

# 2. Approved Master UOM Vocabulary & Standard Abbreviations
APPROVED_UOM_STANDARDS = {
    # Length / Dimensions
    "inch": "in",
    "inches": "in",
    "in.": "in",
    "in": "in",
    '"': "in",
    "foot": "ft",
    "feet": "ft",
    "ft.": "ft",
    "ft": "ft",
    "'": "ft",
    "millimeter": "mm",
    "millimeters": "mm",
    "mm": "mm",
    "centimeter": "cm",
    "centimeters": "cm",
    "cm": "cm",
    "meter": "m",
    "meters": "m",
    "m": "m",
    # Weight / Mass
    "pound": "lb",
    "pounds": "lb",
    "lbs": "lb",
    "lb": "lb",
    "ounce": "oz",
    "ounces": "oz",
    "oz": "oz",
    "kilogram": "kg",
    "kilograms": "kg",
    "kg": "kg",
    "gram": "g",
    "grams": "g",
    "g": "g",
    # Pressure & Flow
    "psi": "psi",
    "bar": "bar",
    "gpm": "gpm",
    "cfm": "cfm",
    # Electrical
    "volt": "V",
    "volts": "V",
    "v": "V",
    "amp": "A",
    "amps": "A",
    "ampere": "A",
    "a": "A",
    "watt": "W",
    "watts": "W",
    "w": "W",
    "rpm": "RPM",
    # Packaging / Counting
    "pieces": "pc",
    "piece": "pc",
    "pcs": "pc",
    "pc": "pc",
    "pack": "pk",
    "pk": "pk",
    "box": "box",
    "each": "ea",
    "ea": "ea",
    "pair": "pr",
    "set": "set",
    "roll": "roll",
    # Abrasives Grit
    "grit": "Grit",
    "p": "Grit",
}

# 3. Fittings Category LOV Vocabulary (from Fittings_LOV.xlsx)
FITTINGS_LOV = {
    "fitting_types": {
        "90 ELB": "90 Degree Elbow",
        "45 ELB": "45 Degree Elbow",
        "STREET TEE": "Street Tee",
        "RED TEE": "Reducing Tee",
        "HEX BUSH": "Hex Bushing",
        "HEX NIP": "Hex Nipple",
        "CLOSE NIP": "Close Nipple",
        "HEX PLUG": "Hex Plug",
        "CPLG": "Coupling",
        "COUPLING": "Coupling",
        "ELB": "Elbow",
        "ELL": "Elbow",
        "ELBOW": "Elbow",
        "TEE": "Tee",
        "ADPT": "Adapter",
        "ADAPTER": "Adapter",
        "BUSH": "Bushing",
        "BUSHING": "Bushing",
        "NIP": "Nipple",
        "NIPPLE": "Nipple",
        "UN": "Union",
        "UNION": "Union",
        "CAP": "Cap",
        "PLUG": "Plug",
        "CROSS": "Cross",
        "FLANGE": "Flange",
        "BALL VALVE": "Ball Valve",
        "VALVE": "Ball Valve",
    },
    "connection_types": {
        "FNPT": "Female NPT",
        "MNPT": "Male NPT",
        "FPT": "Female NPT",
        "MPT": "Male NPT",
        "NPT": "NPT",
        "SWEAT": "Sweat / Solder",
        "COMP": "Compression",
        "FLANGED": "Flanged",
        "PUSH": "Push-to-Connect",
        "BARB": "Hose Barb",
        "SW": "Socket Weld",
        "BW": "Butt Weld",
    },
    "materials": {
        "304SS": "304 Stainless Steel",
        "316SS": "316 Stainless Steel",
        "SS": "Stainless Steel",
        "BRS": "Brass",
        "BRASS": "Brass",
        "CS": "Carbon Steel",
        "STEEL": "Carbon Steel",
        "COPPER": "Copper",
        "CU": "Copper",
        "CPVC": "CPVC",
        "PVC": "PVC",
        "MI": "Malleable Iron",
        "CI": "Cast Iron",
        "ALUM": "Aluminum",
        "BRONZE": "Bronze",
    },
    "pressure_classes": {
        "150#": "Class 150",
        "300#": "Class 300",
        "600#": "Class 600",
        "2000#": "2000 PSI",
        "3000#": "3000 PSI",
        "SCH 40": "Schedule 40",
        "SCH 80": "Schedule 80",
    }
}


def normalize_uom_string(val_str: str) -> tuple[str, str, str | None]:
    """
    Normalizes a numerical + UOM string to strict 'number space unit' standard.
    Example: '24in' -> ('24 in', '24 in', 'Unilog Master UOM Standards')
    """
    if not val_str:
        return val_str, val_str, None

    val_clean = str(val_str).strip()
    match = re.match(r"^(\d+(?:[-/.]\d+)?)\s*([a-zA-Z\"'.]+)$", val_clean)
    if match:
        num = match.group(1).strip()
        raw_uom = match.group(2).strip().lower()

        # Check fraction conversion
        if "." in num:
            parts = num.split(".")
            int_part = parts[0]
            dec_part = f"0.{parts[1]}"
            if dec_part in DECIMAL_FRACTION_MAP:
                frac = DECIMAL_FRACTION_MAP[dec_part]
                num = f"{int_part}-{frac}" if int_part != "0" else frac

        if raw_uom in APPROVED_UOM_STANDARDS:
            canonical_uom = APPROVED_UOM_STANDARDS[raw_uom]
            normalized = f"{num} {canonical_uom}"
            return normalized, f"Normalized from '{val_clean}'", "Unilog Master UOM Standards"

    return val_clean, f"Preserved '{val_clean}'", None


def normalize_fittings_spec(raw_desc: str) -> dict[str, Any]:
    """
    Flagship Fittings normalization engine against Fittings_LOV.
    """
    desc_upper = raw_desc.upper()
    results = {
        "raw_description": raw_desc,
        "fitting_type": None,
        "connection_type": None,
        "material": None,
        "size": None,
        "pressure_rating": None,
        "evidence_trace": [],
    }

    # 1. Size Extraction (e.g. 3/8, 1/2", 3/4 IN, 1-1/2)
    size_match = re.search(r'(?:^|\s)(\d+(?:[-/]\d+)?(?:\s*IN|\s*"|\s*MM)?)(?:\s|$)', desc_upper)
    if size_match:
        raw_size = size_match.group(1).strip()
        norm_size, _, _ = normalize_uom_string(raw_size if '"' in raw_size or 'IN' in raw_size else f"{raw_size} in")
        results["size"] = norm_size
        results["evidence_trace"].append({
            "field": "Size",
            "raw_term": size_match.group(1).strip(),
            "normalized_value": norm_size,
            "rule": "Decimal_Fraction & UOM Standard",
            "confidence": 0.98,
        })

    # 2. Fitting Type Lookup (longest match first)
    sorted_types = sorted(FITTINGS_LOV["fitting_types"].items(), key=lambda x: len(x[0]), reverse=True)
    for term, canonical in sorted_types:
        pattern = rf"(?:^|\b|\s){re.escape(term)}(?:\b|\s|$)"
        if re.search(pattern, desc_upper):
            results["fitting_type"] = canonical
            results["evidence_trace"].append({
                "field": "Fitting Type",
                "raw_term": term,
                "normalized_value": canonical,
                "rule": "Fittings_LOV.xlsx > Fitting Types",
                "confidence": 0.99,
            })
            break

    # 3. Material Lookup (longest match first)
    sorted_materials = sorted(FITTINGS_LOV["materials"].items(), key=lambda x: len(x[0]), reverse=True)
    for term, canonical in sorted_materials:
        pattern = rf"(?:^|\b|\s){re.escape(term)}(?:\b|\s|$)"
        if re.search(pattern, desc_upper):
            results["material"] = canonical
            results["evidence_trace"].append({
                "field": "Material",
                "raw_term": term,
                "normalized_value": canonical,
                "rule": "Fittings_LOV.xlsx > Approved Materials",
                "confidence": 0.99,
            })
            break

    # 4. Connection Type Lookup (longest match first)
    sorted_connections = sorted(FITTINGS_LOV["connection_types"].items(), key=lambda x: len(x[0]), reverse=True)
    for term, canonical in sorted_connections:
        pattern = rf"(?:^|\b|\s){re.escape(term)}(?:\b|\s|$)"
        if re.search(pattern, desc_upper):
            results["connection_type"] = canonical
            results["evidence_trace"].append({
                "field": "Connection Type",
                "raw_term": term,
                "normalized_value": canonical,
                "rule": "Fittings_LOV.xlsx > Connection Types",
                "confidence": 0.97,
            })
            break

    # 5. Pressure Class Lookup (longest match first)
    sorted_pressure = sorted(FITTINGS_LOV["pressure_classes"].items(), key=lambda x: len(x[0]), reverse=True)
    for term, canonical in sorted_pressure:
        pattern = rf"(?:^|\b|\s){re.escape(term)}(?:\b|\s|$)"
        if re.search(pattern, desc_upper):
            results["pressure_rating"] = canonical
            results["evidence_trace"].append({
                "field": "Pressure Rating",
                "raw_term": term,
                "normalized_value": canonical,
                "rule": "Fittings_LOV.xlsx > Pressure Ratings",
                "confidence": 0.98,
            })
            break

    return results


def detect_catalog_conflicts(raw_mfg: str | None, raw_brand: str | None, resolved_brand: str | None, category: str | None) -> list[dict[str, Any]]:
    """
    Detects inconsistencies between manufacturer, brand, and category evidence.
    """
    conflicts = []

    if not raw_mfg and not raw_brand and resolved_brand == "Generic / Unbranded":
        conflicts.append({
            "conflict_type": "MISSING_IDENTITY_EVIDENCE",
            "severity": "WARNING",
            "fields": ["Manufacturer", "Brand"],
            "explanation": "No manufacturer or brand provided across all distributor feeds.",
            "possible_resolution": "Lookup MPN in global distributor master catalog.",
            "required_action": "Route to Human Review Queue",
        })

    # Manufacturer vs Brand Inconsistency Check
    if raw_mfg and resolved_brand and resolved_brand != "Generic / Unbranded":
        mfg_lower = raw_mfg.lower()
        brand_lower = resolved_brand.lower()
        # Known disjoint combinations
        if "rheem" in mfg_lower and "frigidaire" in brand_lower:
            conflicts.append({
                "conflict_type": "MANUFACTURER_BRAND_DISCREPANCY",
                "severity": "CRITICAL",
                "fields": ["Part_Manuf", "Canonical_Brand"],
                "explanation": f"Manufacturer '{raw_mfg}' does not produce brand '{resolved_brand}'.",
                "possible_resolution": "Verify whether product is an OEM replacement part or distributor typo.",
                "required_action": "Flag for Human Reviewer Investigation",
            })
        elif "bosch" in mfg_lower and "dewalt" in brand_lower:
            conflicts.append({
                "conflict_type": "MANUFACTURER_BRAND_DISCREPANCY",
                "severity": "CRITICAL",
                "fields": ["Part_Manuf", "Canonical_Brand"],
                "explanation": f"Manufacturer '{raw_mfg}' conflicts with identified brand '{resolved_brand}'.",
                "possible_resolution": "Inspect SKU origin.",
                "required_action": "Reject prediction and require manual brand entry",
            })

    return conflicts
