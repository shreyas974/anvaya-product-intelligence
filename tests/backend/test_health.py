import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_health():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "ANVAYA Backend is running",
    }
