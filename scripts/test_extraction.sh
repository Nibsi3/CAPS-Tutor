#!/bin/bash
# Quick test script for Paper Editor v3 extraction

echo "====================================="
echo "Paper Editor v3 - Extraction Test"
echo "====================================="
echo ""

# Check Python
echo "Checking Python installation..."
if ! command -v python &> /dev/null; then
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python not found. Please install Python 3.8+"
        exit 1
    else
        PYTHON_CMD="python3"
    fi
else
    PYTHON_CMD="python"
fi

echo "✓ Python found: $($PYTHON_CMD --version)"

# Check PyMuPDF
echo "Checking PyMuPDF installation..."
if ! $PYTHON_CMD -c "import fitz" &> /dev/null; then
    echo "❌ PyMuPDF not installed"
    echo "   Run: pip install PyMuPDF"
    exit 1
fi

echo "✓ PyMuPDF installed"
echo ""

# Test with sample file (if provided)
if [ -z "$1" ]; then
    echo "Usage: ./test_extraction.sh <path_to_pdf>"
    echo ""
    echo "Example:"
    echo "  ./test_extraction.sh 'C:/Users/cameron/Desktop/Life Sciences P1 Nov 2020 Eng (2).pdf'"
    exit 0
fi

PDF_PATH="$1"

if [ ! -f "$PDF_PATH" ]; then
    echo "❌ PDF file not found: $PDF_PATH"
    exit 1
fi

echo "Extracting: $PDF_PATH"
echo ""

# Create output directory
OUTPUT_DIR="./test_extraction_output"
mkdir -p "$OUTPUT_DIR"

# Run extraction
$PYTHON_CMD scripts/extract_paper_simple.py "$PDF_PATH" "$OUTPUT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "====================================="
    echo "✅ Extraction Complete!"
    echo "====================================="
    echo ""
    echo "Output location: $OUTPUT_DIR"
    echo "  - extracted.json (paper data)"
    echo "  - images/ (extracted diagrams)"
    echo ""
    echo "Next steps:"
    echo "1. Open the web app: npm run dev"
    echo "2. Navigate to /admin/paper-editor-v3"
    echo "3. Load the extracted.json file"
    echo ""
else
    echo ""
    echo "❌ Extraction failed. Check errors above."
    exit 1
fi
