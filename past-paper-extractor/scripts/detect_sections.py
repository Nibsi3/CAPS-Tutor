"""Identify CAPS section headings from cleaned PDF lines.

Example:
    from scripts.detect_sections import detect_sections
    sections = detect_sections(lines, parse_log={})
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

from utils.cleaner import CleanLine
from utils import patterns


@dataclass
class SectionMarker:
    title: str
    line_index: int
    page: int
    is_instructions: bool = False


def _normalise_section(match, base_title: str) -> str:
    code = match.group("code").upper()
    label = match.groupdict().get("label")
    if label:
        return f"{base_title} {code} - {label.strip().upper()}"
    return f"{base_title} {code}"


def detect_sections(lines: List[CleanLine], parse_log: Dict) -> Tuple[List[SectionMarker], set]:
    """Return section markers plus a set of line numbers reserved for headings."""
    sections: List[SectionMarker] = []
    heading_lines = set()

    for line in lines:
        text = line.text.strip()
        if not text:
            continue
        if len(text.split()) > 10:
            continue

        matched = patterns.SECTION_HEADING.match(text) or patterns.SECTION_HEADING_LOWER.match(text)
        if matched:
            title = _normalise_section(matched, "SECTION")
            sections.append(SectionMarker(title=title, line_index=line.index, page=line.page))
            heading_lines.add(line.index)
            parse_log.setdefault("sections", []).append(
                {"line": line.index, "page": line.page, "title": title}
            )
            continue

        if patterns.INSTRUCTION_HEADING.match(text):
            title = "INSTRUCTIONS"
            sections.append(SectionMarker(title=title, line_index=line.index, page=line.page, is_instructions=True))
            heading_lines.add(line.index)
            parse_log.setdefault("sections", []).append(
                {"line": line.index, "page": line.page, "title": title}
            )

    return sections, heading_lines


__all__ = ["SectionMarker", "detect_sections"]


