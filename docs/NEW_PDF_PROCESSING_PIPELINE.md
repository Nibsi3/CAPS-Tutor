# New PDF Processing Pipeline

## Overview

This document describes the new PDF processing pipeline that treats PDFs as layout + images, moves heavy work to a backend worker, and uses a vision-capable model only for final assembly.

## Architecture

### Components

1. **Python Extractor** (`scripts/extract_pdf_worker.py`)
   - Uses PyMuPDF to extract text blocks with bounding boxes
   - Extracts images with bounding boxes and saves them as PNG files
   - Outputs structured JSON with pages, text_blocks, and images

2. **Node.js Worker** (`src/lib/pdf-worker.ts`)
   - Calls Python extraction script
   - Uploads extracted images to Appwrite Storage
   - Processes questions using LLM with structured inputs
   - Stores questions with file IDs (not base64)

3. **Upload Route** (`src/app/api/admin/past-papers/upload/route.ts`)
   - Uploads PDF to Appwrite Storage
   - Creates paper document
   - Triggers async worker processing

4. **Question Storage** (`src/lib/question-storage.ts`)
   - Stores questions with `imageFileId` field only
   - Never stores base64 image data
   - Uses file IDs from Appwrite Storage

## Processing Flow

```
1. PDF Upload
   ↓
2. Python Extraction (PyMuPDF)
   - Extract text blocks with bboxes
   - Extract images with bboxes
   - Save images as PNG files
   - Output extraction.json
   ↓
3. Image Upload to Appwrite Storage
   - Upload each image file
   - Store file ID in map (filename → fileId)
   ↓
4. LLM Processing
   - Send text chunks with image file IDs
   - Generate questions with imageFilename references
   ↓
5. Question Storage
   - Match questions to images by filename
   - Store questions with imageFileId (not base64)
   ↓
6. Update Paper Status
   - Set status to "Processed" or "Failed"
   - Update questionCount
```

## Key Improvements

### 1. No Base64 in Database
- **Before**: Images stored as base64 strings in database (large, slow)
- **After**: Images stored in Appwrite Storage, database only has file IDs (small, fast)

### 2. Reliable Image Extraction
- **Before**: Browser-based extraction, unreliable
- **After**: PyMuPDF extraction with bounding boxes, reliable

### 3. Structured Processing
- **Before**: Unstructured text extraction, LLM does raw extraction
- **After**: Structured extraction → structured LLM input → structured output

### 4. Scalable Architecture
- **Before**: All processing in browser, rate limits
- **After**: Backend worker, can add queue system, parallel processing

### 5. Deterministic Results
- **Before**: LLM extracts from raw PDF, inconsistent
- **After**: LLM transforms structured inputs, consistent

## File Structure

```
scripts/
  extract_pdf_worker.py          # Python extraction script

src/lib/
  pdf-worker.ts                   # Node.js worker service
  question-storage.ts             # Question storage (updated for file IDs only)
  pdf-pymupdf-extractor.ts        # Legacy extractor (can be removed)

src/app/api/admin/past-papers/
  upload/route.ts                 # Upload route (updated to use worker)
  [id]/questions/route.ts         # Question CRUD (updated to remove options field)
```

## Database Schema

### questions Collection

- `paperId` (string) - Reference to past paper
- `number` (string) - Question number (e.g., "1.1", "2.3.1")
- `question` (string) - Question text
- `answer` (string) - Answer text
- `marks` (integer) - Marks allocated
- `type` (string) - Question type (free-text, multiple-choice, etc.)
- `hasImage` (boolean) - Whether question has an image
- `imageFileId` (string, optional) - Appwrite Storage file ID (NOT base64)
- `order` (integer) - Sort order

**Note**: `options` field is NOT stored (collection schema doesn't support it)

## Image Storage

### Appwrite Storage

- **Bucket**: `QUESTION_IMAGES_BUCKET_ID` (690dafea0021f232399e)
- **Permissions**: `read("users")` - Accessible to authenticated users
- **File Naming**: `page{N}_img{M}.png` (e.g., `page1_img0.png`)
- **Format**: PNG files

### Image URLs

Images are accessed via Appwrite Storage URLs:
```
{endpoint}/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
```

## LLM Processing

### Input Format

```json
{
  "pages": [
    {
      "pageNumber": 1,
      "text_blocks": [
        {
          "bbox": [x1, y1, x2, y2],
          "text": "Question text..."
        }
      ],
      "images": [
        {
          "filename": "page1_img0.png",
          "bbox": [x1, y1, x2, y2],
          "fileId": "appwrite-file-id"
        }
      ]
    }
  ]
}
```

### Output Format

```json
{
  "generatedQuestions": [
    {
      "questionNumber": "1.1",
      "questionText": "Question text...",
      "marks": 2,
      "type": "free-text",
      "hasImage": true,
      "imageFilename": "page1_img0.png",
      "answer": "Answer text..."
    }
  ]
}
```

## Error Handling

### Extraction Errors
- Missing PDF file → Paper status: "Failed"
- Python script error → Paper status: "Failed"
- Invalid extraction JSON → Paper status: "Failed"

### Image Upload Errors
- Missing image file → Warning logged, processing continues
- Upload failure → Warning logged, question stored without image
- Invalid file format → Warning logged, image skipped

### LLM Processing Errors
- Rate limit → Retry with exponential backoff
- Invalid JSON → Error logged, paper status: "Failed"
- Timeout → Error logged, paper status: "Failed"

### Database Errors
- Missing collection → Error logged, paper status: "Failed"
- Invalid field → Error logged (field excluded from document)
- Duplicate question → Updated (not created)

## Future Improvements

1. **Queue System**: Add BullMQ/Redis for job queuing
2. **Parallel Processing**: Upload images in parallel
3. **Memo Processing**: Process memo PDF for answers
4. **Bbox Matching**: Implement proximity-based image matching
5. **Image Optimization**: Compress images, convert formats
6. **Retry Logic**: Better retry handling for LLM calls
7. **Progress Tracking**: Real-time progress updates for UI

## Migration Notes

### From Old Pipeline

1. **Images**: Old pipeline stored base64 in DB → New pipeline uses file IDs
2. **Extraction**: Old pipeline used browser → New pipeline uses Python
3. **Processing**: Old pipeline processed in browser → New pipeline uses worker

### Backward Compatibility

- Old questions with base64 images still work (read-only)
- New questions use file IDs only
- Frontend should handle both (check for `imageFileId` first, then `image`)

## Testing

### Test Extraction

```bash
python scripts/extract_pdf_worker.py test.pdf /tmp/output
```

### Test Worker

```typescript
import { processPDFWithWorker } from '@/lib/pdf-worker';

const result = await processPDFWithWorker(
  'paper-id',
  'pdf-file-id',
  'user-id'
);
```

### Test Image Upload

```typescript
import { uploadImageToStorage } from '@/lib/pdf-worker';

const fileId = await uploadImageToStorage(
  '/path/to/image.png',
  'page1_img0.png'
);
```

## Troubleshooting

### Python Script Not Found
- Check that `scripts/extract_pdf_worker.py` exists
- Check that Python is installed and in PATH
- Check that PyMuPDF is installed: `pip install PyMuPDF`

### Image Upload Fails
- Check that `APPWRITE_API_KEY` is set
- Check that bucket ID is correct
- Check that file exists and is not empty
- Check file permissions

### LLM Processing Fails
- Check that `GROQ_API_KEY` is set
- Check rate limits (Groq free tier has limits)
- Check that prompts are within token limits
- Check that JSON parsing works correctly

### Database Errors
- Check that `questions` collection exists
- Check that collection schema matches code
- Check that `imageFileId` field exists (or is optional)
- Check that `options` field is NOT in schema (will cause errors)

