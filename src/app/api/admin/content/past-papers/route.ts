import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { getServerStorage } from '@/lib/appwrite-server';

const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const searchParams = request.nextUrl.searchParams;
    const paperId = searchParams.get('paperId');
    const subject = searchParams.get('subject');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // If paperId is provided, fetch single paper
    if (paperId) {
      try {
        const paper = await databases.getDocument(
          appwriteConfig.databaseId,
          'pastpapers',
          paperId
        );
        return NextResponse.json({
          success: true,
          paper: paper,
        });
      } catch (error: any) {
        // Check if it's a "not found" error (404) vs other errors
        if (error.code === 404 || error.type === 'document_not_found' || error.message?.includes('not found')) {
          return NextResponse.json(
            { success: false, error: 'Paper not found' },
            { status: 404 }
          );
        }
        // For other errors, log and return 500
        console.error('Error fetching paper:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: error.message || 'Failed to fetch paper',
            code: error.code,
            type: error.type,
          },
          { status: 500 }
        );
      }
    }

    // Otherwise, fetch list of papers
    const queries = [];
    if (subject) {
      // Use contains for partial subject matching (requires string attribute)
      // Note: If this fails, the subject attribute might need to be indexed
      queries.push(Query.equal('subject', subject));
    }
    if (year) {
      queries.push(Query.equal('year', year));
    }
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    queries.push(Query.orderDesc('$createdAt'));

    const papers = await databases.listDocuments(
      appwriteConfig.databaseId,
      'pastpapers',
      queries
    );

    return NextResponse.json({
      success: true,
      papers: papers.documents,
      total: papers.total,
    });
  } catch (error: any) {
    console.error('Error fetching past papers:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch past papers',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const subject = formData.get('subject') as string;
    const paperType = formData.get('paperType') as string;
    const year = formData.get('year') as string;
    const grade = formData.get('grade') as string || '12';
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!subject || !paperType || !year || !file || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    const storage = getServerStorage();

    // Upload file to storage using native File constructor (Node.js 18+)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = ID.unique();
    const fileObject = new File([buffer], file.name, {
      type: file.type || 'application/pdf',
      lastModified: Date.now(),
    });
    
    await storage.createFile(
      PAST_PAPER_BUCKET_ID,
      fileId,
      fileObject,
      ['read("users")'] // Accessible to authenticated users
    );

    // Create paper document
    const paperId = ID.unique();
    await databases.createDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      {
        teacherId: userId,
        gradeLevel: parseInt(grade),
        subject: `${subject} ${paperType}`,
        year: year,
        paperName: file.name,
        memoName: '',
        status: 'Processing',
        questionCount: 0,
      }
    );

    return NextResponse.json({
      success: true,
      paperId,
      message: 'Past paper uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading past paper:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload past paper' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { paperId, ...updates } = body;

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      updates
    );

    return NextResponse.json({
      success: true,
      message: 'Past paper updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating past paper:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update past paper' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paperId = searchParams.get('paperId');

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    const storage = getServerStorage();

    // Step 1: Delete all questions associated with this paper
    let deletedQuestionsCount = 0;
    let deletedImagesCount = 0;
    
    try {
      // Fetch all questions in batches (Appwrite default limit is 25, max is 100)
      const BATCH_SIZE = 100;
      let offset = 0;
      let hasMore = true;
      let totalQuestionsFound = 0;

      while (hasMore) {
        // Get questions for this paper in batches
        const questions = await databases.listDocuments(
          appwriteConfig.databaseId,
          'questions',
          [
            Query.equal('paperId', paperId),
            Query.limit(BATCH_SIZE),
            Query.offset(offset)
          ]
        );

        totalQuestionsFound = questions.total;
        console.log(`Found ${totalQuestionsFound} total questions to delete for paper ${paperId} (processing batch: ${offset} to ${offset + questions.documents.length})`);

        // Delete each question and its associated images
        for (const question of questions.documents) {
          try {
            // Delete associated image from storage if it exists
            if (question.imageFileId) {
              try {
                await storage.deleteFile(
                  PAST_PAPER_BUCKET_ID,
                  question.imageFileId
                );
                deletedImagesCount++;
              } catch (imgError: any) {
                // Image might not exist, continue anyway
                console.warn(`Could not delete image ${question.imageFileId}:`, imgError.message);
              }
            }

            // Delete the question document
            await databases.deleteDocument(
              appwriteConfig.databaseId,
              'questions',
              question.$id
            );
            deletedQuestionsCount++;
          } catch (questionError: any) {
            console.error(`Error deleting question ${question.$id}:`, questionError);
            // Continue deleting other questions even if one fails
          }
        }

        // Check if there are more questions to fetch
        offset += questions.documents.length;
        hasMore = questions.documents.length === BATCH_SIZE && deletedQuestionsCount < totalQuestionsFound;
      }

      console.log(`Deleted ${deletedQuestionsCount} questions and ${deletedImagesCount} images`);
    } catch (questionsError: any) {
      console.error('Error deleting questions:', questionsError);
      // Continue to delete the paper even if questions deletion fails
    }

    // Step 2: Delete the paper document itself
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId
    );

    return NextResponse.json({
      success: true,
      message: `Past paper and ${deletedQuestionsCount} associated questions deleted successfully`,
      deletedQuestions: deletedQuestionsCount,
      deletedImages: deletedImagesCount,
    });
  } catch (error: any) {
    console.error('Error deleting past paper:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete past paper' },
      { status: 500 }
    );
  }
}

