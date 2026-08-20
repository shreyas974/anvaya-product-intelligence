from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_ai_generate_requires_authentication():
    response = client.post(
        "/api/v1/ai/generate",
        json={"prompt": "Describe this industrial product."},
    )

    assert response.status_code == 401


def test_ai_generate_rejects_empty_prompt():
    with patch(
        "backend.api.v1.router.get_current_user",
        return_value={"sub": "test-user"},
    ):
        response = client.post(
            "/api/v1/ai/generate",
            json={"prompt": ""},
        )

    assert response.status_code == 422


def test_ai_generate_success():
    with patch(
        "backend.api.v1.router.get_current_user",
        return_value={"sub": "test-user"},
    ), patch(
        "backend.api.v1.router.generate_ai_response",
        new=AsyncMock(return_value="Industrial product description."),
    ):
        response = client.post(
            "/api/v1/ai/generate",
            json={
                "prompt": "Describe this industrial product."
            },
        )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["response"] == "Industrial product description."


def test_ai_generate_handles_service_failure():
    from fastapi import HTTPException

    with patch(
        "backend.api.v1.router.get_current_user",
        return_value={"sub": "test-user"},
    ), patch(
        "backend.api.v1.router.generate_ai_response",
        new=AsyncMock(
            side_effect=HTTPException(
                status_code=503,
                detail="AI service is not configured",
            )
        ),
    ):
        response = client.post(
            "/api/v1/ai/generate",
            json={"prompt": "Test AI"},
        )

    assert response.status_code == 503
    assert response.json()["detail"] == "AI service is not configured"
