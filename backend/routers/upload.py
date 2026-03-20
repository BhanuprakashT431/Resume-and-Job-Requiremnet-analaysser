"""
routers/upload.py — Document upload and skill extraction endpoints.

Routes:
  POST /api/upload/resume  — Upload a resume (PDF or text)
  POST /api/upload/jd      — Upload a job description (PDF or text)
  GET  /api/gap            — Compute skill gap + generate roadmap from last uploads
"""

from __future__ import annotations
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from services.parser import extract_text
from services.llm_client import extract_skills
from adaptive_engine import AdaptiveEngine
from models.schemas import SkillSet, SkillGap, LearningRoadmap

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["documents"])

# ---------------------------------------------------------------------------
# Simple in-memory state store (use a DB or Redis in production)
# ---------------------------------------------------------------------------
_state: dict[str, SkillSet] = {}


@router.post("/upload/resume", response_model=SkillSet, summary="Upload Candidate Resume")
async def upload_resume(file: UploadFile = File(...)) -> SkillSet:
    """
    Accept a resume file (PDF or plain text), extract text, and use the LLM
    to parse structured skills from it.

    Returns a SkillSet containing the candidate's detected skills.
    """
    _validate_file(file)
    logger.info("Received resume upload: %s", file.filename)

    text = await extract_text(file)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from resume.")

    skills = await extract_skills(text)
    skill_set = SkillSet(
        source="resume",
        skills=skills,
        raw_text_preview=text[:500],
    )
    _state["resume"] = skill_set
    logger.info("Resume parsed: %d skills found.", len(skills))
    return skill_set


@router.post("/upload/jd", response_model=SkillSet, summary="Upload Job Description")
async def upload_jd(file: UploadFile = File(...)) -> SkillSet:
    """
    Accept a job description file (PDF or plain text), extract text, and use
    the LLM to parse required skills from it.

    Returns a SkillSet containing the JD's required skills.
    """
    _validate_file(file)
    logger.info("Received JD upload: %s", file.filename)

    text = await extract_text(file)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from job description.")

    skills = await extract_skills(text)
    skill_set = SkillSet(
        source="job_description",
        skills=skills,
        raw_text_preview=text[:500],
    )
    _state["jd"] = skill_set
    logger.info("JD parsed: %d skills found.", len(skills))
    return skill_set


@router.get("/gap", summary="Get Skill Gap & Learning Roadmap")
async def get_skill_gap() -> JSONResponse:
    """
    Compute the skill gap between the uploaded resume and job description, then
    generate a personalized learning roadmap.

    Requires both /upload/resume and /upload/jd to have been called first.
    Returns combined SkillGap + LearningRoadmap JSON.
    """
    if "resume" not in _state:
        raise HTTPException(status_code=400, detail="No resume uploaded yet.")
    if "jd" not in _state:
        raise HTTPException(status_code=400, detail="No job description uploaded yet.")

    engine = AdaptiveEngine(
        resume_skills=_state["resume"].skills,
        jd_skills=_state["jd"].skills,
    )

    gap: SkillGap = engine.compute_skill_gap(
        resume=_state["resume"],
        jd=_state["jd"],
    )
    roadmap: LearningRoadmap = engine.generate_roadmap(gap)
    roadmap = engine.prioritize_nodes(roadmap)

    return JSONResponse(content={
        "gap": gap.model_dump(),
        "roadmap": roadmap.model_dump(),
    })


@router.delete("/reset", summary="Reset uploaded documents")
async def reset_state() -> dict:
    """Clear all uploaded document state (useful for demo resets)."""
    _state.clear()
    return {"message": "State cleared successfully."}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_file(file: UploadFile) -> None:
    """Raise 400 if the file type is not supported."""
    allowed = {".pdf", ".txt", ".md", ".docx"}
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed)}",
        )
