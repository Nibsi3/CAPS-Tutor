import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const databases = getServerDatabases();
    const { id: paperId } = await params;
    const body = await request.json();

    console.log('PUT /structure - Updating paper structure for paperId:', paperId);

    // Store paperStructure in generatedQuestions array as JSON string
    // The pastPapers collection doesn't have a paperStructure attribute
    // We'll store it in generatedQuestions[0] as a JSON string
    const updateData: any = {
      status: 'Draft', // Mark as draft when structure is being edited
    };

    // Store paperStructure as JSON string in generatedQuestions array
    if (body && typeof body === 'object') {
      const structureJson = JSON.stringify(body);
      updateData.generatedQuestions = [structureJson];
    }

    // Update the past paper document with the paper structure
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId,
      updateData
    );

    return NextResponse.json({
      success: true,
      paper: updated,
      message: 'Paper structure updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating paper structure:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update paper structure',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const databases = getServerDatabases();
    const { id: paperId } = await params;

    const paper = await databases.getDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId
    );

    // First, try to load questions from the questions collection (new structure)
    try {
      console.log(`[Structure API] 🔍 Loading questions from database for paperId: ${paperId}`);
      
      const questionsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questions',
        [
          Query.equal('paperId', paperId),
          Query.orderAsc('order'), // Sort by order field
        ]
      );
      
      console.log(`[Structure API] 📊 Database query returned ${questionsResponse.documents.length} documents`);
      
      // If no questions found, try to see if there are any questions at all for debugging
      if (questionsResponse.documents.length === 0) {
        console.warn(`[Structure API] ⚠️ No questions found for paperId: ${paperId}`);
        console.warn(`[Structure API] ⚠️ Checking if there are any questions in the collection at all...`);
        try {
          const allQuestions = await databases.listDocuments(
            appwriteConfig.databaseId,
            'questions',
            [Query.limit(5)] // Just get a few to check
          );
          console.warn(`[Structure API] ⚠️ Found ${allQuestions.documents.length} total questions in collection (showing first 5 paperIds):`);
          allQuestions.documents.slice(0, 5).forEach((q: any, idx: number) => {
            console.warn(`[Structure API]   Question ${idx + 1}: paperId=${q.paperId}, number=${q.number}`);
          });
        } catch (debugError: any) {
          console.error(`[Structure API] ❌ Error checking questions collection:`, debugError);
        }
      }

      console.log(`[Structure API] 🔍 Querying questions for paperId: ${paperId}`);
      console.log(`[Structure API] 📊 Query result: ${questionsResponse.documents.length} questions found`);
      
      if (questionsResponse.documents.length > 0) {
        console.log(`[Structure API] ✅ Found ${questionsResponse.documents.length} questions in questions collection for paperId: ${paperId}`);
        
        // Log sample questions to verify data
        const sampleQuestions = questionsResponse.documents.slice(0, 3);
        sampleQuestions.forEach((q: any, idx: number) => {
          console.log(`[Structure API] Sample question ${idx + 1}:`, {
            id: q.$id,
            number: q.number,
            questionField: q.question ? `[${q.question.length} chars] ${q.question.substring(0, 50)}...` : 'MISSING',
            questionTextField: q.questionText ? `[${q.questionText.length} chars]` : 'MISSING',
            marks: q.marks,
            type: q.type,
            hasImage: q.hasImage,
            imageFileId: q.imageFileId || 'none',
          });
        });
        
        // Convert database questions to editor format
        const editorQuestions = questionsResponse.documents
          .filter((q: any) => {
            // Filter out invalid question numbers (section headers, malformed numbers)
            const number = String(q.number || '').trim();
            
            // Skip if it's a section header
            if (/^section\s*[abc]/i.test(number) || number.toLowerCase() === 'c' || number.toLowerCase() === 'b' || number.toLowerCase() === 'a') {
              console.warn(`[Structure API] ⚠️ Filtering out section header: "${number}"`);
              return false;
            }
            
            // Skip question number '0', 'null', 'undefined' (invalid)
            if (number === '0' || number === 'null' || number === 'undefined') {
              console.warn(`[Structure API] ⚠️ Filtering out invalid question number: "${number}"`);
              return false;
            }
            
            // Skip if it starts with a dot (malformed like ".1.7")
            if (number.startsWith('.')) {
              console.warn(`[Structure API] ⚠️ Filtering out malformed question number: "${number}"`);
              return false;
            }
            
            // Skip if it's not a valid question number format (should start with digit)
            if (!/^\d/.test(number)) {
              console.warn(`[Structure API] ⚠️ Filtering out invalid question number: "${number}"`);
              return false;
            }
            
            return true;
          })
          .map((q: any) => {
            // IMPORTANT: Database stores as 'question' field, not 'questionText'
            const questionText = q.question || q.questionText || q.text || q.content || q.body || '';
            
            console.log(`[Structure API] 📝 Question ${q.number} text from DB:`, {
              hasQuestion: !!q.question,
              hasQuestionText: !!q.questionText,
              hasText: !!q.text,
              textLength: questionText.length,
              textPreview: questionText.substring(0, 50),
              isPlaceholder: questionText === '(No question text)'
            });
            
            if (!questionText || questionText.trim() === '' || questionText === '(No question text)') {
              console.warn(`[Structure API] ⚠️ Question ${q.number} has empty or placeholder text! DB fields:`, {
                question: q.question?.substring(0, 50),
                questionText: q.questionText?.substring(0, 50),
                allKeys: Object.keys(q)
              });
            }
            
            // Filter out entries that look like headers/metadata rather than questions
            const questionTextLower = questionText.toLowerCase();
            const looksLikeHeader = 
              questionTextLower.includes('memo') ||
              questionTextLower.includes('paper') ||
              questionTextLower.includes('nov ') ||
              questionTextLower.includes('feb ') ||
              questionTextLower.includes('mar ') ||
              questionTextLower.includes('may ') ||
              questionTextLower.includes('jun ') ||
              questionTextLower.includes('sep ') ||
              questionTextLower.includes('oct ') ||
              (questionTextLower.length < 20 && !questionTextLower.includes('?')) ||
              /^(accounting|mathematics|physics|chemistry|biology|life sciences|physical sciences|english|afrikaans)/i.test(questionText);
            
            if (looksLikeHeader && questionText.length < 100) {
              console.warn(`[Structure API] ⚠️ Filtering out entry that looks like header/metadata: "${questionText.substring(0, 50)}" (question ${q.number})`);
              return null; // Return null to filter it out
            }
            
            // Map 'free-text' to 'normal' (legacy type name)
            let detectedType = q.type || 'normal';
            if (detectedType === 'free-text') {
              detectedType = 'normal';
            }
            
            let questionPrompt = questionText;
            let extractedOptions: string[] = [];
            
            // ALWAYS detect multiple-choice questions by checking for option patterns
            // This works for both main questions and sub-questions
            // Only skip if type is already explicitly set to something other than 'normal' or 'free-text'
            const shouldCheckMultipleChoice = !detectedType || detectedType === 'normal' || detectedType === 'free-text';
            
            if (shouldCheckMultipleChoice) {
              // Look for option patterns: A., B., C., D. or A), B), C), D)
              // Match inline options (e.g., "text A. option1 B. option2 C. option3 D. option4")
              // More flexible regex that handles various formats
              const optionPatterns = [
                /\b([A-D])[\.\)]\s+([^A-D\.\)]+?)(?=\s+[A-D][\.\)]|$)/gi,  // Standard: A. text B. text
                /\b([A-D])[\.\)]\s+([A-Z][^A-D\.\)]*?)(?=\s+[A-D][\.\)]|$)/gi,  // Capital start: A. Text B. Text
              ];
              
              let matches: Array<{ letter: string; text: string; index: number }> = [];
              
              // Try each pattern
              for (const pattern of optionPatterns) {
                pattern.lastIndex = 0; // Reset regex
                let match;
                const tempMatches: Array<{ letter: string; text: string; index: number }> = [];
                
                while ((match = pattern.exec(questionText)) !== null) {
                  const optionText = match[2].trim();
                  // Skip if option text is too short (likely false positive) or if it's just a single character
                  if (optionText.length > 1 && !/^[A-Z]$/.test(optionText)) {
                    tempMatches.push({
                      letter: match[1].toUpperCase(),
                      text: optionText,
                      index: match.index
                    });
                  }
                }
                
                // Use the pattern that found the most matches
                if (tempMatches.length > matches.length) {
                  matches = tempMatches;
                }
              }
              
              // Also try a simpler approach: look for 2+ consecutive A-D patterns
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
              
              // If we found 2+ options, it's a multiple-choice question
              if (matches.length >= 2) {
                detectedType = 'multiple-choice';
                
                // Find where options start (first match index)
                const firstOptionIndex = matches[0].index;
                
                // Extract question prompt (everything before first option)
                questionPrompt = questionText.substring(0, firstOptionIndex).trim();
                
                // Extract options in order (A, B, C, D)
                const optionsMap: Record<string, string> = {};
                for (const m of matches) {
                  // If we already have this letter, append (for cases like "A. text A. more text")
                  if (optionsMap[m.letter]) {
                    optionsMap[m.letter] += ' ' + m.text;
                  } else {
                    optionsMap[m.letter] = m.text;
                  }
                }
                
                // Build options array in order (A, B, C, D)
                extractedOptions = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, matches.length).map(letter => {
                  return optionsMap[letter] || '';
                }).filter(opt => opt !== '');
                
                console.log(`[Structure API] 🔍 Detected multiple-choice for question ${q.number}:`, {
                  promptLength: questionPrompt.length,
                  promptPreview: questionPrompt.substring(0, 100),
                  optionCount: extractedOptions.length,
                  options: extractedOptions.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt.substring(0, 50)}`),
                });
              }
            }
            
            // Check for diagrams - if hasImage or imageFileId, set type to 'diagram'
            const hasDiagram = !!(q.hasImage || q.imageFileId);
            let finalType = detectedType;
            
            // If question has a diagram/image, set type to 'diagram' (unless it's already multiple-choice)
            if (hasDiagram && finalType !== 'multiple-choice') {
              finalType = 'diagram';
              console.log(`[Structure API] 📷 Question ${q.number} has diagram - setting type to 'diagram'`);
            }
            
            // Load options from database if stored as JSON string
            let storedOptions: string[] = [];
            if (q.options) {
              try {
                if (typeof q.options === 'string') {
                  storedOptions = JSON.parse(q.options);
                } else if (Array.isArray(q.options)) {
                  storedOptions = q.options;
                }
              } catch (e) {
                console.warn(`[Structure API] ⚠️ Failed to parse options for question ${q.number}:`, e);
              }
            }
            
            // Use stored options if available, otherwise use extracted options
            const finalOptions = storedOptions.length > 0 ? storedOptions : extractedOptions;
            
            // Load all features from database
            let storedTableData: any = null;
            let storedGraphData: any = null;
            let storedCoordinateSystem: any = null;
            
            if (q.tableData) {
              try {
                storedTableData = typeof q.tableData === 'string' ? JSON.parse(q.tableData) : q.tableData;
              } catch (e) {
                console.warn(`[Structure API] ⚠️ Failed to parse tableData for question ${q.number}:`, e);
              }
            }
            
            if (q.graphData) {
              try {
                storedGraphData = typeof q.graphData === 'string' ? JSON.parse(q.graphData) : q.graphData;
              } catch (e) {
                console.warn(`[Structure API] ⚠️ Failed to parse graphData for question ${q.number}:`, e);
              }
            }
            
            if (q.coordinateSystem) {
              try {
                storedCoordinateSystem = typeof q.coordinateSystem === 'string' ? JSON.parse(q.coordinateSystem) : q.coordinateSystem;
              } catch (e) {
                console.warn(`[Structure API] ⚠️ Failed to parse coordinateSystem for question ${q.number}:`, e);
              }
            }
            
            // Convert to editor Question format - ensure all required fields
            const editorQuestion: any = {
              id: q.$id || `question-${q.number}`,
              number: String(q.number || '0'),
              text: questionPrompt, // Use extracted prompt (without options)
              instructionText: q.instructionText || q.instruction_text || '',
              marks: typeof q.marks === 'number' ? q.marks : parseInt(String(q.marks)) || 0,
              type: finalType as any, // Use final type (diagram or multiple-choice or normal)
              subQuestions: [] as any[], // Will be populated when building hierarchy
              hasDiagram: hasDiagram,
              imageFileId: q.imageFileId || undefined,
            };
            
            // FEATURE: Multiple-choice options
            if (finalType === 'multiple-choice' && finalOptions.length > 0) {
              editorQuestion.options = finalOptions;
              console.log(`[Structure API] ✅ Question ${q.number} is multiple-choice with ${finalOptions.length} options`);
            }
            
            // FEATURE: Diagram label
            if (finalType === 'diagram' && q.diagramLabel) {
              editorQuestion.diagramLabel = q.diagramLabel;
              console.log(`[Structure API] 📷 Question ${q.number} has diagramLabel: "${q.diagramLabel}"`);
            }
            
            // FEATURE: Extract text
            if (finalType === 'extract' && q.extractText) {
              editorQuestion.extractText = q.extractText;
              console.log(`[Structure API] 📄 Question ${q.number} has extractText`);
            }
            
            // FEATURE: Table data
            if (finalType === 'table' && storedTableData) {
              editorQuestion.tableData = storedTableData;
              if (q.tableSubject) editorQuestion.tableSubject = q.tableSubject;
              if (q.tableType) editorQuestion.tableType = q.tableType;
              console.log(`[Structure API] 📊 Question ${q.number} has tableData`);
            }
            
            // FEATURE: Graph data
            if (finalType === 'graph' && storedGraphData) {
              editorQuestion.graphData = storedGraphData;
              if (q.graphSubject) editorQuestion.graphSubject = q.graphSubject;
              if (q.graphType) editorQuestion.graphType = q.graphType;
              if (storedCoordinateSystem) editorQuestion.coordinateSystem = storedCoordinateSystem;
              console.log(`[Structure API] 📈 Question ${q.number} has graphData`);
            }
            
            // Log diagram info
            if (editorQuestion.hasDiagram || editorQuestion.imageFileId) {
              console.log(`[Structure API] 📷 Question ${q.number} has diagram: type=${editorQuestion.type}, imageFileId=${editorQuestion.imageFileId || 'none'}`);
            }

            // Validate question has required fields
            if (!editorQuestion.text || editorQuestion.text.trim() === '') {
              console.warn(`[Structure API] ⚠️ Question ${editorQuestion.number} has empty text - ID: ${q.$id}`);
            } else {
              console.log(`[Structure API] ✅ Question ${editorQuestion.number} has text (${editorQuestion.text.length} chars), type: ${editorQuestion.type}`);
            }

            return editorQuestion;
          })
          .filter((q: any) => q !== null); // Filter out null entries (header/metadata)

        // Count questions with text
        const questionsWithText = editorQuestions.filter(q => q.text && q.text.trim() !== '' && q.text !== '(No question text)').length;
        console.log(`[Structure API] Converted ${editorQuestions.length} questions: ${questionsWithText} with text, ${editorQuestions.length - questionsWithText} empty`);

        // Group questions into sections (A, B, C) based on question number
        const sections: any[] = [
          {
            id: 'section-a',
            label: 'Section A',
            number: 1,
            questions: [],
            totalMarks: 0,
          },
          {
            id: 'section-b',
            label: 'Section B',
            number: 2,
            questions: [],
            totalMarks: 0,
          },
          {
            id: 'section-c',
            label: 'Section C',
            number: 3,
            questions: [],
            totalMarks: 0,
          },
        ];

        // Build question hierarchy: recursively group sub-questions under their parent questions
        // e.g., "1.1" under "1", "1.1.1" under "1.1", "1.1.2" under "1.1", etc.
        const questionMap: Record<string, any> = {}; // Map question numbers to question objects
        const topLevelQuestions: any[] = [];
        
        // First pass: create a map of all questions by their number
        for (const question of editorQuestions) {
          questionMap[question.number] = question;
        }
        
        // Second pass: build hierarchy by finding parent for each question
        for (const question of editorQuestions) {
          const numberParts = question.number.split('.');
          
          if (numberParts.length === 1) {
            // Top-level question (e.g., "1", "2", "3")
            topLevelQuestions.push(question);
          } else {
            // Sub-question - find its direct parent
            // For "1.1.1", parent is "1.1"
            // For "1.1", parent is "1"
            const parentNumber = numberParts.slice(0, -1).join('.');
            const parentQuestion = questionMap[parentNumber];
            
            if (parentQuestion) {
              // Parent exists - add as sub-question
              if (!parentQuestion.subQuestions) {
                parentQuestion.subQuestions = [];
              }
              parentQuestion.subQuestions.push(question);
            } else {
              // Parent doesn't exist - this is an orphaned sub-question
              // We'll handle these later by creating placeholder parents
              console.warn(`[Structure API] ⚠️ Question ${question.number} has no parent ${parentNumber}`);
            }
          }
        }
        
        // Third pass: sort sub-questions within each question recursively
        function sortSubQuestions(question: any) {
          if (question.subQuestions && question.subQuestions.length > 0) {
            question.subQuestions.sort((a: any, b: any) => {
              const aParts = a.number.split('.').map((n: string) => parseFloat(n) || 0);
              const bParts = b.number.split('.').map((n: string) => parseFloat(n) || 0);
              
              for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aVal = aParts[i] || 0;
                const bVal = bParts[i] || 0;
                if (aVal !== bVal) return aVal - bVal;
              }
              return 0;
            });
            
            // Recursively sort nested sub-questions
            for (const subQ of question.subQuestions) {
              sortSubQuestions(subQ);
            }
            
            console.log(`[Structure API] Question ${question.number} has ${question.subQuestions.length} sub-questions: ${question.subQuestions.map((sq: any) => sq.number).join(', ')}`);
          }
        }
        
        // Sort all top-level questions and their nested sub-questions
        for (const question of topLevelQuestions) {
          sortSubQuestions(question);
        }
        
        // Track assigned questions to avoid duplicates
        const assignedQuestions = new Set<string>();
        
        // Handle orphaned sub-questions (sub-questions whose parent doesn't exist)
        // Find all questions that weren't added to the hierarchy
        const processedQuestions = new Set<string>();
        function markProcessed(question: any) {
          processedQuestions.add(question.number);
          if (question.subQuestions) {
            for (const subQ of question.subQuestions) {
              markProcessed(subQ);
            }
          }
        }
        for (const question of topLevelQuestions) {
          markProcessed(question);
        }
        
        // Find orphaned questions
        const orphanedQuestions = editorQuestions.filter(q => !processedQuestions.has(q.number));
        
        // Group orphaned questions by their parent number
        const orphanedByParent: Record<string, any[]> = {};
        for (const orphan of orphanedQuestions) {
          const numberParts = orphan.number.split('.');
          if (numberParts.length > 1) {
            const parentNumber = numberParts.slice(0, -1).join('.');
            if (!orphanedByParent[parentNumber]) {
              orphanedByParent[parentNumber] = [];
            }
            orphanedByParent[parentNumber].push(orphan);
          }
        }
        
        // Create placeholder parents for orphaned sub-questions
        for (const [parentNumber, orphanedSubQuestions] of Object.entries(orphanedByParent)) {
          // Find which section this parent number would belong to
          const mainQNum = parseFloat(parentNumber.split('.')[0]) || 0;
          let targetSectionIndex = 0;
          
          if (mainQNum > 40 && sections.length > 2) {
            targetSectionIndex = 2;
          } else if (mainQNum > 20 && sections.length > 1) {
            targetSectionIndex = 1;
          } else {
            targetSectionIndex = 0;
          }
          
          // Create a placeholder parent question
          const placeholderParent: any = {
            id: `placeholder-${parentNumber}`,
            number: parentNumber,
            text: `Question ${parentNumber}`, // Placeholder text
            instructionText: '',
            marks: 0,
            type: 'normal' as any,
            subQuestions: orphanedSubQuestions,
            hasDiagram: false,
          };
          
          // Sort and recursively process sub-questions
          sortSubQuestions(placeholderParent);
          
          // Check if this placeholder parent should be nested under another parent
          const parentParts = parentNumber.split('.');
          if (parentParts.length > 1) {
            // This placeholder is itself a sub-question - find its parent
            const grandParentNumber = parentParts.slice(0, -1).join('.');
            const grandParent = questionMap[grandParentNumber];
            if (grandParent) {
              if (!grandParent.subQuestions) {
                grandParent.subQuestions = [];
              }
              grandParent.subQuestions.push(placeholderParent);
              sortSubQuestions(grandParent);
              console.log(`[Structure API] ⚠️ Created placeholder parent ${parentNumber} (nested under ${grandParentNumber}) with ${orphanedSubQuestions.length} orphaned sub-questions: ${orphanedSubQuestions.map((sq: any) => sq.number).join(', ')}`);
            } else {
              // Grandparent doesn't exist - add as top-level
              if (!assignedQuestions.has(placeholderParent.number)) {
                topLevelQuestions.push(placeholderParent);
                console.log(`[Structure API] ⚠️ Created placeholder parent ${parentNumber} (top-level) with ${orphanedSubQuestions.length} orphaned sub-questions: ${orphanedSubQuestions.map((sq: any) => sq.number).join(', ')}`);
              }
            }
          } else {
            // Top-level placeholder
            if (!assignedQuestions.has(placeholderParent.number)) {
              topLevelQuestions.push(placeholderParent);
              console.log(`[Structure API] ⚠️ Created placeholder parent ${parentNumber} (top-level) with ${orphanedSubQuestions.length} orphaned sub-questions: ${orphanedSubQuestions.map((sq: any) => sq.number).join(', ')}`);
            }
          }
        }
        
        // Re-assign all top-level questions to sections (including newly created placeholders)
        sections.forEach(s => s.questions = []); // Clear sections
        for (const question of topLevelQuestions) {
          // Extract the main question number (first part of question number)
          const mainQNum = parseFloat(question.number.split('.')[0]) || 0;
          
          let targetSectionIndex = 0;
          
          // Determine section based on main question number
          if (mainQNum > 40 && sections.length > 2) {
            targetSectionIndex = 2; // Section C (questions 41+)
          } else if (mainQNum > 20 && sections.length > 1) {
            targetSectionIndex = 1; // Section B (questions 21-40)
          } else {
            targetSectionIndex = 0; // Section A (questions 1-20)
          }

          // Count total sub-questions recursively
          function countSubQuestions(q: any): number {
            let count = q.subQuestions?.length || 0;
            if (q.subQuestions) {
              for (const subQ of q.subQuestions) {
                count += countSubQuestions(subQ);
              }
            }
            return count;
          }
          
          const totalSubQuestions = countSubQuestions(question);
          sections[targetSectionIndex].questions.push(question);
          
          console.log(`[Structure API] Final assignment: question ${question.number} (main: ${mainQNum}) with ${totalSubQuestions} total sub-questions to ${sections[targetSectionIndex].label}`);
        }

        // Sort questions within each section by their number
        sections.forEach(section => {
          section.questions.sort((a: any, b: any) => {
            // Sort by parsing question numbers (handles "1", "1.1", "2", etc.)
            const aParts = a.number.split('.').map((n: string) => parseFloat(n) || 0);
            const bParts = b.number.split('.').map((n: string) => parseFloat(n) || 0);
            
            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
              const aVal = aParts[i] || 0;
              const bVal = bParts[i] || 0;
              if (aVal !== bVal) return aVal - bVal;
            }
            return 0;
          });
        });

        // Calculate section marks
        sections.forEach(section => {
          section.totalMarks = section.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
        });

        // Extract paper number from subject (e.g., "Mathematics Paper 1" -> "Paper 1")
        const paperNumberMatch = (paper.subject || '').match(/paper\s*(\d+)/i);
        const paperNumber = paperNumberMatch ? `Paper ${paperNumberMatch[1]}` : 'Paper 1';

        // Build paper structure matching editor's PaperStructure interface
        const paperStructure = {
          header: {
            subject: paper.subject || '',
            paperNumber: paperNumber, // Editor expects paperNumber, not paperType
            year: paper.year || '',
            grade: paper.gradeLevel || 12,
          },
          sections: sections,
          totalMarks: sections.reduce((sum, s) => sum + s.totalMarks, 0),
        };

        console.log(`[Structure API] Built structure with ${sections[0].questions.length} questions in Section A, ${sections[1].questions.length} in Section B, ${sections[2].questions.length} in Section C`);
        
        // Log final structure for debugging
        console.log(`[Structure API] Final structure summary:`, {
          totalSections: sections.length,
          totalQuestions: sections.reduce((sum, s) => sum + s.questions.length, 0),
          sectionBreakdown: sections.map(s => ({
            label: s.label,
            questionCount: s.questions.length,
            questionNumbers: s.questions.map((q: any) => q.number).slice(0, 5), // First 5 question numbers
          })),
        });

        // Verify structure before returning
        console.log(`[Structure API] 🔍 Verifying structure before JSON serialization:`, {
          hasPaperStructure: !!paperStructure,
          hasSections: !!paperStructure.sections,
          sectionCount: paperStructure.sections?.length || 0,
          sectionAQuestionCount: paperStructure.sections?.[0]?.questions?.length || 0,
          sectionAFirstQuestion: paperStructure.sections?.[0]?.questions?.[0] ? {
            id: paperStructure.sections[0].questions[0].id,
            number: paperStructure.sections[0].questions[0].number,
            textLength: paperStructure.sections[0].questions[0].text?.length || 0,
          } : 'none',
          structureKeys: Object.keys(paperStructure),
        });

        const response = {
          success: true,
          paperStructure: paperStructure,
        };
        
        console.log(`[Structure API] 📤 Returning response:`, {
          success: response.success,
          hasPaperStructure: !!response.paperStructure,
          paperStructureType: typeof response.paperStructure,
          sectionsInResponse: response.paperStructure?.sections?.length || 0,
        });

        return NextResponse.json(response);
      }
    } catch (questionsError: any) {
      console.log('[Structure API] No questions found in questions collection, falling back to generatedQuestions:', questionsError.message);
    }

    // Fallback: Retrieve paperStructure from generatedQuestions[0] if it exists (old structure)
    let paperStructure = null;
    if (paper.generatedQuestions && Array.isArray(paper.generatedQuestions) && paper.generatedQuestions.length > 0) {
      try {
        paperStructure = JSON.parse(paper.generatedQuestions[0]);
        console.log('[Structure API] Loaded structure from generatedQuestions[0]');
      } catch (e) {
        console.error('Error parsing paperStructure from generatedQuestions:', e);
      }
    }

    return NextResponse.json({
      success: true,
      paperStructure: paperStructure,
    });
  } catch (error: any) {
    console.error('Error fetching paper structure:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch paper structure',
      },
      { status: 500 }
    );
  }
}

