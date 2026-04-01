"""
services/parser.py — Document text extraction.

Supports:
  - PDF files via PyMuPDF (fitz)  — with graceful fallback
  - Plain text (.txt / .md) files
  - Any other file treated as UTF-8 text
"""

from __future__ import annotations
import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Try importing PyMuPDF; if installation is broken we fall back gracefully.
try:
    import fitz  # PyMuPDF
    _FITZ_AVAILABLE = True
except ImportError:
    _FITZ_AVAILABLE = False
    logger.warning(
        "PyMuPDF (fitz) is not installed. PDF parsing will use raw byte fallback. "
        "Run: pip install PyMuPDF"
    )


async def extract_text(file: UploadFile) -> str:
    """
    Extract raw text content from an uploaded file.

    Supports PDF (via PyMuPDF) and plain text. If PyMuPDF is unavailable,
    PDFs are decoded as UTF-8 (extracts embedded text stream for simple PDFs).

    Args:
        file: The FastAPI UploadFile object.

    Returns:
        Extracted text string (empty string if document is image-only or corrupt).
    """
    raw_bytes: bytes = await file.read()
    filename: str = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return _extract_from_pdf(raw_bytes, filename)

    # Plain text / markdown / anything else
    return raw_bytes.decode("utf-8", errors="replace")


def _extract_from_pdf(raw_bytes: bytes, filename: str = "document.pdf") -> str:
    """
    Extract text from a PDF byte stream using PyMuPDF.
    Falls back to a raw-bytes UTF-8 decode if PyMuPDF is unavailable.

    Args:
        raw_bytes: Raw PDF bytes.
        filename:  Original filename (used for logging only).

    Returns:
        Concatenated text from all pages, or an empty string.
    """
    if not _FITZ_AVAILABLE:
        # Last-resort fallback: strip binary noise and return printable ASCII.
        logger.warning("Falling back to raw byte extraction for '%s'.", filename)
        raw_str = raw_bytes.decode("latin-1", errors="replace")
        # Extract readable chunks between stream markers
        import re
        chunks = re.findall(r"[\x20-\x7E]{4,}", raw_str)
        return " ".join(chunks)

    text_parts: list[str] = []
    try:
        with fitz.open(stream=raw_bytes, filetype="pdf") as doc:
            logger.info("Parsing PDF '%s' — %d page(s).", filename, len(doc))
            for page_num, page in enumerate(doc):
                page_text = page.get_text("text")  # type: ignore[attr-defined]
                if page_text.strip():
                    text_parts.append(f"[Page {page_num + 1}]\n{page_text}")

        if not text_parts:
            logger.warning(
                "No text extracted from '%s' — may be a scanned/image PDF.", filename
            )
    except Exception as exc:  # noqa: BLE001
        logger.error("PyMuPDF failed on '%s': %s", filename, exc)
        # Return empty string; the endpoint will surface a 422 to the client.
    
    return "\n\n".join(text_parts)
