# Paper Extraction Scripts - Quick Reference

## New Simplified Extraction System

### 📋 Overview

This folder contains the **new, simplified extraction system** for CAPS past papers. It's designed to be:
- ✅ **Reliable** - Works offline, no API dependencies
- ✅ **Fast** - Direct PDF extraction using PyMuPDF
- ✅ **Accurate** - Proper question detection and image association
- ✅ **Simple** - Single command to extract a paper

### 🚀 Quick Start

#### Windows

```cmd
# Test extraction
test_extraction.bat "C:\path\to\paper.pdf"

# Extract single paper
python extract_paper_simple.py "paper.pdf" "./output"

# Batch extract folder
python batch_extract.py "./past papers" "./extracted_papers"
```

#### Mac/Linux

```bash
# Test extraction
./test_extraction.sh "/path/to/paper.pdf"

# Extract single paper
python3 extract_paper_simple.py "paper.pdf" "./output"

# Batch extract folder
python3 batch_extract.py "./past papers" "./extracted_papers"
```

### 📦 Installation

```bash
# Install PyMuPDF
pip install PyMuPDF

# Verify installation
python -c "import fitz; print('PyMuPDF OK')"
```

### 🎯 Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `extract_paper_simple.py` | Extract single PDF | `python extract_paper_simple.py input.pdf output/` |
| `batch_extract.py` | Extract multiple PDFs | `python batch_extract.py input_folder/ output_folder/` |
| `test_extraction.sh` | Test extraction (Linux/Mac) | `./test_extraction.sh paper.pdf` |
| `test_extraction.bat` | Test extraction (Windows) | `test_extraction.bat paper.pdf` |

### 📁 Output Structure

```
extracted_papers/
├── Life_Sciences_P1_Nov_2020_Eng/
│   ├── extracted.json          # Complete paper data
│   └── images/                 # Extracted images
│       ├── page1_img1.png
│       ├── page2_img1.png
│       └── ...
├── Life_Sciences_P2_Nov_2020_Eng/
│   └── ...
└── extraction_summary.json     # Batch summary
```

### 🔍 Extracted JSON Format

```json
{
  "filename": "Life Sciences P1 Nov 2020 Eng.pdf",
  "metadata": {
    "subject": "Life Sciences",
    "grade": 12,
    "paper": "Paper 1",
    "year": 2020
  },
  "questions": [
    {
      "number": "1.1",
      "type": "multiple_choice",
      "question": "Which ONE...",
      "marks": 2,
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "hasImage": false,
      "page": 1
    }
  ],
  "images": [...],
  "totalQuestions": 45,
  "totalImages": 8
}
```

### 🎨 Using with Paper Editor v3

1. **Extract paper:**
   ```bash
   python extract_paper_simple.py "paper.pdf" "./extracted"
   ```

2. **Open web app:**
   ```bash
   npm run dev
   ```

3. **Navigate to:**
   ```
   http://localhost:3000/admin/paper-editor-v3
   ```

4. **Load JSON:**
   - Click "Load Paper JSON"
   - Select `extracted/extracted.json`
   - Edit and export!

### ⚙️ Configuration

#### Filter Small Images

Edit `extract_paper_simple.py`:

```python
# Line ~140
if pix.width < 100 or pix.height < 100:  # Change threshold
    continue
```

#### Customize Question Detection

Edit `extract_paper_simple.py`:

```python
def detect_question_type(text, has_options):
    # Add your own patterns
    if "calculate" in text.lower():
        return "calculation"
    # ...
```

### 🐛 Troubleshooting

#### Issue: Python not found

```bash
# Windows
python --version
# If fails, install from python.org

# Mac/Linux
python3 --version
```

#### Issue: PyMuPDF not installed

```bash
pip install PyMuPDF
# or
pip3 install PyMuPDF
```

#### Issue: No questions extracted

**Causes:**
- PDF is scanned (image-only)
- Non-standard formatting
- Encrypted PDF

**Solutions:**
- Use OCR-capable PDF viewer to re-save
- Check if text is selectable in PDF
- Remove password protection

#### Issue: Images not showing

**Causes:**
- Images too small (filtered)
- Images are logos (filtered)

**Solutions:**
- Check `images/` folder
- Adjust size threshold in script

### 📊 Comparison: Old vs New

| Feature | Old System | New System |
|---------|-----------|------------|
| Dependencies | Groq AI, Node.js, Python | PyMuPDF only |
| Speed | Slow (AI processing) | Fast (direct) |
| Reliability | API limits, failures | 100% offline |
| Image matching | Inconsistent | Proper bbox-based |
| Question types | Limited | Full CAPS support |
| Editing | None | Visual editor v3 |

### 🔄 Migration Guide

If you have old extraction data:

```bash
# Old workflow (deprecated)
python scripts/extract_pdfs_with_metadata.py
node scripts/generate_questions_with_metadata.mjs

# New workflow (recommended)
python scripts/extract_paper_simple.py "paper.pdf" "./extracted"
# Then use Paper Editor v3
```

### 📚 Full Documentation

See: `docs/PAPER_EDITOR_V3_GUIDE.md`

### ✨ Features

- ✅ Extracts all question types (MCQ, short answer, diagrams, etc.)
- ✅ Proper question numbering detection
- ✅ Mark allocation extraction
- ✅ Image-to-question association
- ✅ CAPS syllabus alignment
- ✅ Batch processing
- ✅ Visual editor integration

### 🎯 Example Workflow

```bash
# 1. Extract all papers in folder
python batch_extract.py "./past papers" "./extracted_papers"

# 2. Review extraction_summary.json
cat extracted_papers/extraction_summary.json

# 3. Open one paper in editor
# Load extracted_papers/Life_Sciences_P1_Nov_2020_Eng/extracted.json

# 4. Edit, verify, export

# 5. Upload to database (optional)
# Use your existing upload scripts
```

### 🚨 Important Notes

- **Memos:** Currently extracts papers only, not memos (can be added)
- **OCR:** Does not perform OCR on scanned PDFs
- **Encryption:** Cannot extract from password-protected PDFs
- **Formatting:** Works best with standard CAPS format

### 🔗 Related Files

- `/src/components/paper-editor-v3.tsx` - Visual editor component
- `/src/app/admin/paper-editor-v3/page.tsx` - Editor page
- `/docs/PAPER_EDITOR_V3_GUIDE.md` - Complete guide

### 📝 License

Same as main project

### 👥 Support

For issues or questions, check the troubleshooting section above or review the full guide.
