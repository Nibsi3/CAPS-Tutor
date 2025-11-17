## JSON Extraction v3 — Design Overview

### Why This Rewrite?
- The current extraction pipeline (`scripts/extract_pdfs_with_metadata.py` → `scripts/generate_questions_with_metadata.mjs` → `storeQuestions()`) relies on multi-step Groq calls (`processPastPaperFromPyMuPDF`) that are brittle: strict JSON mode, token limits, and rate limits frequently break chunk processing.
- We already have proven reference output (`Life Sciences P1 Nov 2020 Eng (2)_extracted.json`) that contains correctly ordered questions, image labels, and type metadata; the new code must reproduce this schema deterministically.
- Paper Editor v3 needs predictable, lossless JSON so that diagrams, numbering (e.g. `2.3.1`), sections (A/B/C), marks, and answer text remain intact.

### Current State (Problems)
1. **Chunking & Groq JSON** – `processPastPaperFromPyMuPDF` (Next.js API) still chunks text and depends on `groqChat()` for each chunk. Even with strict JSON guards, any malformed response aborts the batch.
2. **Duplicate Logic** – We now maintain two flows (`scripts/generate_questions_with_metadata.mjs` and the Next.js API). Both attempt to solve the same problem differently, increasing the surface area for bugs.
3. **No deterministic parser** – There is no code that can take a PyMuPDF `extraction.json` artifact and rebuild the JSON we store in Appwrite / Firestore without calling an LLM.
4. **Paper Editor coupling** – The editor expects a complete `questions[]` array (with images & types) but there is no shared contract describing sections, marks, or memo links.

### Target Architecture

```
PDF (Appwrite Storage / local) 
   ↓ (Python) PyMuPDF extraction
extraction.json + /images
   ↓ (Node) JSON Extraction Orchestrator (new)
paper_extracted.json (legacy schema, deterministic)
   ↓ (Next.js) Paper Editor v3 + Appwrite ingestion
```

#### Stage 0: PyMuPDF (existing, minor tweaks)
- Keep `scripts/extract_pdf_pymupdf.py`.
- Ensure it always writes `extraction.json` + raw page images.
- Add optional flag to skip image filters when we explicitly want *all* diagrams (used for Life Sciences).

#### Stage 1: JSON Extraction Orchestrator (new)
- Location: `src/lib/extraction/`.
- Input: `PyMuPDFExtractionResult` (same shape returned by `extract_pdf_pymupdf.py`) + optional memo extraction.
- Output: `ExtractedPaperV3`:
  ```ts
  interface ExtractedPaperV3 {
    subject: string;
    grade: number;
    paper: string;
    year: number;
    sections: Section[];
    questions: Question[]; // flat, ordered
    media: Record<string, ImageMeta>;
  }
  ```
- Responsibilities:
  1. **Pre-processing**
     - Normalize whitespace, join hyphenated words, drop headers/footers.
     - Annotate each line with `pageNumber`.
  2. **Section detection**
     - Identify Section A/B/C headings (regex: `/Section\s+[ABC]/i`, fallback to marks totals) to build `sections[]`.
  3. **Question segmentation**
     - Regex-driven tokenizer for numbering patterns (`^\d+(?:\.\d+)*`).
     - Keeps nested numbers (e.g. `2.2.1.3`).
     - Captures trailing mark annotations `(3)` if present.
  4. **Type inference**
     - MCQ: detect `A.`/`B.` block or `1.1.1 Choose the correct...`.
     - Diagram questions: keywords (`diagram`, `figure`, `identify part`, `study the`).
     - Matching / fill-in heuristics.
  5. **Image association**
     - For each question, pull images on the same page (or ±1 page) whose bounding boxes overlap with the question text range.
     - Provide `imageFilename`, `imageLabel`, `bbox`.
  6. **Memo merge**
     - If memo extraction supplied, match answers by question number using fuzzy search (handles `1.1 (2)` vs `1.1`).
  7. **Validation**
     - Ensure numbering is strictly increasing.
     - Ensure `hasImage` is true whenever `imageFilename` is set (and vice versa).
     - Emit diagnostics for missing marks or duplicate numbers.

#### Stage 2: Distribution
- CLI wrapper: `scripts/extract_questions_from_json.mjs`
  - `node scripts/extract_questions_from_json.mjs --input extracted_papers/Life..../extraction.json --output .../_extracted.json`
  - Replaces `scripts/generate_questions_with_metadata.mjs`; no LLM.
- Server hook: `processPastPaperFromPyMuPDF` simply calls the orchestrator and stores the result (optionally still hitting Groq for answers when memo missing, but JSON skeleton is deterministic).
- Paper Editor v3 consumes the exact `_extracted.json` schema (same as legacy file).

### Shared Schema (Paper Editor)

```ts
type QuestionType = 'multiple-choice' | 'free-text' | 'diagram' | 'matching' | 'true-false';

interface ExtractedQuestion {
  questionNumber: string;   // "2.3.1"
  section: 'A' | 'B' | 'C';
  type: QuestionType;
  marks: number;
  text: string;
  options?: string[];       // for MCQ in original text order
  hasImage: boolean;
  imageFilename?: string;
  imageLabel?: string;
  answer?: string;          // memo link (optional)
}

interface ExtractedPaperV3 {
  subject: string;
  grade: number;
  paper: string;
  year: number;
  durationMinutes?: number;
  totalMarks?: number;
  sections: Array<{
    id: 'A' | 'B' | 'C';
    title: string;
    description?: string;
    marks?: number;
  }>;
  questions: ExtractedQuestion[];
  media: Record<string, {
    filename: string;
    page: number;
    bbox: [number, number, number, number];
    width: number;
    height: number;
    label?: string;
    fileId?: string; // Appwrite storage id once uploaded
  }>;
}
```

### Implementation Plan
1. **Core library (`src/lib/extraction/`)**
   - `types.ts` – shared TypeScript interfaces above.
   - `text-normalizer.ts` – remove headers/footers, fix hyphenation.
   - `question-tokenizer.ts` – streaming tokenizer that emits `{ number, textLines, pageRange }`.
   - `image-matcher.ts` – bounding-box based association (reuse `associateTextWithImages`).
   - `memo-merger.ts` – align memo answers.
   - `json-orchestrator.ts` – glue everything together and return `ExtractedPaperV3`.
2. **CLI entry (`scripts/extract_questions_from_json.mjs`)**
   - Reads PyMuPDF JSON + memo.
   - Calls orchestrator.
   - Writes `<pdf>_extracted.json` identical to legacy output.
   - Provides `--verbose` diagnostics (duplicate numbers, missing images, etc.).
3. **Server integration**
   - Update `processPastPaperFromPyMuPDF` to call orchestrator instead of Groq chunk pipeline. Groq call becomes optional fallback for answer enrichment only.
   - Upload images via existing `uploadImageToStorage`, store `media` map in the document.
4. **Testing**
   - Unit tests for tokenizer and type inference (`jest` or `vitest`).
   - Snapshot test using the legacy Life Sciences `_extracted` JSON (once added under `fixtures/`).
   - CLI smoke test wired into `package.json` (`npm run test:extract-json`).

### Rollout Plan
1. Build library + CLI using recorded Life Sciences extraction to ensure parity.
2. Wire CLI into admin workflow (manual step until automated).
3. Update API route once CLI validated to avoid impacting production ingestion prematurely.
4. Feed resulting JSON into Paper Editor v3.

### Open Questions
- Where should fixture JSON live? Proposal: `fixtures/extractions/Life Sciences P1 Nov 2020 Eng (2)_extracted.json`.
- Do we still need Groq for answer synthesis when memos are missing? (Probably yes, but now it is an optional enrichment step that consumes cleaned question text instead of raw chunks.)
- Should image uploads happen inside CLI or server? (For now keep inside Next.js server to reuse Appwrite credentials.)

With this plan we can:
- deterministically regenerate the `_extracted.json` artifacts,
- guarantee CAPS-compliant numbering/sections for the editor,
- and remove the brittle Groq chunk orchestration from the critical path.
