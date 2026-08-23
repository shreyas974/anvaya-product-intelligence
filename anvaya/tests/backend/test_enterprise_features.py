"""
test_enterprise_features.py -- Tests for Product Truth, Benchmark Evaluation, Fittings Demo, and Conflict Detection
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.reference_data import (
    normalize_uom_string,
    normalize_fittings_spec,
    detect_catalog_conflicts,
    DECIMAL_FRACTION_MAP,
)


@pytest.fixture
def client():
    return TestClient(app)


def test_fraction_and_uom_normalization():
    # 24in -> 24 in
    norm, note, rule = normalize_uom_string("24in")
    assert norm == "24 in"
    assert rule == "Unilog Master UOM Standards"

    # Decimal to fraction: 0.5 in -> 1/2 in
    norm_dec, _, _ = normalize_uom_string("0.5in")
    assert norm_dec == "1/2 in"


def test_fittings_flagship_normalization():
    res = normalize_fittings_spec("3/8 CPLG BRS 150#")
    assert res["fitting_type"] == "Coupling"
    assert res["material"] == "Brass"
    assert res["size"] == "3/8 in"
    assert res["pressure_rating"] == "Class 150"
    assert len(res["evidence_trace"]) >= 4


def test_conflict_detection():
    conflicts = detect_catalog_conflicts("Rheem Manufacturing", None, "Frigidaire", "Water Heaters")
    assert len(conflicts) > 0
    assert conflicts[0]["conflict_type"] == "MANUFACTURER_BRAND_DISCREPANCY"


def test_fittings_endpoints(client):
    specs_res = client.get("/api/v1/fittings/specs")
    assert specs_res.status_code == 200
    assert "fitting_types" in specs_res.json()["data"]

    norm_res = client.post("/api/v1/fittings/normalize", json={"raw_text": "1/2 90 ELB SS 3000# NPT"})
    assert norm_res.status_code == 200
    data = norm_res.json()["data"]
    assert data["fitting_type"] == "90 Degree Elbow"
    assert data["material"] == "Stainless Steel"


def test_evaluation_endpoint(client):
    res = client.get("/api/v1/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "benchmark_summary" in data


def test_conflicts_endpoint(client):
    res = client.get("/api/v1/conflicts")
    assert res.status_code == 200
    assert "conflicts" in res.json()["data"]


def test_product_truth_layer_endpoint(client):
    # Ensure at least one product exists
    prods = client.get("/api/v1/products?page=1&page_size=1").json()
    items = prods.get("data", {}).get("items", [])
    if not items:
        # Upload a test dataset
        csv_content = b"Mfg_Part_Num,Part_Desc,E1_Brand\nDCB518ASTS06G,3M Cubitron II 5 in Grinding Disc,3M\n"
        upload_res = client.post(
            "/api/v1/datasets/upload",
            files={"file": ("test_catalog.csv", csv_content, "text/csv")},
        )
        assert upload_res.status_code == 200
        ds_id = upload_res.json()["data"]["id"]
        client.post(f"/api/v1/datasets/{ds_id}/process", json={})
        prods = client.get(f"/api/v1/products?dataset_id={ds_id}&page=1&page_size=1").json()
        items = prods["data"]["items"]

    prod_id = items[0]["id"]
    res = client.get(f"/api/v1/products/{prod_id}/truth")
    assert res.status_code == 200
    truth_data = res.json()["data"]
    assert "truth_fields" in truth_data
    assert "truth_score" in truth_data
    assert len(truth_data["truth_fields"]) > 0
    assert "decision_trace" in truth_data["truth_fields"][0]
