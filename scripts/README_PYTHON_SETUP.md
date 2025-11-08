# Python Setup for PDF Extraction

## Prerequisites

1. **Install Python 3.8+**
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **Install PyMuPDF**
   ```bash
   pip install PyMuPDF
   ```
   
   Or use the requirements file:
   ```bash
   pip install -r scripts/requirements.txt
   ```

## Test the Extraction

```bash
python scripts/extract_pdf_pymupdf.py path/to/paper.pdf output/directory
```

This will:
- Extract all text blocks with bounding boxes
- Extract all images with bounding boxes  
- Save images to `output/directory/images/`
- Save structured JSON to `output/directory/extraction.json`

## Why PyMuPDF?

- **Proper Image Extraction**: Handles JPX, CCITT, and other PDF image formats
- **Bounding Boxes**: Provides exact coordinates for text and images
- **Layout Preservation**: Maintains spatial relationships
- **Reliable**: Industry standard for PDF processing

## Integration

The Node.js backend calls this Python script via child_process to extract PDFs before sending to Groq.

