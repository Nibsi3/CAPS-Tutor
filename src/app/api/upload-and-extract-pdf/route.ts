import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'past_papers');
    await mkdir(uploadsDir, { recursive: true });

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    console.log(`Saved PDF to: ${filePath}`);

    // Run extraction script - it will process all PDFs in the folder
    const scriptPath = join(process.cwd(), 'scripts', 'extract_pdfs_with_metadata.py');
    const pythonCommand = `python3 "${scriptPath}"`;

    console.log(`Running extraction for: ${file.name}`);
    let stdout, stderr;
    try {
      const result = await execAsync(pythonCommand, {
        cwd: process.cwd(),
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large PDFs
        timeout: 300000, // 5 minute timeout
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error: any) {
      // Check if extraction actually succeeded despite error
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      console.log('Script execution:', { stdout, stderr });
    }

    // Find the extracted JSON file
    // The script creates: extracted_papers/{baseName}/{baseName}_extracted.json
    const baseName = file.name.replace('.pdf', '').replace(/\s*\(\d+\)\s*$/, '');
    const extractedJsonPath = join(process.cwd(), 'extracted_papers', baseName, `${baseName}_extracted.json`);

    // Try alternative paths in case filename parsing differs
    const alternativePaths = [
      extractedJsonPath,
      join(process.cwd(), 'extracted_papers', file.name.replace('.pdf', ''), `${file.name.replace('.pdf', '')}_extracted.json`),
    ];

    let extractedData;
    let foundPath = null;

    for (const path of alternativePaths) {
      try {
        const jsonContent = await readFile(path, 'utf-8');
        extractedData = JSON.parse(jsonContent);
        foundPath = path;
        break;
      } catch (error) {
        // Try next path
        continue;
      }
    }

    if (!extractedData) {
      // List what files were actually created
      const extractedDir = join(process.cwd(), 'extracted_papers');
      let dirContents = '';
      try {
        const { readdir } = await import('fs/promises');
        const dirs = await readdir(extractedDir);
        dirContents = `Found directories: ${dirs.join(', ')}`;
      } catch (e) {
        dirContents = 'Could not list extracted_papers directory';
      }

      return NextResponse.json(
        { 
          error: 'Extraction completed but JSON file not found',
          details: {
            searchedPaths: alternativePaths,
            stdout: stdout?.substring(0, 1000),
            stderr: stderr?.substring(0, 1000),
            directoryContents: dirContents
          }
        },
        { status: 500 }
      );
    }

    console.log(`Successfully loaded extracted JSON from: ${foundPath}`);

    return NextResponse.json({
      success: true,
      extractedPaper: extractedData,
      message: `Successfully extracted ${extractedData.pages?.length || 0} pages`
    });

  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process PDF',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
