# PDF Question Extractor

This module extracts questions from PDF past papers and processes them in real-time.

## Setup

1. Install Python dependencies:
```bash
pip install PyMuPDF numpy Pillow opencv-python
```

2. Ensure `add_images_to_json.py` is in the same directory as `extract_questions.py`

## Usage

The extractor is automatically called by the API when a PDF is uploaded through the admin interface.

### Manual Usage

```bash
python extract_questions.py <path_to_pdf>
```

The script will output JSON lines, one per question, in the format:
```json
{"type": "question", "data": {...}}
{"type": "complete", "total": 10}
```

## Features

- Extracts questions in order from PDF
- Matches images/diagrams to questions
- Classifies question types (multiple-choice, diagram, table, etc.)
- Extracts sub-questions
- Streams results in real-time

## Dependencies

- PyMuPDF (fitz) - PDF processing
- numpy - Image processing
- Pillow - Image manipulation
- opencv-python - Diagram detection
- add_images_to_json.py - Image extraction utilities

