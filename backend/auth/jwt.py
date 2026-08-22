from typing import Any

import jwt
from fastapi import HTTPException, status

from backend.core.config import settings


def verify_supabase_token(token: str) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)

        algorithm = header.get("alg")
        key_id = header.get("kid")

        if not algorithm or not key_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        jwks_url = (
            f"{settings.supabase_url.rstrip('/')}"
            "/auth/v1/.well-known/jwks.json"
        )

        jwks_client = jwt.PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        expected_issuer = f"{settings.supabase_url.rstrip('/')}/auth/v1"

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            issuer=expected_issuer,
            options={
                "verify_exp": True,
                "verify_aud": False,
            },
        )

    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from exc

    except jwt.InvalidIssuerError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        ) from exc

    except (
        jwt.InvalidTokenError,
        jwt.PyJWKClientError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    return payload
