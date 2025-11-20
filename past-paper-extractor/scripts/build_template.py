"""Generate CAPS-aligned template JSON from detected structure."""

from __future__ import annotations

import json
import logging
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from .detect_structure import QuestionNode, SectionBlock


LOGGER = logging.getLogger("past-paper-extractor.build_template")


def _question_to_dict(node: QuestionNode) -> Dict[str, Any]:
    return {
        "number": node.number,
        "maxMarks": node.max_marks,
        "subquestions": [_question_to_dict(child) for child in node.subquestions],
    }


def _section_to_dict(section: SectionBlock) -> Dict[str, Any]:
    return {
        "title": section.title,
        "questions": [_question_to_dict(q) for q in section.questions],
    }


def build_template(subject: str, paper: str, year: str, sections: List[SectionBlock]) -> Dict[str, Any]:
    template = {
        "subject": subject,
        "paper": paper,
        "year": year,
        "template": {
            "sections": [_section_to_dict(section) for section in sections],
        },
    }
    LOGGER.debug("Built template for %s %s %s", subject, paper, year)
    return template


def save_template(template: Dict[str, Any], output_dir: str | Path, filename: str) -> Path:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{filename}.json"
    with path.open("w", encoding="utf-8") as fh:
        json.dump(template, fh, ensure_ascii=False, indent=2)
    LOGGER.info("Saved template JSON to %s", path)
    return path


__all__ = ["build_template", "save_template"]

