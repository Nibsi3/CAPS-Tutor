# Quick Start Guide - Life Sciences P1 Test

This guide will walk you through testing the workflow with Life Sciences Paper 1.

## Step 1: Install Dependencies

### Python
```bash
pip install -r requirements.txt
```

### Verify Installation
```bash
python --version  # Should show Python 3.x
python -c "import fitz; print('PyMuPDF installed')"
```

## Step 2: Set Environment Variables

Create a `.env.local` file in the project root (if it doesn't exist):

```bash
GROQ_API_KEY=your_groq_api_key_here
```

The Firebase config is already set in the scripts, but you can override with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

## Step 3: Run the Workflow

### Option A: Full Automated Workflow
```bash
node scripts/run_full_workflow.mjs
```

### Option B: Step by Step

**Step 1: Extract PDFs**
```bash
python scripts/extract_pdfs_with_metadata.py
```

Expected output:
- Creates `extracted_papers/` folder
- Extracts Life Sciences P1 PDFs
- Creates JSON files with text and images

**Step 2: Generate Questions**
```bash
node scripts/generate_questions_with_metadata.mjs
```

Expected output:
- Reads extracted JSON files
- Calls Groq API to generate questions
- Saves `_questions.json` files

**Step 3: Upload to Firebase**
```bash
node scripts/upload_to_firebase_with_metadata.mjs
```

Expected output:
- Uploads questions to Firestore
- Creates `pastpapers/{subject-year-paper}/questions/` structure

## Step 4: Verify Results

Check the following files:
- `extracted_papers/extraction_summary.json` - PDF metadata
- `extracted_papers/questions_summary.json` - Generated questions
- `extracted_papers/upload_results.json` - Upload status

## Troubleshooting

### Python not found
- Install Python 3 from python.org
- Add Python to PATH during installation

### PyMuPDF import error
```bash
pip install pymupdf --upgrade
```

### Groq API errors
- Verify `GROQ_API_KEY` is set in `.env.local`
- Check API key is valid at https://console.groq.com/

### Firebase errors
- Ensure Firestore is enabled in Firebase Console
- Check Firestore security rules allow writes
- Verify network connectivity

## Next Steps

Once Life Sciences P1 works:
1. Edit `scripts/extract_pdfs_with_metadata.py`
2. Set `filter_subject = None` and `filter_paper = None`
3. Run the workflow to process all PDFs



