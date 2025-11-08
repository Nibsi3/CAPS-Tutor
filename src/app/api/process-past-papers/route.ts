/**
 * API Route: Process Past Papers
 * Processes past papers from Appwrite Storage (for Life Science Paper 1)
 * This endpoint is called by the admin "Process All Past Papers" page
 */

import { NextRequest, NextResponse } from 'next/server';
import { listStorageFilesServer, downloadStorageFileServer } from '@/appwrite/storage-server';
import { isLifeSciencePaper1, isLifeSciencePaper1Memo, processStoragePDFWithPyMuPDF, parsePaperMetadata } from '@/lib/past-paper-processor';
import { processPastPaperFromPyMuPDF } from '@/ai/flows/past-paper-processing';
import { storeQuestions, updatePaperQuestionCount } from '@/lib/question-storage';
import { Client, ID, Databases as ClientDatabases, Storage } from 'node-appwrite';
import { appwriteConfig } from '@/appwrite/config';
import fs from 'fs';
import * as path from 'path';

const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';
const QUESTION_IMAGES_BUCKET_ID = '690dafea0021f232399e'; // Use same bucket for now, or create separate one

/**
 * Upload image to Appwrite Storage and return file ID
 * Uses Node SDK with fs.createReadStream() for efficient file streaming
 * Correct signature: createFile(bucketId, fileId, stream)
 */
async function uploadImageToStorage(
  imagePath: string,
  filename: string,
  bucketId: string = QUESTION_IMAGES_BUCKET_ID
): Promise<string> {
  // Initialize Node Appwrite client
  // Use server-side env vars (no NEXT_PUBLIC_ prefix)
  const endpoint = process.env.APPWRITE_ENDPOINT || appwriteConfig.endpoint;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT || appwriteConfig.projectId;
  const apiKey = process.env.APPWRITE_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY environment variable is required for server-side uploads');
  }
  
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  
  const storage = new Storage(client);
  
  // Create read stream from file path
  const stream = fs.createReadStream(imagePath);
  
  try {
    // Upload to Appwrite Storage using Node SDK
    // Signature: createFile(bucketId, fileId, stream)
    // TypeScript types may not reflect that Node SDK accepts ReadStream, but it works at runtime
    const uploaded = await storage.createFile(
      bucketId,
      ID.unique(), // fileId as second argument
      stream as any // Node readable stream as third argument (type assertion needed for TypeScript)
    );
    
    console.log(`✅ Uploaded ${filename} → ${uploaded.$id}`);
    return uploaded.$id;
  } catch (err: any) {
    console.error(`❌ Error uploading ${filename}:`, err);
    throw err;
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // List all files in storage bucket (fetches all pages)
    const { files } = await listStorageFilesServer(PAST_PAPER_BUCKET_ID);
    
    // Debug: Log all files found
    console.log(`Found ${files.length} total files in storage bucket`);
    
    // Check for Life Science files specifically
    const lifeScienceFiles = files.filter(f => {
      const name = (f.name || '').toLowerCase();
      return /life\s*sciences?/i.test(name);
    });
    console.log(`Found ${lifeScienceFiles.length} Life Science files (all papers)`);
    if (lifeScienceFiles.length > 0) {
      console.log('Life Science file names:', lifeScienceFiles.map(f => f.name));
    }
    
    // Filter for Life Science Paper 1 files - use flexible matching
    const lifeScienceP1Files = files.filter(file => {
      const name = file.name || '';
      const isPaper = isLifeSciencePaper1(name);
      const isMemo = isLifeSciencePaper1Memo(name);
      if (isPaper || isMemo) {
        console.log(`✓ Matched Life Science P1 file: ${name}`);
      }
      return isPaper || isMemo;
    });
    
    console.log(`Found ${lifeScienceP1Files.length} Life Science Paper 1 files (papers + memos)`);
    
    // Separate papers and memos
    const papers = lifeScienceP1Files.filter(f => {
      const name = f.name || '';
      return isLifeSciencePaper1(name);
    });
    const memos = lifeScienceP1Files.filter(f => {
      const name = f.name || '';
      return isLifeSciencePaper1Memo(name);
    });
    
    // Filter to only process English papers (skip Afrikaans)
    const englishPapers = papers.filter(f => {
      const name = (f.name || '').toLowerCase();
      // Skip if contains "afr" (Afrikaans), only process "eng" (English)
      if (name.includes('afr')) {
        console.log(`⏭️  Skipping Afrikaans paper: ${f.name}`);
        return false;
      }
      // Process if contains "eng" or if no language indicator (assume English)
      return name.includes('eng') || (!name.includes('afr') && !name.includes('eng'));
    });
    
    const englishMemos = memos.filter(f => {
      const name = (f.name || '').toLowerCase();
      // Skip if contains "afr" (Afrikaans), only process "eng" (English)
      if (name.includes('afr')) {
        console.log(`⏭️  Skipping Afrikaans memo: ${f.name}`);
        return false;
      }
      // Process if contains "eng" or if no language indicator (assume English)
      return name.includes('eng') || (!name.includes('afr') && !name.includes('eng'));
    });
    
    console.log(`📄 Filtered to ${englishPapers.length} English papers (skipped ${papers.length - englishPapers.length} Afrikaans papers)`);
    console.log(`📝 Filtered to ${englishMemos.length} English memos (skipped ${memos.length - englishMemos.length} Afrikaans memos)`);
    
    // Pair English papers with English memos
    const pairedFiles = englishPapers.map(paper => {
      const paperYear = paper.name?.match(/(\d{4})/)?.[1];
      const matchingMemo = englishMemos.find(memo => 
        memo.name?.includes(paperYear || '') &&
        memo.name?.toLowerCase().includes('life science') &&
        (memo.name?.toLowerCase().includes('p1') || memo.name?.toLowerCase().includes('paper 1'))
      );
      
      return {
        paper: {
          fileId: paper.$id,
          name: paper.name,
          file: paper, // Keep the full file object to avoid extra API calls
        },
        memo: matchingMemo ? {
          fileId: matchingMemo.$id,
          name: matchingMemo.name,
          file: matchingMemo, // Keep the full file object
        } : null,
      };
    });
    
    if (pairedFiles.length === 0) {
      // Provide more helpful error message with sample filenames
      const sampleNames = files.slice(0, 5).map(f => f.name || 'unnamed').join(', ');
      return NextResponse.json({
        success: false,
        error: `No Life Science Paper 1 files found in storage. Found ${files.length} total files. Sample filenames: ${sampleNames}. Please check that files are named correctly (e.g., "Life Sciences P1...") or use the "Process Storage Papers" page to process individual files.`,
        processed: 0,
        skipped: 0,
        failed: 0,
        totalFiles: files.length,
        sampleFilenames: files.slice(0, 10).map(f => f.name || 'unnamed'),
      });
    }
    
    // Process each file using the process-storage-paper endpoint logic
    let processed = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];
    
    // Create server-side databases instance with API key
    const apiKey = typeof process !== 'undefined' 
      ? (process as any).env?.APPWRITE_API_KEY 
      : undefined;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'APPWRITE_API_KEY is not set. Please set it in your .env.local file.',
        },
        { status: 500 }
      );
    }
    
    // Use node-appwrite for server-side database operations
    const { Client, Databases } = await import('node-appwrite');
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(apiKey); // Add API key for database operations
    const databases = new Databases(client);
    
    // Check which papers already exist
    const existingPapers = await databases.listDocuments(
      appwriteConfig.databaseId,
      'pastPapers',
      []
    );
    
    for (const filePair of pairedFiles) {
      try {
        // Check if paper already exists
        const paperYear = filePair.paper.name?.match(/(\d{4})/)?.[1];
        const exists = existingPapers.documents.some(p => {
          const pSubject = (p.subject || '').toLowerCase();
          const pYear = p.year?.toString() || '';
          return (
            pSubject.includes('life science') &&
            pYear === paperYear &&
            pSubject.includes('paper 1')
          );
        });
        
        if (exists) {
          skipped++;
          continue;
        }
        
        // Process the paper with NEW PyMuPDF extraction
        try {
          console.log(`📄 Processing paper: ${filePair.paper.name} (fileId: ${filePair.paper.fileId})`);
          
          // Use file data we already have from the list
          const paperFilename = filePair.paper.name || filePair.paper.fileId;
          
          // Parse metadata from filename
          const metadata = parsePaperMetadata(paperFilename);
          
          // Extract paper PDF with PyMuPDF (proper text blocks + images with bboxes)
          console.log(`   🐍 Extracting paper with PyMuPDF...`);
          const extractedPaper = await processStoragePDFWithPyMuPDF(
            filePair.paper.fileId, 
            PAST_PAPER_BUCKET_ID,
            downloadStorageFileServer
          );
          
          // Extract memo PDF if provided
          let extractedMemo = null;
          if (filePair.memo) {
            console.log(`   🐍 Extracting memo with PyMuPDF...`);
            extractedMemo = await processStoragePDFWithPyMuPDF(
              filePair.memo.fileId, 
              PAST_PAPER_BUCKET_ID,
              downloadStorageFileServer
            );
          }
          
          // Generate questions from structured extraction (SINGLE API CALL)
          console.log(`   🤖 Processing with AI (single pass)...`);
          const questionResult = await processPastPaperFromPyMuPDF(
            extractedPaper,
            extractedMemo,
            `${metadata.subject} ${metadata.paper}`,
            metadata.grade,
            metadata.year
          );
          
          if (!questionResult.success || !questionResult.generatedQuestions) {
            throw new Error(questionResult.message || 'Failed to generate questions');
          }
          
          // Upload images to Appwrite Storage (instead of storing base64)
          console.log(`   🖼️  Uploading images to Appwrite Storage...`);
          const imageFileIdMap = new Map<string, string>(); // filename -> Appwrite file ID
          
          for (const page of extractedPaper.pages) {
            for (const image of page.images) {
              try {
                // image.path should be the full path from PyMuPDF extraction
                const imagePath = image.path;
                console.log(`   📷 Uploading image: ${image.filename} from ${imagePath}`);
                
                if (!imagePath) {
                  console.warn(`   ⚠️  No path for image: ${image.filename}`);
                  continue;
                }
                
                // Upload to Appwrite Storage
                const fileId = await uploadImageToStorage(imagePath, image.filename);
                imageFileIdMap.set(image.filename, fileId);
                console.log(`   ✅ Uploaded image: ${image.filename} → fileId: ${fileId}`);
              } catch (error) {
                console.warn(`   ⚠️  Could not upload image ${image.filename} from ${image.path}:`, error instanceof Error ? error.message : String(error));
              }
            }
          }
          
          console.log(`   📊 Image map: ${imageFileIdMap.size} images uploaded`);
          
          // Prepare questions with image file IDs (from Appwrite Storage)
          const questionsWithImages = questionResult.generatedQuestions.map(q => {
            const imageFileId = q.imageFilename ? imageFileIdMap.get(q.imageFilename) : undefined;
            
            if (q.hasImage && !imageFileId) {
              if (q.imageFilename) {
                console.warn(`   ⚠️  Question ${q.questionNumber} has imageFilename "${q.imageFilename}" but image not found in map`);
              } else {
                console.warn(`   ⚠️  Question ${q.questionNumber} has hasImage=true but no imageFilename provided`);
              }
            }
            
            if (imageFileId) {
              console.log(`   ✅ Question ${q.questionNumber} matched to image: ${q.imageFilename} → fileId: ${imageFileId}`);
            }
            
            // Detect question type: use AI-provided type, or detect from questionText
            let questionType = (q as any).type || 'free-text';
            
            // If no type provided, detect from questionText (MCQ has A. B. C. D. pattern)
            if (questionType === 'free-text' && q.questionText) {
              const mcqPattern = /([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+/i;
              if (mcqPattern.test(q.questionText)) {
                questionType = 'multiple-choice';
              }
            }
            
            return {
              questionNumber: q.questionNumber,
              questionText: q.questionText,
              marks: q.marks,
              answer: q.answer,
              hasImage: !!imageFileId || q.hasImage,
              imageFileId: imageFileId || undefined, // Store Appwrite file ID, not base64
              type: questionType,
            };
          });
          
          const questionsWithImagesCount = questionsWithImages.filter(q => q.hasImage && q.imageFileId).length;
          console.log(`   📊 Questions with images: ${questionsWithImagesCount}/${questionsWithImages.length}`);
          
          // Create or update past paper document
          const paperYear = filePair.paper.name?.match(/(\d{4})/)?.[1];
          const existingPaper = existingPapers.documents.find(p => {
            const pSubject = (p.subject || '').toLowerCase();
            const pYear = p.year?.toString() || '';
            return (
              pSubject.includes(metadata.subject.toLowerCase()) &&
              pYear === metadata.year.toString() &&
              pSubject.includes(metadata.paper.toLowerCase().replace('paper ', 'p'))
            );
          });
          
          let paperId: string;
          if (existingPaper) {
            paperId = existingPaper.$id;
            await databases.updateDocument(
              appwriteConfig.databaseId,
              'pastPapers',
              paperId,
              {
                paperName: paperFilename,
                memoName: filePair.memo?.name || '',
                status: 'Processing',
              }
            );
          } else {
            paperId = ID.unique();
            await databases.createDocument(
              appwriteConfig.databaseId,
              'pastPapers',
              paperId,
              {
                teacherId: userId,
                gradeLevel: metadata.grade,
                subject: `${metadata.subject} ${metadata.paper}`,
                year: metadata.year.toString(),
                paperName: paperFilename,
                memoName: filePair.memo?.name || '',
                status: 'Processing',
                questionCount: 0,
              }
            );
          }
          
          // Store questions in database
          // Note: With PyMuPDF, image data URIs are already embedded in questionsWithImages
          const storeResult = await storeQuestions(
            databases as unknown as ClientDatabases,
            paperId,
            questionsWithImages,
            [] // No separate image matches needed - images are already in questions
          );
          
          // Update paper with question count
          await updatePaperQuestionCount(
            databases as unknown as ClientDatabases,
            paperId,
            questionsWithImages.length
          );
          
          processed++;
          console.log(`✅ Successfully processed: ${filePair.paper.name}`);
        } catch (error: any) {
          // Check if it's a rate limit error - retry after waiting
          const isRateLimit = error?.message?.includes('Rate limit') || 
                             error?.message?.includes('429') ||
                             error?.message?.includes('rate_limit_exceeded');
          
          if (isRateLimit) {
            console.log(`⏳ Rate limit hit for ${filePair.paper.name}, waiting 20 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
            
            try {
              // Retry processing this paper
              console.log(`🔄 Retrying: ${filePair.paper.name}`);
              
              const { downloadStorageFileAsDataUriServer, getStorageFileMetadataServer } = await import('@/appwrite/storage-server');
              const paperFilename = filePair.paper.name || filePair.paper.fileId;
              const metadata = parsePaperMetadata(paperFilename);
              
              // Retry with PyMuPDF extraction
              console.log(`   🔄 Retrying with PyMuPDF...`);
              const extractedPaper = await processStoragePDFWithPyMuPDF(
                filePair.paper.fileId, 
                PAST_PAPER_BUCKET_ID,
                downloadStorageFileServer
              );
              
              let extractedMemo = null;
              if (filePair.memo) {
                extractedMemo = await processStoragePDFWithPyMuPDF(
                  filePair.memo.fileId, 
                  PAST_PAPER_BUCKET_ID,
                  downloadStorageFileServer
                );
              }
              
              const questionResult = await processPastPaperFromPyMuPDF(
                extractedPaper,
                extractedMemo,
                `${metadata.subject} ${metadata.paper}`,
                metadata.grade,
                metadata.year
              );
              
              if (!questionResult.success || !questionResult.generatedQuestions) {
                throw new Error(questionResult.message || 'Failed to generate questions');
              }
              
              // Upload images to Appwrite Storage (instead of storing base64)
              console.log(`   🖼️  Uploading images to Appwrite Storage (retry)...`);
              const imageFileIdMap = new Map<string, string>(); // filename -> Appwrite file ID
              
              for (const page of extractedPaper.pages) {
                for (const image of page.images) {
                  try {
                    const imagePath = image.path;
                    if (!imagePath) {
                      console.warn(`   ⚠️  No path for image: ${image.filename}`);
                      continue;
                    }
                    
                    // Upload to Appwrite Storage
                    const fileId = await uploadImageToStorage(imagePath, image.filename);
                    imageFileIdMap.set(image.filename, fileId);
                    console.log(`   ✅ Uploaded image: ${image.filename} → fileId: ${fileId}`);
                  } catch (error) {
                    console.warn(`   ⚠️  Could not upload image ${image.filename}:`, error instanceof Error ? error.message : String(error));
                  }
                }
              }
              
              const questionsWithImages = questionResult.generatedQuestions.map(q => {
                const imageFileId = q.imageFilename ? imageFileIdMap.get(q.imageFilename) : undefined;
                
                // Detect question type: use AI-provided type, or detect from questionText
                let questionType = (q as any).type || 'free-text';
                
                // If no type provided, detect from questionText (MCQ has A. B. C. D. pattern)
                if (questionType === 'free-text' && q.questionText) {
                  const mcqPattern = /([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+\n([A-D])\.\s+[^\n]+/i;
                  if (mcqPattern.test(q.questionText)) {
                    questionType = 'multiple-choice';
                  }
                }
                
                return {
                  questionNumber: q.questionNumber,
                  questionText: q.questionText,
                  marks: q.marks,
                  answer: q.answer,
                  hasImage: !!imageFileId || q.hasImage,
                  imageFileId: imageFileId || undefined, // Store Appwrite file ID, not base64
                  type: questionType,
                };
              });
              
              // Create or update past paper document
              const paperDoc = {
                teacherId: userId,
                gradeLevel: metadata.grade,
                subject: `${metadata.subject} ${metadata.paper}`,
                year: metadata.year.toString(),
                paperName: paperFilename,
                memoName: filePair.memo?.name || '',
                status: 'Processing',
                questionCount: 0,
              };
              
              let paperId: string;
              const existing = existingPapers.documents.find(p => 
                (p.subject || '').toLowerCase() === paperDoc.subject.toLowerCase() &&
                p.year === paperDoc.year
              );
              
              if (existing) {
                await databases.updateDocument(
                  appwriteConfig.databaseId,
                  'pastPapers',
                  existing.$id,
                  paperDoc
                );
                paperId = existing.$id;
              } else {
                const created = await databases.createDocument(
                  appwriteConfig.databaseId,
                  'pastPapers',
                  ID.unique(),
                  paperDoc
                );
                paperId = created.$id;
              }
              
              const storeResult = await storeQuestions(
                databases as unknown as ClientDatabases,
                paperId,
                questionsWithImages
                // No longer passing imageMatches - images are stored via imageFileId in questions
              );
              
              await updatePaperQuestionCount(
                databases as unknown as ClientDatabases,
                paperId,
                questionsWithImages.length
              );
              
              processed++;
              console.log(`✅ Successfully processed after retry: ${filePair.paper.name}`);
            } catch (retryError) {
              failed++;
              errors.push(`${filePair.paper.name}: ${retryError instanceof Error ? retryError.message : 'Unknown error (retry failed)'}`);
              console.error(`❌ Retry failed for ${filePair.paper.name}:`, retryError);
            }
          } else {
            failed++;
            errors.push(`${filePair.paper.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`❌ Failed to process ${filePair.paper.name}:`, error);
          }
        }
        
        // Note: No delay needed between papers with PyMuPDF single-pass extraction
        // Each paper uses only ONE API call (vs 3+ with chunking), so rate limits are no longer an issue
        
      } catch (error) {
        failed++;
        errors.push(`${filePair.paper.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processed} papers, skipped ${skipped} duplicates, failed ${failed}.`,
      processed,
      skipped,
      failed,
      total: pairedFiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error: any) {
    console.error('Error processing past papers:', error);
    
    // Provide more helpful error messages for common issues
    let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = error?.code;
    
    if (errorCode === 401 || errorCode === 403 || errorMessage.includes('not authorized') || errorMessage.includes('unauthorized')) {
      errorMessage = `❌ Authorization Error: The API key does not have permission to access the storage bucket.\n\n` +
        `To fix this:\n` +
        `1. Go to Appwrite Console → Settings → API Keys\n` +
        `2. Find your API key and expand "Storage" section\n` +
        `3. Make sure these scopes are selected:\n` +
        `   ✅ storage.read\n` +
        `   ✅ storage.write\n` +
        `4. Save the API key\n` +
        `5. Also check bucket permissions:\n` +
        `   - Go to Storage → Buckets → ${PAST_PAPER_BUCKET_ID}\n` +
        `   - Check the "Permissions" tab\n` +
        `   - Ensure "Read" permission allows API keys or "any"\n` +
        `6. Restart your dev server after updating the API key\n\n` +
        `Original error: ${errorMessage}`;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
      },
      { status: 500 }
    );
  }
}

