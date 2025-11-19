import { NextRequest } from 'next/server';
import { getServerDatabases, getServerStorage } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { ID, Query } from 'node-appwrite';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/past-papers/upload-pdf
 * Uploads a PDF, processes it with Python extractor, and streams questions in real-time
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let pdfPath: string | null = null;
      let paperId: string | null = null;

      try {
        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const subject = formData.get('subject') as string;
        const year = formData.get('year') as string;
        const grade = formData.get('grade') as string || '12';
        const userId = formData.get('userId') as string;

        if (!file || !subject || !year || !userId) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Missing required fields' })}\n\n`));
          controller.close();
          return;
        }

        // Save PDF to temp file
        const tempDir = join(tmpdir(), 'pdf-uploads');
        if (!existsSync(tempDir)) {
          mkdirSync(tempDir, { recursive: true });
        }
        pdfPath = join(tempDir, `${ID.unique()}.pdf`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        writeFileSync(pdfPath, buffer);

        // Send start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', message: 'Processing PDF...' })}\n\n`));

        // Check if paper already exists (user might be uploading to existing paper)
        const databases = getServerDatabases();
        const storage = getServerStorage();

        // If paperId is provided in formData, use it (for existing papers)
        const existingPaperId = formData.get('paperId') as string | null;
        
        if (existingPaperId) {
          // Use existing paper
          paperId = existingPaperId;
          await databases.updateDocument(
            appwriteConfig.databaseId,
            'pastpapers',
            paperId,
            {
              status: 'Processing',
            }
          );
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'paper_created', paperId: paperId })}\n\n`));
        } else {
          // Create new paper document
          const paperData = {
            teacherId: userId,
            gradeLevel: parseInt(grade),
            subject: subject,
            year: year,
            paperName: file.name,
            memoName: '',
            status: 'Processing',
            questionCount: 0,
            // Don't create generatedQuestions - editor is the source of truth
          };

          const paper = await databases.createDocument(
            appwriteConfig.databaseId,
            'pastpapers',
            ID.unique(),
            paperData
          );
          paperId = paper.$id;

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'paper_created', paperId: paperId })}\n\n`));
        }

        // Run Python extractor
        const pythonScript = join(process.cwd(), 'scripts', 'pdf_extractor', 'extract_questions.py');
        const pythonProcess = spawn('python', [pythonScript, pdfPath], {
          cwd: join(process.cwd(), 'scripts', 'pdf_extractor'),
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true, // Use shell on Windows
        });

        let questionCount = 0;
        const questions: any[] = [];
        const imageMap = new Map<string, string>(); // question number -> image file IDs

        // Handle stdout (questions)
        pythonProcess.stdout.on('data', async (data: Buffer) => {
          const lines = data.toString().split('\n').filter((line: string) => line.trim());
          
          console.log(`[PDF Upload] Received ${lines.length} lines from Python script`);
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              console.log(`[PDF Upload] Parsed JSON type: ${parsed.type}`);
              
              if (parsed.type === 'question') {
                // Validate question data structure
                if (!parsed.data) {
                  console.error(`[PDF Upload] ❌ Question event missing 'data' field:`, parsed);
                  continue;
                }
                
                if (!parsed.data.question_number) {
                  console.error(`[PDF Upload] ❌ Question missing 'question_number':`, parsed.data);
                  continue;
                }
                
                const question = parsed.data;
                const questionNumber = String(question.question_number || '').trim();
                
                // Filter out invalid question numbers (section headers, malformed)
                if (/^section\s*[abc]/i.test(questionNumber) || 
                    questionNumber.toLowerCase() === 'c' || 
                    questionNumber.toLowerCase() === 'b' || 
                    questionNumber.toLowerCase() === 'a' ||
                    questionNumber.startsWith('.')) {
                  console.warn(`[PDF Upload] ⚠️ Skipping invalid question number: "${questionNumber}"`);
                  continue;
                }
                
                // Skip if not a valid question number format
                if (!/^\d/.test(questionNumber)) {
                  console.warn(`[PDF Upload] ⚠️ Skipping invalid question number format: "${questionNumber}"`);
                  continue;
                }
                
                questionCount++;
                questions.push(question);

                console.log(`[PDF Upload] Processing question ${question.question_number} (${questionCount} total)`);

                // Upload images for this question
                const imageFileIds: string[] = [];
                if (question.images && question.images.length > 0) {
                  console.log(`[PDF Upload] Question ${question.question_number} has ${question.images.length} images`);
                  for (const img of question.images) {
                    try {
                      const imageData = img.image_data;
                      if (imageData && imageData.includes(',')) {
                        const base64Data = imageData.split(',')[1];
                        const imageBuffer = Buffer.from(base64Data, 'base64');
                        const fileId = ID.unique();
                        const fileName = `question-${question.question_number}-${imageFileIds.length}-${Date.now()}.png`;
                        
                        // Create File object for Appwrite
                        const imageFile = new File([imageBuffer], fileName, {
                          type: 'image/png',
                          lastModified: Date.now(),
                        });

                        await storage.createFile(
                          appwriteConfig.storageBucketId,
                          fileId,
                          imageFile
                        );

                        imageFileIds.push(fileId);
                        console.log(`[PDF Upload] Uploaded image ${fileId} for question ${question.question_number}`);
                      }
                    } catch (imgError: any) {
                      console.error(`[PDF Upload] Error uploading image for question ${question.question_number}:`, imgError);
                    }
                  }
                }

                // Convert to editor format
                console.log(`[PDF Upload] Converting question ${question.question_number} to editor format...`);
                console.log(`[PDF Upload] Raw question data:`, {
                  number: question.question_number,
                  textLength: question.question_text?.length || 0,
                  textPreview: question.question_text?.substring(0, 100) || 'NO TEXT',
                  hasImages: question.images?.length || 0,
                });
                
                const editorQuestion = convertToEditorFormat(question, imageFileIds);
                
                console.log(`[PDF Upload] Converted question:`, {
                  number: editorQuestion.number,
                  textLength: editorQuestion.text?.length || 0,
                  textPreview: editorQuestion.text?.substring(0, 50) || 'NO TEXT',
                  marks: editorQuestion.marks,
                  type: editorQuestion.type,
                  subQuestions: editorQuestion.subQuestions.length,
                });

                // Validate question has text
                if (!editorQuestion.text || editorQuestion.text.trim() === '') {
                  console.error(`[PDF Upload] ⚠️ Question ${question.question_number} has NO TEXT!`);
                }

                // Save question to database immediately so it persists after refresh
                try {
                  // Validate question text before saving
                  const questionText = editorQuestion.text || '(No question text)';
                  if (!editorQuestion.text || editorQuestion.text.trim() === '') {
                    console.warn(`[PDF Upload] ⚠️ Question ${editorQuestion.number} has empty text - saving placeholder`);
                  }

                  const questionData: any = {
                    paperId: paperId!,
                    number: editorQuestion.number,
                    question: questionText, // Store as 'question' field (not 'questionText')
                    answer: '(No answer provided)',
                    marks: editorQuestion.marks || 0,
                    type: editorQuestion.type || 'normal',
                    hasImage: !!editorQuestion.imageFileId,
                    order: Math.round((parseFloat(editorQuestion.number.split('.')[0]) || 0) * 1000),
                  };

                  if (editorQuestion.imageFileId) {
                    questionData.imageFileId = editorQuestion.imageFileId;
                  }
                  
                  // Store options for multiple-choice questions
                  if (editorQuestion.type === 'multiple-choice' && editorQuestion.options && editorQuestion.options.length > 0) {
                    questionData.options = JSON.stringify(editorQuestion.options); // Store as JSON string
                    console.log(`[PDF Upload] Saving ${editorQuestion.options.length} options for question ${editorQuestion.number}`);
                  }
                  
                  // Store diagramLabel for diagram questions
                  if (editorQuestion.type === 'diagram' && editorQuestion.diagramLabel) {
                    questionData.diagramLabel = editorQuestion.diagramLabel;
                    console.log(`[PDF Upload] Saving diagramLabel for question ${editorQuestion.number}: "${editorQuestion.diagramLabel}"`);
                  }

                  console.log(`[PDF Upload] Saving question ${editorQuestion.number} to database:`, {
                    paperId: paperId,
                    number: questionData.number,
                    textLength: questionText.length,
                    textPreview: questionText.substring(0, 100),
                    marks: questionData.marks,
                    type: questionData.type,
                    hasImage: questionData.hasImage,
                  });

                  // Check if question already exists
                  const existing = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    'questions',
                    [
                      Query.equal('paperId', paperId!),
                      Query.equal('number', editorQuestion.number),
                    ]
                  );

                  if (existing.documents.length > 0) {
                    // Update existing
                    await databases.updateDocument(
                      appwriteConfig.databaseId,
                      'questions',
                      existing.documents[0].$id,
                      questionData
                    );
                    console.log(`[PDF Upload] ✅ Updated question ${editorQuestion.number} in database`);
                  } else {
                    // Create new
                    const newQuestionId = ID.unique();
                    await databases.createDocument(
                      appwriteConfig.databaseId,
                      'questions',
                      newQuestionId,
                      questionData
                    );
                    console.log(`[PDF Upload] ✅ Saved question ${editorQuestion.number} to database with ID ${newQuestionId}`);
                  }
                } catch (dbError: any) {
                  console.error(`[PDF Upload] ❌ Error saving question ${editorQuestion.number} to database:`, dbError);
                  console.error(`[PDF Upload] Error details:`, {
                    message: dbError.message,
                    code: dbError.code,
                    type: dbError.type,
                  });
                  // Don't fail the whole process if one question fails to save
                }
                
                // Send question to client
                const eventData = {
                  type: 'question',
                  question: editorQuestion,
                  questionNumber: question.question_number,
                  total: questionCount
                };
                
                console.log(`[PDF Upload] Sending question ${question.question_number} to client...`);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                console.log(`[PDF Upload] ✅ Question ${question.question_number} sent to client`);
              } else if (parsed.type === 'complete') {
                // All questions processed
                console.log(`[PDF Upload] ✅ All questions processed. Total: ${parsed.total}`);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'complete', 
                  total: parsed.total 
                })}\n\n`));
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              console.error('[PDF Upload] Error parsing line:', parseError);
              console.error('[PDF Upload] Line content:', line.substring(0, 200));
            }
          }
        });

        // Handle stderr (errors and debug info)
        pythonProcess.stderr.on('data', (data: Buffer) => {
          const errorText = data.toString();
          console.log('[PDF Upload] Python stderr:', errorText);
          // Python logs debug info to stderr, so log it but don't treat as error unless it contains "ERROR" or "Exception"
          if (errorText.toLowerCase().includes('error') || errorText.toLowerCase().includes('exception')) {
            console.error('[PDF Upload] ❌ Python error detected:', errorText);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: errorText 
            })}\n\n`));
          }
        });

        // Handle process completion
        pythonProcess.on('close', async (code) => {
          try {
            console.log(`[PDF Upload] Python process exited with code ${code}`);
            console.log(`[PDF Upload] Total questions processed: ${questionCount}`);
            
            if (code !== 0) {
              console.error(`[PDF Upload] ❌ Python script exited with error code ${code}`);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                message: `Python extractor failed with exit code ${code}. Check server logs for details.`
              })}\n\n`));
            }
            
            // Don't save structure automatically - let user save through editor
            // Just update status to indicate processing is complete
            if (paperId) {
              await databases.updateDocument(
                appwriteConfig.databaseId,
                'pastpapers',
                paperId,
                {
                  status: 'Draft',
                  questionCount: questionCount,
                  // Don't save generatedQuestions here - let user save through editor
                }
              );

              console.log(`[PDF Upload] ✅ Updated paper ${paperId} with ${questionCount} questions`);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'done', 
                paperId: paperId,
                total: questionCount,
                message: `Processing complete. ${questionCount} questions extracted. Please review and save through the editor.`
              })}\n\n`));
            }
          } catch (error: any) {
            console.error('[PDF Upload] ❌ Error in process close handler:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: error.message 
            })}\n\n`));
          } finally {
            // Clean up temp file
            if (pdfPath && existsSync(pdfPath)) {
              try {
                unlinkSync(pdfPath);
                console.log(`[PDF Upload] Cleaned up temp file: ${pdfPath}`);
              } catch (e) {
                console.error('Error deleting temp file:', e);
              }
            }
            controller.close();
          }
        });
        
        // Handle process errors
        pythonProcess.on('error', (error: Error) => {
          console.error('[PDF Upload] ❌ Failed to start Python process:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: `Failed to start Python extractor: ${error.message}. Make sure Python is installed and accessible.`
          })}\n\n`));
          controller.close();
        });

      } catch (error: any) {
        console.error('Error processing PDF:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          message: error.message 
        })}\n\n`));
        
        // Clean up
        if (pdfPath && existsSync(pdfPath)) {
          try {
            unlinkSync(pdfPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
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
 * Convert extracted question to editor format
 */
function convertToEditorFormat(question: any, imageFileIds: string[]): any {
  // Map question types
  const typeMap: Record<string, string> = {
    'diagram_question': 'diagram',
    'picture_question': 'diagram',
    'multiple_choice': 'multiple-choice',
    'table_question': 'table',
    'graph_question': 'graph',
    'extract_question': 'extract',
    'essay_question': 'normal',
    'standard_question': 'normal',
  };

  let editorType = typeMap[question.question_type] || 'normal';
  const questionText = question.question_text || '';
  let questionPrompt = questionText;
  let extractedOptions: string[] = [];
  
  // ALWAYS detect multiple-choice by looking for option patterns (A., B., C., D.)
  // This works regardless of what the Python extractor says
  const optionPatterns = [
    /\b([A-D])[\.\)]\s+([^A-D\.\)]+?)(?=\s+[A-D][\.\)]|$)/gi,
    /\b([A-D])[\.\)]\s+([A-Z][^A-D\.\)]*?)(?=\s+[A-D][\.\)]|$)/gi,
  ];
  
  let matches: Array<{ letter: string; text: string; index: number }> = [];
  
  for (const pattern of optionPatterns) {
    pattern.lastIndex = 0;
    let match;
    const tempMatches: Array<{ letter: string; text: string; index: number }> = [];
    
    while ((match = pattern.exec(questionText)) !== null) {
      const optionText = match[2].trim();
      if (optionText.length > 1 && !/^[A-Z]$/.test(optionText)) {
        tempMatches.push({
          letter: match[1].toUpperCase(),
          text: optionText,
          index: match.index
        });
      }
    }
    
    if (tempMatches.length > matches.length) {
      matches = tempMatches;
    }
  }
  
  // Also try simpler pattern
  if (matches.length < 2) {
    const simplePattern = /([A-D])[\.\)]\s+([^\n]+?)(?=\s+[A-D][\.\)]|\s*$)/gi;
    simplePattern.lastIndex = 0;
    matches = [];
    let match;
    while ((match = simplePattern.exec(questionText)) !== null) {
      const optionText = match[2].trim();
      if (optionText.length > 1) {
        matches.push({
          letter: match[1].toUpperCase(),
          text: optionText,
          index: match.index
        });
      }
    }
  }
  
  // If we found 2+ options, it's multiple-choice
  if (matches.length >= 2) {
    editorType = 'multiple-choice';
    const firstOptionIndex = matches[0].index;
    questionPrompt = questionText.substring(0, firstOptionIndex).trim();
    
    const optionsMap: Record<string, string> = {};
    for (const m of matches) {
      if (optionsMap[m.letter]) {
        optionsMap[m.letter] += ' ' + m.text;
      } else {
        optionsMap[m.letter] = m.text;
      }
    }
    
    extractedOptions = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, matches.length).map(letter => {
      return optionsMap[letter] || '';
    }).filter(opt => opt !== '');
    
    console.log(`[convertToEditorFormat] ✅ Detected multiple-choice for question ${question.question_number} with ${extractedOptions.length} options`);
  }
  
  // If has images, set type to 'diagram' (unless already multiple-choice)
  if (imageFileIds.length > 0 && editorType !== 'multiple-choice') {
    editorType = 'diagram';
    console.log(`[convertToEditorFormat] 📷 Question ${question.question_number} has image - setting type to 'diagram'`);
  }
  
  // Extract marks from question text
  const marksMatch = questionText.match(/\((\d+)\)|\[(\d+)\]|(\d+)\s*marks?/i);
  const marks = marksMatch ? parseInt(marksMatch[1] || marksMatch[2] || marksMatch[3] || '1') : 1;

  // Extract sub-questions (e.g., "1.4.3 (a)", "1.4.3 (b)")
  const subQuestionPattern = /\(([a-z])\)/gi;
  const subQuestions: any[] = [];
  const subQMatches: Array<{ index: number; letter: string }> = [];
  
  // Find all matches first
  let subQMatch;
  while ((subQMatch = subQuestionPattern.exec(questionText)) !== null) {
    subQMatches.push({ index: subQMatch.index, letter: subQMatch[1] });
  }

  // Process each sub-question
  for (let i = 0; i < subQMatches.length; i++) {
    const currentMatch = subQMatches[i];
    const nextMatch = subQMatches[i + 1];
    
    const subQStart = currentMatch.index;
    const subQEnd = nextMatch ? nextMatch.index : questionText.length;
    const subQText = questionText.substring(subQStart, subQEnd).trim();
    
    const subQMarksMatch = subQText.match(/\((\d+)\)|\[(\d+)\]|(\d+)\s*marks?/i);
    const subQMarks = subQMarksMatch ? parseInt(subQMarksMatch[1] || subQMarksMatch[2] || subQMarksMatch[3] || '1') : 1;

    subQuestions.push({
      id: ID.unique(),
      number: currentMatch.letter.toUpperCase(),
      text: subQText.replace(/\([a-z]\)/gi, '').trim(),
      marks: subQMarks,
      type: editorType,
    });
  }

  // Validate question_text exists and is not empty
  if (!questionText || questionText.trim() === '') {
    console.warn(`[convertToEditorFormat] ⚠️ Question ${question.question_number} has empty question_text from Python extractor`);
    console.warn(`[convertToEditorFormat] Raw question object:`, {
      question_number: question.question_number,
      question_text: question.question_text,
      question_type: question.question_type,
      hasImages: question.images?.length || 0,
      allKeys: Object.keys(question),
    });
  }

  // Ensure all required fields match editor interface exactly
  const editorQuestion: any = {
    id: ID.unique(),
    number: question.question_number.toString(),
    text: questionPrompt, // Use extracted prompt (without options for multiple-choice)
    instructionText: '', // Optional field
    marks: marks,
    type: editorType as any, // Cast to QuestionType
    subQuestions: subQuestions.length > 0 ? subQuestions : [], // Always an array
    hasDiagram: imageFileIds.length > 0,
    imageFileId: imageFileIds[0] || undefined,
  };
  
  // Add options for multiple-choice questions
  if (editorType === 'multiple-choice' && extractedOptions.length > 0) {
    editorQuestion.options = extractedOptions;
    console.log(`[convertToEditorFormat] ✅ Added ${extractedOptions.length} options to question ${question.question_number}`);
  }
  
  // Add diagramLabel if it's a diagram (extract from question text or use default)
  if (editorType === 'diagram' && imageFileIds.length > 0) {
    // Try to extract a heading/description from the question text
    // Look for text before common diagram references
    const diagramLabelMatch = questionText.match(/^([^\.]+?)(?:\s*(?:below|above|shown|illustrated|diagram|figure))?/i);
    if (diagramLabelMatch && diagramLabelMatch[1].trim().length > 5) {
      editorQuestion.diagramLabel = diagramLabelMatch[1].trim();
    } else {
      // Use question number as default label
      editorQuestion.diagramLabel = `Diagram for Question ${question.question_number}`;
    }
    console.log(`[convertToEditorFormat] 📷 Added diagramLabel to question ${question.question_number}: "${editorQuestion.diagramLabel}"`);
  }

  // Validate required fields
  if (!editorQuestion.id || !editorQuestion.number) {
    console.error('[convertToEditorFormat] Invalid question format - missing id or number:', editorQuestion);
    throw new Error('Question missing required fields: id or number');
  }

  if (editorQuestion.text === undefined) {
    console.error('[convertToEditorFormat] Invalid question format - text is undefined:', editorQuestion);
    throw new Error('Question missing required field: text');
  }

  // Warn if text is empty (but don't throw - allow it to be saved with placeholder)
  if (!editorQuestion.text || editorQuestion.text.trim() === '') {
    console.warn(`[convertToEditorFormat] ⚠️ Question ${editorQuestion.number} will be saved with empty text`);
  }

  return editorQuestion;
}

/**
 * Build paper structure from questions
 */
function buildPaperStructure(questions: any[], subject: string, year: string, grade: string) {
  // Group questions into sections (A, B, C) based on question numbers
  const sections: any[] = [];
  let currentSection = 'A';
  let currentSectionQuestions: any[] = [];

  for (const q of questions) {
    const qNum = parseInt(q.question_number);
    
    // Determine section based on question number ranges
    let section = 'A';
    if (qNum > 20) section = 'B';
    if (qNum > 40) section = 'C';

    if (section !== currentSection) {
      if (currentSectionQuestions.length > 0) {
        sections.push({
          id: ID.unique(),
          label: `SECTION ${currentSection}`,
          number: currentSection.charCodeAt(0) - 64, // A=1, B=2, C=3
          questions: currentSectionQuestions,
          totalMarks: 0,
        });
      }
      currentSection = section;
      currentSectionQuestions = [];
    }

    currentSectionQuestions.push(convertToEditorFormat(q, []));
  }

  // Add last section
  if (currentSectionQuestions.length > 0) {
    sections.push({
      id: ID.unique(),
      label: `SECTION ${currentSection}`,
      number: currentSection.charCodeAt(0) - 64,
      questions: currentSectionQuestions,
      totalMarks: 0,
    });
  }

  // Calculate section marks
  sections.forEach(section => {
    let total = 0;
    section.questions.forEach((q: any) => {
      total += q.marks || 0;
      q.subQuestions.forEach((sq: any) => {
        total += sq.marks || 0;
      });
    });
    section.totalMarks = total;
  });

  const totalMarks = sections.reduce((sum, s) => sum + (s.totalMarks || 0), 0);

  return {
    sections,
    header: {
      subject: subject.split(' ')[0] || subject,
      paperNumber: subject.includes('Paper') ? subject.split('Paper')[1]?.trim() || '1' : '1',
      year: year,
      grade: parseInt(grade) || 12,
      examBoard: 'DBE',
      certificateType: 'SC/NSC',
    },
    totalMarks,
  };
}

