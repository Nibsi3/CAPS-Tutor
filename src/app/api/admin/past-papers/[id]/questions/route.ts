import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';
import { calculateQuestionOrder } from '@/lib/question-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const databases = getServerDatabases();
    const { id: paperId } = await params;

    const questions = await databases.listDocuments(
      appwriteConfig.databaseId,
      'questions',
      [Query.equal('paperId', paperId), Query.orderAsc('order')]
    );

    return NextResponse.json({
      success: true,
      questions: questions.documents,
      total: questions.total,
    });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const databases = getServerDatabases();
    const { id: paperId } = await params;
    const body = await request.json();

    console.log('POST /questions - Received body:', JSON.stringify(body, null, 2));

    const {
      number,
      question,
      questionText,
      answer,
      marks,
      type,
      hasImage,
      imageFileId,
      // options - not stored in schema, excluded
    } = body;

    // Validate required fields
    // Allow empty question text for draft questions, but number is always required
    const numberStr = number ? String(number).trim() : '';
    const questionContent = question !== undefined ? question : (questionText !== undefined ? questionText : '');
    
    if (!number || numberStr === '') {
      console.error('Validation failed: number is missing or empty', { number, numberStr });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Question number is required',
          received: { number, question, questionText }
        },
        { status: 400 }
      );
    }
    
    // Question text can be empty for draft questions, but the field must exist
    // (either question or questionText should be in the request, even if empty)
    if (question === undefined && questionText === undefined) {
      console.error('Validation failed: question field is missing', { question, questionText });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Question field is required (provide either "question" or "questionText", even if empty)',
          received: { number, question, questionText }
        },
        { status: 400 }
      );
    }

    const order = calculateQuestionOrder(numberStr);
    // Use question if provided, otherwise questionText, otherwise empty string
    const finalQuestionText = (question !== undefined ? question : (questionText !== undefined ? questionText : '')).trim();

    // Build question data object, only including fields that exist in the schema
    const questionData: Record<string, any> = {
      paperId,
      number: numberStr, // Already trimmed string
      question: finalQuestionText,
      questionText: finalQuestionText,
      answer: answer || '',
      marks: marks || 0,
      type: type || 'free-text',
      hasImage: hasImage || false,
      order,
    };

    // Only include imageFileId if it's provided and not null/undefined
    if (imageFileId) {
      questionData.imageFileId = imageFileId;
    }

    // Note: options field is not included as it doesn't exist in the questions collection schema
    // If multiple-choice options are needed, they should be stored in the question text
    // or the schema should be updated to include an options attribute

    console.log('Creating question with data:', {
      paperId,
      number: questionData.number,
      questionLength: finalQuestionText.length,
      marks: questionData.marks,
      type: questionData.type,
      hasImage: questionData.hasImage,
      order: questionData.order,
    });

    const created = await databases.createDocument(
      appwriteConfig.databaseId,
      'questions',
      ID.unique(),
      questionData
    );

    return NextResponse.json({
      success: true,
      question: created,
      message: 'Question created successfully',
    });
  } catch (error: any) {
    console.error('Error creating question:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create question',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const databases = getServerDatabases();
    await params; // Await params even if not used, to follow Next.js 15 pattern
    const body = await request.json();

    const {
      $id,
      number,
      question,
      questionText,
      answer,
      marks,
      type,
      hasImage,
      imageFileId,
      // options - not stored in schema, excluded
    } = body;

    if (!$id) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const order = calculateQuestionOrder(number);
    const finalQuestionText = question || questionText || '';

    // Build question data object, only including fields that exist in the schema
    const questionData: Record<string, any> = {
      number: String(number).trim(),
      question: finalQuestionText,
      questionText: finalQuestionText,
      answer: answer || '',
      marks: marks || 0,
      type: type || 'free-text',
      hasImage: hasImage || false,
      order,
    };

    // Only include imageFileId if it's provided and not null/undefined
    if (imageFileId) {
      questionData.imageFileId = imageFileId;
    }

    // Note: options field is not included as it doesn't exist in the questions collection schema
    // If multiple-choice options are needed, they should be stored in the question text
    // or the schema should be updated to include an options attribute

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      'questions',
      $id,
      questionData
    );

    return NextResponse.json({
      success: true,
      question: updated,
      message: 'Question updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const databases = getServerDatabases();
    await params; // Await params even if not used, to follow Next.js 15 pattern
    const searchParams = request.nextUrl.searchParams;
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      'questions',
      questionId
    );

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}

