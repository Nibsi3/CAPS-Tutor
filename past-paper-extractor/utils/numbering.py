"""Utilities to detect and normalise hierarchical question numbering."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional


DECIMAL_PATTERN = re.compile(r"^\(?\d+(?:\.\d+)*\)?")
LETTER_PATTERN = re.compile(r"^\(\s*[A-Za-z]\s*\)")
ROMAN_PATTERN = re.compile(r"^\(\s*[ivxlcdm]+\s*\)", re.IGNORECASE)

# Clean helpers
LEADING_LABEL = re.compile(r"^(QUESTION|Q)\s+", re.IGNORECASE)
TRAILING_PUNCT = re.compile(r"^[\s\.\-\:]+")


@dataclass
class NumberingResult:
    raw: str
    tokens: List[str]

    @property
    def depth(self) -> int:
        return len(self.tokens)

    @property
    def normalized(self) -> str:
        return ".".join(self.tokens)

    @property
    def display(self) -> str:
        """Readable version that keeps decimal separators intact."""
        return ".".join(self.tokens)


def _consume_decimal(text: str) -> Optional[re.Match[str]]:
    return DECIMAL_PATTERN.match(text)


def _consume_letter(text: str) -> Optional[re.Match[str]]:
    return LETTER_PATTERN.match(text)


def _consume_roman(text: str) -> Optional[re.Match[str]]:
    return ROMAN_PATTERN.match(text)


def extract_numbering_from_line(line: str) -> Optional[NumberingResult]:
    """
    Attempt to read hierarchical numbering tokens from the start of the line.

    Supports:
        - Decimal chains: 1, 1.1, 1.1.2
        - Letter chains: (a) (b)
        - Roman chains: (i), (ii)
        - Mixed: 1.1 (a) (i)
    """
    stripped = line.strip()
    stripped = LEADING_LABEL.sub("", stripped).lstrip()

    tokens: List[str] = []
    cursor = stripped

    while cursor:
        # Try decimal segments first
        decimal_match = _consume_decimal(cursor)
        if decimal_match:
            decimal = decimal_match.group().strip("()")
            tokens.extend([part for part in decimal.split(".") if part])
            cursor = cursor[decimal_match.end() :]
            cursor = cursor.lstrip(" .-")
            continue

        letter_match = _consume_letter(cursor)
        if letter_match:
            letter = letter_match.group().strip("()").strip().lower()
            tokens.append(letter)
            cursor = cursor[letter_match.end() :].lstrip()
            continue

        roman_match = _consume_roman(cursor)
        if roman_match:
            roman = roman_match.group().strip("()").strip().lower()
            tokens.append(roman)
            cursor = cursor[roman_match.end() :].lstrip()
            continue

        break

    if not tokens:
        return None

    raw_end = stripped.find(cursor) if cursor else len(stripped)
    raw_part = stripped[:raw_end]
    raw = TRAILING_PUNCT.sub("", raw_part)

    return NumberingResult(raw=raw, tokens=tokens)


__all__ = ["NumberingResult", "extract_numbering_from_line"]

