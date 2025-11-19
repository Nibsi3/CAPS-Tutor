/**
 * Parse questions directly from JSON structure
 * This bypasses Groq and parses the questions programmatically
 */

import { readFileSync } from 'fs';

/**
 * Extract question number from text (e.g., "1.4.3", "1.4.3 (a)", "2.1.1")
 */
function extractQuestionNumber(text) {
  // Match patterns like: 1.4.3, 1.4.3 (a), 2.1.1, etc.
  const patterns = [
    /(\d+\.\d+\.\d+\.\d+)\s*\(([a-z])\)/i,  // 1.4.3.1 (a)
    /(\d+\.\d+\.\d+)\s*\(([a-z])\)/i,        // 1.4.3 (a)
    /(\d+\.\d+)\s*\(([a-z])\)/i,             // 1.4 (a)
    /(\d+\.\d+\.\d+\.\d+)/,                  // 1.4.3.1
    /(\d+\.\d+\.\d+)/,                       // 1.4.3
    /(\d+\.\d+)/,                            // 1.4
    /^(\d+)\s/,                               // 1 (at start)
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // Has sub-part like (a), (b)
        return `${match[1]} (${match[2]})`;
      }
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract marks from text (e.g., "(2)", "[2]", "2 marks")
 */
function extractMarks(text) {
  const patterns = [
    /\((\d+)\)/,           // (2)
    /\[(\d+)\]/,           // [2]
    /(\d+)\s*marks?/i,     // 2 marks
    /\((\d+)\s*marks?\)/i, // (2 marks)
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return 1; // Default to 1 mark
}

/**
 * Clean question text - remove mark indicators, OCR artifacts
 */
function cleanQuestionText(text) {
  if (!text) return '';
  
  // Remove common OCR artifacts
  let cleaned = text
    .replace(/☐/g, '')  // Remove checkbox symbols
    .replace(/☑/g, '')
    .replace(/\[X\]/g, '')  // Remove [X] markers
    .replace(/\[ \]/g, '')
    .replace(/\((\d+)\)\s*/g, '')  // Remove standalone mark indicators like (2)
    .replace(/\[(\d+)\]\s*/g, '')
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();
  
  // Remove mark indicators at the end
  cleaned = cleaned.replace(/\s*\((\d+)\s*marks?\)\s*$/i, '');
  cleaned = cleaned.replace(/\s*\[(\d+)\]\s*$/, '');
  
  return cleaned;
}

/**
 * Parse questions from JSON data
 */
export function parseQuestionsFromJSON(jsonData) {
  const questions = jsonData.questions || [];
  const parsedQuestions = [];
  
  // Group questions by section (based on question_number patterns)
  const sections = new Map();
  
  questions.forEach((q, idx) => {
    const fullText = q.full_text || q.question_text || '';
    const questionNumber = q.question_number?.toString() || '';
    
    // Determine section based on question number
    // Questions starting with 1.x go to Section A, 2.x to Section B, etc.
    let sectionNum = 1;
    if (questionNumber) {
      const firstNum = parseInt(questionNumber.split('.')[0] || questionNumber, 10);
      if (!isNaN(firstNum)) {
        sectionNum = firstNum;
      }
    }
    
    // Extract all question numbers and their text from full_text
    // Split by common patterns
    const lines = fullText.split(/\n/).filter(line => line.trim());
    
    let currentMainQuestion = null;
    let currentSubQuestions = [];
    
    lines.forEach(line => {
      const qNum = extractQuestionNumber(line);
      if (qNum) {
        const marks = extractMarks(line);
        const cleanedText = cleanQuestionText(line.replace(qNum, '').trim());
        
        // Determine if this is a main question or sub-question
        const numParts = qNum.split('.');
        const hasSubPart = qNum.includes('(');
        
        if (hasSubPart || numParts.length > 2) {
          // This is a sub-question
          const mainNum = qNum.split('(')[0].trim();
          currentSubQuestions.push({
            number: qNum,
            text: cleanedText || line.replace(qNum, '').trim(),
            marks: marks,
            type: q.question_type === 'multiple_choice' ? 'multiple-choice' : 'normal',
          });
        } else {
          // This is a main question
          // Save previous main question if exists
          if (currentMainQuestion) {
            parsedQuestions.push({
              ...currentMainQuestion,
              subQuestions: currentSubQuestions,
            });
          }
          
          // Start new main question
          currentMainQuestion = {
            number: qNum,
            text: cleanedText || line.replace(qNum, '').trim(),
            marks: marks,
            type: q.question_type === 'multiple_choice' ? 'multiple-choice' : 'normal',
            hasDiagram: q.images && q.images.length > 0,
          };
          currentSubQuestions = [];
        }
      } else if (currentMainQuestion && line.trim()) {
        // Continuation of current question text
        currentMainQuestion.text += ' ' + cleanQuestionText(line);
      }
    });
    
    // Save last question
    if (currentMainQuestion) {
      parsedQuestions.push({
        ...currentMainQuestion,
        subQuestions: currentSubQuestions,
      });
    }
  });
  
  // Organize into sections
  const sectionMap = new Map();
  parsedQuestions.forEach(q => {
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
    sections.push({
      id: `section-${idx + 1}`,
      label: `SECTION ${String.fromCharCode(64 + sectionNum)}`, // A, B, C, etc.
      number: idx + 1,
      questions: sectionMap.get(sectionNum).map((q, qIdx) => ({
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
  };
}

