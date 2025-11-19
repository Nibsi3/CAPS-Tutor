# Scripts Directory

This directory contains utility scripts organized by purpose.

## Directory Structure

### `deployment/`
Scripts for building and deploying the application to Appwrite.

- `build-for-appwrite.ps1` - Build script for Appwrite deployment
- `deploy-to-appwrite.ps1` - Deployment script
- `setup-appwrite-collections.ps1` - Collection setup script

### `pdf-processing/`
Scripts for processing PDF files and extracting content.

- `extract_to_desktop.py` - Main PDF extraction script
- `extract_pdf_pymupdf.py` - PyMuPDF-based extraction
- `extract-pdf-images.py` - Image extraction from PDFs

### `data-processing/`
Scripts for processing and uploading data.

- `parse_json_questions.mjs` - Parse JSON question data
- `upload-past-papers-to-appwrite.mjs` - Upload past papers
- `process_json_past_paper.mjs` - Process past paper JSON

### `utilities/`
General utility scripts for development and maintenance.

- `check-collections.js` - Check Appwrite collections
- `kill-port.ps1` - Kill process on specific port
- `fix-empty-questions.mjs` - Fix empty questions

### `monitoring/`
Scripts for monitoring and logging.

- `monitor-appwrite-logs.js` - Monitor Appwrite logs
- `appwrite-logs.ps1` - PowerShell log monitoring

## Usage

Most scripts can be run directly from the command line. See individual script files for usage instructions.

