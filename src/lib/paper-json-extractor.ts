import { z } from 'zod';
import { groqChat, extractJsonFromText } from '@/ai/groq';
import type { PyMuPDFExtractionResult } from './pdf-pymupdf-extractor';

export const ExtractedQuestionJsonSchema = z.object({
  number: z.string(),
  type: z.string().optional(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  marks: z.number().optional(),
  answer: z.union([z.string(), z.null()]).optional(),
  imageFilename: z.union([z.string(), z.null()]).optional(),
  imageLabel: z.union([z.string(), z.null()]).optional(),
  imageDataUri: z.union([z.string(), z.null()]).optional(),
  page: z.union([z.number(), z.null()]).optional(),
});

export const ExtractedPaperJsonSchema = z.object({
  subject: z.string(),
  grade: z.number(),
  paper: z.string(),
  year: z.number(),
  questions: z.array(ExtractedQuestionJsonSchema),
});

export type ExtractedQuestionJson = z.infer<typeof ExtractedQuestionJsonSchema>;
export type ExtractedPaperJson = z.infer<typeof ExtractedPaperJsonSchema>;

const MAX_CONTEXT_CHARS = 40000;

function truncateForPrompt(content: string, label: string): string {
  if (content.length <= MAX_CONTEXT_CHARS) {
    return content;
  }
  const truncated = content.slice(0, MAX_CONTEXT_CHARS);
  return `${truncated}\n\n[... ${label} truncated by ${content.length - MAX_CONTEXT_CHARS} characters ...]`;
}

function buildStructuredPages(extraction: PyMuPDFExtractionResult) {
  return extraction.pages.map(page => {
    const pageText =
      page.text?.trim() ||
      page.text_blocks
        .map(block => block.text.trim())
        .filter(Boolean)
        .join('\n')
        .trim();
    
    return {
      page: page.page,
      text: pageText,
      images: page.images.map(image => ({
        filename: image.filename,
        label: image.label,
        dataUri: image.dataUri,
        bbox: image.bbox,
        page: image.page ?? page.page,
      })),
    };
  });
}

function buildImageCatalog(structuredPages: ReturnType<typeof buildStructuredPages>): string {
  const catalog = structuredPages.flatMap(page =>
    page.images.map(image => {
      const labelPart = image.label ? `, Label: "${image.label}"` : '';
      return `- ${image.filename} (Page ${page.page}${labelPart})`;
    })
  );
  
  if (catalog.length === 0) {
    return '- No diagrams detected in this extraction.';
  }
  return catalog.join('\n');
}

export async function generatePaperJsonFromExtraction(params: {
  extraction: PyMuPDFExtractionResult;
  subject: string;
  grade: number;
  paper: string;
  year: number;
}): Promise<ExtractedPaperJson> {
  const { extraction, subject, grade, paper, year } = params;
  const structuredPages = buildStructuredPages(extraction);
  const structuredPagesJson = JSON.stringify(structuredPages, null, 2);
  const pageText = structuredPages
    .map(page => `=== PAGE ${page.page} ===\n${page.text || ''}`)
    .join('\n\n');
  
  const prompt = `You are an expert South African CAPS examiner reconstructing an official Grade ${grade} ${subject} ${paper} (${year}) past paper.

You receive the full PDF extraction with page-by-page text and diagrams (including data URIs).

CRITICAL REQUIREMENTS:
1. Extract questions in the EXACT order they appear on the PDF (top-to-bottom, page-by-page)
2. Copy question wording VERBATIM (no paraphrasing)
3. Preserve numbering exactly as shown (e.g., 1.1, 1.1.1, 2.2.3)
4. Include ALL sub-questions — every numbered item becomes its own entry
5. Detect question type:
   - "multiple_choice" for MCQs (include full options array)
   - "short" for short answers
   - "long" for long-form / essays
   - "diagram" when a diagram/figure/image must be referenced
   - "true_false", "fill_in", "matching" as needed
6. Marks: Estimate realistic CAPS marks per question/sub-question (1-10 range)
7. Images: When a question references a diagram/figure, copy BOTH the filename and dataUri exactly as provided
   - Use \`imageFilename\` = image filename (e.g., "page3_img1.png")
   - Use \`imageDataUri\` = FULL base64 data URI (copy-paste from structured data)
   - Use \`imageLabel\` when provided (e.g., "Figure 1: Human brain")
   - Include \`page\` field for the question's page number
8. Options: For MCQs, output array like ["A. Option text", "B. Option text", ...] with complete wording
9. Answer: Leave null unless memo content explicitly contained within the page text
10. Output ONLY valid JSON (no markdown, no comments, no prose)

METADATA:
- Subject: ${subject}
- Grade: ${grade}
- Paper: ${paper}
- Year: ${year}

AVAILABLE DIAGRAMS:
${buildImageCatalog(structuredPages)}

STRUCTURED PAGES (JSON):
${truncateForPrompt(structuredPagesJson, 'structured pages')}

FULL TEXT (ORDERED):
${truncateForPrompt(pageText, 'full text')}

OUTPUT FORMAT (JSON ONLY):
{
  "subject": "${subject}",
  "grade": ${grade},
  "paper": "${paper}",
  "year": ${year},
  "questions": [
    {
      "number": "1.1",
      "type": "multiple_choice",
      "question": "Exact question text",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "marks": 2,
      "answer": null,
      "imageFilename": null,
      "imageLabel": null,
      "imageDataUri": null,
      "page": 1
    }
  ]
}

Remember: Answer with JSON only.`;
  
  const content = await groqChat(prompt, {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    maxTokens: 8000,
  });
  
  const jsonText = extractJsonFromText(content) ?? content;
  let parsed: ExtractedPaperJson;
  
  try {
    parsed = ExtractedPaperJsonSchema.parse(JSON.parse(jsonText));
  } catch (error) {
    throw new Error(
      `Failed to parse extracted paper JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
  
  // Ensure metadata matches requested values
  parsed.subject = subject;
  parsed.grade = grade;
  parsed.paper = paper;
  parsed.year = year;
  
  return parsed;
}
