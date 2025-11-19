/**
 * Improved parser for questions from JSON
 * Properly extracts full questions, detects types, handles sub-questions
 */

/**
 * Extract all questions from a full_text string with proper parsing
 */
function extractQuestionsFromText(fullText, questionType, hasImages, pageNumber) {
  const questions = [];
  
  if (!fullText || !fullText.trim()) {
    return questions;
  }
  
  // Clean the text first - remove common OCR artifacts but preserve structure
  let cleanedText = fullText
    .replace(/\uf050/g, '') // Remove special Unicode characters
    .replace(/☐/g, '')
    .replace(/☑/g, '')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Pattern to match question numbers: must have at least one dot (1.4.3, not just 1)
  // Also matches sub-questions: 1.4.3 (a), 1.4.3 (b)
  const questionNumberPattern = /(\d+\.\d+(?:\.\d+)*)\s*(?:\(([a-z])\))?/gi;
  
  const matches = [];
  let match;
  const textCopy = cleanedText;
  
  // Reset regex
  questionNumberPattern.lastIndex = 0;
  
  // Find all question number patterns
  while ((match = questionNumberPattern.exec(textCopy)) !== null) {
    // Only add if it's a real question number (has dot) and not just a mark indicator
    const beforeMatch = textCopy.substring(Math.max(0, match.index - 10), match.index);
    const isMarkIndicator = /\((\d+)\)\s*$/.test(beforeMatch.trim());
    
    if (!isMarkIndicator) {
      matches.push({
        index: match.index,
        number: match[1],
        subPart: match[2] || null,
        fullMatch: match[0],
      });
    }
  }
  
  // Sort by position
  matches.sort((a, b) => a.index - b.index);
  
  // Group sub-questions under their parent
  const questionMap = new Map();
  const subQuestionMap = new Map();
  
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    // Calculate text boundaries
    let textStart = currentMatch.index + currentMatch.fullMatch.length;
    // Skip whitespace and mark indicators
    while (textStart < cleanedText.length && (cleanedText[textStart] === ' ' || cleanedText[textStart] === '\t')) {
      textStart++;
    }
    
    let textEnd = nextMatch ? nextMatch.index : cleanedText.length;
    
    // Extract question text
    let questionText = cleanedText.substring(textStart, textEnd).trim();
    
    // Stop at next question number if found in extracted text
    const nextQInText = questionText.match(/\s(\d+\.\d+(?:\.\d+)*)\s*(?:\([a-z]\))?/);
    if (nextQInText) {
      questionText = questionText.substring(0, nextQInText.index).trim();
    }
    
    // Extract marks - look before and after the question number
    const contextBefore = cleanedText.substring(Math.max(0, currentMatch.index - 30), currentMatch.index);
    const contextAfter = questionText.substring(0, 50);
    const marks = extractMarks(contextBefore + ' ' + contextAfter) || 1;
    
    // Clean question text
    questionText = cleanQuestionText(questionText);
    
    // Skip if too short or just artifacts
    if (questionText.length < 5) {
      continue;
    }
    
    const questionNumber = currentMatch.subPart 
      ? `${currentMatch.number} (${currentMatch.subPart})`
      : currentMatch.number;
    
    if (currentMatch.subPart) {
      // This is a sub-question
      if (!subQuestionMap.has(currentMatch.number)) {
        subQuestionMap.set(currentMatch.number, []);
      }
      subQuestionMap.get(currentMatch.number).push({
        number: questionNumber,
        text: questionText,
        marks: marks,
        type: detectQuestionType(questionText, questionType),
      });
    } else {
      // This is a main question
      questionMap.set(currentMatch.number, {
        number: currentMatch.number,
        text: questionText,
        marks: marks,
        type: detectQuestionType(questionText, questionType),
        hasDiagram: hasImages || /diagram|figure|identify|label|draw|structure/i.test(questionText),
        subQuestions: subQuestionMap.get(currentMatch.number) || [],
      });
    }
  }
  
  // Convert map to array
  return Array.from(questionMap.values());
}

/**
 * Detect question type from text
 */
function detectQuestionType(text, jsonType) {
  if (jsonType === 'multiple_choice') {
    return 'multiple-choice';
  }
  
  // Check for multiple choice patterns
  if (/^[A-D]\.\s/.test(text) || /\n[A-D]\.\s/.test(text) || /\([A-D]\)/.test(text)) {
    return 'multiple-choice';
  }
  
  // Check for diagram references
  if (/diagram|figure|identify.*part|label|draw|structure/i.test(text)) {
    return 'diagram';
  }
  
  // Check for table patterns
  if (/table|complete.*table|fill.*table/i.test(text)) {
    return 'table';
  }
  
  // Check for graph patterns
  if (/graph|plot|chart|draw.*graph/i.test(text)) {
    return 'graph';
  }
  
  return 'normal';
}

/**
 * Clean question text
 */
function cleanQuestionText(text) {
  if (!text) return '';
  
  return text
    .replace(/☐/g, '')
    .replace(/☑/g, '')
    .replace(/\[X\]/g, '')
    .replace(/\[ \]/g, '')
    .replace(/^\s*\((\d+)\)\s*/g, '') // Remove leading (2)
    .replace(/\s*\((\d+)\)\s*$/g, '') // Remove trailing (2)
    .replace(/\s*\[(\d+)\]\s*/g, '') // Remove [2]
    .replace(/\s*\((\d+)\s*marks?\)\s*/gi, '') // Remove (2 marks)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract marks from text
 */
function extractMarks(text) {
  const patterns = [
    /\((\d+)\)/,
    /\[(\d+)\]/,
    /(\d+)\s*marks?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const marks = parseInt(match[1], 10);
      if (marks > 0 && marks <= 20) { // Reasonable mark range
        return marks;
      }
    }
  }
  
  return null;
}

/**
 * Parse all questions from JSON and create proper PaperStructure
 */
export function parseQuestionsToStructure(jsonData) {
  const allQuestions = [];
  const imageMap = new Map(); // Track which questions have images
  
  // Process each question entry in JSON
  (jsonData.questions || []).forEach((q, idx) => {
    const fullText = q.full_text || q.question_text || '';
    const hasImages = q.images && q.images.length > 0;
    
    // Store image reference
    if (hasImages) {
      imageMap.set(q.question_number?.toString() || idx.toString(), q.images);
    }
    
    // Extract questions from this full_text
    const extracted = extractQuestionsFromText(
      fullText, 
      q.question_type, 
      hasImages,
      q.page_number
    );
    
    // Add image references to extracted questions
    extracted.forEach(extractedQ => {
      if (hasImages) {
        extractedQ.hasDiagram = true;
        extractedQ._imageData = q.images;
      }
    });
    
    allQuestions.push(...extracted);
  });
  
  // Organize into sections based on question number prefix
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
    
    // Sort questions by number (handle 1.4.3, 1.4.4, 1.4.5, etc.)
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
    
    sections.push({
      id: `section-${idx + 1}`,
      label: `SECTION ${String.fromCharCode(64 + sectionNum)}`,
      number: idx + 1,
      questions: sectionQuestions.map((q, qIdx) => ({
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
    imageMap, // Return image map for later use
  };
}

