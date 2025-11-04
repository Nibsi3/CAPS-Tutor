# Quick Fix: Generate and Upload Questions

## The Problem
The papers exist in Firestore but have 0 questions because the AI question generation step failed.

## The Solution

### Step 1: Set GROQ API Key
```powershell
# Option A: Set in PowerShell session
$env:GROQ_API_KEY="your_groq_api_key_here"

# Option B: Create .env.local file
# Add this line: GROQ_API_KEY=your_groq_api_key_here
```

### Step 2: Generate Questions
```powershell
node scripts/generate_questions_with_metadata.mjs
```

**What to expect:**
- Should show: `[1/2] Processing: Life Sciences P1...`
- Should show: `✓ Generated X questions`
- Creates/updates `extracted_papers/questions_summary.json`

**If it fails:**
- Check GROQ_API_KEY is set: `echo $env:GROQ_API_KEY`
- Check your Groq API key is valid at https://console.groq.com/
- Check you have API credits

### Step 3: Upload to Firestore
```powershell
node scripts/upload_to_firebase_with_metadata.mjs
```

**What to expect:**
- Should show: `Found existing paper: [ID]`
- Should show: `✓ Uploaded X questions to pastPapers/[ID]`

### Step 4: Verify
```powershell
node scripts/check-firestore.mjs
```

Should show:
- `Question Count: X` (where X > 0)
- `Generated Questions: X`

Then refresh your app - questions should appear!

## All-in-One Command
If you want to run steps 2 and 3 together:
```powershell
node scripts/generate_questions_with_metadata.mjs && node scripts/upload_to_firebase_with_metadata.mjs
```

