"""
routers/auth.py — User registration, login, profile, and photo endpoints.
"""

from __future__ import annotations
import os
import uuid
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.auth import hash_password, verify_password, create_access_token, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── Upload directory ───────────────────────────────────────────────────────
_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "photos")
os.makedirs(_UPLOAD_DIR, exist_ok=True)

_ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

GRADUATION_TYPES = [
    "B.Tech / B.E.", "M.Tech / M.E.", "B.Sc", "M.Sc",
    "MBA", "MCA", "BCA", "B.Com", "M.Com", "Ph.D", "Diploma", "Other",
]


# ── Pydantic models for this router ───────────────────────────────────────

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    dob: str | None
    graduation_type: str | None
    photo_url: str | None
    member_since: str | None

    model_config = {"from_attributes": True}


class LoginBody(BaseModel):
    email: str
    password: str


class ProfileUpdateBody(BaseModel):
    name: str | None = None
    dob: str | None = None
    graduation_type: str | None = None


# ── Helpers ───────────────────────────────────────────────────────────────

def _user_out(user: User) -> dict:
    photo_url = None
    if user.photo_filename:
        photo_url = f"/static/photos/{user.photo_filename}"
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "dob": user.dob,
        "graduation_type": user.graduation_type,
        "photo_url": photo_url,
        "member_since": user.created_at.strftime("%B %Y") if user.created_at else None,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/register", summary="Register a new user")
async def register(
    name:            str  = Form(...),
    email:           str  = Form(...),
    password:        str  = Form(...),
    dob:             str  = Form(None),          # YYYY-MM-DD
    graduation_type: str  = Form(None),
    photo:           UploadFile | None = File(None),
    db:              Session = Depends(get_db),
) -> JSONResponse:
    """
    Register a new user. Accepts multipart form data so a profile
    photo can be uploaded in the same request.
    """
    if len(password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters.")

    if db.query(User).filter(User.email == email.lower().strip()).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    # Save photo if provided
    photo_filename: str | None = None
    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1].lower()
        if ext not in _ALLOWED_IMAGE_EXTS:
            raise HTTPException(status_code=422, detail=f"Image must be one of {_ALLOWED_IMAGE_EXTS}")
        photo_filename = f"{uuid.uuid4().hex}{ext}"
        photo_bytes = await photo.read()
        with open(os.path.join(_UPLOAD_DIR, photo_filename), "wb") as f:
            f.write(photo_bytes)

    user = User(
        email=email.lower().strip(),
        hashed_password=hash_password(password),
        name=name.strip(),
        dob=dob or None,
        graduation_type=graduation_type or None,
        photo_filename=photo_filename,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    logger.info("Registered user %s (id=%d)", user.email, user.id)

    return JSONResponse({"token": token, "user": _user_out(user)}, status_code=201)


@router.post("/login", summary="Login and receive a JWT token")
def login(body: LoginBody, db: Session = Depends(get_db)) -> JSONResponse:
    """Authenticate with email + password and return a JWT access token."""
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(user.id)
    return JSONResponse({"token": token, "user": _user_out(user)})


@router.get("/me", summary="Get current user profile")
def get_me(current_user: User = Depends(get_current_user)) -> JSONResponse:
    return JSONResponse(_user_out(current_user))


@router.put("/profile", summary="Update profile details")
def update_profile(
    body: ProfileUpdateBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JSONResponse:
    if body.name is not None:
        current_user.name = body.name.strip()
    if body.dob is not None:
        current_user.dob = body.dob
    if body.graduation_type is not None:
        current_user.graduation_type = body.graduation_type

    db.commit()
    db.refresh(current_user)
    return JSONResponse(_user_out(current_user))


@router.post("/photo", summary="Update profile photo")
async def update_photo(
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JSONResponse:
    ext = os.path.splitext(photo.filename or "")[1].lower()
    if ext not in _ALLOWED_IMAGE_EXTS:
        raise HTTPException(status_code=422, detail=f"Image must be one of {_ALLOWED_IMAGE_EXTS}")

    # Delete old photo
    if current_user.photo_filename:
        old_path = os.path.join(_UPLOAD_DIR, current_user.photo_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    photo_filename = f"{uuid.uuid4().hex}{ext}"
    photo_bytes = await photo.read()
    with open(os.path.join(_UPLOAD_DIR, photo_filename), "wb") as f:
        f.write(photo_bytes)

    current_user.photo_filename = photo_filename
    db.commit()
    db.refresh(current_user)
    return JSONResponse(_user_out(current_user))


@router.get("/graduation-types", summary="List valid graduation types")
def list_graduation_types() -> list[str]:
    return GRADUATION_TYPES
