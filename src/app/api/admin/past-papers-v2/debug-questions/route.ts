import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paperId = searchParams.get('paperId');
    
    if (!paperId) {
      return NextResponse.json({ error: 'paperId required' }, { status: 400 });
    }

    const databases = getServerDatabases();
    
    const questions = await databases.listDocuments(
      appwriteConfig.databaseId,
      'questions',
      [
        Query.equal('paperId', paperId),
        Query.orderAsc('order'),
        Query.limit(100), // First 100 questions to see more
      ]
    );

    const sampleQuestions = questions.documents.map((doc: any) => ({
      number: doc.number,
      type: doc.type,
      marks: doc.marks,
      hasImage: doc.hasImage,
      imageFileId: doc.imageFileId,
      answer: doc.answer?.substring(0, 100),
      questionText: doc.question?.substring(0, 100),
      options: doc.options ? (typeof doc.options === 'string' ? JSON.parse(doc.options) : doc.options) : null,
      parentQuestion: doc.parentQuestion,
    }));

    return NextResponse.json({
      success: true,
      total: questions.total,
      sampleQuestions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

