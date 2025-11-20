"""CLI utility to process a folder of CAPS past papers into template JSON."""

from __future__ import annotations

import argparse
import json
import logging
import re
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple

from .build_template import build_template, save_template
from .detect_structure import detect_structure
from .extract_text import extract_text


LOGGER = logging.getLogger("past-paper-extractor.process_folder")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s - %(message)s")


DEFAULT_CONFIG_PATH = Path(__file__).resolve().parents[1] / "config.json"
DEFAULT_OUTPUT_DIR = Path.home() / "Desktop" / "past-paper-templates"

YEAR_PATTERN = re.compile(r"(19|20)\d{2}")
PAPER_PATTERN = re.compile(r"(paper|p)\s*(?P<num>\d)", re.IGNORECASE)


def _read_config(path: Path) -> Dict[str, str]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    folders = data.get("inputFolders", {})
    resolved = {key: str(Path(value)) for key, value in folders.items()}
    return {
        "output": data.get("outputFolder", ""),
        **resolved,
    }


def _infer_metadata(file_path: Path, explicit_subject: Optional[str]) -> Tuple[str, str, str]:
    stem = file_path.stem.replace("-", " ").replace("_", " ")
    year_match = YEAR_PATTERN.search(stem)
    year = year_match.group(0) if year_match else "Unknown"

    paper_match = PAPER_PATTERN.search(stem)
    paper = f"Paper {paper_match.group('num')}" if paper_match else "Paper"

    if explicit_subject:
        subject = explicit_subject
    else:
        subject_part = stem.split(" ")[0]
        subject = subject_part.title()

    return subject, paper, year


def iter_pdfs(root: Path) -> Iterable[Path]:
    for path in sorted(root.rglob("*.pdf")):
        if path.is_file():
            yield path


def process_pdf(pdf_path: Path, subject: str, paper: str, year: str, output_dir: Path) -> Path:
    text = extract_text(pdf_path)
    sections = detect_structure(text)
    template = build_template(subject, paper, year, sections)
    filename = f"{subject}_{paper.replace(' ', '')}_{year}"
    return save_template(template, output_dir, filename)


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
    input_dir = Path(args.input or config.get("input", ""))
    if not input_dir:
        raise SystemExit("No input directory supplied. Use --input or config.json inputFolders.")

    output_dir = Path(args.output or config.get("output") or DEFAULT_OUTPUT_DIR)
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
            save_path = process_pdf(pdf_path, subject, paper, year, output_dir)
        except Exception as exc:  # pragma: no cover - ensures batch keeps running
            LOGGER.error("Failed to process %s: %s", pdf_path.name, exc)
            continue
        LOGGER.info("Generated template -> %s", save_path.name)


if __name__ == "__main__":
    main()

