/**
 * Utility functions for converting PDFs to images for vision processing
 */

import { spawn } from 'child_process';

/**
 * Convert a base64 PDF data URI to an array of page images as base64 data URIs
 * Uses a Python script with PyMuPDF to render PDF pages
 */
export async function pdfToImages(pdfDataUri: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = process.cwd() + '/scripts/pdf-to-images-stdin.py';
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
          console.error('Python script error:', stderr);
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
          return;
        }
        
        try {
          const images = JSON.parse(stdout.trim()) as string[];
          resolve(images);
        } catch (error) {
          reject(new Error(`Failed to parse JSON output: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });
      
      // Write PDF data URI to stdin
      python.stdin.write(pdfDataUri);
      python.stdin.end();
      
    } catch (error) {
      reject(new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

