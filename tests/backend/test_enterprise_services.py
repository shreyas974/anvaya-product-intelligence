"""
test_enterprise_services.py -- Comprehensive Unit Tests for Enterprise Backend Services

Tests:
1. Profiling service (Data health score, placeholder counts, role detection)
2. Content generator (Deterministic templates, character limit enforcement)
3. Delivery mapper (252-column mapping, export, validation)
4. Enrichment pipeline (Full 8-stage pipeline, provenance trace)
5. Ground truth evaluation benchmark (Dynamic metrics calculation)
6. AI provider registry (Fallback & availability checks)
"""

import os
import pandas as pd
import pytest
from pathlib import Path

from backend.services.profiling_service import profile_dataset, detect_column_role, count_placeholders
from backend.services.content_generator import (
    generate_invoice_description,
    generate_mobile_description,
    generate_short_description,
    generate_long_description,
    generate_retail_description,
    generate_all_content,
    validate_content_compliance,
)
from backend.services.delivery_mapper import (
    map_product_to_delivery_row,
    validate_delivery_row,
    export_delivery_format,
    DELIVERY_SCHEMA,
)
from backend.services.enrichment_pipeline import (
    clean_brand_field,
    detect_brand,
    classify_product,
    extract_attributes_and_provenance,
    enrich_product_record,
)
from backend.services.evaluation_service import run_benchmark_evaluation
from backend.services.ai_provider import get_available_providers, get_active_provider


# =========================================================================
# 1. Profiling Service Tests
# =========================================================================
def test_profiling_service_on_dataframe():
    df = pd.DataFrame({
        "Mfg_Part_Num": ["SKU100", "SKU101", "SKU102"],
        "Part_Desc": ["Diablo 1/2in Sanding Belt", "3M Cubitron Disc", "Milwaukee M18 Hammer Drill"],
        "Part_Manuf": ["Freud Inc", "3M Company", "Milwaukee"],
        "E1_Brand": ["-- Unbranded --", "3M", "-- No DIB Brand --"],
    })
    report = profile_dataset(df=df, dataset_name="test_catalog")
    assert report["status"] == "success"
    assert report["file_stats"]["rows"] == 3
    assert report["file_stats"]["columns"] == 4
    assert report["health_score"] > 0
    assert report["summary"]["total_placeholders"] == 2


def test_detect_column_role():
    role, conf = detect_column_role("mfg_part_num")
    assert role == "manufacturer_part_number"
    assert conf >= 0.85

    role, conf = detect_column_role("part_desc")
    assert role == "description"
    assert conf >= 0.85


# =========================================================================
# 2. Content Generator Tests
# =========================================================================
def test_content_generator_invoice_desc():
    res = generate_invoice_description(
        product_name="Dishwasher",
        mounting_type="Leg",
        wash_cycles="5",
        material="Stainless Steel",
        voltage="120 V",
        amperage="15 A",
    )
    assert res["compliant"] is True
    assert res["char_count"] <= 40
    assert "SST" in res["value"]
    assert "DISHWASHER" in res["value"]


def test_content_generator_all_fields():
    data = {
        "product_name": "Dishwasher",
        "brand_name": "Frigidaire",
        "manufacturer_name": "Rheem Manufacturing",
        "series": "Professional Series",
        "mpn": "PDSH4816AF",
        "mounting_type": "Leg",
        "material": "Stainless Steel",
        "voltage": "120 V",
        "amperage": "15 A",
    }
    content = generate_all_content(data)
    assert "INVOICE_DESC" in content
    assert "MOBILE_DESC" in content
    assert "SHORT_DESC" in content
    assert "LONG_DESC1" in content
    assert "RETAIL_DESC" in content

    compliance = validate_content_compliance(content)
    assert compliance["compliance_rate"] == 100.0


# =========================================================================
# 3. Delivery Mapper Tests
# =========================================================================
def test_delivery_mapper_structure():
    assert len(DELIVERY_SCHEMA) == 252

    prod = {
        "mfg_part_num": "DCB518ASTS06G",
        "part_desc": "Diablo 1/2in Sanding Belt",
        "canonical_brand": "Diablo",
        "manufacturer_name": "Freud Inc",
        "category": "Abrasives",
        "subcategory": "Sanding Belts",
        "product_type": "Sanding Belt",
    }
    row = map_product_to_delivery_row(prod, attributes=[{"label": "Grit", "value": "P80", "uom": "Grit"}])
    assert row["Mfg_Part_Num"] == "DCB518ASTS06G"
    assert row["BRAND_NAME"] == "Diablo"
    assert row["ATTRIBUTE_LABEL 1"] == "Grit"
    assert row["ATTRIBUTE_VALUE 1"] == "P80"


def test_delivery_export_in_memory():
    prod = {
        "mfg_part_num": "TEST1",
        "canonical_brand": "Diablo",
        "manufacturer_name": "Freud",
        "category": "Abrasives",
    }
    row = map_product_to_delivery_row(prod)
    result = export_delivery_format([row], output_path=None, format="csv")
    assert result["status"] == "success"
    assert result["export_summary"]["total_rows"] == 1
    assert result["export_summary"]["total_columns"] == 252


# =========================================================================
# 4. Enrichment Pipeline Tests
# =========================================================================
def test_enrich_product_record():
    raw = {
        "mfg_part_num": "DCB518ASTS06G",
        "part_desc": 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc P80',
        "part_manuf": "Freud Inc (2435)",
        "e1_brand": "-- Unbranded --",
        "unilog_brand": "-- No Unilog Brand --",
        "dib_brand": "-- No DIB Brand --",
    }
    enriched = enrich_product_record(raw)
    assert enriched["canonical_brand"] == "Diablo"
    assert enriched["category"] == "Abrasives"
    assert enriched["subcategory"] == "Sanding Belts"
    assert "Dimensions" in enriched["attributes"]
    assert "Grit Rating" in enriched["attributes"]
    assert enriched["attributes"]["Grit Rating"] == "P80"
    assert enriched["confidence_score"] >= 80.0
    assert len(enriched["provenance_records"]) >= 4


# =========================================================================
# 5. Ground Truth Evaluation Tests
# =========================================================================
def test_benchmark_evaluation_calculation():
    result = run_benchmark_evaluation()
    assert result["status"] == "success"
    summary = result["benchmark_summary"]
    # Check that real numbers are calculated
    assert summary["total_benchmark_records"] == 2
    assert "overall_field_accuracy" in summary
    assert "character_limit_compliance" in summary
    assert summary["character_limit_compliance"] == 100.0


# =========================================================================
# 6. AI Provider Registry Tests
# =========================================================================
def test_ai_provider_registry():
    providers = get_available_providers()
    assert len(providers) >= 4
    names = [p["name"] for p in providers]
    assert "Google Gemini" in names
    assert "Groq Cloud" in names
    assert "OpenRouter" in names
    assert "Ollama (Local)" in names
