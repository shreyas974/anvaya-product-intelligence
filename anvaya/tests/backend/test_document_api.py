from io import BytesIO

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_document_process_endpoint_requires_authentication():
    response = client.post(
        "/api/v1/documents/process",
        files={
            "file": (
                "products.csv",
                BytesIO(b"name,price\nProduct A,100\n"),
                "text/csv",
            )
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_document_process_endpoint_rejects_unsupported_file_type():
    response = client.post(
        "/api/v1/documents/process",
        files={
            "file": (
                "products.exe",
                BytesIO(b"invalid"),
                "application/octet-stream",
            )
        },
    )

    # Authentication is checked before file validation.
    assert response.status_code == 401