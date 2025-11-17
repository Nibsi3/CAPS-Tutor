/**
 * PyMuPDF-based PDF Extraction
 * Calls Python script to extract text blocks and images with bounding boxes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export interface TextBlock {
  bbox: [number, number, number, number]; // [x0, y0, x1, y1]
  text: string;
}

export interface ExtractedImage {
  path: string;
  filename: string;
  bbox: [number, number, number, number];
  width: number;
  height: number;
  xref: number;
  page?: number;
  dataUri?: string;
  label?: string | null;
}

export interface PageData {
  page: number;
  text?: string;
  text_blocks: TextBlock[];
  images: ExtractedImage[];
}

export interface PyMuPDFExtractionResult {
  filename: string;
  num_pages: number;
  pages: PageData[];
}

/**
 * Extract PDF using PyMuPDF Python script
 * @param pdfBuffer - PDF file buffer
 * @param filename - Original filename (for reference)
 * @returns Structured extraction result with text blocks and images
 */
export async function extractPDFWithPyMuPDF(
  pdfBuffer: Buffer,
  filename: string
): Promise<PyMuPDFExtractionResult> {
  // Create temporary directory for this extraction
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'pdf-extract-'));
  const pdfPath = path.join(tempDir, filename);
  const outputDir = path.join(tempDir, 'output');
  
  try {
    // Write PDF to temp file
    await fs.writeFile(pdfPath, pdfBuffer);
    
    // Call Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'extract_pdf_pymupdf.py');
    const command = `python "${scriptPath}" "${pdfPath}" "${outputDir}"`;
    
    console.log(`🐍 Calling PyMuPDF extraction: ${filename}`);
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs
      timeout: 120000, // 2 minute timeout
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8' // Fix Windows Unicode encoding issues
      }
    });
    
    // Log stderr (which contains progress messages)
    if (stderr) {
      console.log(stderr);
    }
    
    // Read extraction JSON
    const jsonPath = path.join(outputDir, 'extraction.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const result: PyMuPDFExtractionResult = JSON.parse(jsonContent);
    
    console.log(`✓ Extracted ${result.num_pages} pages, ` +
                `${result.pages.reduce((sum, p) => sum + p.images.length, 0)} images`);
    
    return result;
  } catch (error) {
    console.error('Error during PyMuPDF extraction:', error);
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('unicodeencodeerror') || errorMsg.includes('charmap')) {
        throw new Error(
          'Unicode encoding error (Windows). This should be fixed by PYTHONIOENCODING=utf-8.\n' +
          'If this persists, try running PowerShell as Administrator or set:\n' +
          '$env:PYTHONIOENCODING="utf-8"\n' +
          'Original error: ' + error.message
        );
      }
      
      if (errorMsg.includes('python') || errorMsg.includes('command not found')) {
        throw new Error(
          'Python not found. Please install Python 3.8+ and PyMuPDF:\n' +
          'pip install PyMuPDF\n' +
          'See scripts/README_PYTHON_SETUP.md for details.'
        );
      }
      
      if (errorMsg.includes('modulenotfounderror') || errorMsg.includes("no module named 'fitz'")) {
        throw new Error(
          'PyMuPDF not installed. Please run:\n' +
          'pip install PyMuPDF\n' +
          'See scripts/README_PYTHON_SETUP.md for details.'
        );
      }
      
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw error;
  } finally {
    // Cleanup temp files (but keep images if needed - they're referenced in result)
    // Comment this out if you want to inspect extracted files
    // await fs.rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * Associate text blocks with nearby images using bounding box overlap
 * @param textBlocks - Text blocks from a page
 * @param images - Images from the same page
 * @returns Map of image index to associated text blocks
 */
export function associateTextWithImages(
  textBlocks: TextBlock[],
  images: ExtractedImage[]
): Map<number, TextBlock[]> {
  const associations = new Map<number, TextBlock[]>();
  
  for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
    const image = images[imgIdx];
    const associatedText: TextBlock[] = [];
    
    // Find text blocks near this image (within 50 pixels)
    for (const block of textBlocks) {
      if (isNearby(block.bbox, image.bbox, 50)) {
        associatedText.push(block);
      }
    }
    
    if (associatedText.length > 0) {
      associations.set(imgIdx, associatedText);
    }
  }
  
  return associations;
}

/**
 * Check if two bounding boxes are nearby (within threshold pixels)
 */
function isNearby(
  bbox1: [number, number, number, number],
  bbox2: [number, number, number, number],
  threshold: number
): boolean {
  const [x1a, y1a, x2a, y2a] = bbox1;
  const [x1b, y1b, x2b, y2b] = bbox2;
  
  // Calculate minimum distance between boxes
  const xDist = Math.max(0, Math.max(x1a, x1b) - Math.min(x2a, x2b));
  const yDist = Math.max(0, Math.max(y1a, y1b) - Math.min(y2a, y2b));
  
  return xDist <= threshold && yDist <= threshold;
}

/**
 * Convert bounding box to readable description
 */
export function bboxToDescription(bbox: [number, number, number, number]): string {
  const [x1, y1, x2, y2] = bbox;
  const width = Math.round(x2 - x1);
  const height = Math.round(y2 - y1);
  return `[${Math.round(x1)},${Math.round(y1)}] ${width}x${height}px`;
}

