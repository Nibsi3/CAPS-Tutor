# Systematic Question Generation Guide

## Overview

This guide explains how to generate at least 20 questions per topic per subject for Grade 12 CAPS subjects, making them available in the past paper editor.

## What It Does

The script `scripts/generate-questions-by-topic.mjs` systematically:

1. **Generates Questions**: Creates at least 20 questions per topic per subject using:
   - AI (GROQ) if `GROQ_API_KEY` is available for high-quality questions
   - Template-based generation as fallback
   
2. **Stores as Custom Presets**: Saves questions in the `custompresets` collection, making them available in the paper editor's randomize function and preset selector

3. **Covers All Grade 12 Subjects**:
   - Mathematics (12 topics)
   - Physical Sciences (11 topics)
   - Life Sciences (8 topics)
   - Accounting (17 topics)
   - Business Studies (16 topics)
   - Economics (10 topics)
   - Geography (5 topics)
   - History (6 topics)

## Prerequisites

1. **Environment Variables** (in `.env.local`):
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor
   GROQ_API_KEY=your-groq-key  # Optional but recommended for better questions
   SYSTEM_USER_ID=system-generator  # Optional, defaults to 'system-generator'
   ```

2. **Appwrite Collection**: Ensure `custompresets` collection exists with these attributes:
   - `userId` (String, 255, indexed)
   - `name` (String, 500)
   - `description` (String, 1000)
   - `type` (String, 100)
   - `text` (String, 5000)
   - `marks` (Integer)
   - `subject` (String, 255, indexed)
   - `instructionText` (String, 1000, optional)
   - `options` (String, 2000, optional) - JSON string for multiple choice
   - `tableData` (String, 5000, optional) - JSON string
   - `graphData` (String, 5000, optional) - JSON string
   - `extractText` (String, 5000, optional)
   - `diagramLabel` (String, 255, optional)
   - `hasDiagram` (Boolean, optional)
   - `answer` (String, 2000, optional)
   - `createdAt` (String, 100)

## Running the Script

```bash
npm run generate-questions
```

Or directly:
```bash
node scripts/generate-questions-by-topic.mjs
```

## How It Works

1. **For Each Subject**: Iterates through all Grade 12 subjects
2. **For Each Topic**: Processes each topic in the subject
3. **Generate 20 Questions**: Creates 20 questions per topic with:
   - 40% short-answer (2 marks)
   - 30% multiple-choice (1 mark)
   - 20% paragraph-long-answer (5 marks)
   - 10% numeric-calculation (3 marks)
4. **AI Generation**: If `GROQ_API_KEY` is set, uses AI to generate authentic CAPS-aligned questions
5. **Store Presets**: Saves each question as a custom preset in the database
6. **Skip Duplicates**: Checks if preset already exists before creating

## Expected Output

The script will generate approximately:
- **Mathematics**: 12 topics × 20 = 240 questions
- **Physical Sciences**: 11 topics × 20 = 220 questions
- **Life Sciences**: 8 topics × 20 = 160 questions
- **Accounting**: 17 topics × 20 = 340 questions
- **Business Studies**: 16 topics × 20 = 320 questions
- **Economics**: 10 topics × 20 = 200 questions
- **Geography**: 5 topics × 20 = 100 questions
- **History**: 6 topics × 20 = 120 questions

**Total: ~1,700 questions** across all Grade 12 subjects

## Using Generated Questions

Once generated, these questions will be available in:

1. **Paper Editor Randomize Function**: When you click "Randomize Questions", it will use these presets
2. **Preset Selector**: When adding questions manually, you can select from these presets
3. **Filtered by Subject**: Presets are automatically filtered by the paper's subject

## Notes

- The script includes rate limiting to avoid overwhelming the API
- Questions are generated with AI if available, otherwise uses templates
- Duplicate detection prevents re-generating existing questions
- Progress is logged to console for monitoring
- The script can be run multiple times safely (skips duplicates)

## Troubleshooting

1. **Collection Not Found**: Ensure `custompresets` collection exists in Appwrite
2. **Permission Errors**: Check that `APPWRITE_API_KEY` has write permissions
3. **AI Generation Fails**: Script falls back to template-based generation
4. **Rate Limiting**: Script includes delays, but you may need to increase them for large batches

