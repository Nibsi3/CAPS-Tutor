# 🚀 Paper Editor v3 - Quick Start

## One-Command Test

### Windows
```cmd
scripts\test_extraction.bat "C:\Users\cameron\Desktop\Life Sciences P1 Nov 2020 Eng (2).pdf"
```

### Mac/Linux
```bash
./scripts/test_extraction.sh "/path/to/Life Sciences P1 Nov 2020 Eng (2).pdf"
```

## What Happens

1. ✅ Checks Python & PyMuPDF installed
2. ✅ Extracts all questions from PDF
3. ✅ Extracts all images/diagrams
4. ✅ Creates `test_extraction_output/extracted.json`
5. ✅ Shows summary of extraction

## Next: Open Paper Editor v3

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to:**
   ```
   http://localhost:3000/admin/paper-editor-v3
   ```

3. **Load JSON:**
   - Click "Load Paper JSON"
   - Select `test_extraction_output/extracted.json`
   - Done! ✨

## What You Can Do

### In the Editor:

- ✏️ **Edit questions** - Click any question
- ➕ **Add questions** - Click "+" button
- 👁️ **Preview** - Toggle edit/preview mode
- 💾 **Save** - Save to database
- 📥 **Export** - Download as JSON
- 🎨 **Edit metadata** - Subject, grade, year
- 🖼️ **View images** - All diagrams included
- 📊 **See stats** - Total questions, marks, images

## File Locations

### New Files Created:
```
/workspace/
├── scripts/
│   ├── extract_paper_simple.py    ⭐ Main extraction script
│   ├── batch_extract.py           ⭐ Batch processing
│   ├── test_extraction.bat        ⭐ Windows test
│   └── test_extraction.sh         ⭐ Unix test
│
├── src/
│   ├── components/
│   │   └── paper-editor-v3.tsx    ⭐ Editor component
│   └── app/admin/paper-editor-v3/
│       └── page.tsx                ⭐ Editor page
│
├── docs/
│   └── PAPER_EDITOR_V3_GUIDE.md   ⭐ Complete guide
│
├── PAPER_EDITOR_V3_SUMMARY.md     ⭐ Full summary
└── QUICK_START_PAPER_EDITOR_V3.md ⭐ This file
```

## Common Commands

### Extract Single Paper
```bash
python scripts/extract_paper_simple.py "input.pdf" "./output"
```

### Extract Folder of Papers
```bash
python scripts/batch_extract.py "./past papers" "./extracted_papers"
```

### Check Installation
```bash
python --version
python -c "import fitz; print('PyMuPDF OK')"
```

## Question Types Supported

- ✅ Multiple Choice (A, B, C, D)
- ✅ Short Answer
- ✅ Long Answer / Essay
- ✅ Diagram / Image-based
- ✅ True/False
- ✅ Matching
- ✅ Calculation
- ✅ Fill in the Blank

## Output Format

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
      "question": "Which ONE of the following...",
      "marks": 2,
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "hasImage": false,
      "page": 1
    }
  ],
  "totalQuestions": 45,
  "totalImages": 8
}
```

## Troubleshooting

### Python Not Found?
```bash
# Install from python.org
# Then verify:
python --version
```

### PyMuPDF Not Installed?
```bash
pip install PyMuPDF
```

### No Questions Extracted?
- Check if PDF has selectable text
- Verify PDF is not encrypted
- Try with a different PDF

### Editor Won't Load JSON?
- Check JSON format
- Verify file path
- Check browser console

## Need More Help?

📖 **Complete Guide:** `/docs/PAPER_EDITOR_V3_GUIDE.md`
📖 **Full Summary:** `/PAPER_EDITOR_V3_SUMMARY.md`
📖 **Script Reference:** `/scripts/EXTRACTION_README.md`

## That's It!

You're ready to:
1. ✅ Extract your papers
2. ✅ Edit in Paper Editor v3
3. ✅ Export and use in your app

**Happy editing! 🎉**
