/**
 * PDF Processing Worker
 * Handles PDF extraction, image upload, and question generation
 * Uses PyMuPDF for extraction and stores images in Appwrite Storage
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { getServerStorage, getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { processPastPaperFromPyMuPDF } from '@/ai/flows/past-paper-processing';
import { storeQuestions, updatePaperQuestionCount, QuestionToStore } from '@/lib/question-storage';
import { downloadStorageFileServer } from '@/appwrite/storage-server';

const execAsync = promisify(exec);

const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';
const QUESTION_IMAGES_BUCKET_ID = '690dafea0021f232399e';

interface ExtractionResult {
  pages: Array<{
    pageNumber: number;
    text_blocks: Array<{
      bbox: number[];
      text: string;
      lines: string[];
    }>;
    images: Array<{
      filename: string;
      path: string;
      xref: number;
      bbox: number[];
      width?: number;
      height?: number;
    }>;
    pageWidth?: number;
    pageHeight?: number;
  }>;
  metadata?: {
    totalPages: number;
    pdfPath: string;
    extractionDate: string;
  };
}

interface ImageUploadResult {
  filename: string;
  fileId: string;
  bbox: number[];
}

/**
 * Run Python extraction script
 */
async function runExtraction(pdfPath: string, outputDir: string): Promise<ExtractionResult> {
  const pythonScript = path.join(process.cwd(), 'scripts', 'extract_pdf_worker.py');
  
  // Check if Python script exists
  try {
    await fs.access(pythonScript);
  } catch (error) {
    throw new Error(`Python extraction script not found at ${pythonScript}. Make sure PyMuPDF is installed.`);
  }
  
  // Run extraction
  const { stdout, stderr } = await execAsync(
    `python "${pythonScript}" "${pdfPath}" "${outputDir}"`,
    { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
  );
  
  if (stderr) {
    console.warn('Extraction warnings:', stderr);
  }
  
  // Parse JSON result
  const result: ExtractionResult = JSON.parse(stdout);
  return result;
}

/**
 * Upload image to Appwrite Storage and return file ID
 */
async function uploadImageToStorage(
  imagePath: string,
  filename: string
): Promise<string> {
  const storage = getServerStorage();
  
  // Check if file exists
  try {
    await fs.access(imagePath);
  } catch (error) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  
  // Read file as buffer
  const fileBuffer = await fs.readFile(imagePath);
  
  // Get file stats
  const stats = await fs.stat(imagePath);
  if (stats.size === 0) {
    throw new Error(`Image file is empty: ${imagePath}`);
  }
  
  // Detect MIME type
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  const mimeType = mimeTypes[ext || ''] || 'image/png';
  
  // Create File object from buffer (convert Buffer to Uint8Array for File constructor)
  const uint8Array = new Uint8Array(fileBuffer);
  const fileObject = new File([uint8Array], filename, {
    type: mimeType,
    lastModified: stats.mtimeMs,
  });
  
  // Upload to Appwrite Storage
  const uploaded = await storage.createFile(
    QUESTION_IMAGES_BUCKET_ID,
    ID.unique(),
    fileObject,
    ['read("users")'] // Accessible to authenticated users
  );
  
  return uploaded.$id;
}

/**
 * Upload all images from extraction and create mapping
 */
async function uploadExtractedImages(
  extraction: ExtractionResult
): Promise<Map<string, ImageUploadResult>> {
  const imageMap = new Map<string, ImageUploadResult>();
  
  console.log('🖼️  Uploading images to Appwrite Storage...');
  
  for (const page of extraction.pages) {
    for (const image of page.images) {
      try {
        console.log(`📷 Uploading image: ${image.filename} from ${image.path}`);
        const fileId = await uploadImageToStorage(image.path, image.filename);
        console.log(`✅ Uploaded ${image.filename} → ${fileId}`);
        
        imageMap.set(image.filename, {
          filename: image.filename,
          fileId,
          bbox: image.bbox,
        });
      } catch (error: any) {
        console.error(`❌ Error uploading ${image.filename}:`, error.message);
        // Continue with other images
      }
    }
  }
  
  console.log(`📊 Image map: ${imageMap.size} images uploaded`);
  return imageMap;
}

/**
 * Match questions to images based on bbox overlap or page proximity
 */
function matchQuestionsToImages(
  questions: Array<{ questionNumber: string; imageFilename?: string | null }>,
  extraction: ExtractionResult,
  imageMap: Map<string, ImageUploadResult>
): Map<string, string> {
  const questionImageMap = new Map<string, string>();
  
  for (const question of questions) {
    // If question already has imageFilename from LLM, use it
    if (question.imageFilename) {
      const imageEntry = imageMap.get(question.imageFilename);
      if (imageEntry) {
        questionImageMap.set(question.questionNumber, imageEntry.fileId);
        console.log(`✅ Question ${question.questionNumber} matched to image: ${question.imageFilename} → fileId: ${imageEntry.fileId}`);
      } else {
        console.warn(`⚠️  Question ${question.questionNumber} has imageFilename "${question.imageFilename}" but image not found in map`);
      }
    }
    // TODO: Implement bbox-based matching for questions without explicit imageFilename
    // This would require parsing question bbox from text_blocks
  }
  
  return questionImageMap;
}

/**
 * Process PDF: Extract → Upload Images → Generate Questions → Store
 */
export async function processPDFWithWorker(
  paperId: string,
  pdfFileId: string,
  userId: string
): Promise<{ success: boolean; questionCount: number; error?: string }> {
  const tempDir = path.join(os.tmpdir(), `pdf-extract-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const outputDir = path.join(tempDir, 'output');
  
  try {
    // Create temp directory
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'images'), { recursive: true });
    
    // Download PDF from Appwrite Storage
    console.log(`📥 Downloading PDF ${pdfFileId} from Appwrite Storage...`);
    const pdfPath = path.join(tempDir, 'paper.pdf');
    const pdfBuffer = await downloadStorageFileServer(PAST_PAPER_BUCKET_ID, pdfFileId);
    await fs.writeFile(pdfPath, Buffer.from(pdfBuffer));
    
    // Run Python extraction
    console.log('📄 Running PyMuPDF extraction...');
    const extraction = await runExtraction(pdfPath, outputDir);
    console.log(`✅ Extracted ${extraction.pages.length} pages`);
    
    // Upload images to Appwrite Storage
    const imageMap = await uploadExtractedImages(extraction);
    
    // Convert extraction to PyMuPDFExtractionResult format expected by LLM processor
    // Match the format from pdf-pymupdf-extractor.ts
    const pyMuPDFResult: any = {
      filename: path.basename(pdfPath),
      num_pages: extraction.pages.length,
      pages: extraction.pages.map(page => ({
        page: page.pageNumber, // Page number (1-indexed)
        text_blocks: page.text_blocks.map(block => ({
          bbox: block.bbox as [number, number, number, number], // Ensure tuple type
          text: block.text || (Array.isArray(block.lines) ? block.lines.join('\n') : ''),
        })),
        images: page.images.map(img => ({
          filename: img.filename,
          path: img.path, // Full path to image file
          bbox: img.bbox as [number, number, number, number], // Ensure tuple type
          width: img.width || 0,
          height: img.height || 0,
          xref: img.xref,
        })),
      })),
    };
    
    // Extract memo if provided (for now, we only process paper)
    // TODO: Add memo processing when memoFileId is provided
    
    // Generate questions using LLM
    // Note: processPastPaperFromPyMuPDF expects subject, grade, year
    // We need to get these from the paper document
    const databases = getServerDatabases();
    const paperDoc = await databases.getDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId
    );
    
    const subject = paperDoc.subject as string;
    const grade = paperDoc.gradeLevel as number;
    const year = parseInt(paperDoc.year as string) || new Date().getFullYear();
    
    console.log('🤖 Generating questions with LLM...');
    const questionResult = await processPastPaperFromPyMuPDF(
      pyMuPDFResult,
      null, // No memo for now
      subject,
      grade,
      year
    );
    
    if (!questionResult.success || !questionResult.generatedQuestions) {
      throw new Error(questionResult.message || 'Failed to generate questions');
    }
    
    const allQuestions = questionResult.generatedQuestions;
    console.log(`✅ Generated ${allQuestions.length} questions`);
    
    // Match questions to images (using imageFilename from LLM)
    const questionImageMap = matchQuestionsToImages(allQuestions, extraction, imageMap);
    
    // Prepare questions with image file IDs
    const questionsToStore = allQuestions.map(q => {
      const imageFileId = questionImageMap.get(q.questionNumber);
      
      // Detect question type if not provided
      let questionType = (q as any).type || 'free-text';
      if (questionType === 'free-text' && q.questionText) {
        // Detect multiple-choice pattern
        const mcqPattern = /([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+/i;
        if (mcqPattern.test(q.questionText)) {
          questionType = 'multiple-choice';
        }
      }
      
      return {
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks || 0,
        answer: q.answer || '',
        hasImage: !!imageFileId || q.hasImage,
        imageFileId: imageFileId || undefined,
        type: questionType,
      };
    });
    
    console.log('💾 Storing questions in database...');
    
    // Update document with generated questions (for preview)
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      {
        generatedQuestions: questionsToStore.map(q => JSON.stringify(q)),
      }
    );
    
    // Store questions in database
    // Type assertion needed because storeQuestions expects client-side Databases type
    // but runtime behavior is compatible with node-appwrite
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { stored, errors } = await storeQuestions(
      databases as any,
      paperId,
      questionsToStore as QuestionToStore[],
      [] // No image matches needed - we use file IDs
    );
    
    // Update paper question count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updatePaperQuestionCount(databases as any, paperId, stored);
    
    // Update paper status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      {
        status: stored > 0 ? 'Processed' : 'Failed',
        questionCount: stored,
      }
    );
    
    console.log(`✅ Stored ${stored} questions, ${errors} errors`);
    
    return {
      success: stored > 0,
      questionCount: stored,
    };
  } catch (error: any) {
    console.error('❌ Error processing PDF:', error);
    
    // Update paper status to Failed
    try {
      const databases = getServerDatabases();
      await databases.updateDocument(
        appwriteConfig.databaseId,
        'pastpapers',
        paperId,
        {
          status: 'Failed',
        }
      );
    } catch (updateError) {
      console.error('Error updating paper status:', updateError);
    }
    
    return {
      success: false,
      questionCount: 0,
      error: error.message || 'Unknown error',
    };
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Warning: Failed to cleanup temp directory:', cleanupError);
    }
  }
}

