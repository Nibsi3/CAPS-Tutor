"""PDF text extraction helpers with pdfplumber primary and PyMuPDF fallback."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional


LOGGER = logging.getLogger("past-paper-extractor.extract_text")


def _extract_with_pdfplumber(pdf_path: Path) -> Optional[str]:
    try:
        import pdfplumber  # type: ignore
    except ImportError as err:  # pragma: no cover - defensive
        LOGGER.debug("pdfplumber not available: %s", err)
        return None

    pages: list[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return "\n".join(pages)


def _extract_with_pymupdf(pdf_path: Path) -> Optional[str]:
    try:
        import fitz  # type: ignore
    except ImportError as err:  # pragma: no cover - defensive
        LOGGER.error("PyMuPDF (fitz) not available: %s", err)
        return None

    doc = fitz.open(pdf_path)  # type: ignore[arg-type]
    try:
        text_chunks = []
        for page in doc:
            text_chunks.append(page.get_text())
        return "\n".join(text_chunks)
    finally:
        doc.close()


def extract_text(pdf_path: str | Path) -> str:
    """
    Extract text from a PDF file.

    Attempts pdfplumber first for more consistent layout, then PyMuPDF.
    Raises RuntimeError if both strategies fail.
    """
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")

    LOGGER.info("Extracting text from %s", path.name)
    text = _extract_with_pdfplumber(path)
    if text and text.strip():
        return text

    LOGGER.warning("pdfplumber extraction yielded empty text for %s; trying PyMuPDF", path)
    fallback = _extract_with_pymupdf(path)
    if fallback and fallback.strip():
        return fallback

    raise RuntimeError(f"Unable to extract text from {path}")


__all__ = ["extract_text"]

