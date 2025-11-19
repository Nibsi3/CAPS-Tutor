/**
 * Process JSON Past Paper and Convert to Editor Format using Groq
 * 
 * This script:
 * 1. Reads a JSON file with past paper questions and images
 * 2. Uses Groq AI to analyze and convert questions to our editor format
 * 3. Creates PaperStructure with sections, questions, and sub-questions
 * 4. Handles images, multiple choice, tables, graphs, diagrams, etc.
 * 5. Uploads the structure to Appwrite
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { Client, Databases, ID, Storage, Query } from 'node-appwrite';
import { parseAllQuestionsWithGroq } from './parse_with_groq_individual.mjs';

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

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('❌ Error: GROQ_API_KEY environment variable is not set');
  console.error('   Please set it in .env.local or as an environment variable');
  process.exit(1);
}
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const STORAGE_BUCKET_ID = '690dafea0021f232399e'; // Past papers bucket

// Get JSON file path from command line
const jsonFilePath = process.argv[2];
if (!jsonFilePath) {
  console.error('Usage: node process_json_past_paper.mjs <path-to-json-file>');
  process.exit(1);
}

if (!existsSync(jsonFilePath)) {
  console.error(`Error: File not found: ${jsonFilePath}`);
  process.exit(1);
}

/**
 * Call Groq API to convert JSON questions to our editor format
 */
async function convertToEditorFormat(jsonData, jsonFilePath) {
  console.log('🤖 Calling Groq API to convert questions to editor format...');
  
  // Prepare questions data for Groq (limit text length to avoid token limits)
  const questionsData = jsonData.questions.map((q, idx) => ({
    index: idx,
    question_number: q.question_number,
    question_type: q.question_type,
    page_number: q.page_number,
    has_images: q.images && q.images.length > 0,
    image_count: q.images ? q.images.length : 0,
    question_text: q.question_text || '',
    // Limit full_text to avoid token issues, but keep enough for analysis
    // Use full_text if available, otherwise use question_text
    full_text: (q.full_text || q.question_text || '') ? 
      ((q.full_text || q.question_text || '').length > 4000 ? 
        (q.full_text || q.question_text || '').substring(0, 4000) + '... [truncated]' : 
        (q.full_text || q.question_text || '')) : '',
  }));
  
  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  const promptLength = JSON.stringify(questionsData).length;
  const estimatedTokens = Math.ceil(promptLength / 4);
  console.log(`   📊 Estimated input tokens: ~${estimatedTokens.toLocaleString()}`);
  console.log(`   📊 Questions to process: ${questionsData.length}`);
  
  if (estimatedTokens > 100000) {
    console.warn(`   ⚠️  Warning: Large input detected. Groq may have token limits.`);
  }

  // Extract metadata for prompt
  const metadata = jsonData.metadata || {};
  const filename = basename(jsonFilePath, '.json');
  const filenameParts = filename.split('_');
  const yearMatch = filename.match(/\b(20\d{2})\b/);
  const paperMatch = filename.match(/\bP(\d+)\b/i);
  const paperIndex = filenameParts.findIndex(p => /^P\d+$/i.test(p));
  let extractedSubject = 'Life Sciences';
  if (paperIndex > 0) {
    const subjectParts = filenameParts.slice(0, paperIndex);
    const uniqueParts = [...new Set(subjectParts)];
    extractedSubject = uniqueParts.join(' ').replace(/_/g, ' ');
  }
  const extractedYear = yearMatch ? yearMatch[1] : '2020';
  const extractedPaper = paperMatch ? paperMatch[1] : '1';

  // Send a more focused prompt with better instructions
  const prompt = `You are an expert at converting past paper questions to a structured CAPS exam format for South African CAPS curriculum.

CRITICAL: The full_text field contains the EXACT text from the PDF. You must:
1. Parse it carefully to extract individual questions
2. Identify question numbers like "1.4.3", "1.4.4", "1.4.5", "2.1", "2.2", etc.
3. Identify sub-questions like "1.4.3 (a)", "1.4.3 (b)", "1.4.3 (c)"
4. Extract marks from patterns like "(2)", "[2]", "2 marks"
5. Clean the text by removing OCR artifacts like ☐, [X], mark indicators
6. Group questions into sections: Section A (questions starting with 1.x), Section B (2.x), Section C (3.x)

INPUT DATA:
- Metadata: ${JSON.stringify(metadata, null, 2)}
- Filename: ${filename}
- Extracted Subject: ${extractedSubject}
- Extracted Year: ${extractedYear}
- Extracted Paper: ${extractedPaper}
- Total questions in JSON: ${jsonData.questions.length}

QUESTIONS DATA (each has full_text with the actual question content):
${questionsData.map((q, i) => `
Question ${i + 1}:
- question_number: ${q.question_number}
- question_type: ${q.question_type}
- page_number: ${q.page_number}
- has_images: ${q.has_images}
- full_text: ${q.full_text.substring(0, 1000)}${q.full_text.length > 1000 ? '... [truncated]' : ''}
`).join('\n')}

TASK - PARSE EACH full_text FIELD CAREFULLY:

For EACH question in the input, analyze its full_text field to extract:

1. QUESTION NUMBERING (CRITICAL):
   - Look for patterns like "1.4.3", "1.4.4", "1.4.5", "2.1", "2.2", "2.3.4", etc.
   - These are the ACTUAL question numbers - use them exactly as found
   - Sub-questions have patterns like "1.4.3 (a)", "1.4.3 (b)", "1.4.3 (c)"
   - DO NOT use the question_number field from input - it's just an index
   - Extract the REAL question numbers from the full_text

2. ORGANIZE INTO SECTIONS:
   - Questions starting with "1.x" → Section A
   - Questions starting with "2.x" → Section B  
   - Questions starting with "3.x" → Section C
   - Create sections based on the first number in the question number

3. EXTRACT QUESTION TEXT:
   - Remove OCR artifacts: ☐, ☑, [X], [ ], mark indicators like (2), [2]
   - Remove mark indicators at the end: "(2 marks)", "[2 marks]"
   - Keep the actual question text clean and readable
   - For sub-questions like "1.4.3 (a)", extract just the text after the number

4. EXTRACT MARKS:
   - Look for: "(2)", "[2]", "2 marks", "(2 marks)" near each question
   - Default to 1 mark if not found
   - Each question and sub-question should have its own marks

5. QUESTION TYPES:
   - "multiple-choice": If question_type is "multiple_choice" OR text has A/B/C/D options
   - "diagram": If has_images is true OR text mentions "diagram", "figure", "identify part"
   - "normal": Default for text questions

6. SUB-QUESTIONS:
   - If you see "1.4.3 (a)", "1.4.3 (b)", "1.4.3 (c)" - these are sub-questions of "1.4.3"
   - The parent question "1.4.3" should contain these as subQuestions array
   - Each sub-question should have its own number, text, and marks

7. CLEAN TEXT:
   - Remove: ☐, ☑, [X], [ ], standalone (2), [2] markers
   - Keep question text clean and readable
   - Preserve line breaks for multiple choice options

OUTPUT FORMAT (JSON only, no markdown):
{
  "sections": [
    {
      "id": "section-1",
      "label": "SECTION A",
      "number": 1,
      "questions": [
        {
          "id": "q-1-1",
          "number": "1.1",
          "text": "Question text here",
          "instructionText": "Instruction if any",
          "marks": 2,
          "type": "normal",
          "hasDiagram": false,
          "subQuestions": [
            {
              "id": "sq-1-1-1",
              "number": "1.1.1",
              "text": "Sub-question text",
              "marks": 1,
              "type": "normal"
            }
          ]
        }
      ],
      "totalMarks": 0
    }
  ],
  "header": {
    "subject": "${extractedSubject}",
    "paperNumber": "${extractedPaper}",
    "year": "${extractedYear}",
    "grade": 12,
    "examBoard": "DBE",
    "certificateType": "NSC"
  },
  "totalMarks": 0
}

EXAMPLE OF CORRECT PARSING:

If full_text contains:
"(1)    (1)      1.4.4      1.4.5 Give the LETTER and NAME of the part that will enter the ovum  during fertilisation.    Name the type of cell division that occurred to produce the  structure in diagram  3 ."

You should extract TWO separate questions:
- Question "1.4.4": "Give the LETTER and NAME of the part that will enter the ovum during fertilisation." (1 mark)
- Question "1.4.5": "Name the type of cell division that occurred to produce the structure in diagram 3." (1 mark)

Both go to Section A (because they start with "1.x")

If full_text contains:
"(1)      1.4.3 (a)    (b)    (c) 3 ☐     1 ☐     1 ☐ (1) (1)    (1)      1.4.4    1.4.5..."

You should extract:
- Question "1.4.3" with 3 sub-questions:
  - "1.4.3 (a)": [extract text after (a), before (b)] (extract marks, default 1)
  - "1.4.3 (b)": [extract text after (b), before (c)] (extract marks, default 1)
  - "1.4.3 (c)": [extract text after (c), before next question] (extract marks, default 1)
- Then continue with "1.4.4" and "1.4.5" as separate questions

CRITICAL: Clean the text by removing:
- ☐, ☑ symbols
- [X], [ ] markers  
- Standalone mark indicators like (1), (2) that appear between questions
- But KEEP the actual question text

CRITICAL RULES:
- Extract question numbers EXACTLY as they appear: "1.4.3", "1.4.4", "1.4.5", NOT "1", "2", "3"
- Sub-questions like "1.4.3 (a)" must be nested under parent "1.4.3"
- Clean text: remove ☐, [X], mark indicators, but keep the actual question text
- Each question number found in full_text should become a separate question or sub-question
- DO NOT create questions numbered "1", "2", "3" - use the actual numbers from the text
- Preserve EXACT question text after cleaning OCR artifacts
- Calculate total marks per section and overall
- Mark questions with images as hasDiagram: true

Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;

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
            content: 'You are an expert at converting past paper questions to structured exam formats. Always return valid JSON only, no markdown or code blocks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 32000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response (handle cases where it might be wrapped in markdown)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const paperStructure = JSON.parse(jsonStr);
    
    // Validate structure
    if (!paperStructure.sections || !Array.isArray(paperStructure.sections)) {
      throw new Error('Invalid structure: missing or invalid sections array');
    }
    
    if (!paperStructure.header) {
      throw new Error('Invalid structure: missing header');
    }
    
    // Ensure all required fields exist and initialize sub-questions if missing
    paperStructure.sections.forEach((section, sectionIdx) => {
      if (!section.id) section.id = `section-${sectionIdx + 1}`;
      if (!section.label) section.label = `SECTION ${String.fromCharCode(65 + sectionIdx)}`;
      if (!section.number) section.number = sectionIdx + 1;
      if (!section.questions) section.questions = [];
      if (!section.totalMarks) section.totalMarks = 0;
      
      section.questions.forEach((q, qIdx) => {
        if (!q.id) q.id = `q-${section.number}-${qIdx + 1}`;
        if (!q.number) q.number = `${section.number}.${qIdx + 1}`;
        if (!q.text) q.text = '';
        if (!q.marks) q.marks = 1;
        if (!q.type) q.type = 'normal';
        if (!q.subQuestions) q.subQuestions = [];
        if (q.hasDiagram === undefined) q.hasDiagram = false;
        
        q.subQuestions.forEach((sq, sqIdx) => {
          if (!sq.id) sq.id = `sq-${q.id}-${sqIdx + 1}`;
          if (!sq.number) sq.number = `${q.number}.${sqIdx + 1}`;
          if (!sq.text) sq.text = '';
          if (!sq.marks) sq.marks = 1;
          if (!sq.type) sq.type = 'normal';
        });
      });
    });
    
    // Calculate marks
    paperStructure.sections.forEach(section => {
      let total = 0;
      section.questions.forEach(q => {
        total += q.marks || 0;
        (q.subQuestions || []).forEach(sq => {
          total += sq.marks || 0;
        });
      });
      section.totalMarks = total;
    });
    
    paperStructure.totalMarks = paperStructure.sections.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
    
    // Ensure header has required fields
    if (!paperStructure.header.subject) paperStructure.header.subject = extractedSubject;
    if (!paperStructure.header.paperNumber) paperStructure.header.paperNumber = extractedPaper;
    if (!paperStructure.header.year) paperStructure.header.year = extractedYear;
    if (!paperStructure.header.grade) paperStructure.header.grade = 12;
    if (!paperStructure.header.examBoard) paperStructure.header.examBoard = 'DBE';
    if (!paperStructure.header.certificateType) paperStructure.header.certificateType = 'NSC';
    
    return paperStructure;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

/**
 * Upload images to Appwrite Storage
 */
async function uploadImages(questions, jsonData, storage, basePath) {
  console.log('📤 Uploading images to Appwrite Storage...');
  
  const imageMap = new Map(); // Maps question number to image file IDs
  
  for (const question of questions) {
    if (question.images && question.images.length > 0) {
      const questionImages = [];
      
      for (let imgIdx = 0; imgIdx < question.images.length; imgIdx++) {
        const image = question.images[imgIdx];
        try {
          // Handle different image formats (path, dataUri, etc.)
          let imageBuffer;
          let extension = 'png';
          
          if (typeof image === 'string') {
            // Image is a file path - try multiple locations
            let imagePath = image;
            
            // Try as absolute path first
            if (!existsSync(imagePath)) {
              // Try relative to JSON file directory
              imagePath = join(basePath, image);
            }
            if (!existsSync(imagePath)) {
              // Try in common subdirectories
              const possiblePaths = [
                join(basePath, 'images', image),
                join(basePath, 'extracted_images', image),
                join(dirname(basePath), 'images', image),
                join(dirname(basePath), 'extracted_images', image),
              ];
              
              for (const possiblePath of possiblePaths) {
                if (existsSync(possiblePath)) {
                  imagePath = possiblePath;
                  break;
                }
              }
            }
            
            if (existsSync(imagePath)) {
              imageBuffer = readFileSync(imagePath);
              const pathMatch = imagePath.match(/\.(\w+)$/);
              if (pathMatch) extension = pathMatch[1];
            } else {
              console.warn(`  ⚠️  Image file not found: ${image} (tried multiple locations)`);
              continue;
            }
          } else if (image && typeof image === 'object') {
            // Image is an object with dataUri, image_data, or path
            if (image.image_data) {
              // Handle image_data field (base64 string, may or may not have data URI prefix)
              let base64Data = image.image_data;
              if (base64Data.startsWith('data:image/')) {
                base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
                const match = image.image_data.match(/data:image\/(\w+);base64/);
                if (match) extension = match[1];
              } else {
                // Assume PNG if no format specified
                extension = image.format || 'png';
              }
              try {
                imageBuffer = Buffer.from(base64Data, 'base64');
              } catch (error) {
                console.warn(`  ⚠️  Failed to decode base64 image data for question ${question.question_number}:`, error.message);
                continue;
              }
            } else if (image.dataUri) {
              // Convert data URI to buffer
              const base64Data = image.dataUri.replace(/^data:image\/\w+;base64,/, '');
              imageBuffer = Buffer.from(base64Data, 'base64');
              const match = image.dataUri.match(/data:image\/(\w+);base64/);
              if (match) extension = match[1];
            } else if (image.path) {
              const imagePath = image.path.startsWith('/') || image.path.match(/^[A-Z]:/) 
                ? image.path 
                : join(basePath, image.path);
              if (existsSync(imagePath)) {
                imageBuffer = readFileSync(imagePath);
                const pathMatch = image.path.match(/\.(\w+)$/);
                if (pathMatch) extension = pathMatch[1];
              } else {
                console.warn(`  ⚠️  Image file not found: ${imagePath}`);
                continue;
              }
            } else {
              console.warn(`  ⚠️  Skipping image for question ${question.question_number} - no valid image data (keys: ${Object.keys(image).join(', ')})`);
              continue;
            }
            
            // Use format from image object if available
            if (image.format && !extension) {
              extension = image.format.toLowerCase();
            }
          } else {
            console.warn(`  ⚠️  Skipping image for question ${question.question_number} - unknown image format`);
            continue;
          }
          
          if (!imageBuffer) {
            console.warn(`  ⚠️  Could not load image buffer for question ${question.question_number}`);
            continue;
          }
          
          const fileName = `question-${question.question_number}-${imgIdx}-${Date.now()}.${extension}`;
          const fileId = ID.unique();
          
          // Detect MIME type from extension
          const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
          };
          const mimeType = mimeTypes[extension.toLowerCase()] || 'image/png';
          
          // Create File object from buffer (Node.js 18+ has native File API)
          const fileObject = new File([imageBuffer], fileName, {
            type: mimeType,
            lastModified: Date.now()
          });
          
          // Upload to Appwrite Storage
          await storage.createFile(
            STORAGE_BUCKET_ID,
            fileId,
            fileObject,
            ['read("any")'] // Public read access
          );
          
          questionImages.push(fileId);
          console.log(`  ✅ Uploaded image ${imgIdx + 1} for question ${question.question_number}: ${fileId}`);
        } catch (error) {
          console.error(`  ❌ Error uploading image for question ${question.question_number}:`, error.message);
        }
      }
      
      if (questionImages.length > 0) {
        imageMap.set(question.question_number.toString(), questionImages);
      }
    }
  }
  
  return imageMap;
}

/**
 * Calculate numeric order for question number (for sorting)
 * e.g., "1.1" -> 1.1, "2.3.1" -> 2.31
 */
function calculateQuestionOrder(questionNumber) {
  const parts = questionNumber.split('.').map(Number);
  let order = 0;
  let multiplier = 1;
  
  // Reverse to process from right to left
  for (let i = parts.length - 1; i >= 0; i--) {
    order += parts[i] * multiplier;
    multiplier *= 100; // Allow up to 99 sub-questions per level
  }
  
  return order;
}

/**
 * Convert PaperStructure to flat array of questions for storage
 */
function flattenQuestions(paperStructure, imageMap) {
  const questionsToStore = [];
  
  paperStructure.sections.forEach(section => {
    section.questions.forEach(question => {
      // Try to match images by question number
      let questionImages = null;
      questionImages = imageMap.get(question.number);
      if (!questionImages) {
        const mainNum = question.number.split('.')[0];
        questionImages = imageMap.get(mainNum);
      }
      if (!questionImages && question.number.includes('.')) {
        const parts = question.number.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
          const testNum = parts.slice(0, i).join('.');
          questionImages = imageMap.get(testNum);
          if (questionImages) break;
        }
      }
      
      const imageFileId = questionImages && questionImages.length > 0 ? questionImages[0] : question.imageFileId;
      
      // Store main question
      questionsToStore.push({
        questionNumber: question.number,
        questionText: question.text || question.instructionText || '',
        marks: question.marks || 0,
        answer: '', // Answers come from memos, not questions
        type: question.type || 'normal',
        hasImage: !!imageFileId || question.hasDiagram || false,
        imageFileId: imageFileId || undefined,
      });
      
      // Store sub-questions
      (question.subQuestions || []).forEach(subQ => {
        // Sub-questions might share parent's image
        const subQImageFileId = subQ.imageFileId || imageFileId;
        
        questionsToStore.push({
          questionNumber: subQ.number,
          questionText: subQ.text || '',
          marks: subQ.marks || 0,
          answer: '',
          type: subQ.type || 'normal',
          hasImage: !!subQImageFileId || subQ.hasDiagram || false,
          imageFileId: subQImageFileId || undefined,
        });
      });
    });
  });
  
  return questionsToStore;
}

/**
 * Store questions in the questions collection
 */
async function storeQuestionsInCollection(databases, paperId, questionsToStore) {
  console.log('📝 Storing questions in questions collection...');
  
  // Sort questions by number to ensure proper order
  const sortedQuestions = [...questionsToStore].sort((a, b) => {
    return calculateQuestionOrder(a.questionNumber) - calculateQuestionOrder(b.questionNumber);
  });
  
  let stored = 0;
  let errors = 0;
  
  for (const question of sortedQuestions) {
    try {
      const order = calculateQuestionOrder(question.questionNumber);
      const orderValue = Math.round(order * 1000); // Multiply by 1000 to preserve 3 decimal places as integer
      
      // Truncate fields to prevent size limit errors
      const MAX_TEXT_LENGTH = 10000;
      const questionText = question.questionText 
        ? (question.questionText.length > MAX_TEXT_LENGTH 
            ? question.questionText.substring(0, MAX_TEXT_LENGTH) + '... [truncated]'
            : question.questionText)
        : '(No question text)';
      
      const answer = question.answer || '(No answer provided)';
      
      // Build question data object matching the schema
      const questionData = {
        paperId: paperId,
        number: question.questionNumber || '0',
        question: questionText,
        questionText: questionText, // Some schemas use questionText instead of question
        answer: answer,
        marks: Math.round(question.marks || 0),
        type: question.type || 'normal',
        hasImage: !!question.imageFileId || question.hasImage || false,
        order: orderValue,
      };
      
      // Add imageFileId if image exists (matching the schema column name)
      if (question.imageFileId) {
        questionData.imageFileId = question.imageFileId;
      }
      
      // Check if question already exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        'questions',
        [
          Query.equal('paperId', paperId),
          Query.equal('number', question.questionNumber),
        ]
      );
      
      if (existing.documents.length > 0) {
        // Update existing question
        await databases.updateDocument(
          DATABASE_ID,
          'questions',
          existing.documents[0].$id,
          questionData
        );
      } else {
        // Create new question
        await databases.createDocument(
          DATABASE_ID,
          'questions',
          ID.unique(),
          questionData
        );
      }
      
      stored++;
    } catch (error) {
      console.error(`  ❌ Error storing question ${question.questionNumber}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ Stored ${stored} questions, ${errors} errors`);
  return { stored, errors };
}

/**
 * Create or update paper in Appwrite
 */
async function saveToAppwrite(paperStructure, jsonData, imageMapFromParser, userId = 'admin') {
  console.log('💾 Saving to Appwrite...');
  
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);
  
  const databases = new Databases(client);
  const storage = new Storage(client);
  
  // Extract metadata from JSON and filename
  const metadata = jsonData.metadata || {};
  const filename = basename(jsonFilePath, '.json');
  
  // Parse filename: e.g., "Life_Sciences_Life_Sciences_P1_Nov_2020_Eng_2_Eng"
  // Pattern: Subject_Subject_PaperNumber_Month_Year_Language...
  const filenameParts = filename.split('_');
  let subject = metadata.subject || 'Life Sciences';
  let year = metadata.year || '2020';
  let paperNumber = metadata.paper || '1';
  let grade = metadata.grade || 12;
  
  // Try to extract from filename
  // Look for year (4 digits)
  const yearMatch = filename.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
  }
  
  // Look for paper number (P1, P2, etc.)
  const paperMatch = filename.match(/\bP(\d+)\b/i);
  if (paperMatch) {
    paperNumber = paperMatch[1];
  }
  
  // Extract subject (usually first part before P1/P2)
  // For "Life_Sciences_Life_Sciences_P1", subject is "Life Sciences"
  const paperIndex = filenameParts.findIndex(p => /^P\d+$/i.test(p));
  if (paperIndex > 0) {
    // Take parts before paper number, remove duplicates
    const subjectParts = filenameParts.slice(0, paperIndex);
    // Remove duplicates while preserving order
    const uniqueParts = [...new Set(subjectParts)];
    subject = uniqueParts.join(' ').replace(/_/g, ' ');
  }
  
  // Determine grade from subject (Life Sciences is typically Grade 12)
  // This is a heuristic - you might want to adjust
  if (!metadata.grade) {
    grade = 12; // Default to Grade 12 for past papers
  }
  
  console.log(`   📋 Extracted metadata:`);
  console.log(`      Subject: ${subject}`);
  console.log(`      Paper: ${paperNumber}`);
  console.log(`      Year: ${year}`);
  console.log(`      Grade: ${grade}`);
  
  // Upload images first (if any) - continue even if images fail
  let imageMap = new Map();
  try {
    const jsonDir = dirname(jsonFilePath);
    imageMap = await uploadImages(jsonData.questions || [], jsonData, storage, jsonDir);
    
    // Merge with parser's image map
    if (imageMapFromParser) {
      imageMapFromParser.forEach((images, qNum) => {
        if (!imageMap.has(qNum)) {
          // Try to find matching uploaded image by question number pattern
          const uploadedImages = Array.from(imageMap.values()).flat();
          if (uploadedImages.length > 0) {
            imageMap.set(qNum, uploadedImages);
          }
        }
      });
    }
  } catch (error) {
    console.warn(`  ⚠️  Warning: Image upload failed, continuing without images:`, error.message);
    // Continue without images
  }
  
  // Check if paper already exists
  let paperId;
  try {
    const papers = await databases.listDocuments(
      DATABASE_ID,
      'pastpapers',
      [
        // Query by subject, year, and paper
      ]
    );
    
    const existingPaper = papers.documents.find(p => {
      const pSubject = (p.subject || '').toLowerCase();
      const pYear = p.year?.toString() || '';
      return (
        pSubject.includes(subject.toLowerCase()) &&
        pYear === year.toString() &&
        pSubject.includes(`paper ${paperNumber}`.toLowerCase() || `p${paperNumber}`.toLowerCase())
      );
    });
    
    if (existingPaper) {
      paperId = existingPaper.$id;
      console.log(`  📄 Found existing paper: ${paperId}`);
      
      // Update existing paper - save structure to generatedQuestions[0] for editor
      // Compress structure to fit in 10KB limit
      const structureJson = JSON.stringify(paperStructure);
      if (structureJson.length > 10000) {
        // If too large, create a minimal structure and let editor load from questions collection
        const minimalStructure = {
          sections: paperStructure.sections.map(s => ({
            id: s.id,
            label: s.label,
            number: s.number,
            questions: s.questions.map(q => ({
              id: q.id,
              number: q.number,
              text: q.text.substring(0, 100), // Truncate for storage
              marks: q.marks,
              type: q.type,
              hasDiagram: q.hasDiagram,
              subQuestions: q.subQuestions.map(sq => ({
                id: sq.id,
                number: sq.number,
                text: sq.text.substring(0, 100),
                marks: sq.marks,
                type: sq.type,
              })),
            })),
            totalMarks: s.totalMarks,
          })),
          header: paperStructure.header,
          totalMarks: paperStructure.totalMarks,
        };
        await databases.updateDocument(
          DATABASE_ID,
          'pastpapers',
          paperId,
          {
            status: 'Draft',
            generatedQuestions: [JSON.stringify(minimalStructure)],
          }
        );
      } else {
        await databases.updateDocument(
          DATABASE_ID,
          'pastpapers',
          paperId,
          {
            status: 'Draft',
            generatedQuestions: [structureJson],
          }
        );
      }
      console.log(`  ✅ Updated paper: ${paperId}`);
    } else {
      // Create new paper
      paperId = ID.unique();
      await databases.createDocument(
        DATABASE_ID,
        'pastpapers',
        paperId,
        {
          teacherId: userId,
          gradeLevel: grade,
          subject: `${subject} Paper ${paperNumber}`,
          year: year.toString(),
          paperName: basename(jsonFilePath),
          memoName: '',
          status: 'Draft',
          questionCount: paperStructure.sections.reduce((sum, s) => 
            sum + s.questions.reduce((qSum, q) => 
              qSum + 1 + q.subQuestions.length, 0), 0),
          // Save structure for editor (compress if needed)
          generatedQuestions: (() => {
            const structureJson = JSON.stringify(paperStructure);
            if (structureJson.length > 10000) {
              // Create minimal structure
              const minimalStructure = {
                sections: paperStructure.sections.map(s => ({
                  id: s.id,
                  label: s.label,
                  number: s.number,
                  questions: s.questions.map(q => ({
                    id: q.id,
                    number: q.number,
                    text: q.text.substring(0, 100),
                    marks: q.marks,
                    type: q.type,
                    hasDiagram: q.hasDiagram,
                    subQuestions: q.subQuestions.map(sq => ({
                      id: sq.id,
                      number: sq.number,
                      text: sq.text.substring(0, 100),
                      marks: sq.marks,
                      type: sq.type,
                    })),
                  })),
                  totalMarks: s.totalMarks,
                })),
                header: paperStructure.header,
                totalMarks: paperStructure.totalMarks,
              };
              return [JSON.stringify(minimalStructure)];
            }
            return [structureJson];
          })()
        }
      );
      console.log(`  ✅ Created new paper: ${paperId}`);
    }
    
    // Convert PaperStructure to flat questions array and store in questions collection
    const questionsToStore = flattenQuestions(paperStructure, imageMap);
    const storeResult = await storeQuestionsInCollection(databases, paperId, questionsToStore);
    
    // Update paper with actual question count
    await databases.updateDocument(
      DATABASE_ID,
      'pastpapers',
      paperId,
      {
        questionCount: storeResult.stored,
        status: 'Draft',
      }
    );
    
    console.log(`\n🎉 Success! Paper ID: ${paperId}`);
    console.log(`   View at: /admin/past-papers/${paperId}`);
    console.log(`   Total sections: ${paperStructure.sections.length}`);
    console.log(`   Total questions stored: ${storeResult.stored}`);
    console.log(`   Total marks: ${paperStructure.totalMarks}`);
    
    return paperId;
  } catch (error) {
    console.error('Error saving to Appwrite:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('📖 Reading JSON file...');
    const jsonContent = readFileSync(jsonFilePath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    
    console.log(`✅ Loaded JSON file`);
    console.log(`   Questions: ${jsonData.questions?.length || 0}`);
    console.log(`   Metadata: ${JSON.stringify(jsonData.metadata || {}, null, 2)}`);
    
    // Convert to editor format using Groq (processing each question individually)
    // Uses question_text field which is cleaner than full_text
    const parsedResult = await parseAllQuestionsWithGroq(jsonData);
    
    // Extract metadata for header
    const metadata = jsonData.metadata || {};
    const filename = basename(jsonFilePath, '.json');
    const filenameParts = filename.split('_');
    const yearMatch = filename.match(/\b(20\d{2})\b/);
    const paperMatch = filename.match(/\bP(\d+)\b/i);
    const paperIndex = filenameParts.findIndex(p => /^P\d+$/i.test(p));
    let extractedSubject = 'Life Sciences';
    if (paperIndex > 0) {
      const subjectParts = filenameParts.slice(0, paperIndex);
      const uniqueParts = [...new Set(subjectParts)];
      extractedSubject = uniqueParts.join(' ').replace(/_/g, ' ');
    }
    const extractedYear = yearMatch ? yearMatch[1] : '2020';
    const extractedPaper = paperMatch ? paperMatch[1] : '1';
    
    const paperStructure = {
      sections: parsedResult.sections,
      header: {
        subject: extractedSubject,
        paperNumber: extractedPaper,
        year: extractedYear,
        grade: 12,
        examBoard: 'DBE',
        certificateType: 'NSC',
      },
      totalMarks: parsedResult.totalMarks,
    };
    
    // Store image map for later use
    const imageMapFromParser = parsedResult.imageMap;
    
    console.log(`\n✅ Converted to editor format`);
    console.log(`   Sections: ${paperStructure.sections.length}`);
    console.log(`   Total marks: ${paperStructure.totalMarks}`);
    
    // Optionally save structure to file for inspection
    const outputFile = jsonFilePath.replace('.json', '_structure.json');
    writeFileSync(outputFile, JSON.stringify(paperStructure, null, 2), 'utf-8');
    console.log(`   💾 Saved structure to: ${outputFile}`);
    
    // Save to Appwrite
    await saveToAppwrite(paperStructure, jsonData, imageMapFromParser);
    
    console.log('\n✨ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run main function
main();

