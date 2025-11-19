/**
 * Parse questions using Groq, processing each question's full_text individually
 * This gives better accuracy than batch processing
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local if it exists
const envPath = join(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY not found in environment');
}

/**
 * Parse a single question's question_text or full_text using Groq
 */
async function parseQuestionText(questionText, fullText, questionType, hasImages, questionIndex, questionNumber) {
  // Prefer question_text over full_text as it's usually cleaner
  const textToParse = questionText || fullText || '';
  
  if (!textToParse || !textToParse.trim()) {
    return [];
  }
  
  const prompt = `You are parsing a question entry from a past paper. This entry may contain MULTIPLE questions mixed together. Extract ALL questions and sub-questions from this text.

TEXT TO PARSE:
${textToParse}

CRITICAL TASK:
1. Find ALL question numbers in the text (patterns like "1.4.3", "1.4.4", "1.4.5", "2.1", "2.2", "3.1.1", "3.1.2", etc.)
2. Find sub-questions (patterns like "1.4.3 (a)", "1.4.3 (b)", "1.4.3 (c)")
3. Extract the COMPLETE, FULL question text for each - do NOT extract fragments or partial text
4. Extract marks from patterns like "(2)", "[2]", "2 marks" - look before AND after the question number
5. Clean the text by removing OCR artifacts: ☐, ☑, [X], [ ], but KEEP the actual question text
6. Detect question type: 
   - multiple-choice: if has A/B/C/D options or multiple choice format
   - diagram: if mentions "diagram", "figure", "identify part", "label", "draw"
   - table: if mentions "table" or "complete the table"
   - graph: if mentions "graph", "plot", "chart"
   - normal: default for other questions

IMPORTANT RULES:
- Each question number (1.4.4, 1.4.5, 2.1, 2.2, 3.1.1, etc.) should be a SEPARATE question object
- Extract the FULL question text - everything from the question number until the next question number
- Do NOT create questions with empty text or placeholder text like "Complete question text here"
- Do NOT extract just answers or fragments - only extract complete questions
- If you see "QUESTION 3" followed by "3.1.1", "3.1.2", etc., extract each numbered item as a separate question
- Group sub-questions (like "1.4.3 (a)", "1.4.3 (b)") under their parent question "1.4.3"

EXAMPLE:
If text is: "(1)    (1)      1.4.4      1.4.5 Give the LETTER and NAME of the part that will enter the ovum  during fertilisation.    Name the type of cell division that occurred to produce the  structure in diagram  3 ."

Extract:
- Question "1.4.4": "Give the LETTER and NAME of the part that will enter the ovum during fertilisation." (1 mark, type: diagram)
- Question "1.4.5": "Name the type of cell division that occurred to produce the structure in diagram 3." (1 mark, type: diagram)

If text is: "(1)      1.4.3 (a)    (b)    (c) 3 ☐     1 ☐     1 ☐"

Extract:
- Question "1.4.3" with sub-questions:
  - "1.4.3 (a)": [extract actual question text after (a), before (b)] (extract marks)
  - "1.4.3 (b)": [extract actual question text after (b), before (c)] (extract marks)
  - "1.4.3 (c)": [extract actual question text after (c)] (extract marks)

CRITICAL RULES:
- Extract COMPLETE question text, not fragments
- Remove OCR artifacts but keep the actual question
- Use EXACT question numbers as they appear
- Each question/sub-question should have proper text and marks
- Group sub-questions under their parent

Return JSON object with "questions" array:
{
  "questions": [
    {
      "number": "1.4.4",
      "text": "Complete question text here",
      "marks": 1,
      "type": "diagram",
      "hasDiagram": true,
      "subQuestions": []
    }
  ]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at parsing past paper questions. Always return valid JSON arrays only, no markdown or code blocks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Extract JSON from response
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Try to parse as JSON object first
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      // If parsing fails, try to extract JSON array from text
      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        parsed = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Groq response');
      }
    }
    
    // Handle both array and object with questions array
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    
    // Add image flag if needed
    questions.forEach(q => {
      if (hasImages || /diagram|figure|identify|label/i.test(q.text || '')) {
        q.hasDiagram = true;
      }
    });
    
    return questions;
  } catch (error) {
    console.error(`  ⚠️  Error parsing question ${questionIndex}:`, error.message);
    return [];
  }
}

/**
 * Parse all questions from JSON using Groq (one at a time for accuracy)
 */
export async function parseAllQuestionsWithGroq(jsonData) {
  console.log('🤖 Parsing questions with Groq (individual processing)...');
  
  const allQuestions = [];
  const imageMap = new Map();
  
  // Process each question entry individually
  for (let i = 0; i < (jsonData.questions || []).length; i++) {
    const q = jsonData.questions[i];
    const questionText = q.question_text || '';
    const fullText = q.full_text || '';
    const hasImages = q.images && q.images.length > 0;
    const questionNumber = q.question_number;
    
    if (hasImages) {
      imageMap.set(questionNumber?.toString() || i.toString(), q.images);
    }
    
    const textToParse = questionText || fullText;
    if (textToParse.trim()) {
      console.log(`   Processing question ${i + 1}/${jsonData.questions.length} (Q${questionNumber || i + 1})...`);
      const parsed = await parseQuestionText(questionText, fullText, q.question_type, hasImages, i, questionNumber);
      
      // Add image references
      parsed.forEach(pq => {
        if (hasImages) {
          pq.hasDiagram = true;
          pq._imageData = q.images;
        }
      });
      
      allQuestions.push(...parsed);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Organize into sections
  const sectionMap = new Map();
  
  allQuestions.forEach(q => {
    const sectionNum = parseInt(q.number.split('.')[0], 10) || 1;
    if (!sectionMap.has(sectionNum)) {
      sectionMap.set(sectionNum, []);
    }
    sectionMap.get(sectionNum).push(q);
  });
  
  // Convert to sections array
  const sections = [];
  const sortedSectionNums = Array.from(sectionMap.keys()).sort((a, b) => a - b);
  
  sortedSectionNums.forEach((sectionNum, idx) => {
    const sectionQuestions = sectionMap.get(sectionNum);
    
    // Sort questions by number
    sectionQuestions.sort((a, b) => {
      const aParts = a.number.split(/[.()]/).map(x => {
        const num = parseInt(x);
        return isNaN(num) ? x.charCodeAt(0) : num;
      });
      const bParts = b.number.split(/[.()]/).map(x => {
        const num = parseInt(x);
        return isNaN(num) ? x.charCodeAt(0) : num;
      });
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });
    
    // Group sub-questions under their parents
    const groupedQuestions = [];
    const questionMap = new Map();
    
    sectionQuestions.forEach(q => {
      if (q.number.includes('(')) {
        // This is a sub-question
        const parentNum = q.number.split('(')[0].trim();
        if (!questionMap.has(parentNum)) {
          questionMap.set(parentNum, {
            number: parentNum,
            text: '',
            marks: 0,
            type: q.type || 'normal',
            hasDiagram: q.hasDiagram || false,
            subQuestions: [],
          });
        }
        questionMap.get(parentNum).subQuestions.push({
          number: q.number,
          text: q.text,
          marks: q.marks || 1,
          type: q.type || 'normal',
        });
      } else {
        // This is a main question
        if (questionMap.has(q.number)) {
          // Update existing (might have been created for sub-questions)
          const existing = questionMap.get(q.number);
          existing.text = q.text || existing.text;
          existing.marks = q.marks || existing.marks;
          existing.type = q.type || existing.type;
          existing.hasDiagram = q.hasDiagram || existing.hasDiagram;
        } else {
          questionMap.set(q.number, {
            number: q.number,
            text: q.text,
            marks: q.marks || 1,
            type: q.type || 'normal',
            hasDiagram: q.hasDiagram || false,
            subQuestions: [],
          });
        }
      }
    });
    
    // Convert map to array
    const finalQuestions = Array.from(questionMap.values());
    
    sections.push({
      id: `section-${idx + 1}`,
      label: `SECTION ${String.fromCharCode(64 + sectionNum)}`,
      number: idx + 1,
      questions: finalQuestions.map((q, qIdx) => ({
        id: `q-${sectionNum}-${qIdx + 1}`,
        number: q.number,
        text: q.text,
        instructionText: '',
        marks: q.marks,
        type: q.type,
        hasDiagram: q.hasDiagram || false,
        subQuestions: (q.subQuestions || []).map((sq, sqIdx) => ({
          id: `sq-${sectionNum}-${qIdx + 1}-${sqIdx + 1}`,
          number: sq.number,
          text: sq.text,
          marks: sq.marks,
          type: sq.type || 'normal',
        })),
      })),
      totalMarks: 0,
    });
  });
  
  // Calculate marks
  sections.forEach(section => {
    let total = 0;
    section.questions.forEach(q => {
      total += q.marks || 0;
      q.subQuestions.forEach(sq => {
        total += sq.marks || 0;
      });
    });
    section.totalMarks = total;
  });
  
  return {
    sections,
    totalMarks: sections.reduce((sum, s) => sum + s.totalMarks, 0),
    imageMap,
  };
}

