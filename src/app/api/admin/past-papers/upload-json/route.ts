import { NextRequest } from 'next/server';
import { getServerDatabases, getServerStorage } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { ID, Query } from 'node-appwrite';
import { groqChat, extractJsonFromText } from '@/ai/groq';

/**
 * JSON UPLOAD ROUTE WITH INTELLIGENT QUESTION TYPE DETECTION
 * 
 * This route handles JSON file uploads for past papers.
 * It extracts questions from the JSON and saves them to the database.
 * 
 * KEY FEATURES:
 * 1. Automatic question type detection (normal, multiple-choice, table, graph, diagram, extract, true-false)
 * 2. Structured data extraction (table data, graph data, extract text, diagram labels, options)
 * 3. LLM-powered analysis (optional, can be enabled/disabled)
 * 4. Pattern-based fallback extraction (works without LLM)
 * 5. Sub-question parsing and mark extraction
 * 6. Marks extraction from question text
 * 7. **ENHANCED ORDER PRESERVATION**: Questions are sorted by number to maintain exact sequence
 * 8. **ENHANCED MULTIPLE CHOICE DETECTION**: Automatically detects and extracts options from question text
 * 
 * QUESTION TYPES SUPPORTED:
 * - normal: Standard text questions
 * - multiple-choice: Questions with options (A, B, C, D) - automatically detected and extracted
 * - table: Questions with table data (headers, rows)
 * - graph: Questions with graph/chart data (axis labels, data points)
 * - diagram: Questions with diagrams/figures (diagram labels)
 * - extract: Questions with extract/passage text
 * - true-false: True/False questions
 * 
 * ORDER PRESERVATION:
 * - Questions are automatically sorted by question number (1.1, 1.2, 1.3, 2.1, etc.)
 * - Question text is processed in the exact order it appears in the JSON
 * - Sub-questions maintain their parent relationship and order
 * 
 * MULTIPLE CHOICE DETECTION:
 * - Detects multiple choice questions from text patterns (A. B. C. D. or A) B) C) D))
 * - Extracts full option text automatically
 * - Handles various formats: "A. text", "A) text", "A text"
 * - Cleans up options (removes letter prefixes, trailing marks)
 * - Saves options in correct order (A, B, C, D)
 */

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Parse request
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const existingPaperId = formData.get('paperId') as string | null;
        const userId = formData.get('userId') as string;
        const subject = formData.get('subject') as string;
        const year = formData.get('year') as string;
        const grade = formData.get('grade') as string;
        
        // NEW: Option to enable/disable LLM (default: disabled for speed)
        const useLLM = formData.get('useLLM') === 'true'; // Only use LLM if explicitly enabled
        
        if (!file) {
          throw new Error('No file provided');
        }

        // Read and parse JSON
        const jsonText = await file.text();
        let jsonData: any;
        try {
          jsonData = JSON.parse(jsonText);
        } catch (error: any) {
          throw new Error(`Invalid JSON: ${error.message}`);
        }

        // Extract paper metadata from JSON or form
        let paperId = existingPaperId || null;
        let detectedSubject = subject;
        let detectedYear = year;
        let detectedGrade = grade ? parseInt(grade) : 12;
        let detectedTitle = file.name.replace('.json', '');

        // Try to extract metadata from JSON
        if (jsonData.past_paper_name) {
          detectedTitle = jsonData.past_paper_name;
          // Try to extract subject, year, grade from name
          const nameMatch = jsonData.past_paper_name.match(/(\w+)\s+P(\d+)\s+NSC\s+(\w+)\s+(\d+)/i);
          if (nameMatch) {
            detectedSubject = detectedSubject || nameMatch[1];
            detectedYear = detectedYear || nameMatch[4];
          }
        }

        // Create or update paper
        const databases = getServerDatabases();
        const storage = getServerStorage();

        if (existingPaperId) {
          paperId = existingPaperId;
          await databases.updateDocument(
            appwriteConfig.databaseId,
            'pastpapers',
            paperId,
            { status: 'Processing' }
          );
        } else {
          const paper = await databases.createDocument(
            appwriteConfig.databaseId,
            'pastpapers',
            ID.unique(),
            {
              teacherId: userId,
              gradeLevel: detectedGrade,
              subject: detectedSubject || 'Unknown Subject',
              year: detectedYear || new Date().getFullYear().toString(),
              paperName: detectedTitle,
              memoName: '',
              status: 'Processing',
              questionCount: 0,
            }
          );
          paperId = paper.$id;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'paper_created', paperId })}\n\n`));

        // Extract questions from JSON - ROBUST EXTRACTION WITH MULTIPLE STRUCTURE SUPPORT
        let questions: any[] = [];
        
        console.log('[JSON Upload] 🔍 Analyzing JSON structure...');
        console.log('[JSON Upload] Top-level keys:', Object.keys(jsonData));
        
        // Handle nested structure: documents[].structured.sections[].questions[]
        if (jsonData.documents && Array.isArray(jsonData.documents)) {
          console.log('[JSON Upload] 📚 Found documents array with', jsonData.documents.length, 'documents');
          for (const doc of jsonData.documents) {
            if (doc.document_type === 'memo') {
              console.log('[JSON Upload] ⏭️  Skipping memo document');
              continue; // Skip memos
            }
            
            console.log('[JSON Upload] 📄 Processing document:', doc.document_type || 'unknown');
            
            if (doc.structured?.sections) {
              console.log('[JSON Upload] 📑 Found structured sections:', doc.structured.sections.length);
              for (const section of doc.structured.sections) {
                if (section.questions && Array.isArray(section.questions)) {
                  console.log(`[JSON Upload] ✅ Section "${section.name}" has ${section.questions.length} questions`);
                  for (const q of section.questions) {
                    questions.push({
                      ...q,
                      section: section.name,
                    });
                    
                    // Also add subquestions as separate entries
                    if (q.subquestions && Array.isArray(q.subquestions)) {
                      console.log(`[JSON Upload] 📝 Question ${q.number || q.question_number} has ${q.subquestions.length} subquestions`);
                      for (const subq of q.subquestions) {
                        questions.push({
                          ...subq,
                          section: section.name,
                          parent: q.number || q.question_number,
                        });
                      }
                    }
                  }
                } else {
                  console.log(`[JSON Upload] ⚠️  Section "${section.name}" has no questions array`);
                }
              }
            } else {
              console.log('[JSON Upload] ⚠️  Document has no structured.sections');
            }
          }
        }
        // Handle flat structure: questions[] or data[]
        else if (jsonData.questions && Array.isArray(jsonData.questions)) {
          console.log('[JSON Upload] 📋 Found flat questions array:', jsonData.questions.length, 'questions');
          questions = jsonData.questions;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          console.log('[JSON Upload] 📊 Found data array:', jsonData.data.length, 'items');
          questions = jsonData.data;
        } else if (Array.isArray(jsonData)) {
          console.log('[JSON Upload] 📦 JSON is direct array:', jsonData.length, 'items');
          questions = jsonData;
        } else {
          // Try to find questions in any nested structure
          console.log('[JSON Upload] 🔍 Searching for questions in nested structure...');
          const findQuestionsRecursive = (obj: any, path: string = ''): any[] => {
            const found: any[] = [];
            if (Array.isArray(obj)) {
              // Check if this array contains question-like objects
              if (obj.length > 0 && obj[0] && typeof obj[0] === 'object') {
                const firstItem = obj[0];
                if (firstItem.number || firstItem.question_number || firstItem.question || firstItem.question_text) {
                  console.log(`[JSON Upload] ✅ Found questions array at path: ${path}`);
                  return obj;
                }
              }
              // Recursively search in array items
              obj.forEach((item, idx) => {
                if (item && typeof item === 'object') {
                  found.push(...findQuestionsRecursive(item, `${path}[${idx}]`));
                }
              });
            } else if (obj && typeof obj === 'object') {
              // Check if this object has a questions property
              if (obj.questions && Array.isArray(obj.questions)) {
                const qs = obj.questions;
                if (qs.length > 0 && qs[0] && (qs[0].number || qs[0].question_number || qs[0].question)) {
                  console.log(`[JSON Upload] ✅ Found questions at path: ${path}.questions`);
                  found.push(...qs);
                }
              }
              // Recursively search in object properties
              for (const key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] && typeof obj[key] === 'object') {
                  found.push(...findQuestionsRecursive(obj[key], path ? `${path}.${key}` : key));
                }
              }
            }
            return found;
          };
          
          const foundQuestions = findQuestionsRecursive(jsonData);
          if (foundQuestions.length > 0) {
            console.log(`[JSON Upload] ✅ Found ${foundQuestions.length} questions via recursive search`);
            questions = foundQuestions;
          }
        }

        console.log(`[JSON Upload] 📊 Total questions extracted: ${questions.length}`);

        if (questions.length === 0) {
          console.error('[JSON Upload] ❌ No questions found. JSON structure:', JSON.stringify(jsonData).substring(0, 500));
          throw new Error('No questions found in JSON. Expected: documents[].structured.sections[].questions[] or questions[] or data[]. Please check the JSON structure.');
        }

        // CRITICAL: Sort questions by number to maintain EXACT order
        // This ensures questions are processed in the correct sequence (1.1, 1.2, 1.3, 2.1, etc.)
        questions.sort((a, b) => {
          const numA = a.number || a.question_number || '';
          const numB = b.number || b.question_number || '';
          
          // Split question numbers into parts (e.g., "1.2.3" -> [1, 2, 3])
          const partsA = numA.split('.').map(p => parseInt(p) || 0);
          const partsB = numB.split('.').map(p => parseInt(p) || 0);
          
          // Compare parts sequentially
          for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const valA = partsA[i] || 0;
            const valB = partsB[i] || 0;
            if (valA !== valB) {
              return valA - valB;
            }
          }
          
          return 0;
        });

        console.log(`[JSON Upload] ✅ Questions sorted by number. First 5: ${questions.slice(0, 5).map(q => q.number || q.question_number).join(', ')}`);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: `Found ${questions.length} questions (sorted by number)`, total: questions.length })}\n\n`));

        // Process questions - SIMPLIFIED VERSION
        let savedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          
          try {
            // Extract question number
            const questionNumber = String(q.number || q.question_number || (i + 1));
            
            // Skip invalid entries (page numbers, headers, etc.)
            if (isInvalidQuestionNumber(questionNumber, q)) {
                      continue;
                    }
            
            // Extract question text - SIMPLE: just use what's in JSON
            let questionText = q.text || q.question_text || q.question || q.content || '';
            
            // Only use LLM if text is missing AND LLM is enabled
            if ((!questionText || questionText.trim().length < 10) && useLLM) {
              try {
                const llmText = await generateQuestionTextWithLLM(questionNumber, q);
                if (llmText && llmText.length > 20) {
                  questionText = llmText;
                }
              } catch (llmError) {
                console.warn(`LLM failed for question ${questionNumber}:`, llmError);
              }
            }
            
            // If still no text, use placeholder
            if (!questionText || questionText.trim().length < 10) {
              questionText = q.diagram ? `[Diagram for Question ${questionNumber}]` : `[Question ${questionNumber} - No text provided]`;
            }
            
            // Extract answer (from memo if available)
            const answer = q.answer || q.answer_text || '(No answer provided)';
            
            // Extract marks from question text or JSON field
            // Look for patterns like "(45 marks)", "(45 marks; 30 minutes)", "(16)", etc.
            let marks = q.marks ? parseInt(String(q.marks)) : 0;
            
            if (marks === 0 && questionText) {
              // Try to extract marks from the BEGINNING of the text (main question marks)
              // Pattern 1: "(45 marks)" or "(45 marks; 30 minutes)" - usually at start after question number
              // Look in first 200 characters to avoid matching sub-question marks
              const firstPart = questionText.substring(0, 200);
              const marksMatch1 = firstPart.match(/\((\d+)\s*marks?/i);
              if (marksMatch1) {
                marks = parseInt(marksMatch1[1]);
              } else {
                // Pattern 2: Just "(45)" in parentheses - but be careful not to match sub-question marks
                // Only match if it's near the beginning (first 150 chars)
                const marksMatch2 = firstPart.match(/\((\d+)\)(?:\s|;|$)/);
                if (marksMatch2) {
                  // Make sure it's not part of a sub-question number
                  const matchIndex = firstPart.indexOf(marksMatch2[0]);
                  const beforeMatch = firstPart.substring(Math.max(0, matchIndex - 20), matchIndex);
                  // If there's a question number pattern before it, it might be a sub-question mark
                  if (!beforeMatch.match(/\d+\.\d+\.\d+\s/)) {
                    marks = parseInt(marksMatch2[1]);
                  }
                }
              }
              
              // If still no marks, try pattern 3: "45 marks" without parentheses (less common)
              if (marks === 0) {
                const marksMatch3 = firstPart.match(/(\d+)\s*marks?\s*(?:;|$)/i);
                if (marksMatch3) {
                  marks = parseInt(marksMatch3[1]);
                }
              }
            }
            
            // ENHANCED QUESTION TYPE DETECTION AND OPTION EXTRACTION
            // This ensures all question types are detected correctly and options are extracted
            let type = q.type || 'normal';
            let structuredData: any = {};
            let extractedOptions: string[] = [];
            
            console.log(`[JSON Upload] 🔍 Analyzing question ${questionNumber} for type detection...`);
            
            // STEP 1: Check if options are already provided in JSON
            if (q.options && Array.isArray(q.options) && q.options.length >= 2) {
              type = 'multiple-choice';
              extractedOptions = q.options.map(opt => {
                // Clean up options - remove letter prefixes if present
                const cleaned = String(opt).replace(/^[A-D][\.\)]\s*/i, '').trim();
                return cleaned || String(opt);
              });
              console.log(`[JSON Upload] ✅ Question ${questionNumber}: Multiple-choice detected from JSON options (${extractedOptions.length} options)`);
            }
            // STEP 2: Detect multiple choice from question text (MOST COMMON CASE)
            else if (questionText && questionText.length > 20) {
              // Enhanced multiple choice detection - look for patterns like:
              // "A. Option text\nB. Option text\nC. Option text\nD. Option text"
              // "A) Option text\nB) Option text..."
              // "A Option text\nB Option text..."
              const mcqPatterns = [
                // Pattern 1: A. text\nB. text\nC. text\nD. text
                /([A-D])[\.\)]\s+([^\n]+?)(?=\s+[A-D][\.\)]|$)/gi,
                // Pattern 2: A text\nB text\nC text\nD text (without punctuation)
                /([A-D])\s+([^\n]+?)(?=\s+[A-D]\s|$)/gi,
              ];
              
              let mcqMatches: Array<{ letter: string; text: string }> = [];
              
              for (const pattern of mcqPatterns) {
                const matches = Array.from(questionText.matchAll(pattern));
                if (matches.length >= 2) {
                  mcqMatches = matches.map(m => ({
                    letter: m[1].toUpperCase(),
                    text: m[2].trim(),
                  }));
                  break;
                }
              }
              
              // Also check for "Which ONE" or "Select ONE" patterns which indicate MCQ
              const mcqIndicators = [
                /which\s+one/i,
                /select\s+one/i,
                /choose\s+one/i,
                /circle\s+the\s+correct/i,
                /mark\s+the\s+correct/i,
              ];
              
              const hasMcqIndicator = mcqIndicators.some(pattern => pattern.test(questionText));
              
              if (mcqMatches.length >= 2 || (hasMcqIndicator && mcqMatches.length >= 2)) {
                type = 'multiple-choice';
                // Sort by letter (A, B, C, D)
                mcqMatches.sort((a, b) => a.letter.localeCompare(b.letter));
                extractedOptions = mcqMatches.map(m => m.text);
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: Multiple-choice detected from text (${extractedOptions.length} options)`);
                console.log(`[JSON Upload]    Options: ${extractedOptions.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt.substring(0, 50)}...`).join(', ')}`);
              }
            }
            
            // STEP 3: Detect diagram type
            if ((q.diagram || q.image_data || q.images || q.image) && type === 'normal') {
              type = 'diagram';
              console.log(`[JSON Upload] ✅ Question ${questionNumber}: Diagram type detected (has image data)`);
            }
            
            // STEP 4: Detect other types from question text
            if (type === 'normal' && questionText && questionText.length > 20) {
              const textLower = questionText.toLowerCase();
              
              // Detect table type
              if (textLower.includes('table') || textLower.includes('column') || textLower.includes('row') || 
                  textLower.includes('match column') || textLower.includes('complete the table')) {
                type = 'table';
                structuredData.tableData = extractTableFromText(questionText);
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: Table type detected`);
              }
              // Detect graph type
              else if (textLower.includes('graph') || textLower.includes('chart') || textLower.includes('plot') ||
                       textLower.includes('draw a graph') || textLower.includes('sketch a graph')) {
                type = 'graph';
                structuredData.graphData = extractGraphFromText(questionText);
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: Graph type detected`);
              }
              // Detect extract type
              else if (textLower.includes('extract') || textLower.includes('passage') || 
                       textLower.includes('read the following') || textLower.includes('study the extract')) {
                type = 'extract';
                structuredData.extractText = extractExtractText(questionText);
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: Extract type detected`);
              }
              // Detect diagram type (from text references)
              else if (textLower.includes('diagram') || textLower.includes('figure') || 
                       textLower.includes('label') || textLower.includes('identify part') ||
                       textLower.includes('study the diagram') || textLower.includes('refer to the diagram')) {
                type = 'diagram';
                structuredData.diagramLabel = extractDiagramLabel(questionText);
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: Diagram type detected (from text)`);
              }
              // Detect true/false type
              else if (textLower.includes('true or false') || textLower.includes('true/false') ||
                       textLower.match(/^.*\?\s*(true|false)/i)) {
                type = 'true-false';
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: True/False type detected`);
              }
            }
            
            // STEP 5: Use LLM for advanced detection if enabled and type is still 'normal'
            if (useLLM && type === 'normal' && questionText.length > 20) {
              try {
                const analysis = await analyzeQuestionWithLLM(questionNumber, questionText, q);
                if (analysis) {
                  // Use LLM-detected type if more specific than current
                  if (analysis.type && analysis.type !== 'normal') {
                    type = analysis.type;
                    console.log(`[JSON Upload] ✅ Question ${questionNumber}: LLM detected type: ${type}`);
                  }
                  
                  // Extract structured data based on type
                  if (analysis.tableData) {
                    structuredData.tableData = analysis.tableData;
                    type = 'table';
                  }
                  if (analysis.graphData) {
                    structuredData.graphData = analysis.graphData;
                    type = 'graph';
                  }
                  if (analysis.extractText) {
                    structuredData.extractText = analysis.extractText;
                    type = 'extract';
                  }
                  if (analysis.diagramLabel) {
                    structuredData.diagramLabel = analysis.diagramLabel;
                    type = 'diagram';
                  }
                  if (analysis.options && analysis.options.length >= 2) {
                    extractedOptions = analysis.options;
                    type = 'multiple-choice';
                    console.log(`[JSON Upload] ✅ Question ${questionNumber}: LLM extracted ${extractedOptions.length} options`);
                  }
                }
              } catch (llmError) {
                console.warn(`[JSON Upload] ⚠️  LLM analysis failed for question ${questionNumber}:`, llmError);
              }
            }
            
            // STEP 6: Final fallback - extract multiple-choice options if type is multiple-choice but options not extracted
            if (type === 'multiple-choice' && extractedOptions.length === 0) {
              extractedOptions = extractMultipleChoiceOptions(questionText);
              if (extractedOptions.length >= 2) {
                console.log(`[JSON Upload] ✅ Question ${questionNumber}: Extracted ${extractedOptions.length} options via fallback`);
              } else {
                console.warn(`[JSON Upload] ⚠️  Question ${questionNumber}: Multiple-choice type but no options extracted`);
              }
            }
            
            console.log(`[JSON Upload] 📝 Question ${questionNumber}: Final type = ${type}, Options = ${extractedOptions.length}`);
            
            // Calculate order (for sorting)
            const order = calculateOrder(questionNumber);
            
            // Parse sub-questions from text if they exist
            // Look for patterns like "1.3.1", "1.3.2", etc. in the text
            const subQuestions = parseSubQuestionsFromText(questionText, questionNumber);
            
            // Log mark extraction for debugging
            if (i < 5 || marks > 0 || subQuestions.length > 0) {
              console.log(`[JSON Upload] Question ${questionNumber}:`, {
                extractedMarks: marks,
                hasSubQuestions: subQuestions.length > 0,
                subQuestionCount: subQuestions.length,
                textLength: questionText.length,
                textPreview: questionText.substring(0, 100),
              });
            }
            
            // If we found sub-questions in the text, we need to:
            // 1. Save the main question (with main question text only)
            // 2. Save each sub-question separately
            if (subQuestions.length > 0) {
              console.log(`[JSON Upload] ✅ Found ${subQuestions.length} sub-questions for question ${questionNumber}`);
              
              // Extract main question text (everything before first sub-question)
              const mainQuestionText = extractMainQuestionText(questionText, subQuestions);
              
              console.log(`[JSON Upload] Main question text (${mainQuestionText.length} chars): "${mainQuestionText.substring(0, 80)}..."`);
              
              // Analyze main question for type and structured data (use main question text, not full text)
              let mainQType = type;
              let mainQStructuredData: any = {};
              let mainQOptions: string[] = [];
              
              // Use LLM to analyze main question if enabled
              if (useLLM && mainQuestionText.length > 20) {
                try {
                  const mainQAnalysis = await analyzeQuestionWithLLM(questionNumber, mainQuestionText, q);
                  if (mainQAnalysis) {
                    if (mainQAnalysis.type && mainQAnalysis.type !== 'normal') {
                      mainQType = mainQAnalysis.type;
                    }
                    if (mainQAnalysis.tableData) {
                      mainQStructuredData.tableData = mainQAnalysis.tableData;
                      mainQType = 'table';
                    }
                    if (mainQAnalysis.graphData) {
                      mainQStructuredData.graphData = mainQAnalysis.graphData;
                      mainQType = 'graph';
                    }
                    if (mainQAnalysis.extractText) {
                      mainQStructuredData.extractText = mainQAnalysis.extractText;
                      mainQType = 'extract';
                    }
                    if (mainQAnalysis.diagramLabel) {
                      mainQStructuredData.diagramLabel = mainQAnalysis.diagramLabel;
                      mainQType = 'diagram';
                    }
                    if (mainQAnalysis.options && mainQAnalysis.options.length >= 2) {
                      mainQOptions = mainQAnalysis.options;
                      mainQType = 'multiple-choice';
                    }
                  }
                } catch (llmError) {
                  console.warn(`LLM analysis failed for main question ${questionNumber}:`, llmError);
                }
              }
              
              // Fallback: Pattern-based detection for main question
              if (mainQType === type && !useLLM) {
                const mainQTextLower = mainQuestionText.toLowerCase();
                if (mainQTextLower.includes('table') || mainQTextLower.includes('column')) {
                  mainQType = 'table';
                  mainQStructuredData.tableData = extractTableFromText(mainQuestionText);
                } else if (mainQTextLower.includes('graph') || mainQTextLower.includes('chart')) {
                  mainQType = 'graph';
                  mainQStructuredData.graphData = extractGraphFromText(mainQuestionText);
                } else if (mainQTextLower.includes('extract') || mainQTextLower.includes('passage')) {
                  mainQType = 'extract';
                  mainQStructuredData.extractText = extractExtractText(mainQuestionText);
                } else if (mainQTextLower.includes('diagram') || mainQTextLower.includes('figure')) {
                  mainQType = 'diagram';
                  mainQStructuredData.diagramLabel = extractDiagramLabel(mainQuestionText);
                }
              }
              
              // Extract multiple-choice options for main question
              if (mainQType === 'multiple-choice' && mainQOptions.length === 0) {
                mainQOptions = extractMultipleChoiceOptions(mainQuestionText);
              }
              
              // Save main question
              const mainQuestionData: any = {
                paperId: paperId!,
                number: questionNumber,
                question: mainQuestionText.substring(0, 32767),
                answer: answer.substring(0, 32767),
                marks: marks, // Total marks for main question
                type: mainQType,
                hasImage: !!(q.diagram || q.image_data || q.images),
                order: order,
              };
              
              // Add structured data for main question
              if (mainQType === 'multiple-choice' && mainQOptions.length > 0) {
                const optionsStr = JSON.stringify(mainQOptions);
                if (optionsStr.length <= 32767) {
                  mainQuestionData.options = optionsStr;
                }
              }
              
              // Save structured data for main question (schema attributes now exist)
              if (mainQType === 'table' && mainQStructuredData.tableData) {
                const tableDataStr = JSON.stringify(mainQStructuredData.tableData);
                if (tableDataStr.length <= 32767) {
                  mainQuestionData.tableData = tableDataStr;
                  console.log(`[JSON Upload] 📊 Main question ${questionNumber} - Saved table data`);
                }
              }
              
              if (mainQType === 'graph' && mainQStructuredData.graphData) {
                const graphDataStr = JSON.stringify(mainQStructuredData.graphData);
                if (graphDataStr.length <= 32767) {
                  mainQuestionData.graphData = graphDataStr;
                  console.log(`[JSON Upload] 📈 Main question ${questionNumber} - Saved graph data`);
                }
                if (mainQStructuredData.coordinateSystem) {
                  const coordStr = JSON.stringify(mainQStructuredData.coordinateSystem);
                  if (coordStr.length <= 1000) {
                    mainQuestionData.coordinateSystem = coordStr;
                  }
                }
              }
              
              if (mainQType === 'extract' && mainQStructuredData.extractText) {
                mainQuestionData.extractText = mainQStructuredData.extractText.substring(0, 32767);
                console.log(`[JSON Upload] 📄 Main question ${questionNumber} - Saved extract text`);
              }
              
              if (mainQType === 'diagram' && mainQStructuredData.diagramLabel) {
                mainQuestionData.diagramLabel = mainQStructuredData.diagramLabel.substring(0, 500);
                console.log(`[JSON Upload] 📷 Main question ${questionNumber} - Saved diagram label`);
              }
              
              // Save metadata
              if (mainQType === 'table') {
                if (mainQStructuredData.tableSubject) mainQuestionData.tableSubject = mainQStructuredData.tableSubject.substring(0, 255);
                if (mainQStructuredData.tableType) mainQuestionData.tableType = mainQStructuredData.tableType.substring(0, 100);
              }
              if (mainQType === 'graph') {
                if (mainQStructuredData.graphSubject) mainQuestionData.graphSubject = mainQStructuredData.graphSubject.substring(0, 255);
                if (mainQStructuredData.graphType) mainQuestionData.graphType = mainQStructuredData.graphType.substring(0, 100);
              }
              
              await saveQuestion(databases, paperId!, questionNumber, mainQuestionData);
              savedCount++;
              
              // Save each sub-question
              for (const subQ of subQuestions) {
                const subQNumber = `${questionNumber}.${subQ.number}`;
                console.log(`[JSON Upload] Saving sub-question ${subQNumber}: "${subQ.text.substring(0, 60)}..." (${subQ.marks} marks)`);
                
                // Analyze sub-question for type and structured data
                let subQType = type;
                let subQStructuredData: any = {};
                let subQOptions: string[] = [];
                
                // Use LLM to analyze sub-question if enabled
                if (useLLM && subQ.text.length > 20) {
                  try {
                    const subQAnalysis = await analyzeQuestionWithLLM(subQNumber, subQ.text, {});
                    if (subQAnalysis) {
                      if (subQAnalysis.type && subQAnalysis.type !== 'normal') {
                        subQType = subQAnalysis.type;
                      }
                      if (subQAnalysis.tableData) {
                        subQStructuredData.tableData = subQAnalysis.tableData;
                        subQType = 'table';
                      }
                      if (subQAnalysis.graphData) {
                        subQStructuredData.graphData = subQAnalysis.graphData;
                        subQType = 'graph';
                      }
                      if (subQAnalysis.extractText) {
                        subQStructuredData.extractText = subQAnalysis.extractText;
                        subQType = 'extract';
                      }
                      if (subQAnalysis.diagramLabel) {
                        subQStructuredData.diagramLabel = subQAnalysis.diagramLabel;
                        subQType = 'diagram';
                      }
                      if (subQAnalysis.options && subQAnalysis.options.length >= 2) {
                        subQOptions = subQAnalysis.options;
                        subQType = 'multiple-choice';
                      }
                    }
                  } catch (llmError) {
                    console.warn(`LLM analysis failed for sub-question ${subQNumber}:`, llmError);
                  }
                }
                
                // Fallback: Pattern-based detection for sub-questions
                if (subQType === type && !useLLM) {
                  const subQTextLower = subQ.text.toLowerCase();
                  if (subQTextLower.includes('table') || subQTextLower.includes('column')) {
                    subQType = 'table';
                    subQStructuredData.tableData = extractTableFromText(subQ.text);
                  } else if (subQTextLower.includes('graph') || subQTextLower.includes('chart')) {
                    subQType = 'graph';
                    subQStructuredData.graphData = extractGraphFromText(subQ.text);
                  } else if (subQTextLower.includes('extract') || subQTextLower.includes('passage')) {
                    subQType = 'extract';
                    subQStructuredData.extractText = extractExtractText(subQ.text);
                  } else if (subQTextLower.includes('diagram') || subQTextLower.includes('figure')) {
                    subQType = 'diagram';
                    subQStructuredData.diagramLabel = extractDiagramLabel(subQ.text);
                  }
                }
                
                // Extract multiple-choice options for sub-question
                if (subQType === 'multiple-choice' && subQOptions.length === 0) {
                  subQOptions = extractMultipleChoiceOptions(subQ.text);
                }
                
                const subQData: any = {
                  paperId: paperId!,
                  number: subQNumber,
                  question: subQ.text.substring(0, 32767),
                  answer: '(No answer provided)',
                  marks: subQ.marks || 0,
                  type: subQType,
                  hasImage: false,
                  order: calculateOrder(subQNumber),
                };
                
                // Add structured data for sub-question
                if (subQType === 'multiple-choice' && subQOptions.length > 0) {
                  const optionsStr = JSON.stringify(subQOptions);
                  if (optionsStr.length <= 32767) {
                    subQData.options = optionsStr;
                  }
                }
                
                // Save structured data for sub-question (schema attributes now exist)
                if (subQType === 'table' && subQStructuredData.tableData) {
                  const tableDataStr = JSON.stringify(subQStructuredData.tableData);
                  if (tableDataStr.length <= 32767) {
                    subQData.tableData = tableDataStr;
                    console.log(`[JSON Upload] 📊 Sub-question ${subQNumber} - Saved table data`);
                  }
                  if (subQStructuredData.tableSubject) subQData.tableSubject = subQStructuredData.tableSubject.substring(0, 255);
                  if (subQStructuredData.tableType) subQData.tableType = subQStructuredData.tableType.substring(0, 100);
                }
                
                if (subQType === 'graph' && subQStructuredData.graphData) {
                  const graphDataStr = JSON.stringify(subQStructuredData.graphData);
                  if (graphDataStr.length <= 32767) {
                    subQData.graphData = graphDataStr;
                    console.log(`[JSON Upload] 📈 Sub-question ${subQNumber} - Saved graph data`);
                  }
                  if (subQStructuredData.coordinateSystem) {
                    const coordStr = JSON.stringify(subQStructuredData.coordinateSystem);
                    if (coordStr.length <= 1000) {
                      subQData.coordinateSystem = coordStr;
                    }
                  }
                  if (subQStructuredData.graphSubject) subQData.graphSubject = subQStructuredData.graphSubject.substring(0, 255);
                  if (subQStructuredData.graphType) subQData.graphType = subQStructuredData.graphType.substring(0, 100);
                }
                
                if (subQType === 'extract' && subQStructuredData.extractText) {
                  subQData.extractText = subQStructuredData.extractText.substring(0, 32767);
                  console.log(`[JSON Upload] 📄 Sub-question ${subQNumber} - Saved extract text`);
                }
                
                if (subQType === 'diagram' && subQStructuredData.diagramLabel) {
                  subQData.diagramLabel = subQStructuredData.diagramLabel.substring(0, 500);
                  console.log(`[JSON Upload] 📷 Sub-question ${subQNumber} - Saved diagram label`);
                }
                
                await saveQuestion(databases, paperId!, subQNumber, subQData);
                savedCount++;
              }
              
              // Skip the rest of the processing for this question since we've already saved it
              continue;
            }

            // No sub-questions found - save as normal question
            const questionData: any = {
              paperId: paperId!,
              number: questionNumber,
              question: questionText.substring(0, 32767), // Appwrite limit
              answer: answer.substring(0, 32767),
              marks: marks,
              type: type,
              hasImage: !!(q.diagram || q.image_data || q.images),
              order: order,
            };
            
            // Add multiple-choice options - CRITICAL: Use extracted options
            if (type === 'multiple-choice') {
              const optionsToUse = extractedOptions.length > 0 ? extractedOptions : (q.options || []);
              if (optionsToUse.length > 0) {
                // Clean up options one more time
                const cleanedOptions = optionsToUse.map(opt => {
                  let cleaned = String(opt).trim();
                  // Remove letter prefixes if still present
                  cleaned = cleaned.replace(/^[A-D][\.\)]\s*/i, '').trim();
                  // Remove trailing marks
                  cleaned = cleaned.replace(/\s*[\(\[]\d+[\)\]]\s*$/, '').trim();
                  return cleaned;
                }).filter(opt => opt.length > 0);
                
                if (cleanedOptions.length >= 2) {
                  const optionsStr = JSON.stringify(cleanedOptions);
                if (optionsStr.length <= 32767) {
                  questionData.options = optionsStr;
                    console.log(`[JSON Upload] ✅ Question ${questionNumber}: Saved ${cleanedOptions.length} multiple-choice options`);
                  } else {
                    console.warn(`[JSON Upload] ⚠️  Question ${questionNumber}: Options too long (${optionsStr.length} chars), truncating`);
                    questionData.options = optionsStr.substring(0, 32767);
                }
                } else {
                  console.warn(`[JSON Upload] ⚠️  Question ${questionNumber}: Multiple-choice type but insufficient options (${cleanedOptions.length})`);
                }
              } else {
                console.warn(`[JSON Upload] ⚠️  Question ${questionNumber}: Multiple-choice type but no options found`);
              }
            }
            
            // Save structured data based on question type (schema attributes now exist)
            if (type === 'table' && structuredData.tableData) {
              const tableDataStr = JSON.stringify(structuredData.tableData);
              if (tableDataStr.length <= 32767) {
                questionData.tableData = tableDataStr;
                console.log(`[JSON Upload] 📊 Question ${questionNumber} - Saved table data (${structuredData.tableData.headers?.length || 0} headers, ${structuredData.tableData.rows?.length || 0} rows)`);
              } else {
                console.warn(`[JSON Upload] ⚠️ Question ${questionNumber} - Table data too large (${tableDataStr.length} chars), truncating`);
                questionData.tableData = tableDataStr.substring(0, 32767);
              }
            }
            
            if (type === 'graph' && structuredData.graphData) {
              const graphDataStr = JSON.stringify(structuredData.graphData);
              if (graphDataStr.length <= 32767) {
                questionData.graphData = graphDataStr;
                console.log(`[JSON Upload] 📈 Question ${questionNumber} - Saved graph data (${structuredData.graphData.dataPoints?.length || 0} data points)`);
              } else {
                console.warn(`[JSON Upload] ⚠️ Question ${questionNumber} - Graph data too large (${graphDataStr.length} chars), truncating`);
                questionData.graphData = graphDataStr.substring(0, 32767);
              }
              
              // Save coordinate system if available
              if (structuredData.coordinateSystem) {
                const coordStr = JSON.stringify(structuredData.coordinateSystem);
                if (coordStr.length <= 1000) {
                  questionData.coordinateSystem = coordStr;
                }
              }
            }
            
            if (type === 'extract' && structuredData.extractText) {
              questionData.extractText = structuredData.extractText.substring(0, 32767);
              console.log(`[JSON Upload] 📄 Question ${questionNumber} - Saved extract text (${structuredData.extractText.length} chars)`);
            }
            
            if (type === 'diagram' && structuredData.diagramLabel) {
              questionData.diagramLabel = structuredData.diagramLabel.substring(0, 500);
              console.log(`[JSON Upload] 📷 Question ${questionNumber} - Saved diagram label: "${structuredData.diagramLabel}"`);
            }
            
            // Save additional metadata
            if (type === 'table' && structuredData.tableSubject) {
              questionData.tableSubject = structuredData.tableSubject.substring(0, 255);
            }
            if (type === 'table' && structuredData.tableType) {
              questionData.tableType = structuredData.tableType.substring(0, 100);
            }
            if (type === 'graph' && structuredData.graphSubject) {
              questionData.graphSubject = structuredData.graphSubject.substring(0, 255);
            }
            if (type === 'graph' && structuredData.graphType) {
              questionData.graphType = structuredData.graphType.substring(0, 100);
            }
            
            // Log type detection
            if (type !== 'normal') {
              console.log(`[JSON Upload] ✅ Question ${questionNumber} - Type: ${type}, Structured data saved`);
            }
            
            await saveQuestion(databases, paperId!, questionNumber, questionData);
            savedCount++;
            
            // Send progress update
            if (i % 10 === 0 || i === questions.length - 1) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'progress',
                message: `Processed ${i + 1}/${questions.length} questions`,
                saved: savedCount,
                errors: errorCount,
            })}\n\n`));
            }
            
          } catch (error: any) {
            errorCount++;
            const errorMsg = `Error processing question ${i + 1}: ${error.message}`;
            errors.push(errorMsg);
            console.error(errorMsg, error);
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: errorMsg,
            })}\n\n`));
          }
        }
        
        // Update paper status and question count
          await databases.updateDocument(
            appwriteConfig.databaseId,
            'pastpapers',
          paperId!,
            {
              status: 'Processed',
            questionCount: savedCount,
            }
          );

        // IMPORTANT: The paper structure is automatically created when the editor loads
        // The structure route groups questions into sections (A, B, C) based on question numbers
        // So we don't need to create the structure here - it's created on-demand
        
        // Send completion event (frontend expects 'done' type)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'done', 
          message: `Successfully processed ${savedCount} questions${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
          total: savedCount,
          saved: savedCount,
          errors: errorCount,
          paperId: paperId,
        })}\n\n`));
        
        console.log(`[JSON Upload] ✅ Upload complete: ${savedCount} questions saved to paper ${paperId}`);

      } catch (error: any) {
        console.error('[JSON Upload] Error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          message: error.message || 'Unknown error occurred',
        })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Check if question number is invalid (page number, header, etc.)
 */
function isInvalidQuestionNumber(number: string, questionData: any): boolean {
  // Skip page numbers (> 100)
  if (/^\d{3,}$/.test(number) && parseInt(number) > 100) {
    return true;
  }
  
  // Skip totals
  if (number === '150' || number === '120' || number.toLowerCase() === 'total') {
    return true;
  }
  
  // Skip if text looks like a header
  const text = questionData.text || questionData.question_text || '';
  if (text && (
    text.includes('Copyright reserved') ||
    text.includes('Please turn over') ||
    text.includes('KEEP THIS PAGE BLANK') ||
    (text.length < 50 && !text.includes('?'))
  )) {
    return true;
  }
  
  return false;
}

/**
 * Calculate order for sorting questions
 */
function calculateOrder(questionNumber: string): number {
  const parts = questionNumber.split('.');
  let order = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parseInt(parts[i]) || 0;
    order += part * Math.pow(1000, 2 - i); // 1.1.1 = 1001001, 1.2 = 1002000
  }
  
  return order;
}

/**
 * Parse sub-questions from question text
 * Looks for patterns like "1.3.1", "1.3.2", etc.
 * Example: "1.3.1 Explain why... (2)" or "1.3.2 Give TWO reasons... (4)"
 */
function parseSubQuestionsFromText(text: string, parentNumber: string): Array<{ number: string; text: string; marks: number }> {
  const subQuestions: Array<{ number: string; text: string; marks: number }> = [];
  
  // Escape special regex characters in parent number (e.g., "1.3" -> "1\.3")
  const escapedParent = parentNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Pattern to find sub-questions: "1.3.1", "1.3.2", etc.
  // Match the full sub-question number including the parent
  const subQNumberPattern = new RegExp(`${escapedParent}\\.(\\d+)`, 'g');
  
  const subQPositions: Array<{ number: string; index: number }> = [];
  let match;
  
  // Find all sub-question number positions
  while ((match = subQNumberPattern.exec(text)) !== null) {
    subQPositions.push({
      number: match[1], // Just the sub-number (e.g., "1" from "1.3.1")
      index: match.index,
    });
  }
  
  // If no sub-questions found, return empty array
  if (subQPositions.length === 0) {
    return subQuestions;
  }
  
  // Extract text and marks for each sub-question
  for (let i = 0; i < subQPositions.length; i++) {
    const current = subQPositions[i];
    const next = subQPositions[i + 1];
    
    // Find the start of this sub-question's text (after the number)
    const subQFullNumber = `${parentNumber}.${current.number}`;
    const numberEndIndex = current.index + subQFullNumber.length;
    
    // Extract text until the next sub-question or end of text
    // Skip whitespace after the number
    let textStartIndex = numberEndIndex;
    while (textStartIndex < text.length && /\s/.test(text[textStartIndex])) {
      textStartIndex++;
    }
    
    let subQText = '';
    if (next) {
      // Text from after current sub-question number to start of next sub-question
      // Find where the next sub-question number starts (might need to backtrack to find the actual start)
      let nextStartIndex = next.index;
      // Backtrack to find the actual start (before any leading whitespace/newlines)
      while (nextStartIndex > textStartIndex && /\s/.test(text[nextStartIndex - 1])) {
        nextStartIndex--;
      }
      subQText = text.substring(textStartIndex, nextStartIndex).trim();
    } else {
      // Last sub-question - take everything after the number
      subQText = text.substring(textStartIndex).trim();
    }
    
    // Extract marks from the text (look for patterns like "(2)", "(4)", etc.)
    // Marks are usually at the end of the sub-question text
    let marks = 0;
    
    // Try multiple patterns to find marks
    // Pattern 1: "(2)" at the very end
    const marksMatch1 = subQText.match(/\((\d+)\)\s*$/);
    if (marksMatch1) {
      marks = parseInt(marksMatch1[1]);
      // Remove marks from text
      subQText = subQText.replace(/\s*\(\d+\)\s*$/, '').trim();
    } else {
      // Pattern 2: "(2)" followed by newline or end of text (might have whitespace)
      const marksMatch2 = subQText.match(/\((\d+)\)(?:\s*\n|$)/);
      if (marksMatch2) {
        marks = parseInt(marksMatch2[1]);
        subQText = subQText.replace(/\s*\(\d+\)(?:\s*\n|$)/, '').trim();
      } else {
        // Pattern 3: "[2]" at the end
        const marksMatch3 = subQText.match(/\[(\d+)\]\s*$/);
        if (marksMatch3) {
          marks = parseInt(marksMatch3[1]);
          subQText = subQText.replace(/\s*\[\d+\]\s*$/, '').trim();
        }
      }
    }
    
    // Clean up text (remove leading/trailing whitespace, normalize newlines)
    subQText = subQText.replace(/^\s+|\s+$/g, '').replace(/\n{3,}/g, '\n\n').trim();
    
    // Only add if we have substantial text (at least 15 characters to avoid false positives)
    if (subQText.length >= 15) {
      subQuestions.push({
        number: current.number,
        text: subQText,
    marks: marks,
      });
    }
  }
  
  return subQuestions;
}

/**
 * Extract main question text (everything before first sub-question)
 */
function extractMainQuestionText(text: string, subQuestions: Array<{ number: string; text: string; marks: number }>): string {
  if (subQuestions.length === 0) {
    return text;
  }
  
  // Find where the first sub-question starts in the text
  // Look for pattern like "1.3.1" or "parentNumber.1"
  const parentNumber = text.match(/^(\d+(?:\.\d+)?)/)?.[1] || '';
  if (!parentNumber) {
    return text;
  }
  
  const firstSubQ = subQuestions[0];
  const escapedParent = parentNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const firstSubQPattern = new RegExp(`${escapedParent}\\.${firstSubQ.number}\\b`);
  const firstSubQIndex = text.search(firstSubQPattern);
  
  if (firstSubQIndex > 0) {
    // Extract everything before the first sub-question
    const mainText = text.substring(0, firstSubQIndex).trim();
    // Remove any trailing mark indicators that might be part of the main question
    return mainText.replace(/\s*\(\d+\s*marks?\)\s*$/i, '').trim();
  }
  
  return text;
}

/**
 * Filter question data to only include fields that exist in the Appwrite schema
 * This prevents "Unknown attribute" errors
 * 
 * NOTE: The structure route expects tableData, graphData, extractText, diagramLabel,
 * but these fields are NOT yet in the Appwrite schema. Once they're added to the schema,
 * we can remove them from the filter and uncomment the code that saves them.
 */
function filterQuestionData(data: any): any {
  // List of allowed fields in the questions collection schema
  const allowedFields = [
    'paperId',
    'number',
    'question',
    'answer',
    'marks',
    'type',
    'hasImage',
    'order',
    'options', // For multiple-choice questions
    'imageFileId', // For questions with images
    'tableData', // For table questions (now in schema)
    'graphData', // For graph questions (now in schema)
    'extractText', // For extract questions (now in schema)
    'diagramLabel', // For diagram questions (now in schema)
    'coordinateSystem', // For graph questions (now in schema)
    'tableSubject', // For table questions (now in schema)
    'tableType', // For table questions (now in schema)
    'graphSubject', // For graph questions (now in schema)
    'graphType', // For graph questions (now in schema)
    'instructionText', // For additional instructions (now in schema)
  ];
  
  const filtered: any = {};
  
  // Only include allowed fields
  for (const field of allowedFields) {
    if (data[field] !== undefined && data[field] !== null) {
      filtered[field] = data[field];
    }
  }
  
  return filtered;
}

/**
 * Save or update a question in the database
 */
async function saveQuestion(databases: any, paperId: string, questionNumber: string, questionData: any): Promise<void> {
  // Filter out any unsupported fields before saving
  const filteredData = filterQuestionData(questionData);
  
  // Check if question exists
  const existing = await databases.listDocuments(
    appwriteConfig.databaseId,
    'questions',
    [
      Query.equal('paperId', paperId),
      Query.equal('number', questionNumber),
    ]
  );
  
  // Save or update question
  if (existing.documents.length > 0) {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'questions',
      existing.documents[0].$id,
      filteredData
    );
  } else {
    await databases.createDocument(
      appwriteConfig.databaseId,
      'questions',
      ID.unique(),
      filteredData
    );
  }
}

/**
 * Analyze question with LLM to detect type and extract structured data
 */
async function analyzeQuestionWithLLM(questionNumber: string, questionText: string, questionData: any): Promise<any> {
  try {
    const prompt = `You are analyzing a CAPS past paper question. Analyze the question text and determine its type, then extract any structured data.

Question Number: ${questionNumber}
Question Text: ${questionText.substring(0, 2000)}

Analyze this question and determine:
1. QUESTION TYPE: One of: "normal", "multiple-choice", "table", "graph", "diagram", "extract"
2. STRUCTURED DATA: Extract relevant data based on the type

QUESTION TYPES:
- "multiple-choice": Question has options (A, B, C, D) to choose from
- "table": Question references or contains a table with rows and columns
- "graph": Question references or contains a graph/chart with data points
- "diagram": Question references a diagram/figure that needs labeling
- "extract": Question includes a passage/extract to read before answering
- "normal": Standard text question

EXTRACTION RULES:
1. MULTIPLE-CHOICE: Extract all options as an array of strings (remove letter prefixes like "A.", "B.", etc.)
2. TABLE: Extract table structure: { headers: string[], rows: string[][], description?: string }
   - IMPORTANT: If question mentions "COLUMN A" and "COLUMN B", extract these as headers: ["COLUMN A", "COLUMN B"]
   - If question mentions table headers like "VAT", "AMOUNT", "EFFECT", extract them as headers
   - Look for column headers in ALL CAPS or capitalized words
   - Extract any data rows if present in the text
   - If question says "match COLUMN A with COLUMN B", create headers: ["COLUMN A", "COLUMN B"] with empty rows (user will fill in editor)
   - If question mentions specific headers (e.g., "VAT INCLUDING VAT VAT AMOUNT EFFECT"), extract all headers
   - Always return at least the headers array, even if rows are empty
3. GRAPH: Extract graph data: { type?: string, xAxisLabel?: string, yAxisLabel?: string, dataPoints?: Array<{label: string, value: number}>, description?: string }
   - Look for axis labels, data points, graph type (line, bar, pie, etc.)
4. EXTRACT: Extract the passage/extract text (the text block before the question)
5. DIAGRAM: Extract diagram label/description (e.g., "Figure 1: Heart structure")

Return ONLY valid JSON in this format:
{
  "type": "question-type",
  "tableData": { "headers": [], "rows": [] } OR null,
  "graphData": { "xAxisLabel": "", "yAxisLabel": "", "dataPoints": [] } OR null,
  "extractText": "extract text" OR null,
  "diagramLabel": "diagram label" OR null,
  "options": ["option1", "option2"] OR null
}

If a feature is not applicable, set it to null. Return ONLY the JSON object, no other text.`;

    const response = await groqChat(prompt, {
      temperature: 0.1,
      model: 'llama-3.1-70b-versatile', // Use more capable model for structured extraction
      maxTokens: 2000,
    });

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('LLM analysis error:', error);
    return null;
  }
}

/**
 * Extract table data from question text (pattern-based fallback)
 */
function extractTableFromText(text: string): any {
  // Look for table-like structures in text
  const headers: string[] = [];
  const rows: string[][] = [];
  
  // Pattern 1: Look for "COLUMN A" and "COLUMN B" patterns (common in matching questions)
  const columnPattern = /COLUMN\s+([A-Z])\b/gi;
  const columnMatches = Array.from(text.matchAll(columnPattern));
  if (columnMatches.length >= 2) {
    // Extract unique column letters
    const columns = [...new Set(columnMatches.map(m => m[1]))].sort();
    headers.push(...columns.map(col => `COLUMN ${col}`));
    
    // Look for examples or data in the text
    // Try to find rows with data separated by spaces, tabs, or special characters
    const dataPattern = /([A-Z][^A-Z\n]{10,})/g;
    const dataMatches = Array.from(text.matchAll(dataPattern));
    if (dataMatches.length > 0) {
      // Create placeholder rows based on number of columns
      for (let i = 0; i < Math.min(5, dataMatches.length); i++) {
        rows.push(columns.map(() => `Item ${i + 1}`));
      }
    }
    
    if (headers.length > 0) {
      return { 
        headers, 
        rows: rows.length > 0 ? rows : [], 
        description: 'Matching table - extract data from question text' 
      };
    }
  }
  
  // Pattern 2: Look for table headers separated by | or tabs
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Check for pipe-separated or tab-separated headers
    if (line.includes('|') || line.includes('\t')) {
      const parts = line.split(/[|\t]/).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length >= 2 && parts.length <= 10) {
        headers.push(...parts);
        
        // Look for following rows with same separator
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const rowLine = lines[j];
          if (rowLine.includes('|') || rowLine.includes('\t')) {
            const rowParts = rowLine.split(/[|\t]/).map(p => p.trim()).filter(p => p.length > 0);
            if (rowParts.length === parts.length) {
              rows.push(rowParts);
            }
          }
        }
        break;
      }
    }
    
    // Pattern 3: Look for headers like "VAT INCLUDING VAT VAT AMOUNT EFFECT"
    if (line.match(/\b[A-Z]{3,}\s+[A-Z]{3,}\s+[A-Z]{3,}/)) {
      const words = line.split(/\s+/).filter(w => w.length >= 3 && /^[A-Z]+$/.test(w));
      if (words.length >= 2 && words.length <= 6) {
        headers.push(...words);
        break;
      }
    }
  }
  
  // Pattern 4: Look for structured data patterns like "Name | Age | City"
  if (headers.length === 0) {
    const structuredPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[|\t]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
    const match = text.match(structuredPattern);
    if (match) {
      headers.push(match[1], match[2]);
    }
  }
  
  // If we found headers but no rows, create a placeholder structure
  if (headers.length > 0 && rows.length === 0) {
    // Create empty rows based on header count (user can fill these in editor)
    return { 
      headers, 
      rows: [], 
      description: `Table with ${headers.length} columns - data to be added` 
    };
  }
  
  // If no headers found, return empty structure
  if (headers.length === 0) {
    return { headers: [], rows: [], description: 'Table data to be extracted' };
  }
  
  return { headers, rows, description: 'Extracted from question text' };
}

/**
 * Extract graph data from question text (pattern-based fallback)
 */
function extractGraphFromText(text: string): any {
  // Look for graph-related keywords
  const graphData: any = {
    description: 'Graph data to be extracted',
  };
  
  // Look for axis labels
  const xAxisMatch = text.match(/x[-\s]?axis[:\s]+([^\n]+)/i);
  const yAxisMatch = text.match(/y[-\s]?axis[:\s]+([^\n]+)/i);
  
  if (xAxisMatch) graphData.xAxisLabel = xAxisMatch[1].trim();
  if (yAxisMatch) graphData.yAxisLabel = yAxisMatch[1].trim();
  
  // Look for graph type
  if (text.toLowerCase().includes('line graph') || text.toLowerCase().includes('line chart')) {
    graphData.type = 'line';
  } else if (text.toLowerCase().includes('bar graph') || text.toLowerCase().includes('bar chart')) {
    graphData.type = 'bar';
  } else if (text.toLowerCase().includes('pie chart')) {
    graphData.type = 'pie';
  }
  
  return graphData;
}

/**
 * Extract extract text from question (pattern-based fallback)
 */
function extractExtractText(text: string): string {
  // Look for extract/passage indicators
  // Usually appears before "REQUIRED:" or question marks
  const requiredIndex = text.indexOf('REQUIRED:');
  const questionMarkIndex = text.indexOf('?');
  
  if (requiredIndex > 0) {
    return text.substring(0, requiredIndex).trim();
  } else if (questionMarkIndex > 100) {
    // If question mark is far in, there might be extract text before it
    const beforeQuestion = text.substring(0, questionMarkIndex);
    if (beforeQuestion.length > 200) {
      return beforeQuestion.trim();
    }
  }
  
  return '';
}

/**
 * Extract diagram label from question text (pattern-based fallback)
 */
function extractDiagramLabel(text: string): string {
  // Look for figure/diagram labels
  const figureMatch = text.match(/(?:figure|diagram|fig\.?)\s*\d+[:\s]+([^\n]+)/i);
  if (figureMatch) {
    return figureMatch[0].trim();
  }
  
  // Look for "Diagram" or "Figure" followed by description
  const diagramMatch = text.match(/(?:diagram|figure)[:\s]+([^\n?.]+)/i);
  if (diagramMatch) {
    return diagramMatch[1].trim();
  }
  
  return 'Diagram';
}

/**
 * ENHANCED: Extract multiple-choice options from question text
 * Handles multiple formats: A. text, A) text, A text, etc.
 */
function extractMultipleChoiceOptions(text: string): string[] {
  const options: string[] = [];
  const matches: Array<{ letter: string; text: string; index: number }> = [];
  
  // Pattern 1: A. option text\nB. option text\nC. option text\nD. option text
  // This handles both periods and parentheses: A. or A)
  const pattern1 = /([A-D])[\.\)]\s+([^\n]+?)(?=\s+[A-D][\.\)]|\s*$)/gi;
  let match;
  
  while ((match = pattern1.exec(text)) !== null) {
    matches.push({
      letter: match[1].toUpperCase(),
      text: match[2].trim(),
      index: match.index,
    });
  }
  
  // Pattern 2: A option text\nB option text (without punctuation)
  if (matches.length < 2) {
    const pattern2 = /([A-D])\s+([^\n]+?)(?=\s+[A-D]\s|\s*$)/gi;
    while ((match = pattern2.exec(text)) !== null) {
      // Make sure we don't have duplicates
      const existing = matches.find(m => m.letter === match![1].toUpperCase());
      if (!existing) {
        matches.push({
          letter: match[1].toUpperCase(),
          text: match[2].trim(),
          index: match.index,
        });
      }
    }
  }
  
  // Pattern 3: Look for numbered options in lines (A, B, C, D on separate lines)
  if (matches.length < 2) {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Match lines starting with A. B. C. D. or A) B) C) D)
      const lineMatch = line.match(/^([A-D])[\.\)]\s+(.+)$/i);
      if (lineMatch) {
        const existing = matches.find(m => m.letter === lineMatch[1].toUpperCase());
        if (!existing) {
          matches.push({
            letter: lineMatch[1].toUpperCase(),
            text: lineMatch[2].trim(),
            index: i,
          });
        }
      }
    }
  }
  
  // Pattern 4: Look for options in format "A) Option" or "A. Option" within the same line
  if (matches.length < 2) {
    // Split by common separators and look for A-D patterns
    const parts = text.split(/\s+(?=[A-D][\.\)])/i);
    for (const part of parts) {
      const partMatch = part.match(/^([A-D])[\.\)]\s*(.+)$/i);
      if (partMatch) {
        const existing = matches.find(m => m.letter === partMatch[1].toUpperCase());
        if (!existing && partMatch[2].trim().length > 3) {
          matches.push({
            letter: partMatch[1].toUpperCase(),
            text: partMatch[2].trim(),
            index: matches.length,
          });
        }
      }
    }
  }
  
  if (matches.length >= 2) {
    // Sort by letter (A, B, C, D) to maintain order
    matches.sort((a, b) => {
      if (a.letter !== b.letter) {
        return a.letter.localeCompare(b.letter);
      }
      return a.index - b.index;
    });
    
    // Extract text and clean up
    const extracted = matches.map(m => {
      let cleaned = m.text;
      // Remove trailing marks like "(2)" or "[2]"
      cleaned = cleaned.replace(/\s*[\(\[]\d+[\)\]]\s*$/, '').trim();
      // Remove any remaining letter prefixes
      cleaned = cleaned.replace(/^[A-D][\.\)]\s*/i, '').trim();
      return cleaned;
    });
    
    // Filter out empty options
    return extracted.filter(opt => opt.length > 0);
  }
  
  return [];
}

/**
 * Generate question text using LLM (OPTIONAL - only if enabled)
 */
async function generateQuestionTextWithLLM(questionNumber: string, questionData: any): Promise<string | null> {
  try {
    const prompt = `You are analyzing a CAPS past paper question. The question number is ${questionNumber}.
    
Question data: ${JSON.stringify(questionData).substring(0, 500)}

Generate a professional CAPS-appropriate question text. If this is a diagram question, use text like "Study the diagram below and answer the questions that follow."

Return ONLY the question text, nothing else.`;

    const response = await groqChat(prompt, {
      temperature: 0.3,
      model: 'llama-3.1-8b-instant',
      maxTokens: 500,
    });

    return response.trim();
  } catch (error) {
    console.error('LLM error:', error);
    return null;
  }
}
