from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, programs, applications, documents, profile, payments, admin, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown — close DB pool
    from app.database import engine
    await engine.dispose()


app = FastAPI(
    title="IO Recruitment System API",
    description="Backend API dla zintegrowanego systemu rekrutacyjnego",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api/v1
PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(programs.router, prefix=PREFIX)
app.include_router(applications.router, prefix=PREFIX)
app.include_router(documents.router, prefix=PREFIX)
app.include_router(profile.router, prefix=PREFIX)
app.include_router(payments.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)
app.include_router(notifications.router, prefix=PREFIX)


@app.get("/")
async def root():
    return {"message": "IO Recruitment System API", "docs": "/docs"}
