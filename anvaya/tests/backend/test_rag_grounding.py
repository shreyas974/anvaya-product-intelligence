import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_test_dataset():
    # Upload and process a test catalog for RAG grounding tests
    csv_content = (
        b"Mfg_Part_Num,Part_Desc,E1_Brand\n"
        b"DCB518ASTS06G,3M Cubitron II 5 in x 7/8 in 36+ Grit Quick Change Sanding Disc,3M\n"
        b"9A-125-080,Mirka Abranet 5 in Mesh Sanding Grip Disc 80 Grit,Mirka\n"
        b"D0724R,Diablo 7-1/4 in x 24T Framing Circular Saw Blade,Diablo\n"
    )
    upload_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("rag_test_catalog.csv", csv_content, "text/csv")},
    )
    assert upload_res.status_code == 200
    ds_id = upload_res.json()["data"]["id"]
    proc_res = client.post(f"/api/v1/datasets/{ds_id}/process", json={})
    assert proc_res.status_code == 200
    return ds_id


def test_copilot_anti_hallucination_guardrail():
    # Ask for a spec that does not exist in the abrasive/cutting tool dataset
    response = client.post(
        "/api/v1/copilot/query",
        json={"query": "What is the pressure rating and voltage for DCB518ASTS06G?"},
    )
    assert response.status_code == 200
    data = response.json()["data"]

    answer = data["answer"]
    assert "does not provide" in answer.lower()
    assert "pressure" in answer.lower() or "voltage" in answer.lower()
    assert len(data["citations"]) > 0


def test_copilot_grounded_brand_search():
    response = client.post(
        "/api/v1/copilot/query",
        json={"query": "Show 3M products"},
    )
    assert response.status_code == 200
    data = response.json()["data"]

    assert "3M" in data["answer"]
    assert len(data["citations"]) > 0


def test_review_queue_and_actions():
    # Get review queue
    q_resp = client.get("/api/v1/reviews?status_filter=PENDING")
    assert q_resp.status_code == 200
    reviews = q_resp.json()["data"]["items"]

    if len(reviews) > 0:
        first_review = reviews[0]
        review_id = first_review["id"]

        # Test Edit action
        edit_resp = client.post(
            f"/api/v1/reviews/{review_id}/edit",
            json={
                "action": "edit",
                "field_name": first_review["field_name"] or "Brand",
                "new_value": "Verified Brand Master",
                "reviewer_notes": "Manually verified by human catalog architect",
            },
        )
        assert edit_resp.status_code == 200
        assert edit_resp.json()["status"] == "success"
