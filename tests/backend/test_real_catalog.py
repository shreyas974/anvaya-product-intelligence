import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.seeding_service import seed_database_from_csv
from backend.db.database import SessionLocal, engine, Base

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    seed_database_from_csv(force=False)


def test_dashboard_overview_returns_real_calculated_kpis():
    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    kpis = data["data"]["kpis"]
    assert kpis["total_products"] >= 1000
    assert kpis["enriched_count"] >= 1000
    assert kpis["avg_completeness_score"] > 0
    assert kpis["avg_confidence_score"] > 0
    assert len(data["data"]["categories_distribution"]) > 0
    assert len(data["data"]["brands_distribution"]) > 0


def test_products_list_supports_search_and_pagination():
    response = client.get("/api/v1/products?page=1&page_size=10&search=3M")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    items = data["data"]["items"]
    assert len(items) <= 10
    for item in items:
        assert "3M" in item["canonical_brand"] or "3M" in item["mfg_part_num"] or "3M" in (item["part_desc"] or "")


def test_product_detail_includes_provenance_and_validation():
    # Fetch first product
    list_resp = client.get("/api/v1/products?page=1&page_size=1")
    first_id = list_resp.json()["data"]["items"][0]["id"]

    response = client.get(f"/api/v1/products/{first_id}")
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["id"] == first_id
    assert "raw" in data
    assert "enriched" in data
    assert "provenance" in data
    assert len(data["provenance"]) > 0
    assert "confidence" in data["scores"]


def test_data_quality_returns_5_dimensions():
    response = client.get("/api/v1/data-quality")
    assert response.status_code == 200
    data = response.json()["data"]

    assert "overall_quality_score" in data
    assert len(data["dimensions"]) == 5
    dim_names = [d["name"] for d in data["dimensions"]]
    assert "Completeness" in dim_names
    assert "Consistency" in dim_names
    assert "Uniqueness" in dim_names
    assert "Freshness" in dim_names
    assert "Accuracy" in dim_names
