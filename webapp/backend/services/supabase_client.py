import os
from supabase import create_client, Client, acreate_client, AsyncClient
from dotenv import load_dotenv
from backend.exceptions import ServiceUnavailableException

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Sync Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Async Client
_db: AsyncClient | None = None

async def init_db():
    """Called by main.py on startup to connect."""
    global _db
    _db = await acreate_client(SUPABASE_URL, SUPABASE_KEY)

def get_db() -> AsyncClient:
    """Routers call this to get the active connection."""
    if _db is None:
        raise ServiceUnavailableException(detail="Database non inizializzato (Startup in corso?)")
    return _db