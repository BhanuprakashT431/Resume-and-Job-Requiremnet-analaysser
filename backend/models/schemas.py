"""
Pydantic models for the AI-Adaptive Onboarding Engine API.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------------------------------------------------------
# Skill primitives
# ---------------------------------------------------------------------------

class Skill(BaseModel):
    """A single skill extracted from a document."""
    name: str = Field(..., description="Skill name, e.g. 'Python', 'Docker'")
    level: float = Field(
        ..., ge=0, le=10,
        description="Proficiency level 0-10 (0 = none, 10 = expert)"
    )
    category: str = Field(
        default="General",
        description="High-level category, e.g. 'Programming', 'Cloud', 'Soft Skills'"
    )
    years_of_experience: Optional[float] = Field(
        default=None,
        description="Years of hands-on experience if parseable"
    )


class SkillSet(BaseModel):
    """Collection of skills from a single document."""
    source: str = Field(..., description="'resume' or 'job_description'")
    skills: list[Skill] = Field(default_factory=list)
    raw_text_preview: Optional[str] = Field(
        default=None,
        description="First 500 chars of the original document text"
    )


# ---------------------------------------------------------------------------
# Gap models
# ---------------------------------------------------------------------------

class SkillGapItem(BaseModel):
    """A single skill's gap between current level and required level."""
    skill_name: str
    category: str
    current_level: float = Field(ge=0, le=10)
    required_level: float = Field(ge=0, le=10)
    gap: float = Field(description="required_level - current_level (negative = already exceeds)")
    priority: str = Field(
        default="medium",
        description="'critical' | 'high' | 'medium' | 'low'"
    )


class SkillGap(BaseModel):
    """Full skill gap analysis result."""
    total_skills_required: int
    total_skills_matched: int
    coverage_percentage: float
    gaps: list[SkillGapItem]


# ---------------------------------------------------------------------------
# Roadmap models
# ---------------------------------------------------------------------------

class RoadmapNode(BaseModel):
    """A single learning node in the personalized roadmap."""
    id: str
    title: str
    description: str
    skill_name: str
    estimated_hours: int
    status: str = Field(
        default="locked",
        description="'locked' | 'available' | 'in_progress' | 'complete'"
    )
    prerequisites: list[str] = Field(
        default_factory=list,
        description="List of node IDs that must be completed first"
    )
    resources: list[str] = Field(
        default_factory=list,
        description="Suggested links or resource titles"
    )
    week: int = Field(
        default=1,
        description="Suggested week number in the onboarding schedule"
    )


class LearningRoadmap(BaseModel):
    """Complete personalized learning roadmap."""
    total_weeks: int
    total_hours: int
    nodes: list[RoadmapNode]
    metadata: dict = Field(default_factory=dict)
