# Delete Invalid Question Types Script

This script deletes questions that have question types that are not valid for their subjects according to CAPS curriculum requirements.

## Overview

The script:
1. Fetches all past papers from Appwrite
2. For each paper, extracts the subject name
3. Gets all questions for that paper
4. Checks if each question's type is valid for that subject
5. Deletes questions with invalid types

## Usage

### Prerequisites

1. Ensure you have the required environment variables set in `.env.local`:
   - `APPWRITE_ENDPOINT` (or `NEXT_PUBLIC_APPWRITE_ENDPOINT`)
   - `APPWRITE_PROJECT_ID` (or `NEXT_PUBLIC_APPWRITE_PROJECT_ID`)
   - `APPWRITE_API_KEY`
   - `APPWRITE_DATABASE_ID` (or `NEXT_PUBLIC_APPWRITE_DATABASE_ID`)

### Dry Run (Recommended First Step)

Before actually deleting questions, run a dry run to see what would be deleted:

```bash
node scripts/delete-invalid-question-types.mjs --dry-run
```

or

```bash
node scripts/delete-invalid-question-types.mjs -d
```

This will show you:
- Which questions would be deleted
- Which subjects are affected
- A summary of deletions by subject and question type

### Actual Deletion

Once you've reviewed the dry run output and are satisfied, run the script without the `--dry-run` flag:

```bash
node scripts/delete-invalid-question-types.mjs
```

## Subject and Question Type Mapping

The script validates question types based on the CAPS curriculum requirements for each subject:

### Languages (English, Afrikaans, isiXhosa)
- Written: short-answer, paragraph-long-answer, reasoning-interpretation, true-false-with-reason, compare-evaluate-predict, sequencing-ordering
- Objective: multiple-choice, matching-pairing, fill-in-blank
- Visual: diagram-interpretation, table-interpretation, graph-interpretation, map-cartoon, data-set-analysis
- Extract-Based: extract-source, case-study

### Mathematics / Mathematical Literacy
- Written: short-answer, reasoning-interpretation, true-false-with-reason, compare-evaluate-predict, sequencing-ordering
- Objective: multiple-choice, matching-pairing, fill-in-blank
- Visual: diagram-interpretation, diagram-labeling, table-interpretation, graph-interpretation, data-set-analysis
- Extract-Based: extract-source, case-study
- Calculation: numeric-calculation, formula-based-calculation, accounting-financial-calculation, geography-scale-gradient, biology-percentage-ratio

### Physical Sciences
- Written: short-answer, paragraph-long-answer, reasoning-interpretation, true-false-with-reason, compare-evaluate-predict, sequencing-ordering
- Objective: multiple-choice, matching-pairing, fill-in-blank
- Visual: diagram-interpretation, diagram-labeling, table-interpretation, graph-interpretation, data-set-analysis
- Extract-Based: extract-source, case-study
- Calculation: numeric-calculation, formula-based-calculation, biology-percentage-ratio

### Life Sciences
- Written: short-answer, paragraph-long-answer, reasoning-interpretation, true-false-with-reason, compare-evaluate-predict, sequencing-ordering
- Objective: multiple-choice, matching-pairing, fill-in-blank
- Visual: diagram-interpretation, diagram-labeling, table-interpretation, graph-interpretation, data-set-analysis
- Extract-Based: extract-source, case-study
- Calculation: biology-percentage-ratio

And so on for all other subjects...

## Safety Features

1. **Dry Run Mode**: Always test with `--dry-run` first
2. **Unknown Subjects**: Questions for unknown subjects are NOT deleted (safer approach)
3. **Default Types**: Questions with `free-text` or empty type are NOT deleted
4. **Batch Processing**: Processes questions in batches to handle large datasets
5. **Error Handling**: Continues processing even if individual deletions fail

## Output

The script provides:
- Progress updates for each paper processed
- A summary showing:
  - Total questions checked
  - Total questions deleted
  - Papers processed
  - Deletions broken down by subject and question type

## Notes

- The script processes all past papers in your Appwrite database
- Questions are deleted permanently - there is no undo
- Always run a dry run first to verify what will be deleted
- The script handles subject name variations automatically (e.g., "Mathematics Paper 1" → "Mathematics")

