import { NextRequest } from 'next/server';
import { getServerDatabases, getServerStorage, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';
import { PopplerJSON, PopplerDocument, PopplerNormalizedQuestion, EditorQuestion, EditorPaper } from '@/lib/past-papers-v2/types';
import { uploadPopplerImages } from '@/lib/past-papers-v2/storage';

/**
 * Calculate order value for question sorting
 * Format: Q1.1 -> 1001000, Q1.1.1 -> 1001001, Q1.2 -> 1002000, etc.
 */
function calculateOrder(questionNumber: string): number {
  const parts = questionNumber.split('.');
  let order = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parseInt(parts[i]) || 0;
    order += part * Math.pow(1000, 2 - i);
  }
  return order;
}

/**
 * Remove option letters and texts from the question prompt so they don't duplicate in the editor
 * Handles multiple formats:
 * - A. text\nB. text\nC. text\nD. text
 * - A\nB\nC\nD\nOption A\nOption B\n...
 * - Lines that contain option text
 */
function cleanQuestionTextOfOptions(text: string, options: string[]): string {
  if (!text) return '';
  if (!options || options.length === 0) {
    return text.trim();
  }
  
  const optionSet = new Set(options.map(opt => opt.trim()).filter(Boolean));
  if (optionSet.size === 0) {
    return text.trim();
  }
  
  const lines = text.split('\n');
  const keptLines: string[] = [];
  let inOptionSection = false;
  let foundFirstLetter = false;
  
  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const trimmed = originalLine.trim();
    
    // Skip standalone option letters (A, B, C, D, E)
    if (/^[A-E]$/i.test(trimmed)) {
      foundFirstLetter = true;
      continue;
    }
    
    // Once we've found option letters, we're in the option section
    // Skip all lines until we're sure we're past the options
    if (foundFirstLetter) {
      // Check if this line is part of an option text
      // Options might be on single lines or span multiple lines
      let isOptionLine = false;
      
      // Check if line exactly matches an option
      if (optionSet.has(trimmed)) {
        isOptionLine = true;
      } else {
        // Check if line contains option text (for multi-line options)
        for (const opt of optionSet) {
          if (trimmed.includes(opt) || opt.includes(trimmed)) {
            // Only consider it an option line if the match is substantial
            const matchRatio = Math.min(trimmed.length, opt.length) / Math.max(trimmed.length, opt.length);
            if (matchRatio > 0.5) {
              isOptionLine = true;
              break;
            }
          }
        }
      }
      
      if (isOptionLine) {
        continue; // Skip this option line
      }
      
      // If we've moved past options (found a substantial non-option line), stop skipping
      // A substantial line is one that's not just whitespace and doesn't match options
      if (trimmed.length > 10 && !isOptionLine) {
        // We've passed the option section, add remaining lines
        keptLines.push(originalLine);
      }
    } else {
      // Before finding option letters, keep all lines
      keptLines.push(originalLine);
    }
  }
  
  // Clean up excessive blank lines
  return keptLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * API Route: Upload Poppler-generated JSON
 * Processes Poppler JSON format and stores in database
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const memoFile = formData.get('memoFile') as File | null;
    const userId = formData.get('userId') as string;
    const subject = formData.get('subject') as string | null;
    const year = formData.get('year') as string | null;
    const grade = formData.get('grade') as string | null;

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return Response.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Read and parse JSON
    const jsonText = await file.text();
    let popplerData: PopplerJSON;
    try {
      popplerData = JSON.parse(jsonText);
    } catch (error: any) {
      return Response.json({ success: false, error: `Invalid JSON: ${error.message}` }, { status: 400 });
    }

    // Extract metadata from Poppler JSON
    const detectedSubject = subject || extractSubjectFromName(popplerData.past_paper_name);
    const detectedYear = year || extractYearFromName(popplerData.past_paper_name);
    const detectedGrade = grade ? parseInt(grade) : 12;
    const paperName = popplerData.past_paper_name;

    // Get question paper and memo documents
    const questionPaper = popplerData.documents.find(d => d.document_type === 'question_paper');
    const memo = popplerData.documents.find(d => d.document_type === 'memo');
    const memoName = memo?.pdf_name || '';

    if (!questionPaper) {
      return Response.json({ success: false, error: 'No question paper found in JSON' }, { status: 400 });
    }

    const databases = getServerDatabases();
    const storage = getServerStorage();

    // Upload memo PDF to Appwrite Storage if provided
    let memoFileId: string | undefined;
    let uploadedMemoName = memoName;
    const PAST_PAPER_BUCKET_ID = '690dafea0021f232399e';
    
    if (memoFile) {
      try {
        console.log(`Uploading memo PDF: ${memoFile.name}...`);
        const memoFileIdUnique = ID.unique();
        const uploadedMemo = await storage.createFile(
          PAST_PAPER_BUCKET_ID,
          memoFileIdUnique,
          memoFile,
          ['read("users")'] // Accessible to authenticated users
        );
        memoFileId = uploadedMemo.$id;
        uploadedMemoName = memoFile.name || memoName;
        console.log(`Memo uploaded successfully: ${memoFileId}`);
      } catch (error: any) {
        console.error('Error uploading memo file:', error);
        // Continue without memo if upload fails
        console.warn('Continuing without memo file...');
      }
    }

    // Upload images to Appwrite Storage
    console.log(`Uploading ${popplerData.images.length} images...`);
    const imageMap = await uploadPopplerImages(storage, popplerData.images);
    console.log(`Uploaded ${imageMap.size} images`);

    // Build page-to-image map for spatial matching (fallback when question_number is null)
    // Map: page number -> array of image file IDs on that page
    const pageImageMap = new Map<number, string[]>();
    for (const image of popplerData.images) {
      if (!image.page) continue;

      // Try multiple keys to find the fileId in imageMap
      let imageFileId: string | undefined;
      const imageFilename = (image as any).image_filename as string | undefined;
      if (imageFilename) {
        imageFileId = imageMap.get(imageFilename);
      }
      if (!imageFileId && image.label) {
        imageFileId = imageMap.get(image.label);
      }
      if (!imageFileId && image.question_number) {
        imageFileId = imageMap.get(image.question_number);
      }

      if (imageFileId) {
        if (!pageImageMap.has(image.page)) {
          pageImageMap.set(image.page, []);
        }
        pageImageMap.get(image.page)!.push(imageFileId);
      }
    }
    console.log(`Built page-to-image map: ${pageImageMap.size} pages with images`);
    for (const [page, fileIds] of pageImageMap.entries()) {
      console.log(`  Page ${page}: ${fileIds.length} image(s)`);
    }

    // Create paper document
    const paperData: any = {
      teacherId: userId,
      gradeLevel: detectedGrade,
      subject: detectedSubject || 'Unknown Subject',
      year: detectedYear || new Date().getFullYear().toString(),
      paperName: paperName,
      memoName: uploadedMemoName,
      status: 'Processing',
      questionCount: 0,
    };

    // Add memo file ID if uploaded
    if (memoFileId) {
      paperData.memoFileId = memoFileId;
    }

    const paper = await databases.createDocument(
      appwriteConfig.databaseId,
      'pastpapers', // Using existing collection for now, can create pastPapersV2 later
      ID.unique(),
      paperData
    );

    const paperId = paper.$id;
    console.log(`Created paper: ${paperId}`);

    // Process questions from normalized format
    const questions: EditorQuestion[] = [];
    let questionCount = 0;

    // Check if normalized array exists and has data
    if (!questionPaper.normalized || questionPaper.normalized.length === 0) {
      console.error('❌ No normalized questions found in question paper!');
      console.log('Available keys in document:', Object.keys(questionPaper));
      if (questionPaper.structured) {
        console.log('Structured data available - trying to use that instead...');
        // Fallback: try to extract from structured format
        if (questionPaper.structured.sections) {
          for (const section of questionPaper.structured.sections) {
            for (const q of section.questions || []) {
              // Convert structured question to normalized format
              const normQ: PopplerNormalizedQuestion = {
                QuestionNumber: q.number,
                QuestionType: q.type || 'text',
                QuestionText: q.text || '',
                Marks: q.marks || null,
                Section: section.name,
                LinkedDiagram: q.diagram || null,
                Title: q.title || null,
                ParentQuestion: undefined,
              };
              const editorQ = convertNormalizedToEditor(normQ, paperId, questionPaper, imageMap, undefined, pageImageMap);
              if (editorQ) {
                questions.push(editorQ);
                questionCount++;
              }
            }
          }
        }
      }
    } else {
    // CRITICAL: Sort normalized questions by order BEFORE processing
    // This ensures parent questions are processed before subquestions, and questions are in correct order
    const sortedNormalized = [...questionPaper.normalized].sort((a, b) => {
      const orderA = calculateOrder(a.QuestionNumber);
      const orderB = calculateOrder(b.QuestionNumber);
      return orderA - orderB;
    });
    console.log(`✓ Sorted ${sortedNormalized.length} normalized questions by order before processing`);

    // First pass: collect ALL parent questions (not just multiple choice ones)
    // We need to check if a parent has options for a specific subquestion
    const parentQuestions = new Map<string, PopplerNormalizedQuestion>();
    for (const normQ of sortedNormalized) {
      if (!normQ.ParentQuestion) {
        parentQuestions.set(normQ.QuestionNumber, normQ);
      }
    }

      // Process question paper questions (now in sorted order)
      console.log(`Processing ${sortedNormalized.length} normalized questions...`);
      
      // DEBUG: Log the sequence of questions from JSON normalized array with calculated order
      console.log(`[Question Text Debug] ========================================`);
      console.log(`[Question Text Debug] RAW JSON NORMALIZED ARRAY SEQUENCE (with calculated order):`);
      let previousOrder = -1;
      let orderIssues: string[] = [];
      sortedNormalized.forEach((normQ, idx) => {
        const calculatedOrder = calculateOrder(normQ.QuestionNumber);
        const orderCheck = previousOrder >= 0 && calculatedOrder < previousOrder ? ' ⚠️ ORDER ISSUE!' : '';
        if (previousOrder >= 0 && calculatedOrder < previousOrder) {
          orderIssues.push(`Q${normQ.QuestionNumber} (order=${calculatedOrder}) comes after question with order=${previousOrder}`);
        }
        console.log(`  [${idx}] Q${normQ.QuestionNumber}:${orderCheck}`);
        console.log(`    - Calculated Order: ${calculatedOrder}`);
        console.log(`    - QuestionText: "${(normQ.QuestionText || '').substring(0, 150)}${(normQ.QuestionText || '').length > 150 ? '...' : ''}"`);
        console.log(`    - QuestionType: ${normQ.QuestionType || 'none'}`);
        console.log(`    - ParentQuestion: ${normQ.ParentQuestion || 'none'}`);
        console.log(`    - Marks: ${normQ.Marks || 0}`);
        previousOrder = calculatedOrder;
      });
      
      if (orderIssues.length > 0) {
        console.log(`[Question Text Debug] ⚠️ ORDER VALIDATION FAILED:`);
        orderIssues.forEach(issue => console.log(`  - ${issue}`));
        console.log(`[Question Text Debug] The questions in the JSON normalized array are NOT in the correct order!`);
        console.log(`[Question Text Debug] This will cause questions to be saved/displayed in the wrong order.`);
        console.log(`[Question Text Debug] Please fix the order in the JSON file before uploading.`);
      } else {
        console.log(`[Question Text Debug] ✓ Order validation passed - questions are in correct order by question number.`);
      }
      
      // Summary: Show compact sequence for easy comparison with past paper
      console.log(`[Question Text Debug] ========================================`);
      console.log(`[Question Text Debug] SUMMARY - Question sequence from JSON (for comparison with past paper):`);
      sortedNormalized.forEach((normQ, idx) => {
        const calculatedOrder = calculateOrder(normQ.QuestionNumber);
        const textPreview = (normQ.QuestionText || '').substring(0, 80).replace(/\n/g, ' ');
        console.log(`  ${idx + 1}. Q${normQ.QuestionNumber} (order=${calculatedOrder}): "${textPreview}${textPreview.length >= 80 ? '...' : ''}"`);
      });
      console.log(`[Question Text Debug] ========================================`);
      console.log(`[Question Text Debug] ⚠️ IMPORTANT: Compare the above sequence with the actual past paper!`);
      console.log(`[Question Text Debug] If the question text doesn't match, the issue is in the JSON extraction, not the ordering logic.`);
      console.log(`[Question Text Debug] ========================================`);
      
      let skippedCount = 0;
      const typeCounts: Record<string, number> = {};
      const seenQuestionNumbers = new Set<string>(); // Track duplicates
      
      for (const normQ of sortedNormalized) {
        // Skip duplicate question numbers (keep first occurrence)
        if (seenQuestionNumbers.has(normQ.QuestionNumber)) {
          console.warn(`⚠️ Skipping duplicate question number: Q${normQ.QuestionNumber}`);
          skippedCount++;
          continue;
        }
        seenQuestionNumbers.add(normQ.QuestionNumber);
        const editorQ = convertNormalizedToEditor(
          normQ,
          paperId,
          questionPaper,
          imageMap,
          parentQuestions,
          pageImageMap
        );
        if (editorQ) {
          questions.push(editorQ);
          questionCount++;
          // Track type distribution
          typeCounts[editorQ.type] = (typeCounts[editorQ.type] || 0) + 1;
          // Log first few for debugging
          if (questions.length <= 5) {
            console.log(`  Q${editorQ.number}: type=${editorQ.type}, marks=${editorQ.marks}, hasImage=${editorQ.hasImage}, hasOptions=${!!editorQ.options && editorQ.options.length > 0}`);
          }
        } else {
          skippedCount++;
          if (skippedCount <= 5) {
            console.log(`  Skipped question: ${normQ.QuestionNumber} (${normQ.QuestionType}) - text: "${(normQ.QuestionText || '').substring(0, 50)}"`);
          }
        }
      }
      console.log(`Converted ${questions.length} questions (skipped ${skippedCount})`);
      console.log(`Type distribution:`, typeCounts);
      
      // DEBUG: Log final question sequence by order
      console.log(`[Question Sequence] Final order of questions (sorted by order field):`);
      const sortedForLogging = [...questions].sort((a, b) => a.order - b.order);
      sortedForLogging.forEach((q, idx) => {
        console.log(`  [${idx}] Q${q.number}: order=${q.order}, type=${q.type}, hasImage=${q.hasImage}, imageFileId=${q.imageFileId ? 'YES' : 'NO'}`);
      });
      
      // DEBUG: Question Sequence Validation - Compare structured vs normalized
      console.log(`[Question Sequence Validation] Comparing structured vs normalized formats:`);
      if (questionPaper.structured?.sections) {
        const structuredQuestions: Array<{ number: string; text: string }> = [];
        const normalizedQuestions: Array<{ number: string; text: string }> = [];
        
        // Collect structured questions
        for (const section of questionPaper.structured.sections) {
          for (const q of section.questions || []) {
            structuredQuestions.push({ number: q.number, text: q.text || '' });
            for (const subQ of q.subquestions || []) {
              structuredQuestions.push({ number: subQ.number, text: subQ.text || '' });
            }
          }
        }
        
        // Collect normalized questions
        for (const normQ of questionPaper.normalized) {
          normalizedQuestions.push({ 
            number: normQ.QuestionNumber, 
            text: normQ.QuestionText || '' 
          });
        }
        
        // Compare sequences
        console.log(`  Structured questions: ${structuredQuestions.length}`);
        console.log(`  Normalized questions: ${normalizedQuestions.length}`);
        
        // Check for mismatches
        const mismatches: Array<{ number: string; structured: string; normalized: string }> = [];
        for (let i = 0; i < Math.max(structuredQuestions.length, normalizedQuestions.length); i++) {
          const structQ = structuredQuestions[i];
          const normQ = normalizedQuestions[i];
          
          if (structQ && normQ) {
            if (structQ.number !== normQ.number) {
              console.warn(`  ⚠️ Question number mismatch at index ${i}: structured=${structQ.number}, normalized=${normQ.number}`);
            }
            if (structQ.text !== normQ.text) {
              mismatches.push({
                number: structQ.number || normQ.number,
                structured: structQ.text.substring(0, 100),
                normalized: normQ.text.substring(0, 100)
              });
            }
          } else if (structQ && !normQ) {
            console.warn(`  ⚠️ Missing in normalized: Q${structQ.number}`);
          } else if (!structQ && normQ) {
            console.warn(`  ⚠️ Missing in structured: Q${normQ.number}`);
          }
        }
        
        if (mismatches.length > 0) {
          console.warn(`  ⚠️ Found ${mismatches.length} text mismatches:`);
          mismatches.slice(0, 10).forEach(m => {
            console.warn(`    Q${m.number}:`);
            console.warn(`      Structured: "${m.structured}..."`);
            console.warn(`      Normalized: "${m.normalized}..."`);
          });
          if (mismatches.length > 10) {
            console.warn(`    ... and ${mismatches.length - 10} more mismatches`);
          }
        } else {
          console.log(`  ✅ All question texts match between structured and normalized formats`);
        }
      }
    }

    // Process memo answers (match by question number)
    if (memo) {
      const memoAnswers = new Map<string, string>();
      
      // Try structured format first (more reliable)
      // In memo, the structured format has answers in subquestions
      if (memo.structured && memo.structured.sections) {
        for (const section of memo.structured.sections) {
          for (const memoQ of section.questions || []) {
            // For parent questions, the text might be the question, not the answer
            // Skip parent question text if it looks like a question number or instruction
            const parentText = memoQ.text?.trim() || '';
            if (parentText && parentText.length > 3 && !/^\d+\.\d+$/.test(parentText)) {
              // Only set if it doesn't look like a question number
              memoAnswers.set(memoQ.number, parentText);
            }
            
            // Subquestions contain the actual answers
            if (memoQ.subquestions) {
              for (const subQ of memoQ.subquestions) {
                const answerText = subQ.text?.trim() || '';
                if (answerText && answerText.length > 0) {
                  // Skip if it's just a question number pattern
                  if (!/^\d+\.\d+(\.\d+)?$/.test(answerText)) {
                    memoAnswers.set(subQ.number, answerText);
                  }
                }
              }
            }
          }
        }
      }
      
      // Fallback to normalized format
      for (const memoQ of memo.normalized) {
        if (memoQ.QuestionText && memoQ.QuestionText.trim()) {
          const answerText = memoQ.QuestionText.trim();
          // Skip if answer is just a question number (e.g., "1.1", "1.2") - these aren't real answers
          // Real answers are usually longer or contain letters/words
          if (answerText.length > 3 || /[A-Za-z]/.test(answerText)) {
            memoAnswers.set(memoQ.QuestionNumber, answerText);
          }
        }
      }

      // Merge answers into questions
      let answerCount = 0;
      const answerSamples: string[] = [];
      for (const q of questions) {
        const answer = memoAnswers.get(q.number);
        if (answer) {
          q.answer = answer;
          answerCount++;
          if (answerSamples.length < 5) {
            answerSamples.push(`Q${q.number}: "${answer.substring(0, 50)}"`);
          }
        }
      }
      console.log(`Matched ${answerCount} answers from memo (total questions: ${questions.length})`);
      if (answerSamples.length > 0) {
        console.log(`Sample answers:`, answerSamples);
      }
      if (answerCount === 0 && memoAnswers.size > 0) {
        console.warn(`⚠️ Found ${memoAnswers.size} memo answers but none matched! Sample memo keys:`, Array.from(memoAnswers.keys()).slice(0, 5));
        console.warn(`Sample question numbers:`, questions.slice(0, 5).map(q => q.number));
      }
    }

    // Save questions to database
    console.log(`Saving ${questions.length} questions...`);
    
    // CRITICAL FIX: Sort questions by order BEFORE saving to ensure correct order in database
    // The JSON normalized array might be out of order, so we MUST sort by the calculated order field
    questions.sort((a, b) => a.order - b.order);
    console.log(`✓ Sorted ${questions.length} questions by order field before saving`);
    
    // DEBUG: Log the sequence of questions being saved (after sorting)
    console.log(`[Question Text Debug] ========================================`);
    console.log(`[Question Text Debug] QUESTIONS BEING SAVED TO DATABASE (sorted by order):`);
    questions.forEach((q, idx) => {
      console.log(`  [${idx}] Q${q.number}:`);
      console.log(`    - order: ${q.order}`);
      console.log(`    - type: ${q.type}`);
      console.log(`    - text: "${(q.text || '').substring(0, 150)}${(q.text || '').length > 150 ? '...' : ''}"`);
      console.log(`    - hasImage: ${q.hasImage}`);
      console.log(`    - imageFileId: ${q.imageFileId || 'none'}`);
    });
    console.log(`[Question Text Debug] ========================================`);
    
    let savedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    if (questions.length === 0) {
      console.warn('⚠️ No questions to save! Check conversion logic.');
      console.log('Sample normalized question:', JSON.stringify(questionPaper.normalized[0], null, 2));
    }
    
    for (const question of questions) {
      try {
        await saveQuestion(databases, paperId, question);
        savedCount++;
        if (savedCount % 10 === 0) {
          console.log(`  Progress: ${savedCount}/${questions.length} questions saved`);
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Question ${question.number}: ${error.message || error.code || 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`Error saving question ${question.number}:`, error.message || error.code);
        console.error(`  Error type:`, error.type);
        console.error(`  Error code:`, error.code);
        console.error(`  Full error:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // Log first error in detail
        if (errorCount === 1) {
          console.error(`  Question data:`, JSON.stringify(question, null, 2));
        }
        // Continue with other questions
      }
    }
    
    if (errorCount > 0) {
      console.warn(`⚠️ ${errorCount} questions failed to save. First few errors:`, errors.slice(0, 5));
    }
    
    if (questions.length > 0 && savedCount === 0) {
      console.error('❌ All questions failed to save! Check database schema and permissions.');
      console.error('First question data:', JSON.stringify(questions[0], null, 2));
    }

    // Update paper with question count and status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      {
        status: 'Processed',
        questionCount: savedCount,
      }
    );

    console.log(`Successfully processed paper ${paperId}: ${savedCount} questions`);

    return Response.json({
      success: true,
      paperId: paperId,
      message: `Successfully processed ${savedCount} questions`,
      debug: {
        totalQuestions: questions.length,
        savedCount,
        errorCount,
        skippedCount: questions.length - savedCount - errorCount,
        firstQuestion: questions.length > 0 ? {
          number: questions[0].number,
          type: questions[0].type,
          textLength: questions[0].text.length,
        } : null,
        firstError: errors.length > 0 ? errors[0] : null,
        firstErrorDetails: errorCount > 0 && questions.length > 0 ? {
          questionNumber: questions[0].number,
          questionType: questions[0].type,
          hasOptions: !!questions[0].options,
          hasImage: questions[0].hasImage,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Error processing Poppler JSON:', error);
    return Response.json(
      { success: false, error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Convert Poppler normalized question to Editor question format
 */
function convertNormalizedToEditor(
  normQ: PopplerNormalizedQuestion,
  paperId: string,
  document: PopplerDocument,
  imageMap: Map<string, string>,
  parentQuestions?: Map<string, PopplerNormalizedQuestion>,
  pageImageMap?: Map<number, string[]>
): EditorQuestion | null {
  // Skip invalid questions
  if (!normQ.QuestionNumber || normQ.QuestionNumber.trim() === '') {
    return null;
  }
  
  // CRITICAL FIX: Detect if question text contains multiple question numbers
  // This indicates questions weren't properly separated during extraction
  const fullQuestionText = normQ.QuestionText || '';
  // Improved pattern to catch question numbers more accurately
  // Matches: 1.1, 1.1.1, 1.1.1.1, etc. but not standalone numbers like "1" or "2" in text
  const questionNumberPattern = /\b(\d+(?:\.\d+){1,3})\b/g;
  let cleanedQuestionText = fullQuestionText;
  const otherNumberMatches: Array<{ number: string; index: number }> = [];
  let match: RegExpExecArray | null;
  
  // Reset regex lastIndex to ensure we check from the start
  questionNumberPattern.lastIndex = 0;
  while ((match = questionNumberPattern.exec(fullQuestionText)) !== null) {
    const number = match[1];
    // Only consider it a different question if it's not the current question number
    // and it's a valid question number format (has at least one dot)
    if (number !== normQ.QuestionNumber && number.includes('.')) {
      otherNumberMatches.push({ number, index: match.index });
    }
  }
  const otherQuestionNumbers = otherNumberMatches.map(m => m.number);
  
  if (otherQuestionNumbers.length > 0) {
    console.warn(`⚠️ Q${normQ.QuestionNumber} contains other question numbers: ${otherQuestionNumbers.join(', ')}`);
    console.warn(`  This indicates questions weren't properly separated. Text preview: "${fullQuestionText.substring(0, 200)}..."`);
    // Trim text at the first occurrence of another question number to avoid merging multiple questions
    const firstOther = otherNumberMatches.sort((a, b) => a.index - b.index)[0];
    if (firstOther.index > 0) {
      // Find the start of the line containing the question number for cleaner trimming
      const lineStart = fullQuestionText.lastIndexOf('\n', firstOther.index);
      const trimIndex = lineStart > 0 ? lineStart : firstOther.index;
      cleanedQuestionText = fullQuestionText.substring(0, trimIndex).trim();
      console.warn(`  → Trimming Q${normQ.QuestionNumber} text before Q${firstOther.number} (trimmed ${fullQuestionText.length - cleanedQuestionText.length} chars)`);
    }
  }
  if (!cleanedQuestionText || cleanedQuestionText.length < 10) {
    // If trimming resulted in empty or very short text, use original but log warning
    cleanedQuestionText = fullQuestionText.trim();
    if (otherQuestionNumbers.length > 0) {
      console.warn(`  ⚠️ Trimming would remove too much text, keeping original (but question may be merged)`);
    }
  }
  
  // DEBUG: Log question being processed
  console.log(`[Question Text Debug] Processing Q${normQ.QuestionNumber}:`);
  console.log(`  - QuestionType: ${normQ.QuestionType || 'none'}`);
  console.log(`  - QuestionText (first 100 chars): ${fullQuestionText.substring(0, 100)}`);
  console.log(`  - Full QuestionText length: ${fullQuestionText.length}`);
  console.log(`  - ParentQuestion: ${normQ.ParentQuestion || 'none'}`);
  console.log(`  - LinkedDiagram: ${normQ.LinkedDiagram || 'none'}`);
  
  // Check if structured format exists for this question
  if (document.structured?.sections) {
    for (const section of document.structured.sections) {
      for (const structQ of section.questions || []) {
        if (structQ.number === normQ.QuestionNumber) {
          console.log(`  - Found matching structured question:`);
          console.log(`    Structured text (first 100 chars): ${(structQ.text || '').substring(0, 100)}`);
          console.log(`    Text match: ${structQ.text === normQ.QuestionText ? 'YES' : 'NO'}`);
          if (structQ.text !== normQ.QuestionText) {
            console.warn(`    ⚠️ TEXT MISMATCH for Q${normQ.QuestionNumber}!`);
            console.warn(`      Normalized: "${fullQuestionText.substring(0, 150)}"`);
            console.warn(`      Structured: "${(structQ.text || '').substring(0, 150)}"`);
          }
          break;
        }
        // Check subquestions
        for (const subQ of structQ.subquestions || []) {
          if (subQ.number === normQ.QuestionNumber) {
            console.log(`  - Found matching structured subquestion:`);
            console.log(`    Structured text (first 100 chars): ${(subQ.text || '').substring(0, 100)}`);
            console.log(`    Text match: ${subQ.text === normQ.QuestionText ? 'YES' : 'NO'}`);
            if (subQ.text !== normQ.QuestionText) {
              console.warn(`    ⚠️ TEXT MISMATCH for Q${normQ.QuestionNumber}!`);
              console.warn(`      Normalized: "${fullQuestionText.substring(0, 150)}"`);
              console.warn(`      Structured: "${(subQ.text || '').substring(0, 150)}"`);
            }
            break;
          }
        }
      }
    }
  }
  
  // Don't skip based on text length - some questions might have empty text initially
  // The editor will allow editing them

  // Detect if this is a header question (e.g., "QUESTION 1", "SECTION A", instruction headers)
  const questionTextUpper = fullQuestionText.toUpperCase().trim();
  const isHeader = 
    questionTextUpper.includes('SECTION') ||
    questionTextUpper.includes('QUESTION') && (questionTextUpper.includes('VARIOUS OPTIONS') || questionTextUpper.includes('GIVE THE CORRECT') || questionTextUpper.includes('INDICATE WHETHER') || questionTextUpper.includes('THE DIAGRAMS BELOW')) ||
    questionTextUpper.includes('VARIOUS OPTIONS ARE PROVIDED') ||
    questionTextUpper.includes('GIVE THE CORRECT BIOLOGICAL TERM') ||
    questionTextUpper.includes('INDICATE WHETHER') ||
    questionTextUpper.includes('THE DIAGRAMS BELOW SHOW') ||
    questionTextUpper.includes('READ THE EXTRACT BELOW') ||
    questionTextUpper.includes('AN INVESTIGATION WAS DONE');

  // Determine question type
  let type: EditorQuestion['type'] = 'normal';
  
  // CRITICAL FIX: Check for MCQ indicators FIRST, before checking QuestionType
  // This ensures we detect MCQ even if QuestionType is wrong or missing
  const questionTextTrimmed = cleanedQuestionText.trim();
  const hasMCQKeywords = /\b(which one|which of the following|which of|select|choose|pick|identify the)\b/i.test(questionTextTrimmed);
  const hasOptionFields = Object.keys(normQ).some(key => key.startsWith('Option'));
  
  // Check if question text contains option patterns (A., B., C., D. or A:, B:, C:, D:)
  // Improved pattern to catch more formats including lines starting with just A, B, C, D
  const hasOptionPatterns = /(?:^|\n)\s*([A-E])[\.\):]\s+[^\n]+/im.test(questionTextTrimmed) || 
                            /(?:^|\n)\s*([A-E])\s+[A-Z][^\n]+/im.test(questionTextTrimmed);
  
  // Check if there are multiple lines that look like options (4+ lines starting with capital letters)
  const lines = questionTextTrimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const hasMultipleOptionLines = lines.length >= 4 && lines.slice(-4).every((line, idx) => {
    // Check if last 4 lines look like options (start with capital letter, reasonable length)
    return /^[A-Z]/.test(line) && line.length > 10 && line.length < 200;
  });
  
  // CRITICAL: Check for embedded option format: A\nB\nC\nD\nOption A text\nOption B text\n...
  // This format has letters on separate lines followed by option texts on separate lines
  const letterLines = lines.filter(l => /^[A-E]$/i.test(l));
  const hasEmbeddedOptionFormat = letterLines.length >= 2; // At least 2 option letters on separate lines
  
  // Check if question text contains standalone option letters (A, B, C, D) followed by text
  // This catches cases where options are listed without punctuation
  // Standalone option lines (letter on its own line) - capture their count
  const standaloneOptionMatches = questionTextTrimmed.match(/(?:^|\n)\s*([A-E])\s*(?=\n)/g) || [];
  const hasStandaloneOptions = standaloneOptionMatches.length >= 2;
  
  // Check if there are at least 2-4 distinct option letters (A, B, C, D) in the text
  const optionLettersInText = new Set(questionTextTrimmed.match(/\b([A-E])\b/g) || []);
  const hasMultipleOptionLetters = optionLettersInText.size >= 2;
  
  // If it has MCQ keywords OR option fields OR option patterns OR embedded option format OR multiple option-like lines, it's likely MCQ
  const likelyMCQ = hasMCQKeywords || hasOptionFields || hasOptionPatterns || hasEmbeddedOptionFormat || hasMultipleOptionLines || 
                    (hasStandaloneOptions && hasMultipleOptionLetters);
  
  // DEBUG: Log MCQ detection details
  console.log(`[MCQ Detection] Q${normQ.QuestionNumber}:`, {
    hasMCQKeywords,
    hasOptionFields,
    hasOptionPatterns,
    hasEmbeddedOptionFormat,
    hasMultipleOptionLines,
    hasStandaloneOptions,
    hasMultipleOptionLetters,
    optionLettersFound: Array.from(optionLettersInText),
    likelyMCQ,
    QuestionType: normQ.QuestionType
  });
  
  // NOTE: We'll determine if it's a diagram type AFTER we've matched the image
  // Don't mark as diagram just because LinkedDiagram exists - it must match an actual image
  
  // CRITICAL: Check for embedded options FIRST, even if QuestionType is 'text'
  // This catches cases where questions have embedded options but are misclassified
  if (normQ.QuestionType === 'multiple_choice' || likelyMCQ || hasEmbeddedOptionFormat) {
    // Check if this question has direct Option fields (OptionA, OptionB, etc.)
    // If it has Option fields, it's definitely a multiple-choice question
    if (hasOptionFields) {
      type = 'multiple-choice';
    } else if (hasMCQKeywords || hasOptionPatterns || hasEmbeddedOptionFormat) {
      // Has MCQ keywords, patterns, or embedded option format - will extract from text later
      type = 'multiple-choice';
    } else {
      // No clear indicators - keep as normal
      type = 'normal';
    }
  } else if (normQ.QuestionType === 'true_false' || normQ.QuestionType === 'true-false') {
    type = 'true-false'; // True/false questions
  } else if (normQ.QuestionType === 'extract') {
    type = 'normal'; // Extract questions are normal text questions with extract text
  } else if (normQ.QuestionType === 'graph') {
    type = 'diagram'; // Graph questions are treated as diagram questions
  } else if (normQ.QuestionType === 'table') {
    type = 'diagram'; // Table questions are treated as diagram questions
  } else if (normQ.QuestionType === 'diagram') {
    type = 'diagram'; // Explicit diagram type
  } else if (normQ.QuestionType === 'subquestion') {
    type = 'subquestion'; // Will be changed to multiple-choice later if options found
  } else if (normQ.QuestionType === 'text' || normQ.QuestionType === 'normal') {
    // CRITICAL: Even if marked as 'text', check for embedded options
    if (hasEmbeddedOptionFormat) {
      type = 'multiple-choice'; // Override to multiple-choice if embedded options detected
    } else {
      type = 'normal';
    }
  }

  // Extract options for multiple choice
  // CRITICAL: Also extract if we detected embedded options, even if type isn't set yet
  const options: string[] = [];
  const shouldExtractOptions = type === 'multiple-choice' || type === 'subquestion' || hasEmbeddedOptionFormat;
  if (shouldExtractOptions) {
    // FIRST: Check for direct OptionA, OptionB, OptionC, OptionD fields on this question
    const directOptionsMap = new Map<string, string>(); // Map letter -> text for sorting
    const optionLetters = ['A', 'B', 'C', 'D', 'E'];
    for (const letter of optionLetters) {
      const optionKey = `Option${letter}` as keyof PopplerNormalizedQuestion;
      const optionValue = (normQ as any)[optionKey];
      if (optionValue && typeof optionValue === 'string' && optionValue.trim().length >= 3) {
        // Validate: not just placeholder text
        const trimmed = optionValue.trim();
        if (trimmed.toUpperCase() !== letter && trimmed.toUpperCase() !== `OPTION ${letter}`) {
          directOptionsMap.set(letter, trimmed);
        }
      }
    }
    
    if (directOptionsMap.size >= 2) {
      // Found valid direct options - sort by letter order
      const sortedDirectOptions: string[] = [];
      for (const letter of optionLetters) {
        const optText = directOptionsMap.get(letter);
        if (optText) {
          sortedDirectOptions.push(optText);
        }
      }
      options.push(...sortedDirectOptions);
      console.log(`  Found ${sortedDirectOptions.length} direct options (OptionA-D) for Q${normQ.QuestionNumber} (sorted: ${optionLetters.slice(0, sortedDirectOptions.length).join(', ')})`);
    } else {
      // SECOND: For sub-questions, look for options in parent question
    if (normQ.ParentQuestion && parentQuestions) {
      const parentQ = parentQuestions.get(normQ.ParentQuestion);
      if (parentQ) {
          // Check parent for OptionA, OptionB, etc. (shared options)
          const parentOptions: string[] = [];
          for (const letter of optionLetters) {
            const optionKey = `Option${letter}` as keyof PopplerNormalizedQuestion;
            const optionValue = (parentQ as any)[optionKey];
            if (optionValue && typeof optionValue === 'string' && optionValue.trim().length >= 3) {
              const trimmed = optionValue.trim();
              if (trimmed.toUpperCase() !== letter && trimmed.toUpperCase() !== `OPTION ${letter}`) {
                parentOptions.push(trimmed);
              }
            }
          }
          
          if (parentOptions.length >= 2) {
            options.push(...parentOptions);
            console.log(`  Found ${parentOptions.length} options for Q${normQ.QuestionNumber} from parent Q${normQ.ParentQuestion} (OptionA-D)`);
          } else {
            // Look for Option{questionNumber} field in parent (e.g., Option1.1.1) - legacy format
        const optionKey = `Option${normQ.QuestionNumber}`;
        const optionData = (parentQ as any)[optionKey];
        if (typeof optionData === 'object' && optionData !== null) {
          // Options are in format { A: "...", B: "...", C: "...", D: "..." }
          const sortedOptions = Object.entries(optionData)
            .sort(([a], [b]) => a.localeCompare(b))
                .map(([_, value]) => {
                  const val = value as string;
                  // Validate option text
                  if (val && typeof val === 'string' && val.trim().length >= 3) {
                    return val.trim();
                  }
                  return null;
                })
                .filter((v): v is string => v !== null);
              
              if (sortedOptions.length >= 2) {
          options.push(...sortedOptions);
                console.log(`  Found ${sortedOptions.length} options for Q${normQ.QuestionNumber} from parent Q${normQ.ParentQuestion} (legacy format)`);
              }
            }
          }
        }
      }
      
      // THIRD: If no options found, try parsing from question text
      if (options.length === 0) {
        const questionText = cleanedQuestionText;
        // Try to extract options from text using regex patterns
        // Improved patterns to handle various formats:
        // - A. text\nB. text\nC. text\nD. text
        // - A: text\nB: text\nC: text\nD: text
        // - A) text\nB) text\nC) text\nD) text
        // - Lines starting with just A, B, C, D (without punctuation)
        const optionPatterns = [
          /^([A-E])[\.\):]\s*(.+?)(?=\n\s*[A-E][\.\):]|\n\s*[A-E]\s*$|$)/gim,  // A. text (multiline)
          /^([A-E])\s+(.+?)(?=\n\s*[A-E][\.\):]|\n\s*[A-E]\s*$|$)/gim,  // A text (without punctuation)
        ];
        
        const extractedOptionsMap = new Map<string, string>(); // Map letter -> text
        
        for (const pattern of optionPatterns) {
          const matches = questionText.matchAll(pattern);
          for (const match of matches) {
            const letter = match[1].toUpperCase();
            const optText = match[2]?.trim();
            if (optText && optText.length >= 3) {
              // Only add if we don't already have this letter, or if this text is longer (more complete)
              const existing = extractedOptionsMap.get(letter);
              if (!existing || optText.length > existing.length) {
                extractedOptionsMap.set(letter, optText);
              }
            }
          }
          if (extractedOptionsMap.size >= 2) {
            break; // Found enough options
          }
        }
        
        // Sort options by letter order (A, B, C, D, E)
        if (extractedOptionsMap.size < 2) {
          // CRITICAL FIX: Handle format where letters are on separate lines followed by option texts
          // Format 1: "A\nB\nC\nD\nOption A text\nOption B text\n..." (all letters first, then all options)
          // Format 2: "A\nOption A text\nB\nOption B text\n..." (letter then option, repeated)
          // This handles cases with blank lines between letters and option texts, and multi-line options
          const lines = questionText.split('\n');
          const letterPositions: Array<{ index: number; letter: string }> = [];
          
          // First pass: Find all letter lines (A, B, C, D, E on their own line, possibly with spaces)
          for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            const letterMatch = trimmed.match(/^([A-E])$/i);
            if (letterMatch) {
              letterPositions.push({ index: i, letter: letterMatch[1].toUpperCase() });
            }
          }
          
          // Second pass: Determine format and extract options
          if (letterPositions.length >= 2) {
            // Check if all letters are consecutive (Format 1: all letters first, then all options)
            const allLettersConsecutive = letterPositions.every((pos, idx) => 
              idx === 0 || pos.index === letterPositions[idx - 1].index + 1
            );
            
            if (allLettersConsecutive && letterPositions.length >= 2) {
              // Format 1: All letters first, then all option texts in order
              // Find where options start (first non-empty, non-letter line after last letter)
              const lastLetterIndex = letterPositions[letterPositions.length - 1].index;
              const optionTextLines: string[] = [];
              
              for (let j = lastLetterIndex + 1; j < lines.length; j++) {
                const trimmed = lines[j].trim();
                if (trimmed && trimmed.length > 0) {
                  // Stop if we hit another letter
                  if (/^([A-E])$/i.test(trimmed)) {
                    break;
                  }
                  optionTextLines.push(trimmed);
                }
              }
              
              // Assign option texts to letters in order
              for (let p = 0; p < letterPositions.length && p < optionTextLines.length; p++) {
                const letterPos = letterPositions[p];
                const optionText = optionTextLines[p].trim();
                if (optionText.length >= 3) {
                  const existing = extractedOptionsMap.get(letterPos.letter);
                  if (!existing || optionText.length > existing.length) {
                    extractedOptionsMap.set(letterPos.letter, optionText);
                  }
                }
              }
            } else {
              // Format 2: Letter then option, repeated (A\nOption A\nB\nOption B\n...)
              for (let p = 0; p < letterPositions.length; p++) {
                const letterPos = letterPositions[p];
                const nextLetterIndex = p < letterPositions.length - 1 
                  ? letterPositions[p + 1].index 
                  : lines.length;
                
                // Collect all non-empty lines between this letter and the next letter
                const optionLines: string[] = [];
                for (let j = letterPos.index + 1; j < nextLetterIndex; j++) {
                  const trimmed = lines[j].trim();
                  if (trimmed && trimmed.length > 0) {
                    // Stop if we hit another letter
                    if (/^([A-E])$/i.test(trimmed)) {
                      break;
                    }
                    optionLines.push(trimmed);
                  }
                }
                
                // Join multi-line options with spaces
                if (optionLines.length > 0) {
                  const optionText = optionLines.join(' ').trim();
                  if (optionText.length >= 3) {
                    const existing = extractedOptionsMap.get(letterPos.letter);
                    if (!existing || optionText.length > existing.length) {
                      extractedOptionsMap.set(letterPos.letter, optionText);
                    }
                  }
                }
              }
            }
          }
        }
        
        if (extractedOptionsMap.size >= 2) {
          const sortedOptions: string[] = [];
          for (const letter of optionLetters) {
            const optText = extractedOptionsMap.get(letter);
            if (optText) {
              sortedOptions.push(optText);
            }
          }
          if (sortedOptions.length >= 2) {
            options.push(...sortedOptions);
            console.log(`  Extracted ${sortedOptions.length} options from question text for Q${normQ.QuestionNumber} (sorted: ${optionLetters.slice(0, sortedOptions.length).join(', ')})`);
          }
        }
      }
      
      // FOURTH: Check for direct options array (fallback)
    if (options.length === 0 && (normQ as any).options) {
      const directOptions = (normQ as any).options;
      if (Array.isArray(directOptions)) {
          const validOptions = directOptions
            .filter((opt: any) => opt && typeof opt === 'string' && opt.trim().length >= 3)
            .map((opt: string) => opt.trim());
          if (validOptions.length >= 2) {
            options.push(...validOptions);
            console.log(`  Found ${validOptions.length} options from options array for Q${normQ.QuestionNumber}`);
          }
        }
      }
    }
    
    // Validate final options - reject if invalid
    if (options.length < 2) {
      // Not enough valid options - clear options array
      options.length = 0;
      
      // CRITICAL: Don't convert type back to 'normal' if we detected MCQ indicators
      // The type should stay as 'multiple-choice' if we detected MCQ keywords/patterns
      // Options can be extracted manually in the editor
      if (type === 'multiple-choice') {
        if (hasMCQKeywords || hasOptionPatterns || hasEmbeddedOptionFormat || hasMultipleOptionLines || hasStandaloneOptions) {
          // Keep as multiple-choice - options might be in text but not extracted properly
          console.log(`  Warning: Q${normQ.QuestionNumber} is MCQ but options weren't extracted. Keeping as multiple-choice. Options may need manual extraction.`);
          console.log(`    Question text preview: "${questionTextTrimmed.substring(0, 200)}..."`);
        } else {
          // No strong MCQ indicators - convert to normal
          type = 'normal';
          console.log(`  Warning: Q${normQ.QuestionNumber} marked as multiple-choice but has insufficient options and no MCQ indicators, converting to normal`);
        }
      }
    } else {
      // CRITICAL: If we successfully extracted options, ensure type is set to multiple-choice
      if (type !== 'multiple-choice' && options.length >= 2) {
        console.log(`  ✓ Successfully extracted ${options.length} options for Q${normQ.QuestionNumber}, setting type to multiple-choice`);
        type = 'multiple-choice';
      }
      // Log warning if any option looks like placeholder
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (opt.toUpperCase() === optionLetters[i] || opt.toUpperCase() === `OPTION ${optionLetters[i]}`) {
          console.log(`  Warning: Q${normQ.QuestionNumber} option ${optionLetters[i]} appears to be placeholder: "${opt}"`);
        }
      }
    }
  }
  
  // Determine final type for subquestions
  if (type === 'subquestion') {
    if (options.length > 0) {
      // Has options from parent → multiple choice
      type = 'multiple-choice';
    } else {
      // No options found → check parent type to determine if it's text-based
      if (normQ.ParentQuestion && parentQuestions) {
        const parentQ = parentQuestions.get(normQ.ParentQuestion);
        if (parentQ) {
          // If parent is "text" type, subquestion is definitely normal text
          if (parentQ.QuestionType === 'text') {
            type = 'normal';
          } else if (parentQ.QuestionType === 'multiple_choice') {
            // Parent is multiple choice but this subquestion has no options
            // Check if question text suggests it's MCQ or text-based
            const questionText = cleanedQuestionText || '';
            const hasMCQLanguage = questionText.toLowerCase().match(/\b(which one|which of|select|choose)\b/i);
            if (!hasMCQLanguage && questionText.length > 0) {
              type = 'normal'; // Text-based subquestion
            }
            // If it has MCQ language but no options, keep as subquestion (might be error in data)
          } else {
            // Unknown parent type → default to normal
            type = 'normal';
          }
        } else {
          // Parent not found → default to normal
          type = 'normal';
        }
      } else {
        // No parent info → default to normal
        type = 'normal';
      }
    }
  }

  // Find linked images - support multiple images per question
  // Priority: question_number (from Poppler LLM) > LinkedDiagram > parent question > partial match
  const matchedImages: Array<{ imageFileId: string; type?: string; label?: string }> = [];
  
  // Helper function to add image if not already added
  const addImageIfNotExists = (fileId: string, type?: string, label?: string) => {
    if (fileId && !matchedImages.some(img => img.imageFileId === fileId)) {
      matchedImages.push({ imageFileId: fileId, type, label });
    }
  };
  
  // 1. PRIMARY: Check by question number directly (images have question_number field from Poppler LLM)
  // This is the most reliable method since Poppler uses LLM to identify which question each diagram belongs to
  // CRITICAL: Only match if question_number in imageMap EXACTLY matches this question's number
  // Do NOT use pattern matching here - it's too aggressive and causes diagrams to attach to wrong questions
  if (normQ.QuestionNumber) {
    // Check direct match ONLY (exact question number)
    const directMatch = imageMap.get(normQ.QuestionNumber);
    if (directMatch) {
      addImageIfNotExists(directMatch);
      console.log(`  ✓ Matched image for Q${normQ.QuestionNumber} by exact question_number match`);
    }
    
    // Check q_ prefix match ONLY (exact match)
    const qPrefixMatch = imageMap.get(`q_${normQ.QuestionNumber}`);
    if (qPrefixMatch && qPrefixMatch !== directMatch) {
      addImageIfNotExists(qPrefixMatch);
      console.log(`  ✓ Matched image for Q${normQ.QuestionNumber} by exact q_ prefix match`);
    }
    
    // REMOVED: Pattern matching was too aggressive and caused the same diagram to match multiple questions
    // If a diagram doesn't have an exact question_number match, it shouldn't be attached
  }
  
  // 2. Check by LinkedDiagram (image filename from normalization stage)
  // LinkedDiagram now contains the image_filename from the images array
  if (normQ.LinkedDiagram) {
    // Try direct match first
    const linkedMatch = imageMap.get(normQ.LinkedDiagram);
    if (linkedMatch) {
      addImageIfNotExists(linkedMatch);
      console.log(`  ✓ Matched image for Q${normQ.QuestionNumber} by LinkedDiagram filename: "${normQ.LinkedDiagram}"`);
    } else {
      // Try matching by extracting question number from filename (e.g., "q_1_4_diagram.png" -> "1.4")
      // This handles cases where LinkedDiagram is a filename but imageMap key is question_number
      const filenameMatch = normQ.LinkedDiagram.match(/q[_-](\d+(?:[._]\d+)*)/i);
      if (filenameMatch) {
        const extractedQNum = filenameMatch[1].replace(/_/g, '.');
        const extractedMatch = imageMap.get(extractedQNum);
        if (extractedMatch) {
          addImageIfNotExists(extractedMatch);
          console.log(`  ✓ Matched image for Q${normQ.QuestionNumber} by extracting question number from LinkedDiagram: "${extractedQNum}"`);
        }
      }
    }
  }
  
  // 3. FALLBACK: If no match found and we have page information, try page-based matching
  // This helps when images don't have question_number but are on the same page as questions
  if (matchedImages.length === 0 && pageImageMap) {
    // Try to find page number from raw_extraction, structured data, or question text
    let questionPage: number | undefined;

    // Method 1: Check raw_extraction for page info
    if (document.raw_extraction && document.raw_extraction.length > 0) {
      // Search through raw_extraction pages for text blocks containing this question number
      for (const pageData of document.raw_extraction) {
        const pageNum = pageData.page || 0;
        // Check if any text block on this page contains the question number
        const hasQuestionNumber = pageData.text_blocks?.some((block: any) =>
          block.text && block.text.includes(normQ.QuestionNumber)
        );
        if (hasQuestionNumber) {
          questionPage = pageNum;
          break;
        }
      }
    }

    // Method 2: Check structured format for page info
    if (!questionPage && document.structured?.sections) {
      for (const section of document.structured.sections) {
        for (const structQ of section.questions || []) {
          if (structQ.number === normQ.QuestionNumber && (structQ as any).page) {
            questionPage = (structQ as any).page;
            break;
          }
          for (const subQ of structQ.subquestions || []) {
            if (subQ.number === normQ.QuestionNumber && (subQ as any).page) {
              questionPage = (subQ as any).page;
              break;
            }
          }
        }
      }
    }

    // If we found a page and it has images, attach the first image as a fallback
    // This is a spatial heuristic - images on the same page likely belong to questions on that page
    if (questionPage && pageImageMap.has(questionPage)) {
      const pageImages = pageImageMap.get(questionPage)!;
      if (pageImages.length > 0) {
        // Use the first image on the page
        addImageIfNotExists(pageImages[0]);
        console.log(`  ⚠️ Fallback: Matched image for Q${normQ.QuestionNumber} by page ${questionPage} (spatial heuristic)`);
      }
    }
  }

  // 4. REMOVED: Parent inheritance was too aggressive
  // Subquestions should only get diagrams if they have their own LinkedDiagram or question_number match
  // Don't automatically inherit from parent - this was causing diagrams to be attached to wrong questions
  
  // 5. REMOVED: Partial matching was too aggressive and caused diagrams to be matched to wrong questions
  // Only use exact matches from steps 1-3 above
  // If no exact match found, don't force-match diagrams to questions
  
  // Get primary imageFileId (first image) for backward compatibility
  const imageFileId = matchedImages.length > 0 ? matchedImages[0].imageFileId : undefined;

  // Calculate order for sorting
  const order = calculateOrder(normQ.QuestionNumber);
  
  // DEBUG: Log order calculation
  console.log(`[Order Calculation] Q${normQ.QuestionNumber}: calculated order=${order}, parts=${normQ.QuestionNumber.split('.').join(',')}`);

  // Set hasImage flag - only true if we actually found an image file
  // Don't set hasImage just because LinkedDiagram exists - we need an actual imageFileId
  const hasImage = !!imageFileId;
  
  // NOW determine if this should be a diagram type - only if we actually found an image
  // Override the type if we found an image and it's not already a special type
  // CRITICAL: Never override if it's already multiple-choice or true-false (MCQ questions can have diagrams too)
  const isSpecialType = type === 'multiple-choice' || type === 'true-false' || type === 'subquestion';

  // Check if question explicitly references diagrams/images in text
  const questionTextLower = cleanedQuestionText.toLowerCase();
  const referencesDiagram = questionTextLower.includes('diagram') ||
                            questionTextLower.includes('figure') ||
                            questionTextLower.includes('image') ||
                            questionTextLower.includes('refer to') ||
                            questionTextLower.includes('study the') ||
                            questionTextLower.includes('look at');

  if (hasImage) {
    // If we have an image and it's a normal question that references diagrams, make it a diagram type
    if (type === 'normal' && !isSpecialType && referencesDiagram &&
        normQ.QuestionType !== 'multiple_choice' && normQ.QuestionType !== 'true_false' && normQ.QuestionType !== 'true-false') {
      type = 'diagram';
      console.log(`  ✓ Setting type to 'diagram' for Q${normQ.QuestionNumber} (has image + references diagram)`);
    }
    // Also set to diagram if QuestionType explicitly says so
    if (normQ.QuestionType === 'diagram' || normQ.QuestionType === 'graph' || normQ.QuestionType === 'table') {
      type = 'diagram';
    }
  }
  
  // DEBUG: Log final type decision
  console.log(`[Type Decision] Q${normQ.QuestionNumber}: final type=${type}, hasImage=${hasImage}, options.length=${options.length}, isSpecialType=${isSpecialType}`);
  
  // DEBUG: Log image matching results
  if (normQ.LinkedDiagram || imageFileId) {
    console.log(`[Image Matching] Q${normQ.QuestionNumber}:`, {
      LinkedDiagram: normQ.LinkedDiagram || 'none',
      imageFileId: imageFileId || 'NOT FOUND',
      hasImage,
      type: type,
      parentQuestion: normQ.ParentQuestion || 'none',
      imageMapKeys: Array.from(imageMap.keys()).filter(k => k.includes(normQ.QuestionNumber) || (normQ.ParentQuestion && k.includes(normQ.ParentQuestion))).slice(0, 5)
    });
  }

  const question: EditorQuestion = {
    paperId,
    number: normQ.QuestionNumber,
    type,
    text: options.length >= 2 ? cleanQuestionTextOfOptions(cleanedQuestionText, options) : cleanedQuestionText,
    marks: normQ.Marks || 0,
    section: normQ.Section,
    order,
    hasImage,
    imageFileId,
    isHeader, // Mark header questions for better formatting
  };
  
  // DEBUG: Log final question text being saved with comprehensive comparison
  console.log(`[Question Text Debug] ========================================`);
  console.log(`[Question Text Debug] Final question for Q${normQ.QuestionNumber}:`);
  console.log(`  - Type: ${type}`);
  console.log(`  - Text from JSON (normQ.QuestionText): "${(normQ.QuestionText || '').substring(0, 150)}${(normQ.QuestionText || '').length > 150 ? '...' : ''}"`);
  console.log(`  - Text being saved (question.text): "${(question.text || '').substring(0, 150)}${(question.text || '').length > 150 ? '...' : ''}"`);
  console.log(`  - Full text length: ${(question.text || '').length}`);
  console.log(`  - isHeader: ${isHeader}`);
  console.log(`  - hasImage: ${hasImage}`);
  console.log(`  - imageFileId: ${imageFileId || 'none'}`);
  console.log(`  - order: ${order}`);
  
  // Check if text matches
  if (normQ.QuestionText !== question.text) {
    console.error(`  ⚠️⚠️⚠️ TEXT MISMATCH: JSON text differs from saved text!`);
    console.error(`     JSON: "${normQ.QuestionText || ''}"`);
    console.error(`     Saved: "${question.text || ''}"`);
  }

  // Add parent question for subquestions
  if (normQ.ParentQuestion) {
    question.parentQuestion = normQ.ParentQuestion;
  }

  // Add options for multiple choice
  if (options.length > 0) {
    question.options = options;
  }

  // Add diagram data if image exists (backward compatibility - primary image)
  if (imageFileId) {
    question.diagramData = {
      imageFileId,
      label: normQ.LinkedDiagram || undefined,
      title: normQ.Title || undefined,
    };
  }
  
  // Add multiple images if more than one found
  if (matchedImages.length > 1) {
    question.images = matchedImages.map(img => ({
      imageFileId: img.imageFileId,
      type: img.type,
      label: img.label,
    }));
    console.log(`  ✓ Q${normQ.QuestionNumber} has ${matchedImages.length} images: ${matchedImages.map(img => img.type || 'unknown').join(', ')}`);
  } else if (matchedImages.length === 1) {
    // Single image - store in images array for consistency
    question.images = [{
      imageFileId: matchedImages[0].imageFileId,
      type: matchedImages[0].type,
      label: matchedImages[0].label,
    }];
  }

  // Add extract text if this is an extract question
  if (normQ.QuestionType === 'extract' && (normQ as any).ExtractText) {
    question.extractText = (normQ as any).ExtractText;
  }

  return question;
}


/**
 * Save question to database
 */
async function saveQuestion(
  databases: any,
  paperId: string,
  question: EditorQuestion
): Promise<void> {
  // Check if question exists
  const existing = await databases.listDocuments(
    appwriteConfig.databaseId,
    'questions',
    [
      Query.equal('paperId', paperId),
      Query.equal('number', question.number),
    ]
  );

  // Use the order value directly (calculateOrder already returns an integer)
  // Ensure order is a valid integer (should already be from calculateOrder)
  const orderValue = Math.round(question.order || 0);
  
  // Validate order value is reasonable (should be >= 1000000 for Q1, etc.)
  if (orderValue < 0 || orderValue > 999999999) {
    console.warn(`⚠️ Invalid order value for Q${question.number}: ${orderValue}, recalculating...`);
    const recalculatedOrder = calculateOrder(question.number);
    question.order = recalculatedOrder;
  }
  
  const questionData: any = {
    paperId: question.paperId,
    number: question.number,
    question: question.text.substring(0, 32767), // Appwrite limit
    answer: question.answer || '(No answer provided)',
    marks: Math.round(question.marks || 0), // Ensure integer
    type: question.type,
    hasImage: question.hasImage || false,
    order: Math.round(question.order || 0), // Ensure integer, use recalculated if needed
  };
  
  // DEBUG: Log what's being saved to database with full text
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Question Save] ========================================`);
    console.log(`[Question Save] Saving Q${question.number} to database:`);
    console.log(`  - number: "${questionData.number}"`);
    console.log(`  - order: ${questionData.order}`);
    console.log(`  - text (first 200 chars): "${questionData.question.substring(0, 200)}${questionData.question.length > 200 ? '...' : ''}"`);
    console.log(`  - full text length: ${questionData.question.length}`);
    console.log(`  - type: ${questionData.type}`);
    console.log(`  - hasImage: ${questionData.hasImage}`);
    console.log(`  - imageFileId: ${question.imageFileId || 'none'}`);
    console.log(`[Question Save] ========================================`);
  }

  // Add optional fields - try to save them, but catch errors if they don't exist in schema
  // These fields need to be added to the questions collection schema
  if (question.imageFileId) {
    questionData.imageFileId = question.imageFileId;
  }
  if (question.parentQuestion) {
    questionData.parentQuestion = question.parentQuestion;
  }
  if (question.options && question.options.length > 0) {
    questionData.options = JSON.stringify(question.options);
  }
  if (question.diagramData) {
    questionData.diagramData = JSON.stringify(question.diagramData);
  }
  if (question.images && question.images.length > 0) {
    questionData.images = JSON.stringify(question.images);
  }
  if (question.tableData) {
    questionData.tableData = JSON.stringify(question.tableData);
  }
  if (question.graphData) {
    questionData.graphData = JSON.stringify(question.graphData);
  }
  if (question.extractText) {
    questionData.extractText = question.extractText.substring(0, 32767);
  }

  // Save or update - try to save all fields, but handle errors for missing attributes
  try {
    if (existing.documents.length > 0) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        'questions',
        existing.documents[0].$id,
        questionData
      );
    } else {
      await databases.createDocument(
        appwriteConfig.databaseId,
        'questions',
        ID.unique(),
        questionData
      );
    }
  } catch (error: any) {
    // If error is about unknown attributes, try saving with core fields + options/imageFileId
    if (error.message && error.message.includes('Unknown attribute')) {
      const unknownAttr = error.message.match(/Unknown attribute[:\s]+"?(\w+)"?/i);
      const unknownAttrName = unknownAttr ? unknownAttr[1] : 'unknown';
      const isOptionsError = unknownAttrName.toLowerCase() === 'options' || error.message.toLowerCase().includes('"options"') || error.message.toLowerCase().includes("'options'");
      
      console.warn(`Attribute "${unknownAttrName}" not in schema for question ${question.number}, retrying without it`);
      
      const basicData: any = {
        paperId: questionData.paperId,
        number: questionData.number,
        question: questionData.question,
        answer: questionData.answer,
        marks: questionData.marks,
        type: questionData.type,
        hasImage: questionData.hasImage,
        order: questionData.order,
      };
      
      // Try to include options and imageFileId (these should exist in schema)
      // Skip options if that's the error
      if (questionData.options && !isOptionsError) {
        basicData.options = questionData.options;
      } else if (isOptionsError && question.options && question.options.length > 0) {
        console.warn(`  ⚠️ Options field doesn't exist in schema - cannot save ${question.options.length} options for Q${question.number}`);
        console.warn(`  Please add "options" (String, 32767) attribute to questions collection schema`);
      }
      
      // Try to include diagramData if it's not the error
      const isDiagramDataError = unknownAttrName.toLowerCase() === 'diagramdata' || error.message.toLowerCase().includes('"diagramdata"') || error.message.toLowerCase().includes("'diagramdata'");
      if (questionData.diagramData && !isDiagramDataError) {
        basicData.diagramData = questionData.diagramData;
      } else if (isDiagramDataError && question.diagramData) {
        console.warn(`  ⚠️ diagramData field doesn't exist in schema - cannot save diagram data for Q${question.number}`);
        console.warn(`  Please add "diagramData" (String, 32767) attribute to questions collection schema`);
        // Still save imageFileId so DiagramViewer can work with fallback
        if (question.imageFileId) {
          basicData.imageFileId = question.imageFileId;
        }
      }
      if (question.imageFileId && unknownAttrName !== 'imageFileId') {
        basicData.imageFileId = question.imageFileId;
      }
      if (question.parentQuestion && unknownAttrName !== 'parentQuestion') {
        basicData.parentQuestion = question.parentQuestion;
      }
      
      // Try saving again
      try {
        if (existing.documents.length > 0) {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            'questions',
            existing.documents[0].$id,
            basicData
          );
        } else {
          await databases.createDocument(
            appwriteConfig.databaseId,
            'questions',
            ID.unique(),
            basicData
          );
        }
      } catch (retryError: any) {
        // If still fails, save absolute minimum
        const minimalData: any = {
          paperId: questionData.paperId,
          number: questionData.number,
          question: questionData.question,
          answer: questionData.answer,
          marks: questionData.marks,
          type: questionData.type,
          hasImage: false,
          order: questionData.order,
        };
        if (existing.documents.length > 0) {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            'questions',
            existing.documents[0].$id,
            minimalData
          );
        } else {
          await databases.createDocument(
            appwriteConfig.databaseId,
            'questions',
            ID.unique(),
            minimalData
          );
        }
        throw retryError; // Re-throw to log the issue
      }
    } else {
      throw error; // Re-throw if it's a different error
    }
  }
}

/**
 * Extract subject from paper name
 */
function extractSubjectFromName(name: string): string {
  const subjects = [
    'Life Sciences', 'Mathematics', 'Physical Sciences', 'English',
    'History', 'Geography', 'Accounting', 'Economics'
  ];
  for (const subj of subjects) {
    if (name.includes(subj)) {
      return subj;
    }
  }
  return 'Unknown';
}

/**
 * Extract year from paper name
 */
function extractYearFromName(name: string): string {
  const yearMatch = name.match(/\b(20\d{2}|19\d{2})\b/);
  return yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
}

