"""Helpers that normalise text extracted from PDFs before parsing."""

from __future__ import annotations

import re
from typing import Iterable, Iterator, List


NOISE_PATTERNS = [
    re.compile(r"^\s*Page\s+\d+\s+(of|/\s*)\s*\d+", re.IGNORECASE),
    re.compile(r"^\s*Department\s+of\s+Basic\s+Education", re.IGNORECASE),
    re.compile(r"^\s*Copyright\s+\d{4}", re.IGNORECASE),
    re.compile(r"^\s*National\s+Senior\s+Certificate", re.IGNORECASE),
    re.compile(r"^\s*This\s+question\s+paper\s+consists", re.IGNORECASE),
    re.compile(r"^\s*\d+\s*/\s*\d+\s*$"),  # page counters like 3/28
]

SOFT_HYPHEN = "\u00ad"


def sanitize_line(line: str) -> str:
    cleaned = line.replace(SOFT_HYPHEN, "")
    cleaned = cleaned.replace("\x0c", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if not cleaned:
        return ""

    for pattern in NOISE_PATTERNS:
        if pattern.search(cleaned):
            return ""
    return cleaned


def iter_clean_lines(lines: Iterable[str]) -> Iterator[str]:
    for line in lines:
        sanitized = sanitize_line(line)
        if sanitized:
            yield sanitized


def collapse_paragraphs(text: str) -> List[str]:
    """Return cleaned lines from the full extracted text."""
    return list(iter_clean_lines(text.splitlines()))


__all__ = ["sanitize_line", "iter_clean_lines", "collapse_paragraphs"]

