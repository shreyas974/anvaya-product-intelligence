from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import HTTPException, status

from backend.core.config import settings


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": int(expire.timestamp())})
    if "sub" not in to_encode and "email" in to_encode:
        to_encode["sub"] = to_encode["email"]
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def verify_supabase_token(token: str) -> dict[str, Any]:
    # 1. First attempt direct HS256 decode with local secret_key
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            options={"verify_exp": True, "verify_aud": False},
        )
        if payload.get("sub"):
            return payload
    except Exception:
        pass

    # 2. Fall back to Supabase PyJWKClient validation
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
