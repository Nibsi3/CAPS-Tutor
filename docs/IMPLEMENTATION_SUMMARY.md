# New PDF Processing Pipeline - Implementation Summary

## ✅ Completed

### 1. Python Extraction Script
- **File**: `scripts/extract_pdf_worker.py`
- **Functionality**: Extracts text blocks and images with bounding boxes using PyMuPDF
- **Output**: Structured JSON with pages, text_blocks, and images
- **Features**:
  - Text block extraction with bboxes
  - Image extraction with bboxes
  - Image saving as PNG files
  - Error handling for corrupt images

### 2. Node.js Worker Service
- **File**: `src/lib/pdf-worker.ts`
- **Functionality**: Processes PDFs using the new pipeline
- **Features**:
  - Calls Python extraction script
  - Uploads images to Appwrite Storage
  - Processes questions with LLM
  - Stores questions with file IDs only (no base64)
  - Error handling and status updates

### 3. Upload Route Integration
- **File**: `src/app/api/admin/past-papers/upload/route.ts`
- **Changes**:
  - Removed old processing function
  - Integrated new worker-based pipeline
  - Cleaned up unused imports
  - Uses `processPDFWithWorker` for async processing

### 4. Question Storage Updates
- **File**: `src/lib/question-storage.ts`
- **Changes**:
  - Removed base64 image storage
  - Only stores `imageFileId` (file IDs from Appwrite Storage)
  - Improved error handling
  - Better field validation

### 5. Question API Routes
- **File**: `src/app/api/admin/past-papers/[id]/questions/route.ts`
- **Changes**:
  - Fixed Next.js 15 params awaiting
  - Removed `options` field (not in schema)
  - Improved validation and error messages
  - Better handling of empty question text

### 6. Frontend Image Display
- **File**: `src/app/admin/past-papers/[id]/page.tsx`
- **Status**: Already supports `imageFileId` with fallback to base64
- **Function**: `getImageUrl()` constructs Appwrite Storage URLs

## 🏗️ Architecture

```
┌─────────────────┐
│  PDF Upload     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Appwrite       │
│  Storage        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Python         │─────▶│  extraction.json │
│  Extractor      │      │  images/*.png    │
│  (PyMuPDF)      │      └──────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Image Upload   │─────▶│  Appwrite        │
│  to Storage     │      │  Storage         │
│  (file IDs)     │      │  (file IDs)      │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  LLM Processing │─────▶│  Questions       │
│  (Groq)         │      │  with imageFileId│
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│  DB Storage     │
│  (file IDs only)│
└─────────────────┘
```

## 🔑 Key Features

### 1. No Base64 in Database
- All images stored in Appwrite Storage
- Database only contains file IDs (small strings)
- Faster queries, smaller database size

### 2. Reliable Extraction
- PyMuPDF provides accurate text and image extraction
- Bounding boxes for proper image matching
- Error handling for corrupt images

### 3. Structured Processing
- Structured extraction → structured LLM input → structured output
- Deterministic results
- Easier to debug and maintain

### 4. Scalable Architecture
- Backend worker (can add queue system)
- Parallel processing possible
- Rate limit handling

### 5. Error Handling
- Comprehensive error logging
- Status updates (Processing → Processed/Failed)
- Graceful degradation (missing images don't stop processing)

## 📋 Database Schema

### questions Collection
- `paperId` (string) - Required
- `number` (string) - Required
- `question` (string) - Required
- `answer` (string) - Required
- `marks` (integer) - Required
- `type` (string) - Required
- `hasImage` (boolean) - Required
- `imageFileId` (string) - Optional (file ID from Appwrite Storage)
- `order` (integer) - Required (for sorting)

**Note**: `options` field is NOT in the schema and should not be stored.

## 🚀 Usage

### Upload PDF
```typescript
// Frontend uploads PDF via form
const formData = new FormData();
formData.append('paperFile', pdfFile);
formData.append('subject', 'Mathematics');
formData.append('paperType', 'Paper 1');
formData.append('year', '2024');
formData.append('grade', '12');
formData.append('userId', userId);

const response = await fetch('/api/admin/past-papers/upload', {
  method: 'POST',
  body: formData,
});
```

### Processing Flow
1. PDF uploaded to Appwrite Storage
2. Paper document created with status "Processing"
3. Worker processes PDF asynchronously:
   - Extracts text and images
   - Uploads images to storage
   - Generates questions with LLM
   - Stores questions with file IDs
4. Paper status updated to "Processed" or "Failed"

### Display Images
```typescript
// Frontend constructs image URL from file ID
const imageUrl = `${endpoint}/storage/buckets/${bucketId}/files/${imageFileId}/view?project=${projectId}`;
```

## 🔧 Configuration

### Environment Variables
- `APPWRITE_API_KEY` - Required for server-side operations
- `GROQ_API_KEY` - Required for LLM processing
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` - Appwrite database ID

### Python Requirements
```bash
pip install PyMuPDF
```

### Appwrite Storage Buckets
- `PAST_PAPER_BUCKET_ID`: `690dafea0021f232399e` (PDFs)
- `QUESTION_IMAGES_BUCKET_ID`: `690dafea0021f232399e` (Images)

## 🐛 Known Issues & TODOs

### Current Limitations
1. **Memo Processing**: Not yet implemented (TODO in worker)
2. **Bbox Matching**: Basic filename matching, could be improved with bbox overlap
3. **Queue System**: No queue yet (sequential processing)
4. **Parallel Uploads**: Images uploaded sequentially (could be parallelized)

### Future Improvements
1. Add BullMQ/Redis queue system
2. Implement memo processing
3. Add bbox-based image matching
4. Parallel image uploads
5. Image optimization (compression, format conversion)
6. Progress tracking for UI
7. Retry logic for failed uploads

## 🧪 Testing

### Test Python Extraction
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

## 📝 Notes

- The new pipeline is backward compatible with existing questions
- Frontend handles both `imageFileId` and `image` (base64) for backward compatibility
- Old processing function removed from upload route
- All image storage uses Appwrite Storage (no base64 in DB)
- Questions are stored with file IDs only

## 🎯 Next Steps

1. **Test the pipeline** with a real PDF upload
2. **Monitor error logs** for any issues
3. **Add memo processing** when needed
4. **Implement queue system** for better rate limiting
5. **Add progress tracking** for UI updates
6. **Optimize image processing** (compression, parallel uploads)

