"""Centralised regex patterns shared by the extractor heuristics."""

from __future__ import annotations

import re

# Section heading heuristics -------------------------------------------------
SECTION_HEADING = re.compile(
    r"^\s*SECTION[\s\-]+(?P<code>[A-Z0-9])(?:\s*[:\-]\s*(?P<label>[A-Z][\w\s]+))?\s*$",
    re.IGNORECASE,
)
SECTION_HEADING_LOWER = re.compile(
    r"^\s*Section\s+(?P<code>[A-Z0-9])(?:\s*[:\-]\s*(?P<label>[A-Za-z][\w\s]+))?\s*$"
)
INSTRUCTION_HEADING = re.compile(
    r"^\s*INSTRUCTIONS?(?:\s+(?:AND|TO)\s+[A-Z\s]+)?\s*:?\s*$",
    re.IGNORECASE,
)

# Question numbering heuristics ----------------------------------------------
MAIN_QUESTION_LINE = re.compile(
    r"^\s*(?:QUESTION\s+)?(?P<num>\d{1,2})(?:[\.\)]|\s)", re.IGNORECASE
)
QUESTION_KEYWORD_LINE = re.compile(r"^\s*(?:QUESTION|Q)\s+\d+\b", re.IGNORECASE)
SUB_QUESTION_INLINE = re.compile(r"^\s*(\d{1,2}(?:\.\d{1,2})+)")
LETTER_TOKEN = re.compile(r"^\s*\(\s*[a-z]\s*\)", re.IGNORECASE)
ROMAN_TOKEN = re.compile(r"^\s*\(\s*(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\s*\)", re.IGNORECASE)

# Marks extraction -----------------------------------------------------------
MARK_BRACKETS = re.compile(r"(?:\(|\[)\s*(?P<marks>\d{1,3})\s*(?:marks?)?\s*(?:\)|\])", re.IGNORECASE)
MARK_TRAILING = re.compile(r"(?:-|–|—)?\s*(?P<marks>\d{1,3})\s+marks?\b", re.IGNORECASE)
MARK_TOTAL = re.compile(r"TOTAL\s*[:\-]\s*(?P<marks>\d{1,3})", re.IGNORECASE)

# Noise filters --------------------------------------------------------------
YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")
PAGE_FOOTER = re.compile(r"Page\s+\d+\s+(of|/\s*)\s*\d+", re.IGNORECASE)
LONG_DECIMAL = re.compile(r"\d+(?:\.\d+){4,}")


__all__ = [
    "SECTION_HEADING",
    "SECTION_HEADING_LOWER",
    "INSTRUCTION_HEADING",
    "MAIN_QUESTION_LINE",
    "SUB_QUESTION_INLINE",
    "QUESTION_KEYWORD_LINE",
    "LETTER_TOKEN",
    "ROMAN_TOKEN",
    "MARK_BRACKETS",
    "MARK_TRAILING",
    "MARK_TOTAL",
    "YEAR_PATTERN",
    "PAGE_FOOTER",
    "LONG_DECIMAL",
]

