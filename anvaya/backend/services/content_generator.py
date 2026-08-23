"""
content_generator.py -- Deterministic Content Generation Engine for ANVAYA

Generates compliant product content from structured facts + templates:
- Invoice Description (uppercase, abbreviated, max 40 chars)
- Mobile Description (Brand, ProductType, Series, MPN, max 100 chars)
- Short Description (Brand + Series + MPN + ProductType + key attrs, max 150 chars)
- Long Description (Full attribute listing with UOM, max 500 chars)
- Retail Description (Series + ProductType + key attrs, max 150 chars)

All content is template-based deterministic generation.
No LLM required.
Every generated field has provenance (template + structured facts).
"""

import re
import logging
from typing import Any

logger = logging.getLogger("anvaya.content_generator")

# Character limits from Unilog Content Guidelines
CHAR_LIMITS = {
    "INVOICE_DESC": 40,
    "MOBILE_DESC": 100,
    "SHORT_DESC": 150,
    "LONG_DESC1": 500,
    "RETAIL_DESC": 150,
    "MARKETING_DESCRIPTION": 1000,
}

# Abbreviation map for invoice descriptions (uppercase, compressed)
INVOICE_ABBREVIATIONS = {
    "Stainless Steel": "SST",
    "stainless steel": "SST",
    "Built-in": "BLTLN",
    "built-in": "BLTLN",
    "Leg": "LEG",
    "Professional": "PRO",
    "Dishwasher": "DISHWASHER",
    "Refrigerator": "REFRIG",
    "Freezer": "FRZR",
    "Washing Machine": "WASHER",
    "Dryer": "DRYER",
    "Mounting": "MTG",
    "Coupling": "CPLG",
    "Elbow": "ELB",
    "Nipple": "NIP",
    "Bushing": "BUSH",
    "Brass": "BRS",
    "Carbon Steel": "CS",
    "Malleable Iron": "MI",
    "Copper": "CU",
    "Galvanized": "GALV",
}


def abbreviate_for_invoice(text: str) -> str:
    """Apply abbreviation rules for invoice descriptions."""
    result = text
    for full, abbr in INVOICE_ABBREVIATIONS.items():
        result = re.sub(re.escape(full), abbr, result, flags=re.IGNORECASE)
    return result.upper()


def truncate_with_ellipsis(text: str, max_len: int) -> str:
    """Truncate text to max length without breaking words."""
    if len(text) <= max_len:
        return text
    truncated = text[:max_len - 3].rsplit(" ", 1)[0]
    return truncated + "..."


def generate_invoice_description(
    product_name: str,
    mounting_type: str | None = None,
    wash_cycles: str | None = None,
    material: str | None = None,
    voltage: str | None = None,
    amperage: str | None = None,
    size: str | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Generate invoice description: uppercase, abbreviated, max 40 chars.
    Pattern: PRODUCT MOUNT CYCLES MATERIAL VOLTAGE AMPERAGE SIZE
    """
    parts = [abbreviate_for_invoice(product_name)]

    if mounting_type:
        parts.append(abbreviate_for_invoice(mounting_type))
    if wash_cycles:
        parts.append(str(int(float(wash_cycles))) if wash_cycles.replace(".", "").isdigit() else wash_cycles)
    if material:
        parts.append(abbreviate_for_invoice(material))
    if voltage:
        v = str(voltage).replace(" V", "V").replace(" v", "V")
        if not v.endswith("V"):
            v += "V"
        parts.append(v)
    if amperage:
        a = str(amperage).replace(" A", "A").replace(" a", "A")
        if not a.endswith("A"):
            a += "A"
        parts.append(a)
    if size:
        # Extract compact dimension
        size_compact = re.sub(r"\s+in\b", "IN", str(size))
        if len(size_compact) < 15:
            parts.append(size_compact)

    raw = " ".join(parts).upper()
    final = truncate_with_ellipsis(raw, CHAR_LIMITS["INVOICE_DESC"])

    return {
        "value": final,
        "char_count": len(final),
        "char_limit": CHAR_LIMITS["INVOICE_DESC"],
        "compliant": len(final) <= CHAR_LIMITS["INVOICE_DESC"],
        "template": "PRODUCT MOUNT CYCLES MATERIAL VOLTAGE AMPERAGE SIZE",
        "method": "deterministic_template",
    }


def generate_mobile_description(
    manufacturer_name: str | None = None,
    brand_name: str | None = None,
    product_name: str | None = None,
    series: str | None = None,
    mpn: str | None = None,
    mounting_type: str | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Generate mobile description: Brand, ProductType, Series, MPN, max 100 chars.
    Pattern: Manufacturer Brand, ProductType, Series, MPN[, MountingType]
    """
    parts = []
    if manufacturer_name and brand_name and manufacturer_name.lower() != brand_name.lower().replace("®", "").replace("Ar", "").strip().lower():
        parts.append(f"{manufacturer_name} {brand_name}")
    elif brand_name:
        parts.append(str(brand_name))
    elif manufacturer_name:
        parts.append(str(manufacturer_name))

    if product_name:
        parts.append(str(product_name))
    if series:
        parts.append(str(series))
    if mpn:
        parts.append(str(mpn))
    if mounting_type:
        parts.append(f"{mounting_type} Mounting")

    raw = ", ".join(parts)
    final = truncate_with_ellipsis(raw, CHAR_LIMITS["MOBILE_DESC"])

    return {
        "value": final,
        "char_count": len(final),
        "char_limit": CHAR_LIMITS["MOBILE_DESC"],
        "compliant": len(final) <= CHAR_LIMITS["MOBILE_DESC"],
        "template": "Manufacturer Brand, ProductType, Series, MPN",
        "method": "deterministic_template",
    }


def generate_short_description(
    brand_name: str | None = None,
    series: str | None = None,
    mpn: str | None = None,
    product_name: str | None = None,
    mounting_type: str | None = None,
    material: str | None = None,
    color: str | None = None,
    with_features: str | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Generate short description: Brand Series MPN ProductType, Mounting, Material, Color.
    Max 150 chars.
    """
    header_parts = []
    if brand_name:
        header_parts.append(str(brand_name))
    if series:
        header_parts.append(str(series))
    if mpn:
        header_parts.append(str(mpn))
    if product_name:
        header_parts.append(str(product_name))

    header = " ".join(header_parts)

    suffix_parts = []
    if with_features:
        suffix_parts.append(f"With {with_features}")
    if mounting_type:
        suffix_parts.append(f"{mounting_type} Mounting")
    if material:
        suffix_parts.append(str(material))
    if color and color != material:
        suffix_parts.append(str(color))

    suffix = ", ".join(suffix_parts)
    raw = f"{header}, {suffix}" if suffix else header
    final = truncate_with_ellipsis(raw, CHAR_LIMITS["SHORT_DESC"])

    return {
        "value": final,
        "char_count": len(final),
        "char_limit": CHAR_LIMITS["SHORT_DESC"],
        "compliant": len(final) <= CHAR_LIMITS["SHORT_DESC"],
        "template": "Brand Series MPN ProductType, Mounting, Material, Color",
        "method": "deterministic_template",
    }


def generate_long_description(
    brand_name: str | None = None,
    product_name: str | None = None,
    series: str | None = None,
    attributes: dict[str, Any] | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Generate long description with full attribute listing.
    Pattern: Brand ProductType, Series, Attr1 Value UOM, Attr2 Value UOM, ...
    Max 500 chars.
    """
    header_parts = []
    if brand_name:
        header_parts.append(str(brand_name))
    if product_name:
        header_parts.append(str(product_name))

    header = " ".join(header_parts)

    attr_parts = []
    if series:
        attr_parts.append(f"Series: {series}")

    if attributes:
        for label, val_info in attributes.items():
            if label in ("Series", "Model", "Product Name"):
                continue
            if isinstance(val_info, dict):
                val = val_info.get("value", "")
                uom = val_info.get("uom", "")
            else:
                val = str(val_info)
                uom = ""

            if val and str(val) != "nan":
                if uom and str(uom) != "nan":
                    attr_parts.append(f"{val} {uom} {label}")
                else:
                    attr_parts.append(f"{label}: {val}")

    suffix = ", ".join(attr_parts)
    raw = f"{header}, {suffix}" if suffix else header
    final = truncate_with_ellipsis(raw, CHAR_LIMITS["LONG_DESC1"])

    return {
        "value": final,
        "char_count": len(final),
        "char_limit": CHAR_LIMITS["LONG_DESC1"],
        "compliant": len(final) <= CHAR_LIMITS["LONG_DESC1"],
        "template": "Brand ProductType, Series, Attributes with UOM",
        "method": "deterministic_template",
    }


def generate_retail_description(
    series: str | None = None,
    product_name: str | None = None,
    mounting_type: str | None = None,
    material: str | None = None,
    color: str | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Generate retail description: Series ProductType, Mounting, Material, Color.
    Max 150 chars.
    """
    parts = []
    if series:
        parts.append(f"{series} {product_name}" if product_name else str(series))
    elif product_name:
        parts.append(str(product_name))

    suffix_parts = []
    if mounting_type:
        suffix_parts.append(f"{mounting_type} Mounting")
    if material:
        suffix_parts.append(str(material))
    if color and color != material:
        suffix_parts.append(str(color))

    suffix = ", ".join(suffix_parts)
    raw = f"{', '.join(parts)}, {suffix}" if suffix else ", ".join(parts)
    final = truncate_with_ellipsis(raw, CHAR_LIMITS["RETAIL_DESC"])

    return {
        "value": final,
        "char_count": len(final),
        "char_limit": CHAR_LIMITS["RETAIL_DESC"],
        "compliant": len(final) <= CHAR_LIMITS["RETAIL_DESC"],
        "template": "Series ProductType, Mounting, Material, Color",
        "method": "deterministic_template",
    }


def generate_all_content(
    product_data: dict[str, Any],
    attributes: dict[str, Any] | None = None,
) -> dict[str, dict[str, Any]]:
    """
    Generate all content fields for a product record.
    Returns dict of field_name -> {value, char_count, char_limit, compliant, template, method}.
    """
    return {
        "INVOICE_DESC": generate_invoice_description(
            product_name=product_data.get("product_name", ""),
            mounting_type=product_data.get("mounting_type"),
            wash_cycles=product_data.get("wash_cycles"),
            material=product_data.get("material"),
            voltage=product_data.get("voltage"),
            amperage=product_data.get("amperage"),
            size=product_data.get("size"),
        ),
        "MOBILE_DESC": generate_mobile_description(
            manufacturer_name=product_data.get("manufacturer_name"),
            brand_name=product_data.get("brand_name"),
            product_name=product_data.get("product_name"),
            series=product_data.get("series"),
            mpn=product_data.get("mpn"),
            mounting_type=product_data.get("mounting_type"),
        ),
        "SHORT_DESC": generate_short_description(
            brand_name=product_data.get("brand_name"),
            series=product_data.get("series"),
            mpn=product_data.get("mpn"),
            product_name=product_data.get("product_name"),
            mounting_type=product_data.get("mounting_type"),
            material=product_data.get("material"),
            color=product_data.get("color"),
            with_features=product_data.get("with_features"),
        ),
        "LONG_DESC1": generate_long_description(
            brand_name=product_data.get("brand_name"),
            product_name=product_data.get("product_name"),
            series=product_data.get("series"),
            attributes=attributes,
        ),
        "RETAIL_DESC": generate_retail_description(
            series=product_data.get("series"),
            product_name=product_data.get("product_name"),
            mounting_type=product_data.get("mounting_type"),
            material=product_data.get("material"),
            color=product_data.get("color"),
        ),
    }


def validate_content_compliance(content: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """
    Validate all generated content against character limits and formatting rules.
    Returns compliance summary.
    """
    total_fields = len(content)
    compliant_fields = sum(1 for f in content.values() if f.get("compliant", False))
    violations = []

    for field_name, field_data in content.items():
        if not field_data.get("compliant", False):
            violations.append({
                "field": field_name,
                "char_count": field_data.get("char_count", 0),
                "char_limit": field_data.get("char_limit", 0),
                "overflow": field_data.get("char_count", 0) - field_data.get("char_limit", 0),
            })

    return {
        "total_fields": total_fields,
        "compliant_fields": compliant_fields,
        "compliance_rate": round((compliant_fields / total_fields) * 100, 1) if total_fields > 0 else 100.0,
        "violations": violations,
        "status": "COMPLIANT" if compliant_fields == total_fields else "VIOLATIONS_FOUND",
    }
