# Past Paper Template Extractor

Backend-only pipeline that converts CAPS-aligned PDF past papers into standardised JSON templates ready for the Past Paper Editor.

## Pipeline overview

1. **`scripts/extract_text.py`** – pulls text from PDFs using `pdfplumber` with a PyMuPDF fallback to guarantee coverage when PDFs have tricky encodings.
2. **`utils/cleaner.py`** – strips page numbers, watermarks, DBE footers, soft hyphens, and other noise so only pedagogically relevant content remains.
3. **`utils/numbering.py`** – normalises every numbering system used across CAPS (decimal, alpha, roman, and mixed chains like `1.1 (a) (i)`), turning them into stack-friendly tokens.
4. **`scripts/detect_structure.py`** – walks the cleaned lines top-to-bottom, detects sections (`SECTION A/B/C` or implicit), questions, sub-questions, and marks, and builds a nested question tree with a stack.
5. **`scripts/build_template.py`** – converts the section/question tree into the JSON schema required by the Past Paper Editor:

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

6. **`scripts/process_folder.py`** – command-line orchestrator that walks a folder of PDFs, extracts metadata from filenames, runs the full pipeline, and writes JSON to the Desktop (`~/Desktop/past-paper-templates`) by default.

## Configuration

`config.json` stores the default library of folders. Update the `inputFolders` entries to point to new directories if needed. `outputFolder` controls where JSON files land by default.

## Usage

```bash
cd past-paper-extractor
python -m scripts.process_folder --input "C:/Users/cameron/Documents/past papers/EnglishPastPapers"
```

Optional arguments:

- `--subject`, `--paper`, `--year` – override metadata if filenames are ambiguous.
- `--output` – custom destination for template JSON files (defaults to your Desktop `past-paper-templates` folder).
- `--config` – alternate config file path.

Each processed PDF outputs `Subject_PaperX_Year.json` in `~/Desktop/past-paper-templates` (unless you override `--output`). When a paper name has no explicit number, it is labelled simply `Paper` so single-paper exams keep their official naming style. Failed PDFs (e.g. scanned images) are logged and skipped so the batch continues.

## Implementation notes

- Section detection accepts `SECTION A`, `Section B`, `SECTION-A`, and long-form labels such as `SECTION A: LANGUAGE`.
- Question detection supports `QUESTION 1`, `Q1`, bare `1`, as well as nested decimals, `(a)`, `(i)`, etc.
- Mark extraction captures `[5 marks]`, `(5 marks)`, `5 marks`, and `5 mark` variations. Missing marks are stored as `null` for later completion in the editor.
- Noise cleaning removes headers/footers (`Department of Basic Education`, `Page x of y`, watermarks) before parsing to avoid false positives.
- The stack-based tree builder ensures numbering depth changes (`1` → `1.1` → `1.1.1`, etc.) correctly attach to their parents, even when letters or roman numerals are mixed in.

## Next steps

- Add automated tests with fixture PDFs.
- Extend metadata inference with subject dictionaries per CAPS subject group.
- Integrate logging levels from `config.json` and expose richer debugging traces.

