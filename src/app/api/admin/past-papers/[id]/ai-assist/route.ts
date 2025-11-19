import { NextRequest, NextResponse } from 'next/server';
import { groqChat } from '@/ai/groq';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // Await params even if not used, to follow Next.js 15 pattern
    const body = await request.json();
    const { questionId, prompt, question } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Construct the full prompt for AI
    const fullPrompt = `You are an expert CAPS curriculum tutor helping to edit and improve past paper questions.

Current question details:
- Number: ${question?.number || 'N/A'}
- Type: ${question?.type || 'N/A'}
- Question: ${question?.question || question?.questionText || 'N/A'}
- Answer: ${question?.answer || 'N/A'}
- Marks: ${question?.marks || 0}
${question?.options ? `- Options: ${JSON.stringify(question.options)}` : ''}

User request: ${prompt}

Please return a JSON object with the updated question fields. Include only the fields that should be updated based on the user's request. The JSON should have this structure:
{
  "question": "updated question text",
  "answer": "updated answer",
  "marks": updated_marks_number,
  "type": "question_type",
  "options": ["option1", "option2", "option3", "option4"] (only for multiple-choice)
}

Return only valid JSON, no additional text.`;

    const response = await groqChat(fullPrompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Parse the JSON response (groqChat returns JSON string)
    let updatedQuestion;
    try {
      updatedQuestion = JSON.parse(response);
    } catch (parseError) {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        updatedQuestion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Merge with existing question, only updating provided fields
    const mergedQuestion = {
      question: updatedQuestion.question || question?.question || question?.questionText || '',
      questionText: updatedQuestion.question || question?.questionText || question?.question || '',
      answer: updatedQuestion.answer !== undefined ? updatedQuestion.answer : (question?.answer || ''),
      marks: updatedQuestion.marks !== undefined ? updatedQuestion.marks : (question?.marks || 0),
      type: updatedQuestion.type || question?.type || 'free-text',
      options: updatedQuestion.options || question?.options || undefined,
    };

    return NextResponse.json({
      success: true,
      updatedQuestion: mergedQuestion,
      message: 'AI assistance applied successfully',
    });
  } catch (error: any) {
    console.error('Error getting AI assistance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get AI assistance' },
      { status: 500 }
    );
  }
}

