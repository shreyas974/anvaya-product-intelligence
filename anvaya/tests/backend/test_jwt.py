from unittest.mock import patch

import jwt
import pytest
from fastapi import HTTPException

from backend.core.config import settings
from backend.auth.jwt import verify_supabase_token


def test_jwt_rejects_invalid_token():
    with pytest.raises(HTTPException) as exc_info:
        verify_supabase_token("invalid-token")

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid authentication token"


@patch("backend.auth.jwt.jwt.PyJWKClient")
def test_jwt_verifies_supabase_token(mock_jwk_client):
    token = jwt.encode(
        {
            "sub": "user-123",
            "exp": 4102444800,
            "iss": f"{settings.supabase_url.rstrip('/')}/auth/v1",
        },
        "test-secret",
        algorithm="HS256",
        headers={"kid": "test-key"},
    )

    mock_key = mock_jwk_client.return_value.get_signing_key_from_jwt.return_value
    mock_key.key = "test-secret"

    result = verify_supabase_token(token)

    assert result["sub"] == "user-123"


def test_jwt_rejects_token_without_subject():
    token = jwt.encode(
        {"exp": 4102444800},
        "test-secret",
        algorithm="HS256",
        headers={"kid": "test-key"},
    )

    with patch("backend.auth.jwt.jwt.PyJWKClient") as mock_jwk_client:
        mock_key = mock_jwk_client.return_value.get_signing_key_from_jwt.return_value
        mock_key.key = "test-secret"

        with pytest.raises(HTTPException) as exc_info:
            verify_supabase_token(token)

    assert exc_info.value.status_code == 401
