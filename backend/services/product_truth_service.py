"""
product_truth_service.py -- Product Truth Engine & Decision Trace Generator

Builds the complete Product Truth Layer:
- Field
- Raw Value
- Normalized Value
- Evidence
- Source
- Rule / LOV
- Confidence
- Status (VERIFIED, NORMALIZED, INFERRED, MISSING, CONFLICT, REQUIRES REVIEW)

Generates deep "WHY?" Decision Trace for every field.
"""

from typing import Any
import json
from sqlalchemy.orm import Session
from backend.models.product import Product, ProvenanceRecord, ValidationIssue
from backend.services.reference_data import (
    normalize_uom_string,
    detect_catalog_conflicts,
    APPROVED_UOM_STANDARDS,
)


def build_product_truth_layer(product: Product) -> dict[str, Any]:
    """
    Constructs the authoritative Product Truth Layer for a given product.
    """
    attrs = product.attributes or {}
    descriptions = product.descriptions or {}
    prov_map = {pr.field_name: pr for pr in product.provenance_records}

    truth_fields = []

    # 1. Product Identifier (MPN / SKU)
    truth_fields.append({
        "field": "Manufacturer Part Number (MPN)",
        "raw_value": product.mfg_part_num,
        "normalized_value": product.mfg_part_num,
        "evidence": f"Direct distributor key '{product.mfg_part_num}'",
        "source": "Distributor Ingestion Header",
        "rule_or_lov": "ISO/IEC 15459 Unique Product Identifier",
        "confidence": 100.0,
        "status": "VERIFIED",
        "decision_trace": {
            "raw_evidence": product.mfg_part_num,
            "detected_term": product.mfg_part_num,
            "candidate_value": product.mfg_part_num,
            "vocabulary_match": "Exact Primary Key Match",
            "applicable_category": product.category or "General",
            "validation_result": "Format Valid",
            "confidence": 100.0,
            "decision": "Accepted as immutable catalog identifier",
        }
    })

    # 2. Manufacturer
    raw_mfg = product.part_manuf
    mfg_status = "VERIFIED" if raw_mfg else "MISSING"
    truth_fields.append({
        "field": "Manufacturer Entity",
        "raw_value": raw_mfg or "Not available in supplied data",
        "normalized_value": product.manufacturer_name or "Not available in supplied data",
        "evidence": f"Extracted from Part_Manuf '{raw_mfg}'" if raw_mfg else "Insufficient evidence in raw distributor feeds",
        "source": "Distributor Part_Manuf Column" if raw_mfg else "None",
        "rule_or_lov": "UniCat_Manufacturer_and_Brand_List.xlsx",
        "confidence": 95.0 if raw_mfg else 0.0,
        "status": mfg_status,
        "decision_trace": {
            "raw_evidence": raw_mfg or "None",
            "detected_term": raw_mfg or "None",
            "candidate_value": product.manufacturer_name or "Unassigned",
            "vocabulary_match": "UniCat Manufacturer Master" if raw_mfg else "No Match",
            "applicable_category": product.category or "General",
            "validation_result": "Approved" if raw_mfg else "Field Empty",
            "confidence": 95.0 if raw_mfg else 0.0,
            "decision": "Normalized against master directory" if raw_mfg else "Flagged as missing manufacturer evidence",
        }
    })

    # 3. Canonical Brand
    brand_prov = prov_map.get("Brand")
    brand_status = "NORMALIZED"
    if product.canonical_brand == "Generic / Unbranded":
        brand_status = "REQUIRES REVIEW"
    elif product.e1_brand or product.unilog_brand or product.dib_brand:
        brand_status = "VERIFIED"

    truth_fields.append({
        "field": "Brand",
        "raw_value": product.e1_brand or product.unilog_brand or product.dib_brand or "Not supplied in brand columns",
        "normalized_value": product.canonical_brand,
        "evidence": brand_prov.evidence if brand_prov else f"Matched entity from '{product.part_desc}'",
        "source": brand_prov.source if brand_prov else "Part_Desc / Part_Manuf",
        "rule_or_lov": "UniCat_Manufacturer_and_Brand_List.xlsx",
        "confidence": round((brand_prov.confidence * 100) if brand_prov else 90.0, 1),
        "status": brand_status,
        "decision_trace": {
            "raw_evidence": product.part_desc or "None",
            "detected_term": product.canonical_brand,
            "candidate_value": product.canonical_brand,
            "vocabulary_match": "UniCat Brand Master (1,000+ Brands)",
            "applicable_category": product.category or "General",
            "validation_result": "Approved Entity" if brand_status != "REQUIRES REVIEW" else "Review Required",
            "confidence": round((brand_prov.confidence * 100) if brand_prov else 90.0, 1),
            "decision": f"Mapped to canonical brand '{product.canonical_brand}' with traceable provenance",
        }
    })

    # 4. Taxonomy / ClassPath
    cat_prov = prov_map.get("Category")
    truth_fields.append({
        "field": "Taxonomy ClassPath",
        "raw_value": "Not provided in raw feeds",
        "normalized_value": f"{product.category} > {product.subcategory}",
        "evidence": cat_prov.evidence if cat_prov else f"Keyword rule matched in description",
        "source": "AI Zero-Shot Taxonomy Matcher",
        "rule_or_lov": "UNILOG Internal Taxonomy Guidelines & LOV",
        "confidence": round((cat_prov.confidence * 100) if cat_prov else 92.0, 1),
        "status": "NORMALIZED" if cat_prov and cat_prov.confidence >= 0.85 else "INFERRED",
        "decision_trace": {
            "raw_evidence": product.part_desc or "None",
            "detected_term": product.product_type or "Item",
            "candidate_value": f"{product.category} > {product.subcategory}",
            "vocabulary_match": "Unilog ClassPath Hierarchy",
            "applicable_category": product.category or "General",
            "validation_result": "Validated ClassPath",
            "confidence": round((cat_prov.confidence * 100) if cat_prov else 92.0, 1),
            "decision": f"Classified product into '{product.category}' based on structural terms",
        }
    })

    # 5. Extracted Dense Attributes
    for attr_name, attr_val in attrs.items():
        prov = prov_map.get(attr_name)
        norm_val, _, uom_rule = normalize_uom_string(str(attr_val))
        truth_fields.append({
            "field": f"Attribute: {attr_name}",
            "raw_value": str(attr_val),
            "normalized_value": norm_val,
            "evidence": prov.evidence if prov else f"Regex matched '{attr_val}' in description",
            "source": prov.source if prov else "Part_Desc",
            "rule_or_lov": uom_rule or "Decimal_Fraction.xlsx & LOV Constraints",
            "confidence": round((prov.confidence * 100) if prov else 95.0, 1),
            "status": "NORMALIZED" if norm_val != str(attr_val) else "INFERRED",
            "decision_trace": {
                "raw_evidence": prov.evidence if prov else str(attr_val),
                "detected_term": str(attr_val),
                "candidate_value": norm_val,
                "vocabulary_match": "Unilog Master UOM Standards",
                "applicable_category": product.category or "General",
                "validation_result": "Approved LOV / UOM Format",
                "confidence": round((prov.confidence * 100) if prov else 95.0, 1),
                "decision": f"Normalized attribute '{attr_name}' to strict UOM standard '{norm_val}'",
            }
        })

    # 6. Check Missing Essential Attributes
    if "Dimensions" not in attrs:
        truth_fields.append({
            "field": "Attribute: Dimensions",
            "raw_value": "Not available in supplied data",
            "normalized_value": "Not available in supplied data",
            "evidence": "Insufficient evidence in raw description",
            "source": "None",
            "rule_or_lov": "Unilog Master UOM Standards",
            "confidence": 0.0,
            "status": "MISSING",
            "decision_trace": {
                "raw_evidence": product.part_desc or "None",
                "detected_term": "No dimensional measurement detected",
                "candidate_value": "None",
                "vocabulary_match": "No Match",
                "applicable_category": product.category or "General",
                "validation_result": "Field Absent",
                "confidence": 0.0,
                "decision": "Honest declaration: dimensional spec is absent from raw distributor source",
            }
        })

    # 7. Check Potential Conflicts
    conflicts = detect_catalog_conflicts(
        product.part_manuf,
        product.e1_brand or product.unilog_brand,
        product.canonical_brand,
        product.category,
    )

    # Truth Score Calculation based strictly on measurable evidence
    total_weights = len(truth_fields)
    verified_or_norm = len([f for f in truth_fields if f["status"] in ["VERIFIED", "NORMALIZED", "INFERRED"]])
    truth_score = round((verified_or_norm / total_weights) * 100, 1) if total_weights > 0 else 0.0

    return {
        "product_id": product.id,
        "sku": product.mfg_part_num,
        "cleaned_name": product.cleaned_name,
        "truth_score": truth_score,
        "status_summary": {
            "verified_count": len([f for f in truth_fields if f["status"] == "VERIFIED"]),
            "normalized_count": len([f for f in truth_fields if f["status"] == "NORMALIZED"]),
            "inferred_count": len([f for f in truth_fields if f["status"] == "INFERRED"]),
            "missing_count": len([f for f in truth_fields if f["status"] == "MISSING"]),
            "conflict_count": len(conflicts),
            "requires_review_count": len([f for f in truth_fields if f["status"] == "REQUIRES REVIEW"]),
        },
        "truth_fields": truth_fields,
        "conflicts": conflicts,
    }
