# JSON Past Paper Processor

This script processes JSON files containing past paper questions and converts them to the CAPS Tutor editor format using Groq AI.

## Overview

The script:
1. Reads a JSON file with past paper questions and images
2. Uses Groq AI to analyze and convert questions to our editor's PaperStructure format
3. Organizes questions into sections (A, B, C, etc.)
4. Identifies question types (multiple-choice, diagram, table, graph, extract, normal)
5. Extracts sub-questions and marks
6. Uploads images to Appwrite Storage
7. Saves the structure to Appwrite database

## Prerequisites

1. **Environment Variables:**
   - `GROQ_API_KEY` - Your Groq API key
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite endpoint URL
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Appwrite project ID
   - `APPWRITE_API_KEY` - Appwrite API key
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID` - Appwrite database ID

2. **Node.js Dependencies:**
   ```bash
   npm install node-appwrite
   ```

## Usage

```bash
node scripts/process_json_past_paper.mjs <path-to-json-file>
```

### Example

```bash
node scripts/process_json_past_paper.mjs "C:\Users\cameron\Documents\past papers\pastpaperJSON\Life_Sciences_Life_Sciences_P1_Nov_2020_Eng_2_Eng.json"
```

## JSON File Format

The script expects a JSON file with the following structure:

```json
{
  "metadata": {
    "output_name": "Life_Sciences_Life_Sciences_P1_Nov_2020_Eng_2_Eng",
    "source_files": ["...pdf"],
    "total_questions": 17,
    "total_images": 26,
    "total_pages": 26
  },
  "questions": [
    {
      "question_number": "1",
      "question_text": "...",
      "full_text": "...",
      "question_type": "multiple_choice",
      "page_number": 4,
      "images": [...],
      "bbox": {...},
      "source_file": "...",
      "source_type": "..."
    }
  ]
}
```

## How It Works

### 1. Metadata Extraction
- Extracts subject, year, paper number, and grade from filename and JSON metadata
- Filename pattern: `Subject_Subject_PaperNumber_Month_Year_Language...`
- Example: `Life_Sciences_Life_Sciences_P1_Nov_2020_Eng_2_Eng`

### 2. Groq AI Conversion
- Sends question data to Groq API (Llama 3.1 70B model)
- Groq analyzes questions and converts them to PaperStructure format
- Identifies:
  - Sections (A, B, C, etc.)
  - Question types (multiple-choice, diagram, table, graph, extract, normal)
  - Sub-questions and numbering
  - Marks from question text
  - Multiple choice options

### 3. Image Processing
- Uploads images to Appwrite Storage
- Links images to questions by question number
- Supports data URIs and file paths

### 4. Appwrite Integration
- Creates or updates paper document in Appwrite
- Stores PaperStructure in `generatedQuestions[0]` as JSON string
- Updates question count and status

## Output

The script:
1. Saves a `_structure.json` file alongside the input JSON (for inspection)
2. Creates/updates the paper in Appwrite database
3. Uploads images to Appwrite Storage
4. Prints paper ID and summary statistics

## Viewing Results

After processing, view the paper in the admin panel:
```
/admin/past-papers/{paperId}
```

## Troubleshooting

### Groq API Errors
- Check your `GROQ_API_KEY` is set correctly
- Verify you have API credits remaining
- Check rate limits

### Image Upload Errors
- Ensure image files exist in the expected location
- Check Appwrite Storage permissions
- Verify bucket ID is correct

### Structure Conversion Issues
- Check the `_structure.json` output file to inspect Groq's conversion
- Review question text in the original JSON
- Adjust the prompt if needed for your specific paper format

## Notes

- The script processes all questions in one Groq API call
- Large papers (>50 questions) may need batching (future enhancement)
- Images are matched to questions by question number (approximate matching)
- Question types are inferred from content and `question_type` field
- Marks are extracted from question text patterns like "(2 marks)", "[2]", etc.


