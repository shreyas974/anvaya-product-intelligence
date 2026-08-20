from unittest.mock import patch

import pytest
from fastapi import HTTPException

from backend.auth.dependencies import get_current_user, require_roles
from backend.auth.roles import UserRole


def test_get_current_user_requires_credentials():
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(None)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Authentication required"


def test_get_current_user_rejects_non_bearer_scheme():
    credentials = type(
        "Credentials",
        (),
        {
            "scheme": "Basic",
            "credentials": "test-token",
        },
    )()

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid authentication scheme"


@patch("backend.auth.dependencies.verify_supabase_token")
def test_get_current_user_verifies_bearer_token(mock_verify):
    mock_verify.return_value = {
        "sub": "user-123",
        "app_metadata": {"role": "user"},
    }

    credentials = type(
        "Credentials",
        (),
        {
            "scheme": "Bearer",
            "credentials": "test-token",
        },
    )()

    result = get_current_user(credentials)

    assert result["sub"] == "user-123"
    mock_verify.assert_called_once_with("test-token")


def test_require_roles_rejects_missing_role():
    role_checker = require_roles(UserRole.ADMIN)

    with pytest.raises(HTTPException) as exc_info:
        role_checker({"sub": "user-123", "app_metadata": {}})

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "User role is not assigned"


def test_require_roles_rejects_insufficient_role():
    role_checker = require_roles(UserRole.ADMIN)

    with pytest.raises(HTTPException) as exc_info:
        role_checker(
            {
                "sub": "user-123",
                "app_metadata": {"role": "user"},
            }
        )

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Insufficient permissions"


def test_require_roles_accepts_allowed_role():
    role_checker = require_roles(UserRole.ENGINEER, UserRole.ADMIN)

    user = {
        "sub": "user-123",
        "app_metadata": {"role": "engineer"},
    }

    assert role_checker(user) == user
