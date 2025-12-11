from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from services.supabase_client import supabase
from services.auth import get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], #default frontend origin
    allow_credentials=True,
    allow_methods=["*"], #(GET,POST,PUT,DELETE, ecc)
    allow_headers=["*"], #(Authorization, Content-Type, ecc)
)

# --- ROTTA PUBBLICA (Nessun lucchetto) ---
@app.get("/")
def home():
    return {"status": "ok", "message": "API Rinova funzionante"}

# --- ROTTA PROTETTA (Serve il Token) ---
# Depends(get_current_user) è il buttafuori
@app.get("/api/dati-privati")
def leggi_dati_sensibili(user: dict = Depends(get_current_user)):
    
    # Se arrivi qui, il token è valido!
    uuid_utente = user['sub'] 
    ruolo = user.get('role', 'user')
    
    return {
        "message": "Accesso autorizzato",
        "utente": uuid_utente,
        "ruolo": ruolo,
        "dati": "Ecco i dati della CER..."
    }