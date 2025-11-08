
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
import { ExtractedPDF } from '@/lib/past-paper-processor';
import type { PyMuPDFExtractionResult, PageData } from '@/lib/pdf-pymupdf-extractor';

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
  // New fields for OCR processing
  extractedPaper: z.any().optional().describe('OCR-extracted paper data from PDF.'),
  extractedMemo: z.any().optional().describe('OCR-extracted memo data from PDF.'),
});

export type PastPaperInput = z.infer<typeof PastPaperInputSchema>;

const GeneratedQuestionSchema = z.object({
    questionNumber: z.string().describe("The question number, e.g., '1.1' or '2.3.1'"),
    questionText: z.string().describe("The full text of the question."),
    marks: z.number().describe("The number of marks allocated to the question."),
    answer: z.string().describe("A concise, correct answer based on the memo."),
    hasImage: z.boolean().optional().describe("Whether this question has an associated image."),
    imageDataUri: z.string().optional().describe("Base64 data URI of the image if hasImage is true."),
    imageFilename: z.string().optional().describe("Filename of the associated image (from PyMuPDF extraction)."),
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
  
  // If we have OCR-extracted data, use OCR-based processing
  if (input.extractedPaper) {
    return processPastPaperFromOCR(input, expectedCount, baseSubject, paperNumber);
  }
  
  // Check if we should use vision processing (for subjects with images like Dance Studies, Visual Arts, etc.)
  const shouldUseVision = input.paperDataUri && input.memoDataUri && 
    (baseSubject.toLowerCase().includes('dance studies') || 
     baseSubject.toLowerCase().includes('visual arts') ||
     baseSubject.toLowerCase().includes('geography') ||
     baseSubject.toLowerCase().includes('life sciences'));
  
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
    // Log prompt length for debugging
    console.log(`   Prompt length: ${prompt.length} characters`);
    
    const content = await groqChat(prompt, { 
      temperature: 0,
      model: 'llama-3.1-8b-instant' // Small, fast, reliable for deterministic JSON outputs
    });
    const jsonText = extractJsonFromText(content) ?? content;
    const parsed = JSON.parse(jsonText) as any;
    
    // Extract questions using flexible key matching
    const questions = extractQuestions(parsed);
    if (!questions || questions.length === 0) {
      console.warn(`⚠️ No questions found in response. Parsed keys:`, Object.keys(parsed));
      return { success: false, message: 'AI failed to generate questions.' };
    }
    
    return {
      success: true,
      message: `Extracted ${questions.length} questions`,
      generatedQuestions: questions
    };
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
    const parsed = JSON.parse(jsonText) as any;
    
    // Extract questions using flexible key matching
    const questions = extractQuestions(parsed);
    if (!questions || questions.length === 0) {
      console.warn(`⚠️ No questions found in response. Parsed keys:`, Object.keys(parsed));
      return { success: false, message: 'AI failed to generate questions.' };
    }
    
    return {
      success: true,
      message: `Extracted ${questions.length} questions`,
      generatedQuestions: questions
    };
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

/**
 * Process past paper from OCR-extracted text
 * This function extracts questions from OCR text maintaining exact order
 */
async function processPastPaperFromOCR(
  input: PastPaperInput,
  expectedCount: number,
  baseSubject: string,
  paperNumber: string
): Promise<PastPaperOutput> {
  const extractedPaper = input.extractedPaper as ExtractedPDF;
  const extractedMemo = input.extractedMemo as ExtractedPDF | undefined;
  
  const fullText = extractedPaper.pages.map(p => p.text).join('\n\n');
  const memoText = extractedMemo ? extractedMemo.pages.map(p => p.text).join('\n\n') : '';
  
  // Debug: Log OCR extraction stats
  console.log(`📄 OCR extracted ${extractedPaper.pages.length} pages`);
  console.log(`   Paper text: ${fullText.length} chars, Memo text: ${memoText.length} chars`);
  console.log(`   Total images in paper: ${extractedPaper.pages.reduce((sum, p) => sum + p.images.length, 0)}`);
  
  // Chunked processing strategy for Groq free tier limits
  // llama-3.1-8b-instant: 6000 token INPUT limit per request
  // Strategy: Split paper into chunks, process separately, merge results
  const CHUNK_SIZE = 8000; // Characters per chunk (conservative for ~2000 tokens)
  const MEMO_SIZE = 4000;  // Memo size per chunk
  
  if (fullText.length <= CHUNK_SIZE) {
    // Paper is small enough to process in one go
    console.log(`   ✓ Paper fits in single chunk, processing normally`);
    return await processSingleChunk(
      fullText,
      memoText.substring(0, MEMO_SIZE),
      input,
      baseSubject,
      paperNumber,
      extractedPaper
    );
  }
  
  // Paper needs chunking
  const numChunks = Math.ceil(fullText.length / CHUNK_SIZE);
  console.log(`   📑 Splitting paper into ${numChunks} chunks for processing`);
  
  return await processChunkedPaper(
    fullText,
    memoText,
    numChunks,
    CHUNK_SIZE,
    MEMO_SIZE,
    input,
    baseSubject,
    paperNumber,
    extractedPaper
  );
}

/**
 * Process paper in chunks when it's too large for token limits
 */
async function processChunkedPaper(
  fullText: string,
  memoText: string,
  numChunks: number,
  chunkSize: number,
  memoSize: number,
  input: PastPaperInput,
  baseSubject: string,
  paperNumber: string,
  extractedPaper: ExtractedPDF
): Promise<PastPaperOutput> {
  const allQuestions: any[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fullText.length);
    const chunk = fullText.substring(start, end);
    
    // Use proportional memo section for each chunk
    const memoStart = Math.floor((start / fullText.length) * memoText.length);
    const memoEnd = Math.min(memoStart + memoSize, memoText.length);
    const memoChunk = memoText.substring(memoStart, memoEnd);
    
    console.log(`   Processing chunk ${i + 1}/${numChunks}: chars ${start}-${end} (${chunk.length} chars)`);
    
    const chunkResult = await extractQuestionsFromChunk(
      chunk,
      memoChunk,
      i + 1,
      numChunks,
      input,
      baseSubject,
      paperNumber,
      extractedPaper
    );
    
    if (chunkResult.success && chunkResult.generatedQuestions) {
      allQuestions.push(...chunkResult.generatedQuestions);
      console.log(`      ✓ Extracted ${chunkResult.generatedQuestions.length} questions from chunk ${i + 1}`);
    } else {
      console.log(`      ⚠️ Chunk ${i + 1} extraction failed: ${chunkResult.message}`);
    }
    
    // Small delay between chunks to respect rate limits
    if (i < numChunks - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (allQuestions.length === 0) {
    return { success: false, message: 'Failed to extract questions from any chunk' };
  }
  
  // Sort and deduplicate questions by question number
  const uniqueQuestions = deduplicateQuestions(allQuestions);
  console.log(`   ✓ Total questions extracted: ${allQuestions.length}, unique: ${uniqueQuestions.length}`);
  
  return {
    success: true,
    message: `Extracted ${uniqueQuestions.length} questions from ${numChunks} chunks`,
    generatedQuestions: uniqueQuestions
  };
}

/**
 * Deduplicate questions by question number
 */
function deduplicateQuestions(questions: any[]): any[] {
  const seen = new Map<string, any>();
  
  // Sort by question number first
  questions.sort((a, b) => compareQuestionNumbers(a.questionNumber, b.questionNumber));
  
  for (const q of questions) {
    if (!seen.has(q.questionNumber)) {
      seen.set(q.questionNumber, q);
    } else {
      // If duplicate, keep the one with more content (longer questionText)
      const existing = seen.get(q.questionNumber);
      if (q.questionText.length > existing.questionText.length) {
        seen.set(q.questionNumber, q);
      }
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Extract questions from a single chunk of text
 */
async function extractQuestionsFromChunk(
  paperChunk: string,
  memoChunk: string,
  chunkNumber: number,
  totalChunks: number,
  input: PastPaperInput,
  baseSubject: string,
  paperNumber: string,
  extractedPaper: ExtractedPDF
): Promise<PastPaperOutput> {
  const prompt = `You are an expert examiner analyzing a Grade ${input.grade} ${input.subject} past exam paper from ${input.year} that has been extracted using OCR.

CRITICAL: This is CHUNK ${chunkNumber} of ${totalChunks} from the paper. Extract questions in the EXACT sequential order they appear. Maintain the original question numbering format exactly as it appears.

EXTRACTED PAPER TEXT (Chunk ${chunkNumber}/${totalChunks}):
${paperChunk}

${memoChunk ? `MEMO/ANSWER KEY TEXT (Corresponding section):
${memoChunk}` : ''}

CRITICAL REQUIREMENTS FOR QUESTION EXTRACTION:

1. EXACT ORDER: Extract in sequential order (1.1, 1.2, 1.3, 2.1, etc.). Do NOT skip or reorganize.

2. EXACT NUMBERING: Use EXACT format from PDF (1.1, 1.2, 1.2.1, 2.1, 2.1.1, etc.)

3. EXACT TEXT - COMPLETE EXTRACTION:
   - Copy word-for-word from the PDF - do NOT paraphrase or summarize
   - MULTIPLE CHOICE: Extract ALL options (A, B, C, D) with FULL TEXT
     * WRONG: "A\nB\nC\nD" (just letters)
     * CORRECT: "A. Option A full text here\nB. Option B full text here\nC. Option C full text here\nD. Option D full text here"
     * You MUST include the complete text for EACH option, not just the letters
   - INCLUDE ALL QUESTION PARTS: Don't just extract the question stem - include everything
   - PRESERVE FORMATTING: Keep line breaks between options

4. ANSWERS: ${memoChunk ? 'Extract from memo, match by question number. For MCQ, include letter AND full option text.' : 'Leave empty string if no memo.'}

5. IMAGES: Set hasImage: true for questions that reference diagrams, figures, graphs.

6. EXTRACT PARTIAL QUESTIONS: If a question is cut off at chunk boundary, extract what you can see. The next chunk will get the rest.

${getSubjectSpecificInstructions(baseSubject, input.grade)}

OUTPUT FORMAT (JSON ONLY):
{
  "success": true,
  "message": "Extracted questions from chunk ${chunkNumber}",
  "generatedQuestions": [
    {
      "questionNumber": "1.1.1",
      "questionText": "Which ONE is CORRECT?\\nA. Option A text\\nB. Option B text\\nC. Option C text\\nD. Option D text",
      "marks": 2,
      "answer": "B. Option B text",
      "hasImage": false
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Extract ALL questions visible in this chunk with COMPLETE text including ALL options for MCQs.`;

  try {
    // Log prompt length for debugging
    console.log(`   Prompt length: ${prompt.length} characters`);
    
    const content = await groqChat(prompt, { 
      temperature: 0,
      model: 'llama-3.1-8b-instant', // Small, fast, reliable for deterministic JSON outputs
      maxTokens: 3000
    });
    
    let jsonText = extractJsonFromText(content) ?? content;
    const parsed = JSON.parse(jsonText) as any;
    
    // Extract questions using flexible key matching
    const questions = extractQuestions(parsed);
    if (!questions || questions.length === 0) {
      console.warn(`⚠️ No questions found in response. Parsed keys:`, Object.keys(parsed));
      return { success: false, message: `No questions extracted from chunk ${chunkNumber}` };
    }
    
    return {
      success: true,
      message: `Extracted ${questions.length} questions from chunk ${chunkNumber}`,
      generatedQuestions: questions
    };
  } catch (error) {
    console.error(`Error processing chunk ${chunkNumber}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error in chunk processing'
    };
  }
}

/**
 * Process a single chunk of text (when paper is small enough)
 */
async function processSingleChunk(
  paperText: string,
  memoText: string,
  input: PastPaperInput,
  baseSubject: string,
  paperNumber: string,
  extractedPaper: ExtractedPDF
): Promise<PastPaperOutput> {
  // Just use the extractQuestionsFromChunk function with a single chunk
  return await extractQuestionsFromChunk(
    paperText,
    memoText,
    1, // chunk number
    1, // total chunks
    input,
    baseSubject,
    paperNumber,
    extractedPaper
  );
}

/**
 * Compare question numbers for sorting (e.g., "1.1" < "1.2" < "2.1")
 */
function compareQuestionNumbers(num1: string, num2: string): number {
  const parts1 = num1.split('.').map(Number);
  const parts2 = num2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const val1 = parts1[i] || 0;
    const val2 = parts2[i] || 0;
    if (val1 !== val2) {
      return val1 - val2;
    }
  }
  
  return 0;
}

/**
 * NEW: Process past paper from PyMuPDF structured extraction
 * Uses proper text blocks and images with bounding boxes
 * Implements chunking to handle Groq token limits
 */
export async function processPastPaperFromPyMuPDF(
  paperExtraction: PyMuPDFExtractionResult,
  memoExtraction: PyMuPDFExtractionResult | null,
  subject: string,
  grade: number,
  year: number
): Promise<PastPaperOutput> {
  console.log(`🐍 Processing paper with PyMuPDF extraction`);
  console.log(`   Paper: ${paperExtraction.num_pages} pages, ${paperExtraction.pages.reduce((sum, p) => sum + p.images.length, 0)} images`);
  if (memoExtraction) {
    console.log(`   Memo: ${memoExtraction.num_pages} pages`);
  }
  
  // Extract text content from PyMuPDF (concatenate all text blocks)
  const paperText = extractTextFromPyMuPDF(paperExtraction);
  const memoText = memoExtraction ? extractTextFromPyMuPDF(memoExtraction) : '';
  
  console.log(`   📝 Extracted text: ${paperText.length} chars (paper), ${memoText.length} chars (memo)`);
  
  // Chunked processing strategy for Groq free tier limits
  // llama-3.1-8b-instant supports ~8k tokens TOTAL (including JSON schema + instructions + metadata)
  // Actual token length ≈ 3× character length, so 1500 chars ≈ 4500 tokens (safe)
  const CHUNK_SIZE = 1500; // Characters per chunk (safe for 8k token limit)
  const MEMO_SIZE = 1000;  // Memo size per chunk
  
  if (paperText.length <= CHUNK_SIZE) {
    // Paper is small enough to process in one go
    console.log(`   ✓ Paper fits in single chunk, processing normally`);
    return await processPyMuPDFChunk(
      paperText,
      memoText.substring(0, MEMO_SIZE),
      1,
      1,
      subject,
      grade,
      year,
      paperExtraction
    );
  }
  
  // Paper needs chunking
  const numChunks = Math.ceil(paperText.length / CHUNK_SIZE);
  console.log(`   📑 Splitting paper into ${numChunks} chunks for processing`);
  
  return await processPyMuPDFChunked(
    paperText,
    memoText,
    numChunks,
    CHUNK_SIZE,
    MEMO_SIZE,
    subject,
    grade,
    year,
    paperExtraction
  );
}

/**
 * Extract plain text from PyMuPDF extraction (for chunking)
 */
function extractTextFromPyMuPDF(extraction: PyMuPDFExtractionResult): string {
  const pages: string[] = [];
  
  for (const page of extraction.pages) {
    const pageText: string[] = [];
    
    // Sort text blocks by position (top to bottom, left to right)
    const sortedBlocks = [...page.text_blocks].sort((a, b) => {
      // Sort by Y position (top to bottom), then X (left to right)
      if (Math.abs(a.bbox[1] - b.bbox[1]) > 5) {
        return a.bbox[1] - b.bbox[1];
      }
      return a.bbox[0] - b.bbox[0];
    });
    
    for (const block of sortedBlocks) {
      if (block.text.trim()) {
        pageText.push(block.text.trim());
      }
    }
    
    if (pageText.length > 0) {
      pages.push(`--- Page ${page.page} ---\n${pageText.join('\n')}`);
    }
  }
  
  return pages.join('\n\n');
}

/**
 * Extract wait time from Groq rate limit error message
 * Example: "Please try again in 36s" -> 36
 */
function extractWaitTime(errorMessage: string): number {
  const match = errorMessage.match(/try again in ([\d.]+)s/i);
  if (match) {
    const seconds = parseFloat(match[1]);
    // Add 2 seconds buffer and round up
    return Math.ceil(seconds + 2);
  }
  // Default wait time if we can't parse
  return 15;
}

/**
 * Extract questions array from parsed JSON
 * Handles multiple possible key names that the LLM might use
 */
function extractQuestions(parsed: any): any[] | null {
  const keys = ["generatedQuestions", "questions", "items", "output"];
  
  for (const key of keys) {
    if (Array.isArray(parsed[key])) {
      return parsed[key];
    }
  }
  
  return null;
}

/**
 * Get images available for a specific chunk
 * Returns images from pages that might contain the chunk's content
 */
function getImagesForChunk(
  chunkNumber: number,
  totalChunks: number,
  paperExtraction: PyMuPDFExtractionResult
): Array<{ filename: string; page: number; label?: string }> {
  const images: Array<{ filename: string; page: number; label?: string }> = [];
  
  // Estimate which pages this chunk covers
  const totalPages = paperExtraction.num_pages;
  const pagesPerChunk = totalPages / totalChunks;
  const startPage = Math.floor((chunkNumber - 1) * pagesPerChunk);
  const endPage = Math.min(Math.ceil(chunkNumber * pagesPerChunk), totalPages);
  
  // Get images from pages in this range (with some overlap for context)
  const pageRange = {
    start: Math.max(0, startPage - 1), // Include previous page for context
    end: Math.min(totalPages - 1, endPage + 1) // Include next page for context
  };
  
  for (let pageNum = pageRange.start; pageNum <= pageRange.end; pageNum++) {
    const page = paperExtraction.pages.find(p => p.page === pageNum);
    if (page) {
      for (const image of page.images) {
        images.push({
          filename: image.filename,
          page: pageNum + 1, // 1-indexed for display
          label: (image as any).label
        });
      }
    }
  }
  
  return images;
}

/**
 * Process a single chunk of PyMuPDF text with retry logic for rate limits
 */
async function processPyMuPDFChunk(
  paperChunk: string,
  memoChunk: string,
  chunkNumber: number,
  totalChunks: number,
  subject: string,
  grade: number,
  year: number,
  paperExtraction: PyMuPDFExtractionResult,
  retryCount: number = 0
): Promise<PastPaperOutput> {
  // Get available images for this chunk
  const availableImages = getImagesForChunk(chunkNumber, totalChunks, paperExtraction);
  
  const imagesSection = availableImages.length > 0 
    ? `\nAVAILABLE IMAGES FOR THIS CHUNK:
${availableImages.map(img => `- ${img.filename} (Page ${img.page}${img.label ? `, Label: "${img.label}"` : ''})`).join('\n')}

When a question references a diagram, figure, or asks to identify parts, set hasImage: true AND set imageFilename to the matching image filename from the list above. Match images to questions based on:
- Question text mentioning diagrams/figures
- Question asking to "identify part X"
- Image labels that match question content
- Page proximity (images on same page as question text)`
    : '\nNOTE: No images available for this chunk.';
  
  const prompt = `You are an expert CAPS examiner analyzing a Grade ${grade} ${subject} past exam paper from ${year} that has been extracted using PyMuPDF.

${totalChunks > 1 ? `CRITICAL: This is CHUNK ${chunkNumber} of ${totalChunks} from the paper. Extract questions in the EXACT sequential order they appear. Maintain the original question numbering format exactly as it appears.` : ''}

EXTRACTED PAPER TEXT${totalChunks > 1 ? ` (Chunk ${chunkNumber}/${totalChunks})` : ''}:
${paperChunk}

${memoChunk ? `MEMO/ANSWER KEY TEXT${totalChunks > 1 ? ` (Corresponding section)` : ''}:
${memoChunk}` : ''}${imagesSection}

CRITICAL REQUIREMENTS FOR QUESTION EXTRACTION:

1. EXACT ORDER: Extract in sequential order (1.1, 1.2, 1.3, 2.1, etc.). Do NOT skip or reorganize.
   - Each question must be a SEPARATE entry in the array
   - Do NOT bunch multiple questions together
   - If you see "1.1.1", "1.1.2", "1.1.3" - these are THREE separate questions, not one

2. EXACT NUMBERING: Use EXACT format from PDF (1.1, 1.2, 1.2.1, 2.1, 2.1.1, etc.)

3. QUESTION TYPE DETECTION:
   - MULTIPLE CHOICE (MCQ): If question has options A, B, C, D → set type: "multiple-choice"
   - FREE TEXT: If question asks to explain, describe, write, etc. → set type: "free-text"
   - MATCHING: If question has columns to match → set type: "matching"
   - TRUE/FALSE: If question asks true/false → set type: "true-false"

4. EXACT TEXT - COMPLETE EXTRACTION:
   - Copy word-for-word from the PDF - do NOT paraphrase or summarize
   - MULTIPLE CHOICE: Extract ALL options (A, B, C, D) with FULL TEXT
     * WRONG: "A\nB\nC\nD" (just letters)
     * WRONG: "Question text? A B C D" (bunched together)
     * CORRECT: "Question text?\nA. Complete option A text\nB. Complete option B text\nC. Complete option C text\nD. Complete option D text"
     * Each option MUST be on a new line with the letter and full text
   - INCLUDE ALL QUESTION PARTS: Don't just extract the question stem - include everything
   - PRESERVE FORMATTING: Keep line breaks between options

5. IMAGE DETECTION (CRITICAL):
   - Set hasImage: true if question contains ANY of these:
     * "diagram" / "diagramme" / "diagramme hieronder"
     * "figure" / "figuur"
     * "identify part" / "identifiseer deel"
     * "study the" / "bestudeer die"
     * "refer to" / "verwys na"
     * "look at" / "kyk na"
     * "the diagram shows" / "die diagram toon"
     * "structure" / "struktuur" (when asking to identify)
   - If question says "diagrams below" or "diagramme hieronder" → hasImage: true
   - If question asks to "identify part A/B/C" → hasImage: true
   - If question mentions any visual element → hasImage: true
   - When in doubt, if question references something visual → hasImage: true

6. ANSWERS: ${memoChunk ? 'Extract from memo, match by question number. For MCQ, include letter AND full option text (e.g., "B. Option B text").' : 'Leave empty string if no memo.'}

7. QUESTION SEPARATION:
   - Each question number (1.1.1, 1.1.2, etc.) is a SEPARATE question
   - Do NOT combine multiple questions into one entry
   - If you see "1.1.1" followed by "1.1.2" → create TWO separate question objects

8. ${totalChunks > 1 ? 'EXTRACT PARTIAL QUESTIONS: If a question is cut off at chunk boundary, extract what you can see. The next chunk will get the rest.' : 'EXTRACT ALL QUESTIONS: Make sure you extract every single question from this section.'}

You MUST output only valid JSON.

No text outside JSON.

No comments.

No quotes around keys that contain quotes.

If you cannot produce JSON, return: {"generatedQuestions":[]}

Respond in this exact schema:

{
  "generatedQuestions": [
    {
      "questionNumber": "1.1.1",
      "questionText": "Which ONE is CORRECT?\\nA. Complete option A text here\\nB. Complete option B text here\\nC. Complete option C text here\\nD. Complete option D text here",
      "type": "multiple-choice",
      "marks": 2,
      "hasImage": false,
      "imageFilename": null,
      "answer": "B. Complete option B text here"
    },
    {
      "questionNumber": "1.2.1",
      "questionText": "Identify part A in the diagram below.",
      "type": "free-text",
      "marks": 2,
      "hasImage": true,
      "imageFilename": "page4_img1.png",
      "answer": "Part A is the iris"
    }
  ]
}

CRITICAL: When hasImage is true, you MUST set imageFilename to the exact filename from the AVAILABLE IMAGES list above (e.g., "page4_img1.png"). If no matching image is found, set imageFilename to null but keep hasImage: true.

CRITICAL REQUIREMENTS:
- For MCQ questions:
  * type MUST be "multiple-choice"
  * questionText MUST include FULL TEXT for each option on separate lines
  * Format: "Question text?\\nA. Complete option A text\\nB. Complete option B text\\nC. Complete option C text\\nD. Complete option D text"
  * NOT just: "A\\nB\\nC\\nD" or "Question? A B C D"
- For questions with images:
  * hasImage MUST be true
  * Check for: "diagram", "figure", "identify part", "study the", etc.
- Each question number is a SEPARATE question - do NOT bunch them together
- Extract ALL questions in sequential order (1.1, 1.2, 1.3, etc.)

Output only JSON. No markdown. No prose.`;

  const MAX_RETRIES = 3;
  
  try {
    // Log prompt length for debugging
    console.log(`   Prompt length: ${prompt.length} characters`);
    
    const content = await groqChat(prompt, { 
      temperature: 0,
      model: 'llama-3.1-8b-instant', // Small, fast, reliable for deterministic JSON outputs
      maxTokens: 3000
    });
    
    // With response_format: { type: 'json_object' }, content should already be valid JSON
    // But we still extract and validate
    let jsonText = extractJsonFromText(content);
    
    if (!jsonText) {
      throw new Error(`Failed to extract JSON from response. Content length: ${content.length} chars`);
    }
    
    // Parse JSON (should be valid now with strict mode)
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(`JSON parsing failed: ${errorMsg}. This should not happen with strict JSON mode.`);
    }
    
    // Extract questions using flexible key matching
    const questions = extractQuestions(parsed);
    
    if (!questions || questions.length === 0) {
      console.warn(`⚠️ No questions found in response. Parsed keys:`, Object.keys(parsed));
      return { success: false, message: `No questions extracted${totalChunks > 1 ? ` from chunk ${chunkNumber}` : ''}` };
    }
    
    // Return in expected format
    return {
      success: true,
      message: `Extracted ${questions.length} questions${totalChunks > 1 ? ` from chunk ${chunkNumber}` : ''}`,
      generatedQuestions: questions
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRateLimit = errorMessage.includes('429') || 
                        errorMessage.includes('Rate limit') || 
                        errorMessage.includes('rate_limit_exceeded');
    
    if (isRateLimit && retryCount < MAX_RETRIES) {
      const waitTime = extractWaitTime(errorMessage);
      console.log(`   ⏳ Rate limit hit for chunk ${chunkNumber}, waiting ${waitTime}s before retry ${retryCount + 1}/${MAX_RETRIES}...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      
      return processPyMuPDFChunk(
        paperChunk,
        memoChunk,
        chunkNumber,
        totalChunks,
        subject,
        grade,
        year,
        paperExtraction,
        retryCount + 1
      );
    }
    
    console.error(`Error processing chunk ${chunkNumber}:`, error);
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Process PyMuPDF extraction in chunks
 */
async function processPyMuPDFChunked(
  paperText: string,
  memoText: string,
  numChunks: number,
  chunkSize: number,
  memoSize: number,
  subject: string,
  grade: number,
  year: number,
  paperExtraction: PyMuPDFExtractionResult
): Promise<PastPaperOutput> {
  const allQuestions: PastPaperOutput['generatedQuestions'] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, paperText.length);
    const paperChunk = paperText.substring(start, end);
    
    // Get corresponding memo chunk (try to align with paper chunk)
    const memoStart = Math.floor((i / numChunks) * memoText.length);
    const memoEnd = Math.min(memoStart + memoSize, memoText.length);
    const memoChunk = memoText.substring(memoStart, memoEnd);
    
    console.log(`   📄 Processing chunk ${i + 1}/${numChunks} (${paperChunk.length} chars)`);
    
    const chunkResult = await processPyMuPDFChunk(
      paperChunk,
      memoChunk,
      i + 1,
      numChunks,
      subject,
      grade,
      year,
      paperExtraction
    );
    
    if (chunkResult.success && chunkResult.generatedQuestions) {
      allQuestions.push(...chunkResult.generatedQuestions);
      console.log(`   ✅ Chunk ${i + 1}/${numChunks} extracted ${chunkResult.generatedQuestions.length} questions`);
    } else {
      console.warn(`   ⚠️  Chunk ${i + 1} failed: ${chunkResult.message}`);
    }
    
    // Delay between chunks to respect Groq rate limits (6000 tokens/minute)
    // With smaller chunks (3000 chars ≈ 1000-1500 tokens), we can process faster
    // But still need delay to avoid rate limits
    if (i < numChunks - 1) {
      const delay = 10; // 10 seconds between chunks (reduced from 12s due to smaller chunks)
      console.log(`   ⏸️  Waiting ${delay}s before next chunk (rate limit protection)...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }
  }
  
  if (allQuestions.length === 0) {
    return { success: false, message: 'No questions extracted from any chunk' };
  }
  
  // Deduplicate and sort questions
  const deduplicated = deduplicateQuestions(allQuestions);
  deduplicated.sort((a, b) => compareQuestionNumbers(a.questionNumber, b.questionNumber));
  
  console.log(`   ✅ Extracted ${deduplicated.length} questions from ${numChunks} chunks`);
  console.log(`   📊 Sample (first 3):`);
  deduplicated.slice(0, 3).forEach((q, idx) => {
    console.log(`      ${idx + 1}. Q${q.questionNumber}: ${q.questionText.substring(0, 80)}...`);
    console.log(`         Marks: ${q.marks}, HasImage: ${q.hasImage}`);
  });
  
  return {
    success: true,
    message: `Extracted ${deduplicated.length} questions from ${numChunks} chunks`,
    generatedQuestions: deduplicated
  };
}

/**
 * Build simplified JSON structure for LLM
 * Includes essential layout information without overwhelming the context
 */
function buildStructuredPaperJSON(extraction: PyMuPDFExtractionResult): any {
  return {
    pages: extraction.pages.map(page => ({
      page: page.page,
      text_blocks: page.text_blocks.slice(0, 50).map(block => ({ // Limit to 50 blocks per page
        bbox: block.bbox,
        text: block.text.substring(0, 500) // Limit text length
      })),
      images: page.images.map(img => ({
        filename: img.filename,
        bbox: img.bbox,
        width: img.width,
        height: img.height
      }))
    }))
  };
}
