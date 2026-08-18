
from fastapi import HTTPException, status

def require_authentication() -> None:
    """
    Authentication dependency.

    Supabase authentication will be integrated here.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication is not configured yet",
    )