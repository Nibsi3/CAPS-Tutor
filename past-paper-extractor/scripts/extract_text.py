"""PDF text extraction helpers with pdfplumber primary and PyMuPDF fallback.

Example:
    from scripts.extract_text import extract_lines
    lines = extract_lines("Accounting.pdf")
    print(lines[0].text)  # -> 'SECTION A'
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import List, Optional

from utils.cleaner import CleanLine, prepare_lines


LOGGER = logging.getLogger("past-paper-extractor.extract_text")


def _extract_with_pdfplumber(pdf_path: Path) -> Optional[List[str]]:
    try:
        import pdfplumber  # type: ignore
    except ImportError as err:  # pragma: no cover - defensive
        LOGGER.debug("pdfplumber not available: %s", err)
        return None

    pages: List[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return pages


def _extract_with_pymupdf(pdf_path: Path) -> Optional[List[str]]:
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
        return text_chunks
    finally:
        doc.close()


def extract_lines(pdf_path: str | Path) -> List[CleanLine]:
    """
    Extract and clean PDF text into line objects ready for downstream parsing.

    pdfplumber is attempted first for layout fidelity, then PyMuPDF as fallback.
    Raises RuntimeError if both strategies fail.
    """
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")

    LOGGER.info("Extracting text from %s", path.name)
    pages = _extract_with_pdfplumber(path)
    if pages and any(fragment.strip() for fragment in pages):
        return prepare_lines(pages)

    LOGGER.warning("pdfplumber extraction yielded empty text for %s; trying PyMuPDF", path)
    fallback = _extract_with_pymupdf(path)
    if fallback and any(fragment.strip() for fragment in fallback):
        return prepare_lines(fallback)

    raise RuntimeError(f"Unable to extract text from {path}")


__all__ = ["extract_lines"]

