import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // For now, we'll query the questions collection if it exists
    // Otherwise, we'll return stats from past papers
    const queries: string[] = [];
    if (subject) {
      queries.push(`subject.contains("${subject}")`);
    }
    if (grade) {
      queries.push(`gradeLevel.equal(${grade})`);
    }
    queries.push(`limit(${limit})`);
    queries.push(`offset(${offset})`);

    try {
      const questions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questions',
        queries.length > 0 ? queries : [`limit(${limit})`, `offset(${offset})`]
      );

      // Get stats
      const allQuestions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questions',
        []
      );

      const subjects = new Set(allQuestions.documents.map((q: any) => q.subject).filter(Boolean));
      const grades = new Set(allQuestions.documents.map((q: any) => q.gradeLevel).filter(Boolean));

      return NextResponse.json({
        success: true,
        questions: questions.documents,
        total: questions.total,
        stats: {
          totalQuestions: allQuestions.total,
          subjectsCount: subjects.size,
          gradesCount: grades.size,
        },
      });
    } catch (error: any) {
      // If questions collection doesn't exist, return stats from past papers
      const papers = await databases.listDocuments(
        appwriteConfig.databaseId,
        'pastpapers',
        []
      );

      const subjects = new Set(papers.documents.map((p: any) => p.subject).filter(Boolean));
      const totalQuestions = papers.documents.reduce((sum: number, p: any) => sum + (p.questionCount || 0), 0);

      return NextResponse.json({
        success: true,
        questions: [],
        total: 0,
        stats: {
          totalQuestions,
          subjectsCount: subjects.size,
          gradesCount: 3, // Grades 10, 11, 12
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching practice questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch practice questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, grade, topic, question, options, answer, explanation, difficulty, userId } = body;

    if (!subject || !grade || !question || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Try to create in questions collection
    try {
      const questionId = ID.unique();
      await databases.createDocument(
        appwriteConfig.databaseId,
        'questions',
        questionId,
        {
          subject,
          gradeLevel: parseInt(grade),
          topic: topic || '',
          question,
          options: options || [],
          answer: answer || '',
          explanation: explanation || '',
          difficulty: difficulty || 'medium',
          createdBy: userId,
          type: options && options.length > 0 ? 'multiple-choice' : 'open-ended',
        }
      );

      return NextResponse.json({
        success: true,
        questionId,
        message: 'Practice question created successfully',
      });
    } catch (error: any) {
      // If questions collection doesn't exist, return error with instructions
      return NextResponse.json(
        {
          success: false,
          error: 'Questions collection does not exist. Please create it in Appwrite first.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating practice question:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create practice question' },
      { status: 500 }
    );
  }
}

