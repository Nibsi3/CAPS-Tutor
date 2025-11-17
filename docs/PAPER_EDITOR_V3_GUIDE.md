# Paper Editor v3 - Complete Guide

## Overview

Paper Editor v3 is a comprehensive solution for extracting, processing, and editing CAPS-aligned past papers. It combines:
- **PyMuPDF** for PDF text and image extraction
- **OpenCV** for advanced image processing and diagram detection
- **LangChain** for structured JSON output
- **AI-powered question generation** using Groq

## Features

### 1. JSON Extraction (`scripts/extract_pdfs_with_metadata.py`)

The extraction script processes PDFs and creates structured JSON files with:

- **Text extraction**: Full text from each page with proper ordering
- **Image extraction**: Images extracted with bounding boxes and labels
- **OpenCV processing**: 
  - Diagram vs photo detection
  - Edge detection for better image analysis
  - Contrast enhancement for diagrams
  - Image quality metrics
- **LangChain structuring**: Validates and structures data using Pydantic models
- **Metadata parsing**: Automatically extracts subject, grade, paper number, and year from filename

#### Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run extraction
python scripts/extract_pdfs_with_metadata.py
```

The script will:
1. Look for PDFs in the `past papers` folder
2. Extract text and images from each PDF
3. Process images with OpenCV
4. Save structured JSON to `extracted_papers/[filename]_extracted.json`
5. Save images to `extracted_papers/[filename]/images/`

#### Output Format

```json
{
  "pdf": "Life Sciences P1 Nov 2020 Eng (2).pdf",
  "subject": "Life Sciences",
  "grade": 12,
  "paper": "Paper 1",
  "year": 2020,
  "pages": [
    {
      "page": 1,
      "text": "Full page text...",
      "images": [
        {
          "path": "images/page_1_img_1.png",
          "filename": "page_1_img_1.png",
          "dataUri": "data:image/png;base64,...",
          "width": 800,
          "height": 600,
          "rect": [100, 200, 900, 800],
          "label": "Figure 1: Heart diagram",
          "opencv_analysis": {
            "is_diagram": true,
            "edge_density": 0.15,
            "mean_brightness": 180,
            "std_dev": 45
          }
        }
      ]
    }
  ]
}
```

### 2. Paper Editor v3 (`src/app/admin/paper-editor-v3/page.tsx`)

A comprehensive web-based editor for viewing and editing extracted papers.

#### Features

- **Upload extracted JSON**: Load `*_extracted.json` files
- **AI question generation**: Automatically extract questions from the paper text
- **Question editing**: Edit question numbers, types, text, options, marks, and answers
- **CAPS-aligned question types**:
  - Short Answer
  - Long Answer
  - Multiple Choice
  - Fill in the Blank
  - Diagram
  - True/False
  - Matching
- **Image support**: View and assign images to questions
- **Preview mode**: See the final paper layout
- **Save/Download**: Save to database or download as JSON

#### Usage

1. Navigate to `/admin/paper-editor-v3`
2. Upload your `*_extracted.json` file
3. Click "Generate Questions from Extraction"
4. Review and edit questions as needed
5. Save to database or download as JSON

### 3. API Endpoints

#### `/api/generate-questions-from-extraction`

Generates questions from extracted paper data using AI.

**Request:**
```json
{
  "extractedPaper": {
    "pdf": "...",
    "subject": "...",
    "grade": 12,
    "paper": "Paper 1",
    "year": 2020,
    "pages": [...]
  }
}
```

**Response:**
```json
{
  "subject": "Life Sciences",
  "grade": 12,
  "paper": "Paper 1",
  "year": 2020,
  "questions": [
    {
      "number": "1.1",
      "type": "multiple_choice",
      "question": "...",
      "options": ["A. ...", "B. ..."],
      "marks": 2,
      "image": "data:image/png;base64,...",
      "image_label": "Figure 1"
    }
  ]
}
```

#### `/api/save-processed-paper`

Saves processed paper to Appwrite database.

**Request:**
```json
{
  "processedPaper": {
    "subject": "...",
    "grade": 12,
    "paper": "Paper 1",
    "year": 2020,
    "questions": [...]
  }
}
```

## Workflow

### Complete Extraction and Editing Workflow

1. **Extract PDFs**
   ```bash
   python scripts/extract_pdfs_with_metadata.py
   ```

2. **Open Paper Editor v3**
   - Navigate to `/admin/paper-editor-v3`
   - Upload the `*_extracted.json` file

3. **Generate Questions**
   - Click "Generate Questions from Extraction"
   - AI will extract all questions with proper numbering and types

4. **Edit Questions**
   - Review each question
   - Edit question numbers, types, text, options, marks
   - Assign images to questions
   - Add answers if available

5. **Save or Download**
   - Save to database for use in the app
   - Or download as JSON for backup/sharing

## CAPS Alignment

The system ensures CAPS alignment by:

- **Question numbering**: Maintains exact numbering format (1.1, 1.2, 1.1.1, etc.)
- **Question types**: Supports all CAPS question types
- **Mark allocation**: Follows CAPS mark distribution guidelines
- **Image handling**: Properly associates diagrams with questions
- **Order preservation**: Maintains exact order from source PDF

## Image Processing with OpenCV

OpenCV is used for:

1. **Diagram detection**: Distinguishes diagrams from photos using edge detection
2. **Image enhancement**: Applies CLAHE for better contrast in diagrams
3. **Quality metrics**: Calculates brightness, edge density, etc.
4. **Filtering**: Removes logos, headers, and black bars

## Dependencies

- `pymupdf>=1.23.0` - PDF extraction
- `opencv-python>=4.8.0` - Image processing
- `numpy>=1.24.0` - Numerical operations
- `langchain>=0.1.0` - Structured output
- `pydantic>=2.0.0` - Data validation

## Troubleshooting

### Extraction Issues

- **No PDFs found**: Check that PDFs are in the `past papers` folder
- **Image extraction fails**: Ensure OpenCV is installed correctly
- **JSON errors**: Check that LangChain and Pydantic are installed

### Editor Issues

- **File won't load**: Ensure file ends with `_extracted.json`
- **Questions not generating**: Check API endpoint is accessible
- **Images not showing**: Verify dataUri is valid base64

## Next Steps

1. Test extraction with your PDF files
2. Verify image extraction quality
3. Review generated questions for accuracy
4. Customize question types as needed
5. Integrate with your question bank system
