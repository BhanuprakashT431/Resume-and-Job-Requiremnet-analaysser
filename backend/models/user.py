"""
models/user.py — SQLAlchemy User ORM model.
"""

from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(150), nullable=False)
    dob = Column(String(10), nullable=True)          # "YYYY-MM-DD"
    graduation_type = Column(String(100), nullable=True)
    photo_filename = Column(String(255), nullable=True)  # stored in uploads/photos/
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
