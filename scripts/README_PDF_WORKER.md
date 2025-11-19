# PDF Processing Worker

## Overview

This worker implements a new pipeline for processing past papers that:

1. **Extracts text blocks and images** using PyMuPDF (Python)
2. **Uploads images to Appwrite Storage** (not base64 in DB)
3. **Processes questions with LLM** using structured inputs
4. **Stores questions with file IDs** only (no large base64 strings)

## Architecture

```
PDF Upload → Python Extractor → Image Upload → LLM Processing → DB Storage
              (PyMuPDF)          (Appwrite)     (Groq)          (File IDs)
```

## Setup

### 1. Install Python Dependencies

```bash
pip install PyMuPDF
```

### 2. Python Script

The extraction script is located at `scripts/extract_pdf_worker.py`.

**Usage:**
```bash
python scripts/extract_pdf_worker.py <pdf_path> <output_dir>
```

**Output:**
- `extraction.json` - Structured extraction with text blocks and images
- `images/` - Directory containing extracted images (PNG format)

### 3. Node.js Worker

The worker service is in `src/lib/pdf-worker.ts`.

**Key Functions:**
- `processPDFWithWorker()` - Main entry point for processing
- `runExtraction()` - Runs Python extraction script
- `uploadExtractedImages()` - Uploads images to Appwrite Storage
- `matchQuestionsToImages()` - Matches questions to images by filename

## Processing Flow

1. **Extraction**: Python script extracts text blocks and images with bounding boxes
2. **Image Upload**: All images are uploaded to Appwrite Storage, file IDs are stored in a map
3. **LLM Processing**: Text is sent to LLM with image file IDs referenced
4. **Question Storage**: Questions are stored with `imageFileId` field (not base64)

## Image Storage

- **Location**: Appwrite Storage bucket (`QUESTION_IMAGES_BUCKET_ID`)
- **Format**: PNG files
- **Naming**: `page{N}_img{M}.png` (e.g., `page1_img0.png`)
- **Database**: Only file IDs are stored in `questions.imageFileId` field
- **Access**: Images are accessible via Appwrite Storage URLs

## Benefits

1. **No Base64 in DB**: Images are stored as files, database only has file IDs
2. **Better Performance**: Smaller database records, faster queries
3. **Scalable**: Can handle large PDFs with many images
4. **Reliable**: PyMuPDF provides accurate text extraction and image bounding boxes
5. **Deterministic**: Structured extraction → structured LLM input → structured output

## Error Handling

- Missing images: Logged as warnings, processing continues
- Extraction failures: Paper status set to "Failed"
- Upload failures: Individual images are skipped, processing continues
- LLM failures: Retried with exponential backoff

## Future Improvements

- [ ] Add memo processing support
- [ ] Implement bbox-based image matching (proximity matching)
- [ ] Add queue system (BullMQ/Redis) for better rate limiting
- [ ] Parallel image uploads for faster processing
- [ ] Image optimization (compression, format conversion)

