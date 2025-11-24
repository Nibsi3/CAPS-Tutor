"""Helpers that normalise text extracted from PDFs before parsing.

Each cleaned line retains its original line number and (optional) page index so
downstream heuristics can make contextual decisions and produce useful logs.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable, List, Sequence


SOFT_HYPHEN = "\u00ad"
FORM_FEED = "\x0c"

HEADER_PATTERNS = [
    re.compile(r"^\s*Department\s+of\s+Basic\s+Education", re.IGNORECASE),
    re.compile(r"^\s*National\s+Senior\s+Certificate", re.IGNORECASE),
    re.compile(r"^\s*This\s+question\s+paper\s+consists", re.IGNORECASE),
]

FOOTER_PATTERNS = [
    re.compile(r"^\s*Page\s+\d+\s+(of|/\s*)\s*\d+", re.IGNORECASE),
    re.compile(r"^\s*\d+\s*/\s*\d+\s*$"),
    re.compile(r"^\s*Copyright\s+\d{4}", re.IGNORECASE),
]

TABLE_ROW_PATTERN = re.compile(r"^\s*(\d+\s+){4,}")


@dataclass
class CleanLine:
    """Represents one sanitised line of PDF text."""

    index: int
    text: str
    page: int
    raw: str


def _strip_noise(line: str) -> str:
    compact = line.replace(SOFT_HYPHEN, "")
    compact = compact.replace(FORM_FEED, " ")
    compact = re.sub(r"\s+", " ", compact).strip()
    return compact


def _is_noise(line: str) -> bool:
    for pattern in HEADER_PATTERNS + FOOTER_PATTERNS:
        if pattern.search(line):
            return True
    return False


def prepare_lines(pages: Sequence[str]) -> List[CleanLine]:
    """Convert page-wise extracted text into a list of cleaned line objects."""
    prepared: List[CleanLine] = []
    global_index = 0
    for page_no, page_text in enumerate(pages, start=1):
        for raw_line in page_text.splitlines():
            global_index += 1
            cleaned = _strip_noise(raw_line)
            if not cleaned:
                continue
            if _is_noise(cleaned):
                continue
            prepared.append(CleanLine(index=global_index, text=cleaned, page=page_no, raw=raw_line.rstrip()))
    return prepared


__all__ = ["CleanLine", "prepare_lines", "TABLE_ROW_PATTERN"]

