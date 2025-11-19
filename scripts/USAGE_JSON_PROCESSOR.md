# JSON Past Paper Processor - Usage Guide

## Quick Start

1. **Set Environment Variables:**
   ```bash
   export GROQ_API_KEY="your-groq-api-key"
   export NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
   export NEXT_PUBLIC_APPWRITE_PROJECT_ID="your-project-id"
   export APPWRITE_API_KEY="your-appwrite-api-key"
   export NEXT_PUBLIC_APPWRITE_DATABASE_ID="your-database-id"
   ```

2. **Test the JSON Structure:**
   ```bash
   node scripts/test_json_structure.mjs "C:\Users\cameron\Documents\past papers\pastpaperJSON\Life_Sciences_Life_Sciences_P1_Nov_2020_Eng_2_Eng.json"
   ```

3. **Process and Upload:**
   ```bash
   node scripts/process_json_past_paper.mjs "C:\Users\cameron\Documents\past papers\pastpaperJSON\Life_Sciences_Life_Sciences_P1_Nov_2020_Eng_2_Eng.json"
   ```

## What the Script Does

1. **Reads JSON File**: Loads the past paper JSON with questions and images
2. **Extracts Metadata**: Parses subject, year, paper number from filename and JSON
3. **Calls Groq AI**: Uses Groq to analyze questions and convert to PaperStructure format
4. **Organizes Sections**: Groups questions into SECTION A, B, C, etc.
5. **Identifies Types**: Detects multiple-choice, diagram, table, graph, extract, normal
6. **Extracts Sub-questions**: Parses question numbering hierarchy
7. **Uploads Images**: Uploads images to Appwrite Storage and links to questions
8. **Saves to Appwrite**: Creates/updates paper in database with structure

## Expected JSON Format

The script expects JSON files with this structure:

```json
{
  "metadata": {
    "output_name": "...",
    "source_files": [...],
    "total_questions": 17,
    "total_images": 26
  },
  "questions": [
    {
      "question_number": "1",
      "question_text": "...",
      "full_text": "...",
      "question_type": "multiple_choice",
      "page_number": 4,
      "images": [...],
      "bbox": {...}
    }
  ]
}
```

## Output

- Creates `*_structure.json` file with the converted structure (for inspection)
- Creates/updates paper in Appwrite database
- Uploads images to Appwrite Storage
- Returns paper ID for viewing in admin panel

## Viewing Results

After processing, view the paper at:
```
/admin/past-papers/{paperId}
```

## Troubleshooting

### Groq API Errors
- Check API key is valid
- Verify you have API credits
- Check rate limits
- For very large files, consider processing in batches

### Image Upload Errors
- Images are optional - script continues without them
- Check image file paths in JSON
- Verify Appwrite Storage permissions

### Structure Conversion Issues
- Check the `_structure.json` output file
- Review Groq's conversion quality
- Adjust prompt if needed for your paper format

## Notes

- The script processes all questions in one Groq API call
- Large papers may need batching (future enhancement)
- Images are matched by question number (approximate)
- Question types are inferred from content
- Marks are extracted from text patterns


