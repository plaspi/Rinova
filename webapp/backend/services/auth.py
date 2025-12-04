from fastapi import Header, HTTPException, Depends
from services.supabase_client import supabase
from models.exceptions import UnauthorizedException, ForbiddenException

def get_current_user(authorization: str = Header(None)):
    """
    Extract and validate the Supabase JWT, return user object.
    Raise unauthorized if anything fails.
    """

    if not authorization:
        raise UnauthorizedException("Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
    except Exception:
        raise UnauthorizedException("Invalid token")

    if not user or not user.get("user"):
        raise UnauthorizedException("Invalid or expired token")

    return user["user"]