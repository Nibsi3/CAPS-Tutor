import { NextRequest, NextResponse } from 'next/server';
import { appwriteConfig } from '@/appwrite/config';
import { databases, ID } from 'appwrite';

interface Question {
  number: string;
  type: 'short' | 'long' | 'multiple_choice' | 'fill_in' | 'diagram' | 'true_false' | 'matching';
  question: string;
  options?: string[];
  answer?: string | null;
  image?: string | null;
  image_label?: string | null;
  marks?: number;
}

interface ProcessedPaper {
  subject: string;
  grade: number;
  paper: string;
  year: number;
  questions: Question[];
}

export async function POST(request: NextRequest) {
  try {
    const { processedPaper }: { processedPaper: ProcessedPaper } = await request.json();

    if (!processedPaper || !processedPaper.questions || processedPaper.questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid processed paper data' },
        { status: 400 }
      );
    }

    // Save to Appwrite database
    const docId = ID.unique();
    const paperData = {
      subject: processedPaper.subject,
      grade: processedPaper.grade,
      paper: processedPaper.paper,
      year: processedPaper.year,
      questionCount: processedPaper.questions.length,
      generatedQuestions: processedPaper.questions,
      status: 'Processed',
      source: 'paper-editor-v3',
      createdAt: new Date().toISOString()
    };

    await databases.createDocument(
      appwriteConfig.databaseId,
      'pastPapers',
      docId,
      paperData
    );

    return NextResponse.json({
      success: true,
      message: 'Paper saved successfully',
      docId
    });

  } catch (error) {
    console.error('Error saving paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save paper' },
      { status: 500 }
    );
  }
}
