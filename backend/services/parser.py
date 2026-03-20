"""
services/parser.py — Document text extraction.

Supports:
  - PDF files via PyMuPDF (fitz)
  - Plain text (.txt) files
  - Any other file treated as UTF-8 text
"""

from __future__ import annotations
import io
import fitz  # PyMuPDF
from fastapi import UploadFile


async def extract_text(file: UploadFile) -> str:
    """
    Extract raw text content from an uploaded file.

    Args:
        file: The FastAPI UploadFile object.

    Returns:
        Extracted text string. May be empty if document is image-only.
    """
    raw_bytes: bytes = await file.read()
    filename: str = file.filename or ""

    if filename.lower().endswith(".pdf"):
        return _extract_from_pdf(raw_bytes)
    else:
        # Treat as plain text — decode with lenient error handling
        return raw_bytes.decode("utf-8", errors="replace")


def _extract_from_pdf(raw_bytes: bytes) -> str:
    """
    Use PyMuPDF to extract text from a PDF byte stream.

    Args:
        raw_bytes: Raw PDF bytes.

    Returns:
        Concatenated text from all pages.
    """
    text_parts: list[str] = []

    with fitz.open(stream=raw_bytes, filetype="pdf") as doc:
        for page_num, page in enumerate(doc):
            page_text = page.get_text("text")
            if page_text.strip():
                text_parts.append(f"[Page {page_num + 1}]\n{page_text}")

    return "\n\n".join(text_parts)
