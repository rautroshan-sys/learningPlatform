"""
app/core/auth.py
Verifies Supabase session JWT tokens.
Raises 401 AppError for missing/invalid/expired tokens.
"""
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.errors import AppError

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency. Returns decoded JWT payload (includes sub = user UUID).
    Raises 401 if token is missing or invalid.
    """
    if credentials is None:
        raise AppError(401, "unauthorized", "Missing Authorization header.")

    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase tokens don't set aud consistently
        )
    except jwt.ExpiredSignatureError:
        raise AppError(401, "token_expired", "Token has expired.")
    except jwt.InvalidTokenError as exc:
        raise AppError(401, "invalid_token", f"Invalid token: {exc}")

    return payload
