# 🧪 Quick Test Guide - PyMuPDF Integration

## Pre-Test Checklist

### 1. Python Setup (5 minutes)
```bash
# Check Python version
python --version
# Should be 3.8 or higher

# Install PyMuPDF
pip install PyMuPDF

# Verify installation
python -c "import fitz; print('PyMuPDF installed successfully')"
```

### 2. Quick Python Test
```bash
# Navigate to project root
cd C:\Users\cameron\Documents\CAPS-Tutor\CAPS-Tutor

# Test with a sample PDF (use any PDF from your storage)
python scripts/extract_pdf_pymupdf.py "path/to/any.pdf" "test_output"

# Expected output:
# ✓ Extracted X pages
# ✓ JSON saved to: test_output/extraction.json
# ✓ Images saved to: test_output/images/
```

Expected result files:
- `test_output/extraction.json` - Structured data
- `test_output/images/` - Extracted images as PNGs

## Main Test - Full Integration

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Navigate to Admin Interface
```
http://localhost:9002/admin/process-papers
```

### 3. Click "Process All Past Papers"

### 4. Watch Console Output

**Expected (Success)**:
```
📄 Processing paper: Life Sciences P1 Nov 2020 Eng (2).pdf
   🐍 Extracting paper with PyMuPDF...
   🐍 Extracting memo with PyMuPDF...
   🤖 Processing with AI (single pass)...
   ✅ Extracted 150 questions in single pass
   🖼️  Converting images to data URIs...
✅ Successfully processed: Life Sciences P1 Nov 2020 Eng (2).pdf
```

**UI Expected**:
```
✅ Processing Complete
Processed 2 papers, skipped 0 duplicates, failed 0.

✓ Processed: 2
⊘ Skipped (duplicates): 0
✗ Failed: 0
```

## Verify Questions

### 1. Navigate to Past Papers
```
http://localhost:9002/dashboard/past-papers
```

### 2. Click on "Life Sciences P1 - 2020"

### 3. Check Questions

**What to Look For**:
- ✅ **Question Count**: Should be ~150 questions (not 28 + 5)
- ✅ **MCQ Format**: 
  ```
  1.1.1 Which ONE of the following...
  A. Option A text
  B. Option B text
  C. Option C text
  D. Option D text
  ```
- ✅ **Images**: Questions like "Study the diagram..." should have images
- ✅ **Numbering**: Sequential (1.1.1, 1.1.2, 1.1.3, 1.2.1, etc.)
- ✅ **Marks**: Each question shows mark allocation (e.g., "2 marks")
- ✅ **Answers**: Available when you attempt the question

## Common Issues & Quick Fixes

### Issue: "UnicodeEncodeError: 'charmap' codec can't encode character" (Windows)
**Fix**: ✅ **ALREADY FIXED** in the code!
The system now automatically sets `PYTHONIOENCODING=utf-8` when calling Python.
If you see this error, just restart the dev server and try again.

**Manual fix (if needed)**:
```powershell
# In PowerShell, set env var
$env:PYTHONIOENCODING="utf-8"

# Or in CMD
set PYTHONIOENCODING=utf-8

# Then restart dev server
npm run dev
```

### Issue: "Python not found"
**Fix**:
```bash
# Install Python from python.org
# Ensure "Add Python to PATH" is checked
# Restart terminal/Cursor
```

### Issue: "ModuleNotFoundError: No module named 'fitz'"
**Fix**:
```bash
pip install PyMuPDF
# NOT "pip install fitz" (wrong package)
```

### Issue: "ENOENT: no such file or directory, open 'test_output/images/...'"
**Possible Cause**: Python script failed silently
**Fix**:
```bash
# Run Python script directly to see errors
python scripts/extract_pdf_pymupdf.py "test.pdf" "output"
# Check for Python errors in stderr
```

### Issue: "Groq API error: 413 Payload Too Large"
**Unlikely with PyMuPDF** (uses 80% less tokens)
**If it happens**: Check if prompt is still being built correctly

### Issue: "Rate limit reached"
**Unlikely with PyMuPDF** (1 API call vs 3-5)
**If it happens**: The retry logic will handle it automatically

## Success Indicators

### During Processing:
- ✅ Sees "🐍 Extracting with PyMuPDF"
- ✅ Sees "🤖 Processing with AI (single pass)"
- ✅ Completes in <15 seconds per paper (vs 60s+ before)
- ✅ No "Waiting 20 seconds..." messages
- ✅ No "Rate limit" errors

### After Processing:
- ✅ All questions extracted (150+, not 33)
- ✅ MCQs have all 4 options (A, B, C, D)
- ✅ Images attached to correct questions
- ✅ Questions in correct order
- ✅ Answers available from memo

## If Everything Works:

🎉 **Success!** The PyMuPDF integration is working perfectly.

Next steps:
1. ✅ Mark as production-ready
2. ✅ Expand to other subjects (Physics, Chemistry, etc.)
3. ✅ Clean up old OCR code
4. ✅ Monitor for any edge cases

## If Something Fails:

1. **Check Python**: `python --version`
2. **Check PyMuPDF**: `python -c "import fitz; print(fitz.__version__)"`
3. **Check Logs**: Look for detailed error messages in terminal
4. **Check PDF**: Try with a different PDF to isolate the issue
5. **Share Error**: Copy full error message for debugging

---

**Quick Test Command**:
```bash
# All-in-one test
python --version && \
python -c "import fitz; print('✓ PyMuPDF installed')" && \
npm run dev
```

Then navigate to `http://localhost:9002/admin/process-papers` and click "Process All Past Papers".

