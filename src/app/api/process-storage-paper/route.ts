/**
 * API Route: Process Storage Paper
 * Processes a past paper from Appwrite Storage by:
 * 1. Downloading PDFs (paper and memo)
 * 2. Extracting text and images with OCR
 * 3. Generating questions with AI
 * 4. Matching images to questions
 * 5. Storing in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { processStoragePDF, parsePaperMetadata } from '@/lib/past-paper-processor';
import { processPastPaper } from '@/ai/flows/past-paper-processing';
import { matchImagesToQuestions, filterQuestionImages } from '@/lib/image-matcher';
import { storeQuestions, updatePaperQuestionCount } from '@/lib/question-storage';
import { listStorageFilesServer, getStorageFileMetadataServer, downloadStorageFileAsDataUriServer } from '@/appwrite/storage-server';
import { isLifeSciencePaper1, isLifeSciencePaper1Memo } from '@/lib/past-paper-processor';
import { appwriteConfig } from '@/appwrite/config';
import { ID, getServerDatabases } from '@/lib/appwrite-server';

const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paperFileId, memoFileId, userId } = body;
    
    if (!paperFileId) {
      return NextResponse.json(
        { success: false, message: 'paperFileId is required' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Get file metadata to extract subject/year info
    const paperMetadata = await getStorageFileMetadataServer(PAST_PAPER_BUCKET_ID, paperFileId);
    const paperFilename = paperMetadata.name || paperFileId;
    
    // Parse metadata from filename
    const metadata = parsePaperMetadata(paperFilename);
    
    // Process paper PDF with OCR
    console.log('Processing paper PDF:', paperFilename);
    const extractedPaper = await processStoragePDF(
      paperFileId, 
      PAST_PAPER_BUCKET_ID,
      downloadStorageFileAsDataUriServer,
      getStorageFileMetadataServer
    );
    
    // Process memo PDF if provided
    let extractedMemo = undefined;
    if (memoFileId) {
      console.log('Processing memo PDF');
      extractedMemo = await processStoragePDF(
        memoFileId, 
        PAST_PAPER_BUCKET_ID,
        downloadStorageFileAsDataUriServer,
        getStorageFileMetadataServer
      );
    }
    
    // Generate questions from OCR text
    console.log('Generating questions from OCR text...');
    const questionResult = await processPastPaper({
      docId: '', // Will be created
      userId,
      subject: `${metadata.subject} ${metadata.paper}`,
      grade: metadata.grade,
      year: metadata.year,
      extractedPaper,
      extractedMemo,
    });
    
    if (!questionResult.success || !questionResult.generatedQuestions) {
      return NextResponse.json(
        { success: false, message: questionResult.message || 'Failed to generate questions' },
        { status: 500 }
      );
    }
    
    // Match images to questions
    console.log('Matching images to questions...');
    const allImages = extractedPaper.pages.flatMap(page => page.images);
    const filteredImages = filterQuestionImages(allImages, extractedPaper.pages);
    
    const imageMatches = matchImagesToQuestions(
      extractedPaper.pages,
      questionResult.generatedQuestions.map(q => ({
        number: q.questionNumber,
        text: q.questionText,
        pageNumber: extractedPaper.pages.find(p => 
          p.text.includes(q.questionNumber) || 
          p.text.includes(q.questionText.substring(0, 50))
        )?.pageNumber,
      }))
    );
    
    // Create image data URI map
    const imageDataUriMap = new Map<number, string>();
    for (const page of extractedPaper.pages) {
      for (const image of page.images) {
        imageDataUriMap.set(image.imageIndex, image.dataUri);
      }
    }
    
    // Prepare questions with image data URIs
    const questionsWithImages = questionResult.generatedQuestions.map(q => {
      const match = imageMatches.find(m => m.questionNumber === q.questionNumber);
      const imageDataUri = match ? imageDataUriMap.get(match.imageIndex) : undefined;
      
      return {
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks,
        answer: q.answer,
        hasImage: !!imageDataUri || q.hasImage,
        imageDataUri: imageDataUri || q.imageDataUri,
        type: 'free-text',
      };
    });
    
    // Create server-side databases instance using node-appwrite
    const databases = getServerDatabases();
    
    // Check if paper already exists
    const existingPapers = await databases.listDocuments(
      appwriteConfig.databaseId,
      'pastpapers',
      [
        // Query by subject, year, and paper
        // Note: Appwrite queries are case-sensitive, so we'll search broadly
      ]
    );
    
    // Find matching paper by subject, year, and paper number
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
      // Update existing paper
      await databases.updateDocument(
        appwriteConfig.databaseId,
        'pastpapers',
        paperId,
        {
          paperName: paperFilename,
          memoName: memoFileId ? (await getStorageFileMetadataServer(PAST_PAPER_BUCKET_ID, memoFileId)).name : '',
          status: 'Processing',
        }
      );
    } else {
      // Create new paper document
      paperId = ID.unique();
      await databases.createDocument(
        appwriteConfig.databaseId,
        'pastpapers',
        paperId,
        {
          teacherId: userId,
          gradeLevel: metadata.grade,
          subject: `${metadata.subject} ${metadata.paper}`,
          year: metadata.year.toString(),
          paperName: paperFilename,
          memoName: memoFileId ? (await getStorageFileMetadataServer(PAST_PAPER_BUCKET_ID, memoFileId)).name : '',
          status: 'Processing',
          questionCount: 0,
        }
      );
    }
    
    // Store questions in database
    console.log('Storing questions in database...');
    const imageMatchesWithDataUris = imageMatches.map(match => ({
      questionNumber: match.questionNumber,
      imageIndex: match.imageIndex,
      imageDataUri: imageDataUriMap.get(match.imageIndex) || '',
    })).filter(m => m.imageDataUri);
    
    const storeResult = await storeQuestions(
      databases,
      paperId,
      questionsWithImages,
      imageMatchesWithDataUris
    );
    
    // Update paper with question count
    await updatePaperQuestionCount(
      databases,
      paperId,
      questionsWithImages.length
    );
    
    return NextResponse.json({
      success: true,
      message: `Processed paper successfully. Stored ${storeResult.stored} questions.`,
      paperId,
      questionCount: questionsWithImages.length,
      stored: storeResult.stored,
      errors: storeResult.errors,
    });
    
  } catch (error) {
    console.error('Error processing storage paper:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: List Life Science Paper 1 files from storage
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'Life Sciences';
    const paper = searchParams.get('paper') || 'P1';
    
    // List all files in bucket
    const { files } = await listStorageFilesServer(PAST_PAPER_BUCKET_ID);
    
    // Filter for Life Science Paper 1 files - use flexible matching
    const filteredFiles = files.filter(file => {
      const name = file.name || '';
      return isLifeSciencePaper1(name) || isLifeSciencePaper1Memo(name);
    });
    
    // Separate papers and memos
    const papers = filteredFiles.filter(f => {
      const name = f.name || '';
      return isLifeSciencePaper1(name);
    });
    const memos = filteredFiles.filter(f => {
      const name = f.name || '';
      return isLifeSciencePaper1Memo(name);
    });
    
    // Try to pair papers with memos
    const pairedFiles = papers.map(paper => {
      // Find matching memo by year
      const paperYear = paper.name?.match(/(\d{4})/)?.[1];
      const matchingMemo = memos.find(memo => 
        memo.name?.includes(paperYear || '') &&
        memo.name?.toLowerCase().includes('life science') &&
        (memo.name?.toLowerCase().includes('p1') || memo.name?.toLowerCase().includes('paper 1'))
      );
      
      return {
        paper: {
          fileId: paper.$id,
          name: paper.name,
          size: paper.sizeOriginal,
          year: paperYear,
        },
        memo: matchingMemo ? {
          fileId: matchingMemo.$id,
          name: matchingMemo.name,
          size: matchingMemo.sizeOriginal,
        } : null,
      };
    });
    
    return NextResponse.json({
      success: true,
      files: pairedFiles,
      total: pairedFiles.length,
    });
    
  } catch (error) {
    console.error('Error listing storage files:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

