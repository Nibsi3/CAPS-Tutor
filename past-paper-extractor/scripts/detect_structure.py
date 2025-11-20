"""Convert cleaned text into a hierarchical section/question structure."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import List, Optional

from utils.cleaner import iter_clean_lines
from utils.numbering import NumberingResult, extract_numbering_from_line
from utils import patterns


LOGGER = logging.getLogger("past-paper-extractor.detect_structure")


@dataclass
class QuestionNode:
    number: str
    depth: int
    text: str
    max_marks: Optional[int]
    subquestions: List["QuestionNode"] = field(default_factory=list)


@dataclass
class SectionBlock:
    title: str
    questions: List[QuestionNode] = field(default_factory=list)


def _resolve_section_title(line: str) -> Optional[str]:
    match = patterns.SECTION_WITH_LABEL.match(line)
    if match:
        core = match.group("title").upper()
        label = match.group("label").title()
        return f"SECTION {core} - {label}"

    for regex in patterns.SECTION_PATTERNS:
        match = regex.match(line)
        if match:
            title = match.groupdict().get("title") or match.groupdict().get("name")
            if title:
                return f"SECTION {title.upper()}"
    return None


def _ensure_section(sections: List[SectionBlock], current: Optional[SectionBlock]) -> SectionBlock:
    if current:
        return current
    default = SectionBlock(title="UNSECTIONED")
    sections.append(default)
    return default


def _create_node(numbering: NumberingResult, text: str, marks: Optional[int]) -> QuestionNode:
    return QuestionNode(
        number=numbering.display,
        depth=numbering.depth,
        text=text.strip(),
        max_marks=marks,
    )


def detect_structure(text: str) -> List[SectionBlock]:
    sections: List[SectionBlock] = []
    current_section: Optional[SectionBlock] = None
    stack: List[QuestionNode] = []
    pending_marks: Optional[int] = None

    for raw_line in iter_clean_lines(text.splitlines()):
        section_title = _resolve_section_title(raw_line)
        if section_title:
            LOGGER.debug("Detected section: %s", section_title)
            current_section = SectionBlock(title=section_title)
            sections.append(current_section)
            stack.clear()
            pending_marks = None
            continue

        marks, line_without_marks = patterns.extract_marks(raw_line)
        if marks is not None:
            pending_marks = marks

        numbering = extract_numbering_from_line(line_without_marks)
        if not numbering:
            continue

        active_section = _ensure_section(sections, current_section)
        question_marks = marks if marks is not None else pending_marks
        node = _create_node(numbering, line_without_marks, question_marks)

        while stack and stack[-1].depth >= node.depth:
            stack.pop()

        if stack:
            stack[-1].subquestions.append(node)
        else:
            active_section.questions.append(node)

        stack.append(node)
        pending_marks = None

    return sections


__all__ = ["detect_structure", "SectionBlock", "QuestionNode"]

