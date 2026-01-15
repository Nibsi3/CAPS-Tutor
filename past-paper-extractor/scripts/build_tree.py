"""Build nested question trees from detected question candidates.

Example:
    sections = build_tree(candidates, section_markers, parse_log)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from .detect_questions import QuestionCandidate
from .detect_sections import SectionMarker


@dataclass
class TreeQuestion:
    number: str
    tokens: Tuple[str, ...]
    kinds: Tuple[str, ...]
    maxMarks: Optional[int]
    subquestions: List["TreeQuestion"] = field(default_factory=list)


@dataclass
class SectionNode:
    title: str
    questions: List[TreeQuestion] = field(default_factory=list)


def _resolve_section_order(sections: List[SectionMarker]) -> List[str]:
    seen = []
    for marker in sections:
        if marker.title not in seen:
            seen.append(marker.title)
    return seen


def build_tree(
    candidates: List[QuestionCandidate],
    section_markers: List[SectionMarker],
    parse_log: Dict,
) -> List[SectionNode]:
    """Attach question candidates to their correct sections using a stack."""
    section_nodes: Dict[str, SectionNode] = {}
    stacks: Dict[str, List[TreeQuestion]] = {}

    ordered_titles = _resolve_section_order(section_markers)
    for title in ordered_titles:
        section_nodes.setdefault(title, SectionNode(title=title))
        stacks.setdefault(title, [])

    for candidate in candidates:
        section_title = candidate.section_hint or "UNSECTIONED"
        section = section_nodes.setdefault(section_title, SectionNode(title=section_title))
        stack = stacks.setdefault(section_title, [])

        while stack and len(stack[-1].tokens) >= len(candidate.tokens):
            stack.pop()

        while stack:
            parent_tokens = stack[-1].tokens
            if candidate.tokens[: len(parent_tokens)] == list(parent_tokens):
                break
            parse_log.setdefault("stack_adjustments", []).append(
                {
                    "section": section_title,
                    "popped": ".".join(parent_tokens),
                    "current": candidate.number,
                }
            )
            stack.pop()

        parent = stack[-1] if stack else None
        siblings = parent.subquestions if parent else section.questions
        tokens_tuple = tuple(candidate.tokens)

        if any(node.tokens == tokens_tuple for node in siblings):
            parse_log.setdefault("duplicates", []).append(
                {
                    "section": section_title,
                    "number": candidate.number,
                    "line": candidate.line_index,
                }
            )
            continue

        node = TreeQuestion(
            number=candidate.number,
            tokens=tokens_tuple,
            kinds=tuple(candidate.kinds),
            maxMarks=candidate.marks,
        )
        siblings.append(node)
        stack.append(node)

    return [section_nodes[title] for title in ordered_titles if title in section_nodes] + [
        node for title, node in section_nodes.items() if title not in ordered_titles
    ]


def serialise_sections(sections: List[SectionNode]) -> List[Dict]:
    """Convert section nodes into JSON-serialisable dictionaries."""
    def _serialize_question(question: TreeQuestion) -> Dict:
        return {
            "number": question.number,
            "maxMarks": question.maxMarks,
            "subquestions": [_serialize_question(child) for child in question.subquestions],
        }

    payload = []
    for section in sections:
        payload.append(
            {
                "title": section.title,
                "questions": [_serialize_question(q) for q in section.questions],
            }
        )
    return payload


__all__ = ["build_tree", "serialise_sections", "SectionNode"]

