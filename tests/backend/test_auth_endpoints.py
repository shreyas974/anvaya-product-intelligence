from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_auth_oauth_google_login():
    response = client.post(
        "/api/v1/auth/oauth",
        json={
            "provider": "google",
            "email": "user.alex@gmail.com",
            "name": "Alex Mercer",
            "role": "ADMIN",
            "company": "Google Enterprise",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "token" in data
    assert data["user"]["email"] == "user.alex@gmail.com"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["provider"] == "google"


def test_auth_oauth_microsoft_login():
    response = client.post(
        "/api/v1/auth/oauth",
        json={
            "provider": "microsoft",
            "email": "sarah.chen@outlook.com",
            "name": "Sarah Chen",
            "role": "DATA_MANAGER",
            "company": "Microsoft 365",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["email"] == "sarah.chen@outlook.com"
    assert data["user"]["role"] == "DATA_MANAGER"
    assert data["user"]["provider"] == "microsoft"


def test_auth_oauth_github_login():
    response = client.post(
        "/api/v1/auth/oauth",
        json={
            "provider": "github",
            "email": "marcus-vance@github.com",
            "name": "Marcus Vance",
            "role": "REVIEWER",
            "company": "GitHub Developer Org",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["email"] == "marcus-vance@github.com"
    assert data["user"]["role"] == "REVIEWER"
    assert data["user"]["provider"] == "github"


def test_auth_oauth_invalid_provider():
    response = client.post(
        "/api/v1/auth/oauth",
        json={
            "provider": "unsupported_provider",
            "email": "test@domain.com",
        },
    )
    assert response.status_code == 400


def test_auth_register_and_me():
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Integration User",
            "email": "test_integration_user@anvaya.ai",
            "password": "securepassword123",
            "company": "Test Enterprise",
            "role": "DATA_MANAGER",
        },
    )
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert reg_data["status"] == "success"
    token = reg_data["token"]
    assert token is not None

    # Test /auth/me with Bearer token
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["status"] == "success"
    assert me_data["user"]["sub"] == "test_integration_user@anvaya.ai"
    assert me_data["user"]["app_metadata"]["role"] == "DATA_MANAGER"


def test_auth_logout():
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
