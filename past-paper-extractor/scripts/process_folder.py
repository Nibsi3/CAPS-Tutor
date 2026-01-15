"""CLI utility to process folders of CAPS past papers into template JSON."""

from __future__ import annotations

import argparse
import json
import logging
import re
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple

from .extract_text import extract_lines
from .detect_sections import detect_sections
from .detect_questions import detect_questions
from .build_tree import build_tree, serialise_sections
from .validator import validate_template


LOGGER = logging.getLogger("past-paper-extractor.process_folder")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s - %(message)s")


DEFAULT_CONFIG_PATH = Path(__file__).resolve().parents[1] / "config.json"
DEFAULT_OUTPUT_DIR = Path.home() / "Desktop" / "past-paper-templates"

YEAR_PATTERN = re.compile(r"(19|20)\d{2}")
PAPER_PATTERN = re.compile(r"(paper|p)\s*(?P<num>\d)", re.IGNORECASE)


def _read_config(path: Path) -> Dict:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    folders = data.get("inputFolders", {})
    resolved = {key: str(Path(value)) for key, value in folders.items()}
    data["inputFolders"] = resolved
    return data


def _infer_metadata(file_path: Path, explicit_subject: Optional[str]) -> Tuple[str, str, str]:
    stem = file_path.stem.replace("-", " ").replace("_", " ")
    year_match = YEAR_PATTERN.search(stem)
    year = year_match.group(0) if year_match else "Unknown"

    paper_match = PAPER_PATTERN.search(stem)
    paper = f"Paper {paper_match.group('num')}" if paper_match else "Paper"

    subject = explicit_subject or stem.split(" ")[0].title()
    return subject, paper, year


def iter_pdfs(root: Path) -> Iterable[Path]:
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.suffix.lower() == ".pdf":
            yield path


def _write_json(payload: Dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def process_pdf(
    pdf_path: Path,
    subject: str,
    paper: str,
    year: str,
    output_dir: Path,
    config: Dict,
) -> None:
    lines = extract_lines(pdf_path)
    parse_log: Dict = {"file": pdf_path.name, "sections": [], "questions": [], "rejections": []}

    section_markers, heading_lines = detect_sections(lines, parse_log)
    candidates = detect_questions(
        lines,
        section_markers,
        heading_lines,
        parse_log,
        {"max_main_question": config.get("limits", {}).get("maxMainQuestion", 40)},
    )

    sections = build_tree(candidates, section_markers, parse_log)
    template_payload = {
        "subject": subject,
        "paper": paper,
        "year": year,
        "template": {
            "sections": serialise_sections(sections),
        },
    }

    validation = validate_template(template_payload)
    template_payload["confidence"] = validation["confidence"]

    filename = f"{subject}_{paper.replace(' ', '')}_{year}"
    template_path = output_dir / f"{filename}.json"
    _write_json(template_payload, template_path)

    heuristics = parse_log.setdefault("heuristics", {})
    top = sorted(heuristics.items(), key=lambda item: item[1], reverse=True)[:10]
    parse_log["top_heuristics"] = [[name, count] for name, count in top]
    _write_json(parse_log, output_dir / f"{filename}_parse_log.json")
    _write_json(validation, output_dir / f"{filename}_validation.json")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=str, help="Folder containing PDF past papers")
    parser.add_argument("--subject", type=str, help="Override subject for all files")
    parser.add_argument("--paper", type=str, help="Override paper label for all files")
    parser.add_argument("--year", type=str, help="Override year for all files")
    parser.add_argument(
        "--output",
        type=str,
        default=str(DEFAULT_OUTPUT_DIR),
        help="Directory to store generated templates",
    )
    parser.add_argument(
        "--config",
        type=str,
        default=str(DEFAULT_CONFIG_PATH),
        help="Custom config file path (overrides defaults)",
    )
    args = parser.parse_args()

    config = _read_config(Path(args.config))
    input_value = args.input or config.get("input", "")
    if not input_value:
        raise SystemExit("No input directory supplied. Use --input or config.json inputFolders.")
    input_dir = Path(input_value)

    output_dir = Path(args.output or config.get("outputFolder") or DEFAULT_OUTPUT_DIR)
    output_dir.mkdir(parents=True, exist_ok=True)

    LOGGER.info("Processing PDFs from %s", input_dir)
    for pdf_path in iter_pdfs(input_dir):
        subject, paper, year = _infer_metadata(pdf_path, args.subject)
        if args.paper:
            paper = args.paper
        if args.year:
            year = args.year

        LOGGER.info("Processing %s (%s, %s, %s)", pdf_path.name, subject, paper, year)
        try:
            process_pdf(pdf_path, subject, paper, year, output_dir, config)
        except Exception as exc:  # pragma: no cover
            LOGGER.error("Failed to process %s: %s", pdf_path.name, exc)
            continue
        LOGGER.info("Generated template -> %s_%s_%s.json", subject, paper.replace(' ', ''), year)


if __name__ == "__main__":
    main()

