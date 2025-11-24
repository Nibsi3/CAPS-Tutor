"""Utilities to detect, validate, and format CAPS question numbering."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional, Tuple


MAX_MAIN_QUESTION = 40
MAX_SUB_QUESTION = 25
MAX_DEPTH = 4
MAX_SEGMENT_LENGTH = 3
VALID_ROMAN = {"i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"}

DECIMAL_CHAIN = re.compile(r"^\(?\d{1,2}(?:\.\d{1,2})*\)?")
LETTER_PATTERN = re.compile(r"^\(\s*[a-z]\s*\)", re.IGNORECASE)
ROMAN_PATTERN = re.compile(r"^\(\s*(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\s*\)", re.IGNORECASE)
LEADING_LABEL = re.compile(r"^(QUESTION|Q)\s+", re.IGNORECASE)


@dataclass
class NumberingResult:
    """Lightweight container for parsed numbering tokens."""

    raw: str
    tokens: List[str]
    kinds: List[str]
    consumed: int

    @property
    def depth(self) -> int:
        return len(self.tokens)

    @property
    def starts_with_decimal(self) -> bool:
        return bool(self.kinds) and self.kinds[0] == "decimal"


def _consume_decimal(text: str) -> Optional[Tuple[List[str], int]]:
    match = DECIMAL_CHAIN.match(text)
    if not match:
        return None
    value = match.group().strip("()")
    tokens = [segment for segment in value.split(".") if segment]
    return tokens, match.end()


def _consume_letter(text: str) -> Optional[Tuple[str, int]]:
    match = LETTER_PATTERN.match(text)
    if not match:
        return None
    content = match.group().strip("()").strip().lower()
    return content, match.end()


def _consume_roman(text: str) -> Optional[Tuple[str, int]]:
    match = ROMAN_PATTERN.match(text)
    if not match:
        return None
    content = match.group().strip("()").strip().lower()
    return content, match.end()


def extract_numbering_from_line(line: str) -> Optional[NumberingResult]:
    """
    Attempt to read hierarchical numbering tokens from the start of the line.

    Supports:
        - Decimal chains: 1, 1.1, 1.1.2
        - Letter chains: (a), (b)
        - Roman chains: (i), (ii)
        - Mixed: 1.1 (a) (i)
    """
    stripped = line.strip()
    cursor = LEADING_LABEL.sub("", stripped).lstrip()

    tokens: List[str] = []
    kinds: List[str] = []

    decimal = _consume_decimal(cursor)
    if decimal:
        decimal_tokens, length = decimal
        tokens.extend(decimal_tokens)
        kinds.extend(["decimal"] * len(decimal_tokens))
        cursor = cursor[length:].lstrip(" .-)")

    while True:
        letter = _consume_letter(cursor)
        if letter:
            value, length = letter
            tokens.append(value)
            kinds.append("letter")
            cursor = cursor[length:].lstrip(" .-)")
            continue

        roman = _consume_roman(cursor)
        if roman:
            value, length = roman
            tokens.append(value)
            kinds.append("roman")
            cursor = cursor[length:].lstrip(" .-)")
            continue
        break

    if not tokens:
        return None

    raw_length = len(stripped) - len(cursor)
    raw = stripped[:raw_length].strip(" .:-")
    return NumberingResult(raw=raw, tokens=tokens, kinds=kinds, consumed=raw_length)


def is_valid_numbering(result: NumberingResult, has_parent: bool) -> bool:
    """Return True only when numbering satisfies CAPS constraints."""
    if not result.tokens:
        return False

    if not result.starts_with_decimal and not has_parent:
        return False

    if result.depth > MAX_DEPTH:
        return False

    for idx, (token, kind) in enumerate(zip(result.tokens, result.kinds)):
        if len(token) > MAX_SEGMENT_LENGTH:
            return False

        if kind == "decimal":
            value = int(token)
            limit = MAX_MAIN_QUESTION if idx == 0 else MAX_SUB_QUESTION
            if value < 1 or value > limit:
                return False
        elif kind == "letter":
            if len(token) != 1 or not token.isalpha():
                return False
        elif kind == "roman":
            if token.lower() not in VALID_ROMAN:
                return False

    return True


def format_tokens(tokens: List[str], kinds: List[str]) -> str:
    """
    Normalise tokens into dot-delimited labels (e.g. 1.1.a.i).

    Letters and roman numerals retain their lowercase textual form.
    """
    parts: List[str] = []
    for token, kind in zip(tokens, kinds):
        if kind == "decimal":
            parts.append(token)
        else:
            parts.append(token.lower())
    return ".".join(parts)


__all__ = [
    "NumberingResult",
    "extract_numbering_from_line",
    "is_valid_numbering",
    "format_tokens",
    "MAX_MAIN_QUESTION",
    "MAX_DEPTH",
]

