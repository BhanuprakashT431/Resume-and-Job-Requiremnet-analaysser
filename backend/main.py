"""
main.py — FastAPI application entry point.
"""

from __future__ import annotations
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import create_tables
from routers.upload import router as upload_router
from routers.auth import router as auth_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── Uploads directory (served as /static) ─────────────────────────────────
_UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(os.path.join(_UPLOADS_DIR, "photos"), exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables…")
    create_tables()
    logger.info("Database ready.")
    yield


app = FastAPI(
    title="AI-Adaptive Onboarding Engine",
    description="Backend API for skill parsing, gap analysis, and personalized learning roadmaps.",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resume-and-job-requiremnet-analayss.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── Static files (profile photos) ─────────────────────────────────────────
app.mount("/static", StaticFiles(directory=_UPLOADS_DIR), name="static")

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(upload_router)


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok", "version": "0.2.0"}
