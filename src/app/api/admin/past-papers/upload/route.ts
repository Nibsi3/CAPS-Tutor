import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, getServerStorage, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { processPDFWithWorker } from '@/lib/pdf-worker';

const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const paperFile = formData.get('paperFile') as File | null;
    const memoFile = formData.get('memoFile') as File | null;
    const subject = formData.get('subject') as string;
    const paperType = formData.get('paperType') as string;
    const year = formData.get('year') as string;
    const grade = formData.get('grade') as string || '12';
    const userId = formData.get('userId') as string;
    const createCustom = formData.get('createCustom') === 'true';
    const customPaperName = formData.get('customPaperName') as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    const storage = getServerStorage();

    let paperId: string;
    let paperFileId: string | null = null;
    let memoFileId: string | null = null;

    if (createCustom) {
      // Create custom paper without files
      if (!customPaperName) {
        return NextResponse.json(
          { success: false, error: 'Custom paper name is required' },
          { status: 400 }
        );
      }

      paperId = ID.unique();
      await databases.createDocument(
        appwriteConfig.databaseId,
        'pastpapers',
        paperId,
        {
          teacherId: userId,
          gradeLevel: parseInt(grade),
          subject: customPaperName,
          year: year || new Date().getFullYear().toString(),
          paperName: '',
          memoName: '',
          status: 'Draft',
          questionCount: 0,
          generatedQuestions: [],
        }
      );

      return NextResponse.json({
        success: true,
        paperId,
        paper: {
          $id: paperId,
          status: 'Draft',
        },
        message: 'Custom paper created successfully',
      });
    }

    // Upload files if provided
    // Use native File constructor (Node.js 18+)
    const uploadFileToStorage = async (file: File, fileId: string) => {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Create File object from buffer (Node.js 18+ native File API)
      // This matches the approach used in the working scripts
      const fileObject = new File([uint8Array], file.name, {
        type: file.type || 'application/pdf',
        lastModified: Date.now(),
      });
      
      // Upload to Appwrite Storage
      const uploaded = await storage.createFile(
        PAST_PAPER_BUCKET_ID,
        fileId,
        fileObject,
        ['read("users")'] // Accessible to authenticated users
      );
      
      return uploaded;
    };

    if (paperFile) {
      paperFileId = ID.unique();
      await uploadFileToStorage(paperFile, paperFileId);
    }

    if (memoFile) {
      memoFileId = ID.unique();
      await uploadFileToStorage(memoFile, memoFileId);
    }

    // Create paper document
    paperId = ID.unique();
    const fullSubject = paperType ? `${subject} ${paperType}` : subject;
    
    await databases.createDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      {
        teacherId: userId,
        gradeLevel: parseInt(grade),
        subject: fullSubject,
        year: year,
        paperName: paperFile?.name || '',
        memoName: memoFile?.name || '',
        status: paperFileId ? 'Processing' : 'Draft',
        questionCount: 0,
        generatedQuestions: [],
      }
    );

    // Start processing asynchronously if paper file was uploaded
    // Use new worker-based pipeline (extract → upload images → process questions)
    if (paperFileId) {
      // Process PDF in background (don't wait for completion)
      processPDFWithWorker(paperId, paperFileId, userId).catch((error) => {
        console.error('Error in PDF worker:', error);
        // Error handling is done inside processPDFWithWorker
      });
    }

    return NextResponse.json({
      success: true,
      paperId,
      paper: {
        $id: paperId,
        status: paperFileId ? 'Processing' : 'Draft',
      },
      message: 'Paper uploaded successfully. Processing will begin shortly.',
    });
  } catch (error: any) {
    console.error('Error uploading past paper:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload past paper' },
      { status: 500 }
    );
  }
}

// NOTE: Old processPaperAsync function removed - now using processPDFWithWorker from pdf-worker.ts
// The new worker-based pipeline handles:
// 1. PDF extraction via Python script
// 2. Image upload to Appwrite Storage
// 3. LLM question generation
// 4. Question storage with file IDs only (no base64)

