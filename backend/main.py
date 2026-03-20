"""
main.py — FastAPI application entry point.

Starts the AI-Adaptive Onboarding Engine backend.
Run with:  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.upload import router as upload_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI-Adaptive Onboarding Engine",
    description=(
        "Backend API for parsing Resumes and Job Descriptions, extracting skills "
        "via an open-source LLM, and generating a personalized learning roadmap."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow Next.js dev server and production origin
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(upload_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["system"])
async def health() -> dict:
    """Simple liveness probe."""
    return {"status": "ok", "service": "ai-adaptive-onboarding-engine"}
