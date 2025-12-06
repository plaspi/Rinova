from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.supabase_client import supabase
from routers.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], #default frontend origin
    allow_credentials=True,
    allow_methods=["*"], #(GET,POST,PUT,DELETE, ecc)
    allow_headers=["*"], #(Authorization, Content-Type, ecc)
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "backend is running"}