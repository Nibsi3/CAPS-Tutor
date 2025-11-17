# Paper Editor v3 - Complete Guide

## Overview

Paper Editor v3 is a comprehensive tool for extracting, editing, and managing CAPS past papers. It includes:
- **Simplified JSON extraction** - Reliable Python-based extraction using PyMuPDF
- **Visual paper editor** - Edit questions, add images, manage metadata
- **CAPS syllabus alignment** - Full support for all question types
- **Batch processing** - Extract multiple papers at once

## Installation

### Prerequisites

1. **Python 3.8+** with PyMuPDF:
```bash
pip install PyMuPDF
```

2. **Node.js** for the web app

### Verify Installation

```bash
python -c "import fitz; print('PyMuPDF installed:', fitz.__version__)"
```

## Extraction Workflow

### Step 1: Extract a Single Paper

Extract questions and images from a PDF:

```bash
python scripts/extract_paper_simple.py "path/to/Life Sciences P1 Nov 2020 Eng.pdf" "./extracted"
```

This will create:
```
extracted/
  ├── extracted.json         # Complete paper data
  └── images/               # Extracted images
      ├── page1_img1.png
      ├── page2_img1.png
      └── ...
```

### Step 2: Batch Extract Multiple Papers

Extract all papers in a folder:

```bash
python scripts/batch_extract.py "./past papers" "./extracted_papers"
```

This will create:
```
extracted_papers/
  ├── Life Sciences P1 Nov 2020 Eng/
  │   ├── extracted.json
  │   └── images/
  ├── Life Sciences P2 Nov 2020 Eng/
  │   ├── extracted.json
  │   └── images/
  └── extraction_summary.json
```

### Step 3: Load in Paper Editor v3

1. Navigate to `/admin/paper-editor-v3`
2. Click "Load Paper JSON"
3. Select the `extracted.json` file
4. Edit, preview, and export

## Extracted JSON Format

The extraction produces a structured JSON file:

```json
{
  "filename": "Life Sciences P1 Nov 2020 Eng.pdf",
  "metadata": {
    "subject": "Life Sciences",
    "grade": 12,
    "paper": "Paper 1",
    "year": 2020,
    "isMemo": false
  },
  "questions": [
    {
      "number": "1.1",
      "type": "multiple_choice",
      "question": "Which ONE of the following...",
      "marks": 2,
      "options": [
        "A. Option A text",
        "B. Option B text",
        "C. Option C text",
        "D. Option D text"
      ],
      "answer": "B",
      "hasImage": false,
      "page": 1
    },
    {
      "number": "1.2",
      "type": "diagram",
      "question": "Identify the parts labeled A and B in the diagram below.",
      "marks": 4,
      "hasImage": true,
      "image": "data:image/png;base64,...",
      "imageFilename": "page2_img1.png",
      "page": 2
    }
  ],
  "images": [
    {
      "filename": "page2_img1.png",
      "dataUri": "data:image/png;base64,...",
      "page": 2
    }
  ],
  "totalPages": 15,
  "totalQuestions": 45,
  "totalImages": 8
}
```

## Question Types

Paper Editor v3 supports all CAPS question types:

| Type | Description | Example |
|------|-------------|---------|
| `multiple_choice` | MCQ with options A-D | "Which ONE of the following..." |
| `short_answer` | 1-3 mark questions | "Define the term osmosis." |
| `long_answer` | Essay questions | "Explain the process of photosynthesis." |
| `diagram` | Image-based questions | "Identify part A in the diagram." |
| `true_false` | True/False questions | "The heart has 4 chambers. TRUE/FALSE" |
| `matching` | Match items in columns | "Match Column A with Column B" |
| `calculation` | Math/science calculations | "Calculate the percentage..." |
| `fill_in` | Fill in the blank | "The _____ is responsible for..." |

## Using Paper Editor v3

### Loading a Paper

1. Click "Load Paper JSON"
2. Select your `extracted.json` file
3. The paper will load with all questions and images

### Editing Questions

1. **Select** a question from the sidebar
2. **Edit** the question text, marks, type, options
3. **Add/Remove** images
4. **Save** changes

### Adding New Questions

1. Click the "+" Add button
2. Fill in question details
3. Set question type and marks
4. Add options (for MCQ)
5. Upload or associate images

### Preview Mode

Toggle between Edit and Preview mode to see how the paper looks to students.

### Exporting

- **Export as JSON** - Save edited paper as JSON
- **Save** - Save to database/local storage
- **Download** - Download as PDF (future feature)

## CAPS Syllabus Alignment

The editor enforces CAPS standards:

✅ **Correct question numbering** - 1.1, 1.2, 1.2.1, etc.
✅ **Proper mark allocation** - Based on question complexity
✅ **Question type validation** - Ensures questions match CAPS format
✅ **Section structure** - Maintains CAPS paper sections
✅ **Image requirements** - Proper diagram integration

## Integration with Workflow

### Option 1: Manual Workflow

```bash
# 1. Extract
python scripts/extract_paper_simple.py "paper.pdf" "./extracted"

# 2. Edit in Paper Editor v3 (web UI)
# Navigate to /admin/paper-editor-v3

# 3. Export edited JSON
# Click "Export" button
```

### Option 2: Automated Workflow

```bash
# 1. Batch extract all papers
python scripts/batch_extract.py "./past papers" "./extracted_papers"

# 2. Process with AI (optional)
node scripts/generate_questions_with_metadata.mjs

# 3. Upload to database
node scripts/upload_to_firebase_with_metadata.mjs
```

## Troubleshooting

### Python Not Found

**Error:** `python: command not found`

**Solution:**
```bash
# Windows
python --version

# Mac/Linux
python3 --version

# Install Python from python.org
```

### PyMuPDF Not Installed

**Error:** `No module named 'fitz'`

**Solution:**
```bash
pip install PyMuPDF
# or
pip3 install PyMuPDF
```

### No Questions Extracted

**Possible causes:**
1. PDF is scanned (image-only) - requires OCR
2. Non-standard formatting
3. Encrypted PDF

**Solution:**
- Use OCR-capable PDF viewer to re-save PDF
- Check if PDF text is selectable
- Remove password protection

### Images Not Showing

**Possible causes:**
1. Images are too small (filtered out)
2. Images are logos/headers (filtered out)
3. Base64 encoding issue

**Solution:**
- Check `images/` folder for extracted images
- Verify image sizes (must be >100x100px)
- Re-extract with updated filters

## Examples

### Example 1: Life Sciences P1 Nov 2020

```bash
# Extract
python scripts/extract_paper_simple.py \
  "C:/Users/cameron/Desktop/Life Sciences P1 Nov 2020 Eng (2).pdf" \
  "./extracted_ls_p1_2020"

# Result
# extracted_ls_p1_2020/
#   ├── extracted.json (45 questions)
#   └── images/ (8 images)
```

### Example 2: Batch Extract All Papers

```bash
# Extract all papers
python scripts/batch_extract.py \
  "./past papers" \
  "./all_extracted"

# Result
# all_extracted/
#   ├── extraction_summary.json
#   ├── Life Sciences P1 Nov 2020 Eng/
#   ├── Life Sciences P2 Nov 2020 Eng/
#   ├── Physical Sciences P1 Nov 2020 Eng/
#   └── ...
```

## Advanced Features

### Custom Image Matching

Edit `extract_paper_simple.py` to customize image-to-question matching:

```python
def associate_images_with_questions(questions, images):
    # Custom logic here
    # Match based on bbox proximity, keywords, etc.
    pass
```

### Question Type Detection

Customize question type detection:

```python
def detect_question_type(text, has_options):
    # Add your own patterns
    if "calculate" in text.lower():
        return "calculation"
    # ...
```

### Answer Extraction

To extract answers from memos:

```bash
# Extract memo
python scripts/extract_paper_simple.py "memo.pdf" "./extracted_memo"

# Manually match answers in Paper Editor v3
# Or write a script to auto-match by question number
```

## Comparison: Old vs New System

| Feature | Old System | New System (v3) |
|---------|-----------|----------------|
| **Extraction** | Complex, AI-dependent | Simple, reliable Python |
| **Images** | Inconsistent matching | Proper bbox-based matching |
| **Question Types** | Limited support | Full CAPS support |
| **Editing** | No visual editor | Full-featured editor |
| **Reliability** | Rate limits, API failures | Works offline, no API |
| **Speed** | Slow (chunking, AI) | Fast (direct extraction) |

## Next Steps

1. ✅ Extract your papers using the new scripts
2. ✅ Load in Paper Editor v3
3. ✅ Edit and verify questions
4. ✅ Export to database or JSON
5. 🔄 Integrate with your app

## Support

For issues:
1. Check Python/PyMuPDF installation
2. Verify PDF is not encrypted
3. Check console for error messages
4. Review extracted JSON structure

## Future Enhancements

- [ ] AI-powered answer extraction from memos
- [ ] Automated question-answer matching
- [ ] PDF export from edited papers
- [ ] Bulk edit operations
- [ ] Version control for papers
- [ ] Cloud storage integration
