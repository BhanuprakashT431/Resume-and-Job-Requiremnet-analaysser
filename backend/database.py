"""
database.py — SQLAlchemy SQLite setup for the Onboarding Engine.

The DB file is created automatically at ./onboarding.db on first run.
"""

from __future__ import annotations
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from typing import Generator
import os

# Store the DB file in the backend directory
_DB_PATH = os.path.join(os.path.dirname(__file__), "onboarding.db")
DATABASE_URL = f"sqlite:///{_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all tables defined on Base. Safe to call multiple times."""
    Base.metadata.create_all(bind=engine)
