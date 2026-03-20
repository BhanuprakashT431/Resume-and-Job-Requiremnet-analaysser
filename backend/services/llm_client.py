"""
services/llm_client.py — LLM-powered skill extraction.

Primary:  Mistral via Ollama (http://localhost:11434)
Fallback: Heuristic keyword extraction (no GPU required)

The prompt instructs the LLM to return a JSON array of skill objects so the
response can be directly parsed into list[Skill].
"""

from __future__ import annotations
import json
import re
import logging
import httpx
from models.schemas import Skill

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"

# ---------------------------------------------------------------------------
# Common tech skills used by the heuristic fallback
# ---------------------------------------------------------------------------
SKILL_KEYWORDS: dict[str, str] = {
    # Programming languages
    "python": "Programming", "java": "Programming", "javascript": "Programming",
    "typescript": "Programming", "c++": "Programming", "c#": "Programming",
    "go": "Programming", "rust": "Programming", "kotlin": "Programming",
    "swift": "Programming", "scala": "Programming", "r": "Programming",
    # Web frameworks
    "react": "Frontend", "next.js": "Frontend", "vue": "Frontend",
    "angular": "Frontend", "svelte": "Frontend", "tailwind": "Frontend",
    # Backend frameworks
    "fastapi": "Backend", "django": "Backend", "flask": "Backend",
    "express": "Backend", "spring": "Backend", "node.js": "Backend",
    # Data / ML
    "machine learning": "ML/AI", "deep learning": "ML/AI",
    "pytorch": "ML/AI", "tensorflow": "ML/AI", "scikit-learn": "ML/AI",
    "pandas": "Data Science", "numpy": "Data Science", "sql": "Database",
    # Cloud
    "aws": "Cloud", "azure": "Cloud", "gcp": "Cloud",
    "kubernetes": "DevOps", "docker": "DevOps", "terraform": "DevOps",
    "ci/cd": "DevOps", "jenkins": "DevOps", "github actions": "DevOps",
    # Databases
    "postgresql": "Database", "mysql": "Database", "mongodb": "Database",
    "redis": "Database", "elasticsearch": "Database",
    # Soft skills
    "communication": "Soft Skills", "leadership": "Soft Skills",
    "teamwork": "Soft Skills", "agile": "Soft Skills", "scrum": "Soft Skills",
}

_PROMPT_TEMPLATE = """
You are a technical recruiter AI. Analyze the following document and extract a
structured list of skills mentioned.

For each skill return a JSON object with these fields:
  - "name": string  (canonical skill name, e.g. "Python", "Docker")
  - "level": float  (proficiency 0–10; infer from context like "3 years" → ~6, "expert" → 9)
  - "category": string  (one of: Programming, Frontend, Backend, ML/AI, Data Science,
                          Cloud, DevOps, Database, Soft Skills, General)
  - "years_of_experience": float or null

Return ONLY a valid JSON array. No explanation, no markdown. Example:
[{{"name":"Python","level":8,"category":"Programming","years_of_experience":5}}]

Document:
\"\"\"
{document_text}
\"\"\"
"""


async def extract_skills(text: str) -> list[Skill]:
    """
    Extract a structured list of skills from raw document text.

    Tries Ollama (Mistral) first. Falls back to heuristic extraction
    if Ollama is unavailable or returns malformed output.

    Args:
        text: Raw text extracted from a Resume or JD document.

    Returns:
        List of Skill objects.
    """
    truncated = text[:4000]  # Keep prompt within context window

    try:
        skills = await _extract_via_ollama(truncated)
        if skills:
            logger.info("LLM extraction succeeded: %d skills found.", len(skills))
            return skills
    except Exception as exc:  # noqa: BLE001
        logger.warning("Ollama unavailable (%s). Falling back to heuristic.", exc)

    return _heuristic_extract(text)


async def _extract_via_ollama(text: str) -> list[Skill]:
    """Call Ollama Mistral and parse the JSON skill array response."""
    prompt = _PROMPT_TEMPLATE.format(document_text=text)

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        )
        response.raise_for_status()
        data = response.json()

    raw_text: str = data.get("response", "")

    # Extract JSON array from response (LLM may wrap in markdown fences)
    json_match = re.search(r"\[.*\]", raw_text, re.DOTALL)
    if not json_match:
        raise ValueError("No JSON array found in LLM response.")

    parsed = json.loads(json_match.group())
    return [Skill(**item) for item in parsed]


def _heuristic_extract(text: str) -> list[Skill]:
    """
    Keyword-matching fallback skill extractor.

    Scans document text for known skill keywords and assigns a default
    level of 5.0 (intermediate) since we cannot infer proficiency without LLM.
    """
    lower_text = text.lower()
    found: list[Skill] = []
    seen: set[str] = set()

    for keyword, category in SKILL_KEYWORDS.items():
        if keyword in lower_text and keyword not in seen:
            seen.add(keyword)
            # Try to infer years from patterns like "3 years of Python"
            years_match = re.search(
                rf"(\d+)\+?\s*years?\s+(?:of\s+)?{re.escape(keyword)}",
                lower_text,
            )
            years = float(years_match.group(1)) if years_match else None
            level = min(10.0, (years * 1.5 + 2)) if years else 5.0

            found.append(Skill(
                name=keyword.title(),
                level=round(level, 1),
                category=category,
                years_of_experience=years,
            ))

    return found
