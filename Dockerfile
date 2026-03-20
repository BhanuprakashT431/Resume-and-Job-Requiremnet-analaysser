# ─── Stage 1: Build Next.js frontend ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Python backend ──────────────────────────────────────────────────
FROM python:3.11-slim AS backend

WORKDIR /app

# System deps for PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend source
COPY backend/ ./backend/

# Copy built Next.js static export into a served directory (optional)
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Expose backend port
EXPOSE 8000

# Note: In production, run frontend separately (see docker-compose.yml).
# This image runs only the FastAPI backend.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
