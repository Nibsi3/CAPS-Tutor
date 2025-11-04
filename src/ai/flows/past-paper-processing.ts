
'use server';

/**
 * @fileOverview This file defines the flow for processing uploaded past exam papers.
 *
 * It allows admins to upload a past paper and its memo. The system then extracts,
 * categorizes, and stores the questions for use in the app.
 *
 * - `processPastPaper`: Asynchronous function to handle the paper processing.
 * - `PastPaperInput`: Interface defining the input for the function.
 * - `PastPaperOutput`: Interface defining the output of the function.
 */

import { groqChat, extractJsonFromText } from '@/ai/groq';
import { pdfToImages } from '@/lib/pdf-utils';
import { z } from 'zod';

const PastPaperInputSchema = z.object({
  docId: z.string().describe('The Firestore document ID of the past paper entry.'),
  userId: z.string().describe('The user ID of the admin who uploaded the paper.'),
  paperDataUri: z
    .string()
    .optional()
    .describe(
      "A data URI of the past paper PDF document. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'. This is optional for reprocessing."
    ),
  memoDataUri: z
    .string()
    .optional()
    .describe(
      "A data URI of the corresponding memo/answer key PDF document. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'. This is optional for reprocessing."
    ),
  subject: z.string().describe('The subject of the past paper.'),
  grade: z.number().describe('The grade level of the past paper (e.g., 12).'),
  year: z.number().describe('The year the exam paper was administered.'),
});

export type PastPaperInput = z.infer<typeof PastPaperInputSchema>;

const GeneratedQuestionSchema = z.object({
    questionNumber: z.string().describe("The question number, e.g., '1.1' or '2.3.1'"),
    questionText: z.string().describe("The full text of the question."),
    marks: z.number().describe("The number of marks allocated to the question."),
    answer: z.string().describe("A concise, correct answer based on the memo."),
    hasImage: z.boolean().optional().describe("Whether this question has an associated image."),
    imageDataUri: z.string().optional().describe("Base64 data URI of the image if hasImage is true."),
});

const PastPaperOutputSchema = z.object({
    success: z.boolean().describe('Indicates whether the processing was successful.'),
    message: z.string().describe('A message providing details about the outcome.'),
    generatedQuestions: z.array(GeneratedQuestionSchema).optional().describe('An array of questions extracted from the paper.'),
});

export type PastPaperOutput = z.infer<typeof PastPaperOutputSchema>;

// Question count guidelines based on subject and paper type
function getExpectedQuestionCount(subject: string, grade: number): number {
  // Grade 12 papers typically have 10-25 questions depending on subject
  if (grade === 12) {
    const subjectLower = subject.toLowerCase();
    // Mathematics Paper 1 typically has 10-11 questions, Paper 2 has 10-11 questions
    if (subjectLower.includes('mathematics')) return 10;
    // Physical Sciences has multiple questions across topics
    if (subjectLower.includes('physical sciences')) return 12;
    // Life Sciences has many questions
    if (subjectLower.includes('life sciences')) return 14;
    // Accounting papers have many questions
    if (subjectLower.includes('accounting')) return 15;
    // Business Studies
    if (subjectLower.includes('business studies')) return 12;
    // Geography
    if (subjectLower.includes('geography')) return 13;
    // History
    if (subjectLower.includes('history')) return 12;
    // Economics
    if (subjectLower.includes('economics')) return 11;
    // Default for Grade 12
    return 12;
  }
  // Lower grades have fewer questions
  if (grade >= 10) return 10;
  if (grade >= 8) return 8;
  return 6;
}

export async function processPastPaper(input: PastPaperInput): Promise<PastPaperOutput> {
  const expectedCount = getExpectedQuestionCount(input.subject, input.grade);
  
  // Extract paper number if available (e.g., "Paper 1", "Paper 2")
  const paperNumberMatch = input.subject.match(/paper\s*(\d+)/i);
  const paperNumber = paperNumberMatch ? paperNumberMatch[1] : '';
  const baseSubject = input.subject.replace(/\s*paper\s*\d+/i, '').trim();
  
  // Check if we should use vision processing (for subjects with images like Dance Studies, Visual Arts, etc.)
  const shouldUseVision = input.paperDataUri && input.memoDataUri && 
    (baseSubject.toLowerCase().includes('dance studies') || 
     baseSubject.toLowerCase().includes('visual arts') ||
     baseSubject.toLowerCase().includes('geography'));
  
  // If vision is needed and we have PDFs, use specialized vision processing
  if (shouldUseVision) {
    return processPastPaperWithVision(input, expectedCount, baseSubject, paperNumber);
  }
  
  // Use standard text-based processing
  return processPastPaperStandard(input, expectedCount, baseSubject, paperNumber);
}

async function processPastPaperStandard(
  input: PastPaperInput,
  expectedCount: number,
  baseSubject: string,
  paperNumber: string
): Promise<PastPaperOutput> {
  const prompt = `You are an expert examiner in the South African CAPS curriculum. You have just reviewed an official Grade ${input.grade} ${input.subject} past exam paper from ${input.year}. Your task is to create comprehensive, authentic questions that match EXACTLY the style, format, difficulty, and content structure of official CAPS past papers.

PAPER DETAILS:
- Subject: ${baseSubject}
- Grade: ${input.grade}
- Year: ${input.year}
${paperNumber ? `- Paper Number: ${paperNumber}` : ''}

CRITICAL REQUIREMENTS - MATCH REAL CAPS PAPERS:

1. QUESTION COUNT: Generate EXACTLY ${expectedCount} questions. This matches the typical number of questions in a Grade ${input.grade} ${input.subject} CAPS exam paper.

2. QUESTION NUMBERING: Use authentic CAPS numbering format:
   - Start with "1.1", "1.2", "1.3" for Question 1 parts
   - Then "2.1", "2.2", "2.2.1", "2.2.2" for Question 2 parts
   - Continue sequentially: "3.1", "3.2", "4.1", etc.
   - Some questions have sub-questions with deeper nesting (e.g., "2.3.1", "2.3.2")
   - Each main question (1, 2, 3...) should have 2-5 parts

3. MARK ALLOCATION (CRITICAL - Match real CAPS papers):
   - Simple recall questions: 1-2 marks
   - Basic application: 2-3 marks
   - Standard questions: 3-5 marks
   - More complex: 4-6 marks
   - Extended/problem-solving: 6-8 marks (only a few of these per paper)
   - Very challenging questions: up to 10 marks (rare, only 1-2 per paper)
   - Total marks should approximately match: ${expectedCount * 5}-${expectedCount * 7} marks

4. QUESTION STYLE - Match Official CAPS Format:
   - Start questions with action verbs: "Calculate", "Explain", "Define", "Describe", "State", "Determine", "Show that", "Prove", "Write down", "List", "Name", "Identify", "Compare", "Analyse"
   - Use formal academic language appropriate for Grade ${input.grade}
   - Include context and real-world scenarios where applicable
   - For diagram questions, clearly describe: "The diagram below shows...", "In the given diagram...", "Refer to the diagram..."
   - Use proper mathematical notation where needed

5. SUBJECT-SPECIFIC REQUIREMENTS:

${getSubjectSpecificInstructions(baseSubject, input.grade)}

6. TOPIC COVERAGE: Cover the main topics from the CAPS ${input.grade} ${baseSubject} curriculum. Ensure variety - don't focus on just one topic.

7. ANSWERS (from Memorandum):
   - Provide complete, accurate answers as they would appear in the official memorandum
   - Show step-by-step solutions for calculation questions
   - Include key points for explanation questions
   - Mark allocations should be clear in the answer structure
   - Use proper terminology and notation

8. AUTHENTICITY CHECK:
   - Questions must be factually accurate for CAPS Grade ${input.grade}
   - Difficulty level must match Grade ${input.grade} expectations
   - Question format must match official CAPS past papers exactly
   - Content must be appropriate for ${input.year} CAPS curriculum

OUTPUT FORMAT (JSON ONLY):
{
  "success": true,
  "message": "Generated ${expectedCount} questions successfully",
  "generatedQuestions": [
    {
      "questionNumber": "1.1",
      "questionText": "Complete question text with proper formatting. For diagrams, describe them: 'The diagram below shows a triangle ABC where angle ABC = 60° and AB = 5 cm. Calculate the length of AC.'",
      "marks": 4,
      "answer": "Complete answer as from memorandum. For calculations, show steps. AC = √(AB² + BC² - 2(AB)(BC)cos(60°)) = ... = 8.66 cm"
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Generate EXACTLY ${expectedCount} questions. Make each question authentic and match real CAPS past paper style.`;

  try {
    const content = await groqChat(prompt, { temperature: 0.2 });
    const jsonText = extractJsonFromText(content) ?? content;
    const parsed = JSON.parse(jsonText) as PastPaperOutput;
    if (!parsed.generatedQuestions || parsed.generatedQuestions.length === 0) {
      return { success: false, message: 'AI failed to generate questions.' };
    }
    return parsed;
  } catch (error) {
    console.error('Error during AI paper processing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during AI processing.',
    };
  }
}

async function processPastPaperWithVision(
  input: PastPaperInput,
  expectedCount: number,
  baseSubject: string,
  paperNumber: string
): Promise<PastPaperOutput> {
  // This function will use a vision model to process PDFs with images
  console.log('Processing with vision for subject with images:', baseSubject);
  
  // Convert PDFs to images for the vision model
  const images: string[] = [];
  try {
    if (input.paperDataUri) {
      console.log('Converting paper PDF to images...');
      const paperImages = await pdfToImages(input.paperDataUri);
      images.push(...paperImages);
      console.log(`Converted ${paperImages.length} pages from paper PDF`);
    }
    if (input.memoDataUri) {
      console.log('Converting memo PDF to images...');
      const memoImages = await pdfToImages(input.memoDataUri);
      images.push(...memoImages);
      console.log(`Converted ${memoImages.length} pages from memo PDF`);
    }
  } catch (error) {
    console.error('Error converting PDFs to images:', error);
    // Fall back to non-vision processing if PDF conversion fails
    return processPastPaperStandard(input, expectedCount, baseSubject, paperNumber);
  }
  
  if (images.length === 0) {
    console.log('No images generated, falling back to standard processing');
    return processPastPaperStandard(input, expectedCount, baseSubject, paperNumber);
  }
  
  const prompt = `You are analyzing official Grade ${input.grade} ${input.subject} past exam paper from ${input.year}. You can see the actual PDF pages of the paper and memo.

Your task is to extract ALL questions from this paper, including those with images.

IMPORTANT: This ${baseSubject} past paper contains images, diagrams, or photographs that are critical to understanding the questions. These images are embedded within the PDF pages you can see.

For each question that has an image, diagram, or photograph, you should:
1. Set hasImage: true
2. Describe the image content in the questionText field
3. The imageDataUri will be extracted separately

PAPER DETAILS:
- Subject: ${baseSubject}
- Grade: ${input.grade}
- Year: ${input.year}
${paperNumber ? `- Paper Number: ${paperNumber}` : ''}

CRITICAL REQUIREMENTS - MATCH REAL CAPS PAPERS:

1. QUESTION COUNT: Generate EXACTLY ${expectedCount} questions. This matches the typical number of questions in a Grade ${input.grade} ${input.subject} CAPS exam paper.

2. QUESTION NUMBERING: Use authentic CAPS numbering format:
   - Start with "1.1", "1.2", "1.3" for Question 1 parts
   - Then "2.1", "2.2", "2.2.1", "2.2.2" for Question 2 parts
   - Continue sequentially: "3.1", "3.2", "4.1", etc.
   - Some questions have sub-questions with deeper nesting (e.g., "2.3.1", "2.3.2")
   - Each main question (1, 2, 3...) should have 2-5 parts

3. MARK ALLOCATION (CRITICAL - Match real CAPS papers):
   - Simple recall questions: 1-2 marks
   - Basic application: 2-3 marks
   - Standard questions: 3-5 marks
   - More complex: 4-6 marks
   - Extended/problem-solving: 6-8 marks (only a few of these per paper)
   - Very challenging questions: up to 10 marks (rare, only 1-2 per paper)
   - Total marks should approximately match: ${expectedCount * 5}-${expectedCount * 7} marks

4. QUESTION STYLE - Match Official CAPS Format:
   - Start questions with action verbs: "Calculate", "Explain", "Define", "Describe", "State", "Determine", "Show that", "Prove", "Write down", "List", "Name", "Identify", "Compare", "Analyse"
   - Use formal academic language appropriate for Grade ${input.grade}
   - Include context and real-world scenarios where applicable
   - IMPORTANT: ${baseSubject} papers often contain images, diagrams, or visual content
   - For visual questions, include a reference like: "Refer to Image 1", "The diagram shows...", "Study the photograph..."

5. SUBJECT-SPECIFIC REQUIREMENTS:

${getSubjectSpecificInstructions(baseSubject, input.grade)}

6. TOPIC COVERAGE: Cover the main topics from the CAPS ${input.grade} ${baseSubject} curriculum. Ensure variety - don't focus on just one topic.

7. ANSWERS (from Memorandum):
   - Provide complete, accurate answers as they would appear in the official memorandum
   - Show step-by-step solutions for calculation questions
   - Include key points for explanation questions
   - Mark allocations should be clear in the answer structure
   - Use proper terminology and notation

8. AUTHENTICITY CHECK:
   - Questions must be factually accurate for CAPS Grade ${input.grade}
   - Difficulty level must match Grade ${input.grade} expectations
   - Question format must match official CAPS past papers exactly
   - Content must be appropriate for ${input.year} CAPS curriculum
   - This subject may include visual content - format questions accordingly

OUTPUT FORMAT (JSON ONLY):
{
  "success": true,
  "message": "Generated ${expectedCount} questions successfully",
  "generatedQuestions": [
    {
      "questionNumber": "1.1",
      "questionText": "Complete question text with proper formatting. For questions with images, describe what you see: 'Refer to the photograph/image showing...'.",
      "marks": 4,
      "answer": "Complete answer as from memorandum.",
      "hasImage": false
    },
    {
      "questionNumber": "2.1", 
      "questionText": "If you see an image, diagram, or photograph in the actual PDF that relates to this question, set hasImage: true and describe what you see.",
      "marks": 5,
      "answer": "Answer based on the image content.",
      "hasImage": true
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Generate EXACTLY ${expectedCount} questions. Look at the PDF pages you can see and mark hasImage: true for ANY question that has visual content (photographs, diagrams, charts, etc.). Make each question authentic and match real CAPS past paper style.`;

  try {
    // Use a vision-capable model if we have images, otherwise use standard model
    const model = images.length > 0 ? 'llama-3.2-90b-vision-preview' : 'llama-3.1-8b-instant';
    console.log(`Using model: ${model} with ${images.length} image(s)`);
    
    const content = await groqChat(prompt, { 
      temperature: 0.2,
      model,
      images: images.length > 0 ? images : undefined,
      maxTokens: 8000 // Need more tokens for vision models
    });
    const jsonText = extractJsonFromText(content) ?? content;
    const parsed = JSON.parse(jsonText) as PastPaperOutput;
    if (!parsed.generatedQuestions || parsed.generatedQuestions.length === 0) {
      return { success: false, message: 'AI failed to generate questions.' };
    }
    return parsed;
  } catch (error) {
    console.error('Error during AI paper processing with vision:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during AI processing.',
    };
  }
}

function getSubjectSpecificInstructions(subject: string, grade: number): string {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('mathematics') || subjectLower.includes('maths')) {
    return `MATHEMATICS SPECIFIC:
- Include algebraic manipulation, equations, inequalities
- Include functions (linear, quadratic, exponential, trigonometric)
- Include calculus (for Grade 12): derivatives, limits, optimization
- Include geometry: Euclidean geometry proofs, analytical geometry
- Include financial mathematics: simple/compound interest, annuities (Grade 12)
- Include statistics and probability
- Include sequences and series (Grade 12)
- Use proper mathematical notation: ∈, ℝ, ∑, ∫, etc.
- Include "Show that" and "Prove that" questions
- Some questions should require multiple steps`;
  }
  
  if (subjectLower.includes('physical sciences')) {
    return `PHYSICAL SCIENCES SPECIFIC:
- Balance Physics and Chemistry questions appropriately
- Physics: Mechanics, electricity, waves, optics, modern physics
- Chemistry: Stoichiometry, equilibrium, acids/bases, electrochemistry, organic chemistry
- Include practical/experimental questions
- Include diagram-based questions (circuits, ray diagrams, molecular structures)
- Include calculation questions with formulas
- Use proper scientific notation and units
- Include data analysis questions (tables, graphs)`;
  }
  
  if (subjectLower.includes('life sciences')) {
    return `LIFE SCIENCES SPECIFIC:
- Include questions on cell biology, genetics, evolution
- Include diagrams of biological structures (cells, organs, systems)
- Include process questions (photosynthesis, respiration, protein synthesis)
- Include application questions about diseases, adaptations
- Include experimental design questions
- Use proper biological terminology
- Include graph/chart interpretation questions`;
  }
  
  if (subjectLower.includes('accounting')) {
    return `ACCOUNTING SPECIFIC:
- Include journal entries, ledger accounts, trial balance
- Include financial statements preparation
- Include calculations (depreciation, interest, ratios)
- Include interpretation of financial statements
- Include GAAP principles and accounting concepts
- Include VAT calculations
- Use proper accounting formats and terminology`;
  }
  
  if (subjectLower.includes('business studies')) {
    return `BUSINESS STUDIES SPECIFIC:
- Include questions on business environments, management, marketing
- Include case study analysis questions
- Include calculations (break-even, profit, ratios)
- Include theory questions on business concepts
- Include application questions about real business scenarios
- Include questions on business sectors, forms of ownership`;
  }
  
  if (subjectLower.includes('geography')) {
    return `GEOGRAPHY SPECIFIC:
- Include map interpretation questions
- Include questions on climate, weather, geomorphology
- Include case studies (South African and global)
- Include diagram interpretation (topographic maps, climate graphs)
- Include GIS and remote sensing questions
- Include questions on development and urbanization`;
  }
  
  if (subjectLower.includes('history')) {
    return `HISTORY SPECIFIC:
- Include source-based questions (analyze sources, extract information)
- Include essay questions requiring historical analysis
- Cover both South African and World History topics
- Include questions on cause and effect, change and continuity
- Include questions requiring historical interpretation
- Use proper historical terminology`;
  }
  
  if (subjectLower.includes('dance studies')) {
    return `DANCE STUDIES SPECIFIC:
- Include questions on dance history and cultural context
- Include questions on dance techniques and terminology
- Include questions analyzing choreography and dance works
- Include questions on dance composition and structure
- Include questions on performance skills and assessment criteria
- Include questions on South African dance forms and traditions
- May include images of dancers, choreography, or dance notation
- Include questions requiring analysis of visual materials`;
  }
  
  return `GENERAL REQUIREMENTS:
- Cover main topics from CAPS curriculum for ${subject} Grade ${grade}
- Include a mix of theory and application questions
- Use proper subject-specific terminology`;
}
