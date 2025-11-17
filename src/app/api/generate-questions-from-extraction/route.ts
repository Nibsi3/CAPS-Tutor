import { NextRequest, NextResponse } from 'next/server';
import { groqChat, extractJsonFromText } from '@/ai/groq';

interface ExtractedPage {
  page: number;
  text: string;
  images: Array<{
    path: string;
    filename: string;
    dataUri: string;
    width: number;
    height: number;
    rect: [number, number, number, number];
    label?: string | null;
  }>;
}

interface ExtractedPaper {
  pdf: string;
  subject: string;
  grade: number;
  paper: string;
  year: number;
  pages: ExtractedPage[];
}

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

export async function POST(request: NextRequest) {
  try {
    const { extractedPaper }: { extractedPaper: ExtractedPaper } = await request.json();

    if (!extractedPaper || !extractedPaper.pages || extractedPaper.pages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid extracted paper data' },
        { status: 400 }
      );
    }

    // Build full text from all pages
    const fullText = extractedPaper.pages
      .map(page => `=== PAGE ${page.page} ===\n${page.text}`)
      .join('\n\n');

    // Build image reference list
    const imageReferences = extractedPaper.pages
      .flatMap(page => 
        page.images.map(img => ({
          page: page.page,
          filename: img.filename,
          label: img.label,
          dataUri: img.dataUri
        }))
      );

    const imageListText = imageReferences.length > 0
      ? imageReferences.map(img => 
          `- Page ${img.page}: ${img.filename}${img.label ? ` (${img.label})` : ''}`
        ).join('\n')
      : 'No images available';

    // Build prompt for question extraction
    const prompt = `You are an expert CAPS examiner analyzing a Grade ${extractedPaper.grade} ${extractedPaper.subject} past exam paper from ${extractedPaper.year}.

EXTRACTED PAPER TEXT:
${fullText.substring(0, 30000)}${fullText.length > 30000 ? '\n\n[... content truncated for length ...]' : ''}

AVAILABLE IMAGES:
${imageListText}

CRITICAL REQUIREMENTS FOR QUESTION EXTRACTION:

1. EXACT ORDER: Extract questions in the EXACT sequential order they appear page by page. Start with Question 1.1, then 1.2, then 1.3, etc. Do NOT skip numbers. Do NOT reorganize.

2. EXACT NUMBERING: Use the EXACT question numbering format from the PDF:
   - Main questions: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, etc.
   - Sub-questions: 1.4.1, 1.4.2, 1.4.3, 2.1.1, 2.1.2, etc.
   - Match the numbering EXACTLY as it appears in the source

3. EXACT TEXT: Copy question text EXACTLY word-for-word as it appears - do NOT paraphrase, rewrite, or summarize

4. QUESTION TYPE DETECTION:
   - MULTIPLE CHOICE (MCQ): If question has options A, B, C, D → type: "multiple_choice"
   - FREE TEXT: If question asks to explain, describe, write, etc. → type: "long" or "short"
   - DIAGRAM: If question references diagrams/figures/images → type: "diagram"
   - TRUE/FALSE: If question asks true/false → type: "true_false"
   - MATCHING: If question has columns to match → type: "matching"
   - FILL IN: If question has blanks → type: "fill_in"

5. MULTIPLE CHOICE OPTIONS:
   - Extract ALL options (A, B, C, D) with FULL TEXT
   - Format: "A. Complete option A text\\nB. Complete option B text\\nC. Complete option C text\\nD. Complete option D text"
   - Each option MUST be on a new line with the letter and full text

6. IMAGE ASSIGNMENT:
   - Set image field to the dataUri if question references diagrams/figures/images
   - Set image_label to the image's label if available
   - Match images to questions based on:
     * Question text mentioning diagrams/figures
     * Question asking to "identify part X"
     * Image labels that match question content
     * Page proximity (images on same page as question text)

7. MARK ALLOCATION:
   - Simple recall: 1-2 marks
   - Basic application: 2-3 marks
   - Standard questions: 3-5 marks
   - Complex: 4-6 marks
   - Extended/problem-solving: 6-8 marks
   - Very challenging: up to 10 marks (rare)

8. COMPLETE EXTRACTION:
   - Extract ALL questions including all parts and sub-questions
   - Each sub-question (1.1, 1.2, 1.1.1, etc.) must be a SEPARATE object
   - Do NOT combine multiple questions into one entry

OUTPUT FORMAT (JSON ONLY):
{
  "subject": "${extractedPaper.subject}",
  "grade": ${extractedPaper.grade},
  "paper": "${extractedPaper.paper}",
  "year": ${extractedPaper.year},
  "questions": [
    {
      "number": "1.1",
      "type": "multiple_choice",
      "question": "Which ONE is CORRECT?\\nA. Option A full text\\nB. Option B full text\\nC. Option C full text\\nD. Option D full text",
      "options": ["A. Option A full text", "B. Option B full text", "C. Option C full text", "D. Option D full text"],
      "answer": null,
      "image": null,
      "image_label": null,
      "marks": 2
    },
    {
      "number": "1.2.1",
      "type": "diagram",
      "question": "Identify part A in the diagram below.",
      "options": null,
      "answer": null,
      "image": "data:image/png;base64,...",
      "image_label": "Figure 1: Heart diagram",
      "marks": 2
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Extract ALL questions in sequential order. Each question number is a SEPARATE entry.`;

    // Call Groq API
    const content = await groqChat(prompt, {
      temperature: 0,
      model: 'llama-3.1-8b-instant',
      maxTokens: 8000
    });

    const jsonText = extractJsonFromText(content) ?? content;
    const parsed = JSON.parse(jsonText);

    // Extract questions array
    const questions: Question[] = parsed.questions || parsed.generatedQuestions || [];

    // Match images to questions based on page proximity and labels
    const questionsWithImages = questions.map(q => {
      // Check if question mentions diagram/figure/image
      const mentionsImage = /diagram|figure|image|identify part|study the|refer to/i.test(q.question);
      
      if (mentionsImage && imageReferences.length > 0) {
        // Try to find matching image
        // For now, assign first available image if question type is diagram
        if (q.type === 'diagram' && imageReferences[0]) {
          return {
            ...q,
            image: imageReferences[0].dataUri,
            image_label: imageReferences[0].label || null
          };
        }
      }
      
      return q;
    });

    return NextResponse.json({
      subject: extractedPaper.subject,
      grade: extractedPaper.grade,
      paper: extractedPaper.paper,
      year: extractedPaper.year,
      questions: questionsWithImages
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
