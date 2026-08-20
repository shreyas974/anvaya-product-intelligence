from io import BytesIO
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from backend.auth.dependencies import get_current_user
from backend.main import app


client = TestClient(app)


def test_pipeline_requires_authentication():
    response = client.post(
        "/api/v1/documents/pipeline",
        files={
            "file": (
                "products.csv",
                BytesIO(b"name,price\nProduct A,100\n"),
                "text/csv",
            )
        },
    )

    assert response.status_code == 401


def test_pipeline_completes_with_mocked_ai_service():
    app.dependency_overrides[get_current_user] = (
        lambda: {"sub": "test-user"}
    )

    try:
        with patch(
            "backend.api.v1.router.run_document_pipeline",
            new=AsyncMock(
                return_value={
                    "file_type": "csv",
                    "source_file": "products.csv",
                    "rows": 1,
                    "columns": ["name", "price"],
                    "data": [
                        {"name": "Product A", "price": 100}
                    ],
                    "evidence": [],
                    "ai_response": "Product summary",
                    "pipeline_status": "completed",
                }
            ),
        ):
            response = client.post(
                "/api/v1/documents/pipeline",
                files={
                    "file": (
                        "products.csv",
                        BytesIO(b"name,price\nProduct A,100\n"),
                        "text/csv",
                    )
                },
            )

        assert response.status_code == 200

        data = response.json()

        assert data["pipeline_status"] == "completed"
        assert data["ai_response"] == "Product summary"
        assert data["file_type"] == "csv"
        assert data["source_file"] == "products.csv"

    finally:
        app.dependency_overrides.clear()
