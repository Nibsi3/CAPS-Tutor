# Past Paper Processing Workflow

This automated workflow processes PDF past papers and uploads structured questions to Firebase.

## Overview

The workflow consists of three actions:

1. **Extract PDFs & Parse Metadata** (Python)
   - Extracts text and images from PDFs
   - Automatically parses metadata (subject, grade, paper, year) from filenames
   - Outputs JSON files with page content and image references

2. **AI Question Generation** (Node.js)
   - Uses Groq AI to convert PDF content into structured exam questions
   - Maintains original numbering and layout
   - Includes all question types (multiple-choice, short answer, diagrams, etc.)

3. **Upload to Firebase** (Node.js)
   - Uploads structured questions to Firestore
   - Organizes questions under `pastpapers/{subject-year-paper}/questions/`

## Prerequisites

### Python Dependencies
```bash
pip install -r requirements.txt
```

Or install directly:
```bash
pip install pymupdf
```

### Node.js Dependencies
All dependencies should already be installed via `package.json`.

### Environment Variables
Create a `.env.local` file with:
```
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config as needed
```

## Usage

### Option 1: Run Full Workflow (Recommended)
```bash
node scripts/run_full_workflow.mjs
```

This runs all three actions in sequence.

### Option 2: Run Actions Individually

**Step 1: Extract PDFs**
```bash
python scripts/extract_pdfs_with_metadata.py
```

**Step 2: Generate Questions**
```bash
node scripts/generate_questions_with_metadata.mjs
```

**Step 3: Upload to Firebase**
```bash
node scripts/upload_to_firebase_with_metadata.mjs
```

## Testing with Life Sciences Paper 1

By default, the extraction script is configured to process only Life Sciences Paper 1 files for testing. To process all PDFs:

1. Open `scripts/extract_pdfs_with_metadata.py`
2. Set `filter_subject = None` and `filter_paper = None` in the `main()` function

## Output Structure

```
extracted_papers/
├── extraction_summary.json          # Metadata from Action 1
├── questions_summary.json           # Questions from Action 2
├── upload_results.json               # Upload results from Action 3
└── {PDF_NAME}/
    ├── {PDF_NAME}.json              # Extracted text and page data
    ├── {PDF_NAME}_questions.json    # AI-generated questions
    └── images/
        └── page_X_img_Y.png         # Extracted images
```

## Firestore Structure

Questions are stored as:
```
pastpapers/
  {subject-year-paper}/
    questions/
      {question_number}/
        - number: "1.1"
        - type: "short"
        - question: "..."
        - image: null or "path/to/image.png"
        - answer: null or "..."
```

## File Naming Convention

PDFs should follow this naming pattern:
- `{Subject} P{Number} {Month} {Year} {Language}.pdf`
- Example: `Life Sciences P1 Nov 2020 Eng (2).pdf`

The script automatically extracts:
- **Subject**: Life Sciences
- **Paper**: Paper 1
- **Year**: 2020
- **Grade**: 12 (default, can be customized)

## Troubleshooting

### Python not found
- Ensure Python 3 is installed
- Add Python to your system PATH

### PyMuPDF not installed
```bash
pip install pymupdf
```

### Groq API errors
- Check that `GROQ_API_KEY` is set in environment
- Verify API key is valid and has credits

### Firebase errors
- Check Firebase config in `.env.local`
- Ensure Firestore is enabled in your Firebase project
- Verify Firestore security rules allow writes

