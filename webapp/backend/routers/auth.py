from fastapi import APIRouter, Depends
from pydantic import BaseModel
from services.supabase_client import supabase
from models.exceptions import BadRequestException, UnauthorizedException
from services.auth import get_current_user

router = APIRouter()

class SignUpPayload(BaseModel):
    email: str
    password: str
    name: str
    surname: str
    ssn: str
    phone: str
    address: str

class SignInPayload(BaseModel):
    email: str
    password: str

@router.post("/signup")
def sign_up(payload: SignUpPayload):
    try:
        result = supabase.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {
                    "data": {
                        "name": payload.name,
                        "surname": payload.surname,
                        "ssn": payload.ssn,
                        "phone": payload.phone,
                        "address": payload.address
                    }
                }
            }
        )
    except Exception as e:
        raise BadRequestException(detail=str(e))
    if result.user is None:
        raise BadRequestException(detail="Could not create user")
    
    return {"status": "ok", "user": result.user}

@router.post("/signin")
def signin(payload: SignInPayload):
    try:
        result = supabase.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as e:
        raise UnauthorizedException(str(e))

    if not result.session:
        raise UnauthorizedException("Invalid email or password")

    return {
        "status": "ok",
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "expires_at": result.session.expires_at,
    }

@router.post("/signout")
def signout(user=Depends(get_current_user)):
    try:
        supabase.auth.sign_out()
    except Exception as e:
        raise BadRequestException(str(e))

    return {"status": "ok", "message": "signed out"}