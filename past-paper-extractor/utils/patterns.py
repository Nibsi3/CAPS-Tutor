"""Centralised regex patterns for section/question detection and marks."""

from __future__ import annotations

import re
from typing import Optional, Tuple


# ---------------------------------------------------------------------------
# Section detection
# ---------------------------------------------------------------------------
SECTION_PATTERNS = [
    re.compile(r"^\s*SECTION[\s\-:]+(?P<title>[A-Z0-9]+)\b", re.IGNORECASE),
    re.compile(r"^\s*Section\s+(?P<title>[A-Z0-9]+)\b", re.IGNORECASE),
    re.compile(r"^\s*Section\s+(?P<title>[A-Z]+)\s*\(\s*(?P<name>[A-Z]+)\s*\)", re.IGNORECASE),
]

SECTION_WITH_LABEL = re.compile(
    r"^\s*SECTION[\s\-:]+(?P<title>[A-Z0-9]+)\s*[:\-]\s*(?P<label>[A-Z][A-Z\s]+)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Question detection
# ---------------------------------------------------------------------------
QUESTION_PREFIX_PATTERNS = [
    re.compile(r"^\s*QUESTION\s+(?P<num>\d+[A-Z]?)", re.IGNORECASE),
    re.compile(r"^\s*Q\s*(?P<num>\d+[A-Z]?)", re.IGNORECASE),
]

ALT_QUESTION_PREFIX = re.compile(r"^\s*TEXT\s+[A-Z]\s+QUESTION\s+(?P<num>\d+)", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Marks detection
# ---------------------------------------------------------------------------
MARK_BLOCK = re.compile(r"[\[(]\s*(?P<marks>\d+)\s*marks?\s*[\])]", re.IGNORECASE)
MARK_INLINE = re.compile(r"\b(?P<marks>\d+)\s*marks?\b", re.IGNORECASE)
MARK_SINGLE = re.compile(r"\b(?P<marks>\d+)\s*mark\b", re.IGNORECASE)


def extract_marks(text: str) -> Tuple[Optional[int], str]:
    matched = MARK_BLOCK.search(text) or MARK_INLINE.search(text) or MARK_SINGLE.search(text)
    if not matched:
        return None, text

    marks = int(matched.group("marks"))
    cleaned = text[: matched.start()] + text[matched.end() :]
    return marks, cleaned.strip()


__all__ = [
    "SECTION_PATTERNS",
    "SECTION_WITH_LABEL",
    "QUESTION_PREFIX_PATTERNS",
    "ALT_QUESTION_PREFIX",
    "extract_marks",
]

