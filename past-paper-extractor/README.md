# Past Paper Template Extractor

Backend-only pipeline that converts CAPS-aligned PDF past papers into standardised JSON templates ready for the Past Paper Editor.

## Pipeline overview

1. **`scripts/extract_text.py`** – gets page-wise text with `pdfplumber` (PyMuPDF fallback) and turns it into `CleanLine` objects.
2. **`utils/cleaner.py`** – strips page numbers, DBE headers/footers, soft hyphens, and table noise while preserving line indices for logging.
3. **`utils/numbering.py`** – normalises decimal/letter/roman hierarchies, enforces CAPS limits (main ≤ 40, depth ≤ 4), and rejects long decimal chains like `44.250.34.725`.
4. **`scripts/detect_sections.py`** – only accepts strong section headings (`SECTION A`, `SECTION B`, `INSTRUCTIONS`); inline “section” mentions are ignored.
5. **`scripts/detect_questions.py`** – matches question lines with strict patterns, rejects years/page numbers, attaches marks found at the end of the heading, and records every acceptance/rejection in `parse_log`.
6. **`scripts/build_tree.py`** – uses a stack to attach each candidate to its correct parent/section, preventing duplicates and guaranteeing exactly one `UNSECTIONED`.
7. **`scripts/validator.py`** – validates the final JSON (duplicate detection, depth checks, instructions cleanliness) and emits a confidence score.
8. **`scripts/process_folder.py`** – orchestrates the whole flow, saving three artefacts per PDF: the template JSON, `<name>_parse_log.json`, and `<name>_validation.json`.

```json
{
  "subject": "Mathematics",
  "paper": "Paper 1",
  "year": "2022",
  "template": {
    "sections": [
      {
        "title": "SECTION A",
        "questions": [
          { "number": "1", "maxMarks": 20, "subquestions": [] }
        ]
      }
    ]
  }
}
```

There is also a regression harness under `tests/` plus curated reference templates under `SAMPLES/expected` that represent the desired structure for Accounting, Business Studies, and Computer Applications Technology.

## Configuration

`config.json` stores the default library of folders. Update the `inputFolders` entries to point to new directories if needed. `outputFolder` controls where JSON files land by default.

## Usage

```bash
cd past-paper-extractor
python -m scripts.process_folder --input "C:/Users/cameron/Documents/past papers/EnglishPastPapers"
```

Optional arguments:

- `--subject`, `--paper`, `--year` – override metadata if filenames are ambiguous.
- `--output` – custom destination for template JSON + logs (defaults to your Desktop `past-paper-templates` folder).
- `--config` – alternate config file path.

Each processed PDF outputs three files in `~/Desktop/past-paper-templates` (unless overridden):

- `Subject_PaperX_Year.json`
- `Subject_PaperX_Year_parse_log.json` (sections/questions evaluated, rejections, heuristics)
- `Subject_PaperX_Year_validation.json` (validator result, warnings, confidence score)

## Implementation notes

- Section detection accepts only standalone uppercase/Title-case headers; instructions are allowed but forced to stay empty.
- Question detection supports `QUESTION 1`, bare `1`, decimal sub-levels, `(a)`, `(i)`, etc. Noise such as years (`2019`), WiFi standards (`802.11`), long decimals, or table percentages is rejected.
- Section headers embedded inside instructions or tables (e.g. “SECTION QUESTION” or “SECTION C - Consists of …”) are ignored so only the real CAPS sections become JSON sections. Papers without explicit sections collapse into a single `UNSECTIONED` block.
- Question numbering is validated: main questions must be `1–40` by default (configurable via `config.json`), depth ≤ 4, and letter/roman subparts only attach when a valid parent already exists.
- Tree building rewinds the stack whenever a prefix mismatch occurs so `1.2` never ends up under `Question 5`; duplicates per parent are logged and dropped.
- Mark extraction only inspects the trailing fragment of a heading (`[10]`, `(10 marks)`, `– 5 marks`). Embedded table marks are ignored; missing marks remain `null`.
- `parse_log` tracks sections considered, questions accepted/rejected, heuristics counts, and duplicate/stack adjustments.
- `validator.py` enforces the final schema and emits a confidence score (penalising warnings/errors). The score is also injected into the template JSON.

## Next steps

- Add automated tests with fixture PDFs (see `tests/test_on_uploaded_jsons.py` which now protects against the known bad JSONs).
- Extend metadata inference with subject dictionaries per CAPS subject group.
- Integrate logging levels from `config.json` and expose richer debugging traces per heuristic.

