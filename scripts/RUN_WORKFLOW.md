# How to Run the Past Paper Workflow

## The Problem
The UI shows "Content Not Ready" because the questions haven't been uploaded to Firestore yet.

## Step-by-Step Instructions

### Step 1: Extract PDFs
Open PowerShell in the project root and run:
```powershell
python scripts/extract_pdfs_with_metadata.py
```

**Expected output:**
- Creates `extracted_papers/` folder
- Extracts Life Sciences P1 PDFs
- Shows: `✓ Processed X PDF(s)`

### Step 2: Generate Questions
```powershell
node scripts/generate_questions_with_metadata.mjs
```

**Expected output:**
- Reads extracted JSON files
- Calls Groq API to generate questions
- Shows: `✓ Generated X questions`

**Note:** Make sure `GROQ_API_KEY` is set in your environment or `.env.local`

### Step 3: Upload to Firebase
```powershell
node scripts/upload_to_firebase_with_metadata.mjs
```

**Expected output:**
- Uploads questions to `pastPapers` collection
- Shows: `✓ Uploaded X questions to pastPapers/{paperId}`

## Troubleshooting

### If Step 1 fails:
- Install Python 3: https://www.python.org/downloads/
- Install PyMuPDF: `pip install pymupdf`
- Verify PDF folder exists: `past papers/`

### If Step 2 fails:
- Check GROQ_API_KEY is set: `echo $env:GROQ_API_KEY`
- Or create `.env.local` with: `GROQ_API_KEY=your_key_here`

### If Step 3 fails:
- Check Firebase config in `src/firebase/config.ts`
- Verify Firestore is enabled in Firebase Console
- Check Firestore security rules allow writes

## Verify It Worked

After running all 3 steps:
1. Check `extracted_papers/upload_results.json` - should show `status: "success"`
2. Open Firebase Console → Firestore → `pastPapers` collection
3. Look for a document with subject "Life Sciences Paper 1" and year "2020"
4. Check that `generatedQuestions` array has questions
5. Refresh the app - questions should appear!

## Quick Test

To verify the paper exists in Firestore:
```powershell
# Check if upload results exist
Get-Content extracted_papers/upload_results.json | ConvertFrom-Json | Format-Table
```



