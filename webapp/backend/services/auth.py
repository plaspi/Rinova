import os
from typing import Optional
from fastapi import Header, HTTPException, status
import jwt # PyJWT
from dotenv import load_dotenv

# Carica le variabili d'ambiente SUBITO
load_dotenv()

# Recupera il JWT Secret da .env
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Verifica il token JWT di Supabase localmente.
    """
    
    # Controllo di sicurezza: se manca la chiave nel .env, ferma tutto
    if not SUPABASE_JWT_SECRET:
        print("ERRORE CRITICO: SUPABASE_JWT_SECRET mancante nel file .env!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Server configuration error: Missing JWT Secret"
        )

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing Authorization header"
        )

    try:
        # Pulisci il token (rimuovi 'Bearer ')
        token = authorization.replace("Bearer ", "")
        
        # Verifica e decodifica il token
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated", # Audience standard di Supabase Auth
            options={"verify_exp": True}
        )
        
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token scaduto"
        )
    except jwt.InvalidTokenError as e:
        print(f"Token invalido: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido"
        )
    except Exception as e:
        print(f"Errore auth generico: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Errore di autenticazione"
        )