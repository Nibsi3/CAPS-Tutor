# PDF Processing Scripts

This directory contains scripts for processing PDF files, extracting content, and generating structured JSON output.

## Main Scripts

### `extract_to_desktop.py`
Main entry point for PDF extraction using the 3-stage pipeline.

**Usage:**
```bash
python extract_to_desktop.py "path/to/pdf/file.pdf"
```

**Features:**
- Uses the 3-stage PDF processing pipeline (`pdf_parser_pipeline.py`)
- Extracts text, images, and diagrams
- Generates structured JSON output
- Supports JSON fix logic for existing extractions

**Dependencies:**
- Requires `pdf_parser_pipeline.py` (should be in same directory or `C:\Users\cameron\Documents\Poppler\`)
- Requires Ollama with vision model (e.g., `qwen3-vl:8b`)

### Other Scripts
- `extract_pdf_pymupdf.py` - PyMuPDF-based extraction
- `extract_pdf_ocr.py` - OCR-based extraction
- `pdf-to-images.py` - Convert PDF pages to images
- `extract-pdf-images.py` - Extract embedded images from PDFs
- `analyze-all-papers.py` - Batch analysis tool

## Pipeline Location

The main pipeline (`pdf_parser_pipeline.py`) is currently located at:
`C:\Users\cameron\Documents\Poppler\pdf_parser_pipeline.py`

**Note:** Consider moving this file to this directory for better organization.

