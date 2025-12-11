import os
from typing import Optional
from fastapi import Header, HTTPException, status
import jwt # Libreria PyJWT

# PRENDI QUESTO DALLA DASHBOARD SUPABASE -> SETTINGS -> API -> JWT SECRET
# (Non usare la Anon Key, serve il JWT Secret che inizia per "super-secret-...")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Verifica il JWT localmente usando la crittografia.
    Zero chiamate di rete a Supabase = Velocità massima e nessun rate limit.
    """
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing Authorization header"
        )

    try:
        # 1. Pulisci il token
        token = authorization.replace("Bearer ", "")
        
        # 2. VERIFICA MATEMATICA (Locale)
        # Se il secret è giusto e il token non è scaduto, decodifica il payload.
        # Se qualcuno ha manomesso il token, questa funzione esplode in un errore.
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated", # Supabase usa questo audience
            options={"verify_exp": True} # Controlla automaticamente se è scaduto
        )
        
        # 3. Ritorna i dati dell'utente (UUID, email, ruolo) contenuti nel token
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token scaduto (fai refresh nel frontend)"
        )
    except jwt.InvalidTokenError as e:
        print(f"Errore token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido"
        )
    except Exception as e:
        print(f"Errore generico auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore verifica autenticazione"
        )