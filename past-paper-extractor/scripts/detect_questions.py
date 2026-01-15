"""Detect valid CAPS question numbers and marks from cleaned lines.

Example:
    candidates = detect_questions(lines, sections, heading_lines, parse_log, {})
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Set

from utils.cleaner import CleanLine
from utils import patterns
from utils.numbering import (
    NumberingResult,
    extract_numbering_from_line,
    format_tokens,
    is_valid_numbering,
    MAX_MAIN_QUESTION,
)
from .detect_sections import SectionMarker


@dataclass
class QuestionCandidate:
    number: str
    tokens: List[str]
    kinds: List[str]
    depth: int
    marks: Optional[int]
    line_index: int
    page: int
    text: str
    section_hint: Optional[str]


def _extract_marks(line: str, numbering: NumberingResult) -> Optional[int]:
    remainder = line.strip()[numbering.consumed :].strip()
    if not remainder:
        return None
    match = patterns.MARK_BRACKETS.search(remainder)
    if match:
        return int(match.group("marks"))
    match = patterns.MARK_TRAILING.search(remainder)
    if match:
        return int(match.group("marks"))
    return None


def _within_instructions(current_section: Optional[str]) -> bool:
    return current_section is not None and current_section.upper().startswith("INSTRUCTION")


def detect_questions(
    lines: List[CleanLine],
    sections: List[SectionMarker],
    heading_lines: set,
    parse_log: Dict,
    config: Dict,
) -> List[QuestionCandidate]:
    """Return ordered question candidates adhering to strict heuristics."""
    max_main = config.get("max_main_question", MAX_MAIN_QUESTION)
    candidates: List[QuestionCandidate] = []
    known_paths: Set[Tuple[str, ...]] = set()
    heuristics = parse_log.setdefault("heuristics", {})
    rejections = parse_log.setdefault("rejections", [])

    section_iter = iter(sorted(sections, key=lambda s: s.line_index))
    current_section = None
    section_marker = next(section_iter, None)

    for line in lines:
        while section_marker and line.index >= section_marker.line_index:
            current_section = section_marker.title
            section_marker = next(section_iter, None)

        if line.index in heading_lines:
            continue

        if _within_instructions(current_section):
            heuristics["instructions_skip"] = heuristics.get("instructions_skip", 0) + 1
            continue

        raw_text = line.text.strip()
        numbering = extract_numbering_from_line(raw_text)
        if not numbering:
            continue

        parent_tokens = tuple(numbering.tokens[:-1]) if numbering.depth > 1 else ()
        has_parent = bool(parent_tokens) and parent_tokens in known_paths

        if numbering.depth == 1 and numbering.kinds[0] == "decimal":
            if not patterns.QUESTION_KEYWORD_LINE.match(raw_text):
                heuristics["missing_question_keyword"] = heuristics.get("missing_question_keyword", 0) + 1
                rejections.append(
                    {
                        "line": line.index,
                        "text": raw_text[:120],
                        "reason": "missing_question_keyword",
                        "section": current_section,
                    }
                )
                continue

        if not is_valid_numbering(numbering, has_parent=has_parent):
            heuristics["invalid_numbering"] = heuristics.get("invalid_numbering", 0) + 1
            rejections.append(
                {
                    "line": line.index,
                    "text": line.text[:120],
                    "reason": "failed_numbering_rules",
                    "section": current_section,
                }
            )
            continue

        if numbering.depth > 1 and not has_parent:
            heuristics["missing_parent"] = heuristics.get("missing_parent", 0) + 1
            rejections.append(
                {
                    "line": line.index,
                    "text": line.text[:120],
                    "reason": "missing_parent",
                    "section": current_section,
                }
            )
            continue

        first_token = int(numbering.tokens[0]) if numbering.kinds[0] == "decimal" else None
        if numbering.kinds[0] == "decimal" and first_token and first_token > max_main and numbering.depth == 1:
            heuristics["exceeds_main_limit"] = heuristics.get("exceeds_main_limit", 0) + 1
            rejections.append(
                {
                    "line": line.index,
                    "text": line.text[:120],
                    "reason": "exceeds_main_limit",
                    "section": current_section,
                }
            )
            continue

        if patterns.YEAR_PATTERN.search(line.text.split(" ", 1)[0]):
            heuristics["year_noise"] = heuristics.get("year_noise", 0) + 1
            rejections.append(
                {
                    "line": line.index,
                    "text": line.text[:120],
                    "reason": "year_noise",
                    "section": current_section,
                }
            )
            continue

        label = format_tokens(numbering.tokens, numbering.kinds)
        marks = _extract_marks(line.text, numbering)

        candidate = QuestionCandidate(
            number=label,
            tokens=list(numbering.tokens),
            kinds=list(numbering.kinds),
            depth=len(numbering.tokens),
            marks=marks,
            line_index=line.index,
            page=line.page,
            text=line.text,
            section_hint=current_section,
        )
        candidates.append(candidate)
        known_paths.add(tuple(numbering.tokens))
        parse_log.setdefault("questions", []).append(
            {
                "line": line.index,
                "page": line.page,
                "number": label,
                "marks": marks,
                "section": current_section,
            }
        )

    return candidates


__all__ = ["QuestionCandidate", "detect_questions"]

