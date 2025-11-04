/**
 * Action 2: AI Question Generation
 * Converts PDF content into structured exam questions using AI
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const EXTRACTED_FOLDER = join(ROOT_DIR, 'extracted_papers');
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

if (!GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY environment variable is not set');
    process.exit(1);
}

/**
 * Call Groq API to generate questions from PDF content
 */
async function generateQuestions(pdfData) {
    const { json: jsonPath, subject, grade, paper, year } = pdfData;
    
    // Read the extracted JSON
    const jsonContent = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    // Build page-structured content with images per page (preserving order)
    const pagesWithImages = jsonContent.pages.map(page => ({
        page: page.page,
        text: page.text,
        images: (page.images || []).map(img => {
            if (typeof img === 'string') {
                return { path: img, dataUri: null, rect: null, label: null };
            } else if (img && typeof img === 'object') {
                return {
                    path: img.path || null,
                    dataUri: img.dataUri || null,
                    rect: img.rect || null,
                    label: img.label || null
                };
            }
            return null;
        }).filter(img => img !== null)
    }));
    
    // Build text content from all pages (for backward compatibility in prompt)
    const fullText = pagesWithImages
        .map(page => `=== PAGE ${page.page} ===\n${page.text}`)
        .join('\n\n');
    
    // Build structured page data for AI (with images per page)
    const structuredPages = JSON.stringify(pagesWithImages, null, 2);
    
    // Build prompt for AI
    const prompt = `You are an exam reconstruction AI for South African CAPS past papers.

INPUT:
- Extracted text from a PDF (pages + text + images)
- Metadata: subject="${subject}", grade=${grade}, paper="${paper}", year=${year}

CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:
1. EXACT ORDER: Extract questions in the EXACT sequential order they appear page by page. Start with Question 1.1, then 1.2, then 1.3, etc. Do NOT skip numbers. Do NOT reorganize. Go page 1, page 2, page 3 in order.
2. EXACT NUMBERING: Use the EXACT question numbering format from the PDF:
   - Main questions: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, etc.
   - Sub-questions: 1.4.1, 1.4.2, 1.4.3, 2.1.1, 2.1.2, etc.
   - DO NOT start with 1.1.1 unless the PDF actually starts that way
   - Match the numbering EXACTLY as it appears in the source
3. EXACT TEXT: Copy question text EXACTLY word-for-word as it appears - do NOT paraphrase, rewrite, or summarize
4. NO DEPARTMENT IMAGES: Completely ignore Department of Education logos, headers, watermarks, or any administrative content
5. IMAGE REFERENCES: Only include images that are actual scientific diagrams/figures referenced in questions (not logos, headers, or black bars)
6. COMPLETE EXTRACTION: Extract ALL questions including all parts and sub-questions - do not skip any

TASK:
- Extract ALL questions from the PDF in their EXACT order - this includes:
  * Main question headers (e.g., "1.1", "1.2", "2.1")
  * ALL sub-questions (e.g., "1.1.1", "1.1.2", "1.1.3", etc.)
  * ALL parts within sub-questions (e.g., "2.1.1 (a)", "2.1.1 (b)")
- Maintain EXACT numbering from the source - do NOT skip any numbers
- Copy question text EXACTLY as written - include multiple choice options if present
- Include EVERY question and sub-question - the PDF typically has 50-100+ questions total
- Set type to "diagram" for questions that explicitly reference diagrams/figures/images
- Leave answer as null (memos processed separately)

OUTPUT FORMAT (JSON ONLY):
{
  "subject": "${subject}",
  "grade": ${grade},
  "paper": "${paper}",
  "year": ${year},
  "questions": [
    {
      "number": "1.1",
      "type": "short",
      "question": "EXACT question text as it appears in the PDF",
      "options": null,
      "answer": null,
      "image": null,
      "image_label": null
    },
    {
      "number": "1.2",
      "type": "multiple_choice",
      "question": "EXACT question text as it appears in the PDF",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "answer": null,
      "image": null,
      "image_label": null
    },
    {
      "number": "2.1.1",
      "type": "diagram",
      "question": "Label the parts of the heart.",
      "options": null,
      "answer": null,
      "image": "data:image/png;base64,...",
      "image_label": "Figure 1: Heart diagram"
    }
  ]
}

QUESTION TYPES:
- "short": Short answer questions (1-3 marks typically)
- "long": Long answer/essay questions (4+ marks)
- "multiple_choice": Multiple choice with options array
- "fill_in": Fill in the blank questions
- "diagram": Questions that require diagrams/images
- "true_false": True/False questions

IMPORTANT: 
- Each sub-question (1.1, 1.2, 1.1.1, 1.1.2, 2.1.1, 2.1.2, etc.) must be a SEPARATE object in the questions array
- For questions with images: set type to "diagram" or include image field with dataUri from the page's image dataUri, and include image_label from the page's image label
- Assign images based on their position relative to question text (images that appear near or below a question belong to that question)
- Use "image" field for the dataUri (not "imageDataUri")
- Use "image_label" field (not "imageLabel")

STRICT RULES - MUST FOLLOW:
- Extract questions in STRICT sequential order: Read page 1 top to bottom, then page 2, then page 3, etc.
- Numbering MUST match PDF exactly: If PDF shows "1.1" then use "1.1", if it shows "1.4.1" then use "1.4.1"
- DO NOT invent numbering - use exactly what appears in the PDF
- Copy question text EXACTLY word-for-word - preserve all punctuation, capitalization, formatting
- Include ALL parts and sub-questions as SEPARATE question objects: If question 1.1 has sub-questions 1.1.1 through 1.1.10, create 10 separate question objects, one for each sub-question. Do NOT combine them.
- A typical Life Sciences Paper 1 has 50-100+ questions total - extract ALL of them as separate objects
- Each numbered item (1.1.1, 1.1.2, 1.2.1, 2.1.1, 2.1.2, etc.) must be its own question object in the array
- For marks: Estimate based on question complexity (1 mark = simple recall, 2-3 = basic, 4-6 = complex, 7-10 = extended)
- Set type to "diagram" and include image field if question text explicitly mentions a diagram, figure, image, or refers to a visual
- Completely ignore Department of Education content (logos, headers, watermarks, administrative text)
- Output ONLY valid JSON - no markdown code blocks, no explanations, no extra text
- The questions array should contain questions in the EXACT order they appear in the PDF

PAGE-STRUCTURED DATA WITH IMAGES:
Each page contains text and images with their coordinates and labels. Use this to assign images to questions based on their position relative to question text.

${structuredPages.substring(0, 40000)}${structuredPages.length > 40000 ? '\n\n[... page data truncated for length ...]' : ''}

PDF CONTENT (EXTRACT IN EXACT ORDER AS IT APPEARS):
${fullText.substring(0, 40000)}${fullText.length > 40000 ? '\n\n[... content truncated for length ...]' : ''}

IMAGE ASSIGNMENT RULES:
- For each question, check which images appear on the same page
- If an image's rectangle coordinates are near or below the question text, assign that image to the question
- Use the image's dataUri for imageDataUri field
- Use the image's label for imageLabel field
- If question text mentions "Figure X", "Diagram X", etc., match it to the image with that label

CRITICAL - ORDER MUST BE 1:1 WITH PDF:
- Read the PDF content from top to bottom, page 1 line 1 through to the last page
- Extract each question in the EXACT order you encounter it
- Question 1.1.1 must come before 1.1.2, which must come before 1.1.3, etc.
- If question 2.1 appears on page 8, it must come after all questions from pages 1-7
- Do NOT sort by question number - preserve the order they appear in the PDF
- The questions array order MUST match the PDF reading order exactly (1:1 correspondence)

Return ONLY valid JSON.`;

    try {
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Updated to current model
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI that extracts exam questions from PDF content. You always return valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 8000,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error('Groq API returned no content');
        }

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const questionJson = JSON.parse(jsonMatch[0]);
        
        // Ensure metadata is set
        questionJson.subject = subject;
        questionJson.grade = grade;
        questionJson.paper = paper;
        questionJson.year = year;

        return questionJson;
    } catch (error) {
        console.error(`Error generating questions for ${pdfData.pdf}:`, error);
        throw error;
    }
}

/**
 * Main function to process all extracted PDFs
 */
async function main() {
    const summaryPath = join(EXTRACTED_FOLDER, 'extraction_summary.json');
    
    if (!existsSync(summaryPath)) {
        console.error(`Error: Extraction summary not found at ${summaryPath}`);
        console.error('Please run extract_pdfs_with_metadata.py first');
        process.exit(1);
    }

    const allPdfs = JSON.parse(readFileSync(summaryPath, 'utf-8'));
    
    console.log(`Found ${allPdfs.length} PDF(s) to process\n`);

    const results = [];
    
    // Load existing questions summary to avoid regenerating
    const existingQuestionsPath = join(EXTRACTED_FOLDER, 'questions_summary.json');
    let existingQuestions = {};
    if (existsSync(existingQuestionsPath)) {
        try {
            const existing = JSON.parse(readFileSync(existingQuestionsPath, 'utf-8'));
            existing.forEach(pdf => {
                if (pdf.ai_output && pdf.ai_output.questions && pdf.ai_output.questions.length > 0) {
                    const key = `${pdf.subject}-${pdf.paper}-${pdf.year}`;
                    existingQuestions[key] = pdf;
                }
            });
            console.log(`Found ${Object.keys(existingQuestions).length} paper(s) with existing questions (will skip)\n`);
        } catch (e) {
            console.log('No existing questions found, will generate all\n');
        }
    }

    for (let i = 0; i < allPdfs.length; i++) {
        const pdf = allPdfs[i];
        const key = `${pdf.subject}-${pdf.paper}-${pdf.year}`;
        
        console.log(`[${i + 1}/${allPdfs.length}] Processing: ${pdf.pdf}`);
        console.log(`  Subject: ${pdf.subject}, ${pdf.paper}, ${pdf.year}`);
        
        // Check if questions already exist for this paper
        if (existingQuestions[key]) {
            console.log(`  ⏭ Skipping - questions already exist (${existingQuestions[key].ai_output.questions.length} questions)`);
            console.log(`  Using existing: ${existingQuestions[key].ai_output_path || 'N/A'}\n`);
            results.push(existingQuestions[key]);
            continue;
        }
        
        try {
            const aiOutput = await generateQuestions(pdf);
            
            // Save AI output
            const outputPath = pdf.json.replace('.json', '_questions.json');
            writeFileSync(outputPath, JSON.stringify(aiOutput, null, 2), 'utf-8');
            
            pdf.ai_output = aiOutput;
            pdf.ai_output_path = outputPath;
            
            console.log(`  ✓ Generated ${aiOutput.questions?.length || 0} questions`);
            console.log(`  ✓ Saved to: ${outputPath}\n`);
            
            results.push(pdf);
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}\n`);
            continue;
        }
    }

    // Save updated summary with AI outputs
    const updatedSummaryPath = join(EXTRACTED_FOLDER, 'questions_summary.json');
    writeFileSync(updatedSummaryPath, JSON.stringify(results, null, 2), 'utf-8');
    
    console.log(`\n✓ Processed ${results.length} PDF(s) successfully`);
    console.log(`✓ Summary saved to: ${updatedSummaryPath}`);
    
    return results;
}

// Run main when executed directly
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export { generateQuestions, main };

