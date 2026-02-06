from fastapi import APIRouter, Depends
from backend.services.auth import get_current_user
from backend.schemas import GenericResponse

router = APIRouter(tags=["General"])

@router.get("/", response_model=GenericResponse, summary="Health Check")
async def root():
    return {"status": "ok", "message": "API Rinova funzionante (Python version 3.13.11)"}

@router.get("/api/dati-privati", tags=["Utils"])
def leggi_dati_sensibili(user: dict = Depends(get_current_user)):
    return {"message": "Accesso autorizzato", "utente": user['sub'], "ruolo": user.get('role', 'user')}