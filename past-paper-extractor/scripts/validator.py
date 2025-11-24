"""Template validator ensuring generated JSON matches CAPS rules."""

from __future__ import annotations

from typing import Dict, List, Tuple

from utils.numbering import MAX_MAIN_QUESTION, MAX_DEPTH


def _validate_question(
    question: Dict,
    errors: List[str],
    warnings: List[str],
    trail: Tuple[str, ...],
):
    number = question.get("number")
    if not number:
        errors.append("Question missing number at path {}".format(".".join(trail)))
        return

    parts = number.split(".")
    if len(parts) > MAX_DEPTH:
        errors.append(f"{number} exceeds maximum depth {MAX_DEPTH}")

    try:
        first_val = int(parts[0])
        if first_val < 1 or first_val > MAX_MAIN_QUESTION:
            errors.append(f"{number} has invalid main question {parts[0]}")
    except ValueError:
        errors.append(f"{number} must begin with an integer main question")

    for segment in parts:
        if len(segment) > 3:
            warnings.append(f"{number} contains unusually long segment {segment}")

    marks = question.get("maxMarks")
    if marks is not None and not isinstance(marks, int):
        errors.append(f"{number} maxMarks must be integer or null")

    children = question.get("subquestions", [])
    seen = set()
    for child in children:
        child_number = child.get("number")
        if child_number in seen:
            errors.append(f"Duplicate subquestion {child_number} under {number}")
        else:
            seen.add(child_number)
        _validate_question(child, errors, warnings, trail + (child_number or "",))


def validate_template(template: Dict) -> Dict:
    errors: List[str] = []
    warnings: List[str] = []

    sections = template.get("template", {}).get("sections", [])
    if not sections:
        errors.append("Template contains no sections")

    seen_unsectioned = 0
    for section in sections:
        title = section.get("title", "").upper()
        if title == "UNSECTIONED":
            seen_unsectioned += 1
            if section.get("questions") and seen_unsectioned > 1:
                errors.append("Multiple UNSECTIONED blocks detected")

        if title.startswith("INSTRUCTION") and section.get("questions"):
            errors.append("INSTRUCTIONS section must not contain questions")

        seen = set()
        for question in section.get("questions", []):
            number = question.get("number")
            if number in seen:
                errors.append(f"Duplicate question {number} in {section.get('title')}")
            else:
                seen.add(number)
            _validate_question(question, errors, warnings, (number or "",))

    confidence = max(0.1, 1 - 0.2 * len(errors) - 0.05 * len(warnings))
    return {
        "valid": not errors,
        "errors": errors,
        "warnings": warnings,
        "confidence": round(confidence, 2),
    }


__all__ = ["validate_template"]

