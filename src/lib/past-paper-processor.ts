/**
 * Past Paper Processor Service
 * Handles downloading PDFs from Appwrite Storage, extracting text and images with OCR,
 * and processing them for question extraction.
 */

// Import server-side functions - this file is used in both client and server contexts
// We'll use dynamic imports or pass the functions as parameters
import { pdfToImages } from './pdf-utils';
import { extractPDFWithPyMuPDF, type PyMuPDFExtractionResult } from './pdf-pymupdf-extractor';
import { spawn } from 'child_process';
import { promisify } from 'util';

const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  images: ExtractedImage[];
}

export interface ExtractedImage {
  imageIndex: number;
  dataUri: string;
  pageNumber: number;
  coordinates?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  label?: string;
}

export interface ExtractedPDF {
  filename: string;
  subject: string;
  grade: number;
  paper: string;
  year: number;
  pages: ExtractedPage[];
}

/**
 * Download and extract text/images from a PDF in Appwrite Storage
 * @param fileId - The file ID in Appwrite Storage
 * @param bucketId - The bucket ID (default: past paper bucket)
 * @param downloadFn - Function to download file as data URI (server-side)
 * @param metadataFn - Function to get file metadata (server-side)
 * @returns Extracted PDF data
 */
/**
 * NEW: Process PDF using PyMuPDF (proper extraction with bounding boxes)
 * This is the recommended method - replaces OCR-based extraction
 */
export async function processStoragePDFWithPyMuPDF(
  fileId: string,
  bucketId: string = PAST_PAPER_BUCKET_ID,
  downloadFn?: (bucketId: string, fileId: string) => Promise<ArrayBuffer>
): Promise<PyMuPDFExtractionResult> {
  // Use provided function or import server-side function dynamically
  let downloadBuffer: (bucketId: string, fileId: string) => Promise<ArrayBuffer>;
  
  if (downloadFn) {
    downloadBuffer = downloadFn;
  } else {
    // Dynamic import for server-side only
    const { downloadStorageFileServer } = await import('@/appwrite/storage-server');
    downloadBuffer = downloadStorageFileServer;
  }
  
  // Get file metadata for filename
  const { getStorageFileMetadataServer } = await import('@/appwrite/storage-server');
  const fileMetadata = await getStorageFileMetadataServer(bucketId, fileId);
  const filename = fileMetadata.name || fileId;

  // Download PDF as buffer
  const pdfBuffer = await downloadBuffer(bucketId, fileId);

  // Extract using PyMuPDF
  console.log(`📄 Extracting PDF with PyMuPDF: ${filename}`);
  const extracted = await extractPDFWithPyMuPDF(Buffer.from(pdfBuffer), filename);

  return extracted;
}

/**
 * OLD: Process PDF using OCR (text-only, no proper image association)
 * @deprecated Use processStoragePDFWithPyMuPDF instead
 */
export async function processStoragePDF(
  fileId: string,
  bucketId: string = PAST_PAPER_BUCKET_ID,
  downloadFn?: (bucketId: string, fileId: string, mimeType?: string) => Promise<string>,
  metadataFn?: (bucketId: string, fileId: string) => Promise<any>
): Promise<ExtractedPDF> {
  // Use provided functions or import server-side functions dynamically
  let getMetadata: (bucketId: string, fileId: string) => Promise<any>;
  let download: (bucketId: string, fileId: string, mimeType?: string) => Promise<string>;
  
  if (metadataFn && downloadFn) {
    getMetadata = metadataFn;
    download = downloadFn;
  } else {
    // Dynamic import for server-side only
    const { getStorageFileMetadataServer, downloadStorageFileAsDataUriServer } = await import('@/appwrite/storage-server');
    getMetadata = getStorageFileMetadataServer;
    download = downloadStorageFileAsDataUriServer;
  }
  
  // Get file metadata
  const fileMetadata = await getMetadata(bucketId, fileId);
  const filename = fileMetadata.name || fileId;

  // Download PDF as data URI
  const pdfDataUri = await download(bucketId, fileId, 'application/pdf');

  // Extract text and images using Python script
  const extracted = await extractPDFWithOCR(pdfDataUri, filename);

  return extracted;
}

/**
 * Extract text and images from PDF using OCR (Python script)
 * @param pdfDataUri - Base64 data URI of the PDF
 * @param filename - Original filename
 * @returns Extracted PDF data
 */
async function extractPDFWithOCR(
  pdfDataUri: string,
  filename: string
): Promise<ExtractedPDF> {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = process.cwd() + '/scripts/extract_pdf_ocr.py';
      const python = spawn('python', [scriptPath]);
      
      let stdout = '';
      let stderr = '';
      
      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          console.error('Python OCR script error:', stderr);
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
          return;
        }
        
        try {
          const extracted = JSON.parse(stdout.trim()) as ExtractedPDF;
          resolve(extracted);
        } catch (error) {
          reject(new Error(`Failed to parse JSON output: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });
      
      // Send PDF data URI and filename to stdin
      const input = JSON.stringify({ pdfDataUri, filename });
      python.stdin.write(input);
      python.stdin.end();
      
    } catch (error) {
      reject(new Error(`Failed to extract PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * Convert PDF to images for vision processing
 * @param fileId - The file ID in Appwrite Storage
 * @param bucketId - The bucket ID (default: past paper bucket)
 * @param downloadFn - Optional server-side download function
 * @returns Array of base64 image data URIs (one per page)
 */
export async function convertStoragePDFToImages(
  fileId: string,
  bucketId: string = PAST_PAPER_BUCKET_ID,
  downloadFn?: (bucketId: string, fileId: string, mimeType?: string) => Promise<string>
): Promise<string[]> {
  let download: (bucketId: string, fileId: string, mimeType?: string) => Promise<string>;
  
  if (downloadFn) {
    download = downloadFn;
  } else {
    // Dynamic import for server-side only
    const { downloadStorageFileAsDataUriServer } = await import('@/appwrite/storage-server');
    download = downloadStorageFileAsDataUriServer;
  }
  
  const pdfDataUri = await download(bucketId, fileId, 'application/pdf');
  return await pdfToImages(pdfDataUri);
}

/**
 * Parse metadata from filename (Life Science Paper 1 format)
 * @param filename - PDF filename
 * @returns Parsed metadata
 */
export function parsePaperMetadata(filename: string): {
  subject: string;
  grade: number;
  paper: string;
  year: number;
  isMemo: boolean;
} {
  const name = filename.replace(/\.pdf$/i, '').trim();
  
  // Check if it's a memo
  const isMemo = /memo/i.test(name);
  
  // Extract paper number (P1, Paper 1, etc.)
  const paperMatch = name.match(/P\s*(\d+)|Paper\s*(\d+)/i);
  const paperNumber = paperMatch ? (paperMatch[1] || paperMatch[2]) : '1';
  const paper = `Paper ${paperNumber}`;
  
  // Extract year (4 digits)
  const yearMatch = name.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  // Extract subject - look for "Life Science" or "Life Sciences"
  let subject = 'Life Sciences';
  if (/life\s*science/i.test(name)) {
    subject = 'Life Sciences';
  }
  
  // Default to Grade 12 for past papers
  const grade = 12;
  
  return {
    subject,
    grade,
    paper,
    year,
    isMemo,
  };
}

/**
 * Check if a file is a Life Science Paper 1 file
 * @param filename - File name to check
 * @returns True if it's a Life Science Paper 1 file
 */
export function isLifeSciencePaper1(filename: string): boolean {
  if (!filename) return false;
  
  // Remove file extension and normalize
  const nameWithoutExt = filename.replace(/\.pdf$/i, '').trim();
  const normalized = nameWithoutExt.toLowerCase();
  
  // Check for Life Science(s) - handle both singular and plural, with or without space
  // Match: "life science", "life sciences", "lifescience", etc.
  const hasLifeScience = /life\s*sciences?/i.test(normalized);
  if (!hasLifeScience) {
    return false;
  }
  
  // Check for Paper 1 - handle various formats more flexibly
  // Match: "P1", "P 1", "P.1", "Paper 1", "Paper1", etc.
  // Use word boundaries to ensure it's not P10, P11, P12, etc.
  // Also handle cases where P1 might be followed by other text like "P1 Nov" or "P1 NSC"
  const hasPaper1 = /\bp\s*\.?\s*1\b|\bpaper\s*1\b/i.test(normalized);
  if (!hasPaper1) {
    return false;
  }
  
  // Exclude memos - check for "memo" anywhere in the filename
  if (/memo/i.test(normalized)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a file is a memo for Life Science Paper 1
 * @param filename - File name to check
 * @returns True if it's a Life Science Paper 1 memo
 */
export function isLifeSciencePaper1Memo(filename: string): boolean {
  if (!filename) return false;
  
  // Remove file extension and normalize
  const nameWithoutExt = filename.replace(/\.pdf$/i, '').trim();
  const normalized = nameWithoutExt.toLowerCase();
  
  // Check for Life Science(s)
  const hasLifeScience = /life\s*sciences?/i.test(normalized);
  if (!hasLifeScience) {
    return false;
  }
  
  // Check for Paper 1 - more flexible matching with word boundaries
  const hasPaper1 = /\bp\s*\.?\s*1\b|\bpaper\s*1\b/i.test(normalized);
  if (!hasPaper1) {
    return false;
  }
  
  // Must be a memo
  if (!/memo/i.test(normalized)) {
    return false;
  }
  
  return true;
}

