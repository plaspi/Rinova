from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .services.supabase_client import init_db
import uvicorn
from .routers import dashboard, analytics, reports, general

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Rinova Energy API",
    description="API Backend per la gestione e il monitoraggio impianti fotovoltaici.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rinovaenergy.vercel.app",
        "http://localhost:5173",
        #"https://rinova-git-main-plaspi.vercel.app" #Preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(general.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(reports.router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)