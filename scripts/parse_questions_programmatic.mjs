/**
 * Programmatic parser for questions from JSON
 * Extracts questions directly from full_text without relying on Groq
 */

/**
 * Extract all question numbers and their text from a full_text string
 */
function extractQuestionsFromText(fullText, questionType, hasImages) {
  const questions = [];
  
  if (!fullText || !fullText.trim()) {
    return questions;
  }
  
  // Pattern to match question numbers: 1.4.3, 1.4.4, 1.4.5, 2.1, 2.3.4, etc.
  // Must be at word boundary or start of text, and have at least one dot
  // Also matches sub-questions: 1.4.3 (a), 1.4.3 (b), etc.
  // DO NOT match standalone numbers like (1), (2) - those are marks
  const questionPattern = /(?:^|\s)(\d+\.\d+(?:\.\d+)*)\s*(?:\(([a-z])\))?(?=\s|$)/gi;
  
  // Also match standalone question numbers at start of lines
  const lines = fullText.split(/\n/).filter(l => l.trim());
  
  let lastMatch = null;
  let currentQuestion = null;
  let currentSubQuestions = [];
  
  // Process the text to find all question numbers
  const matches = [];
  let match;
  const textCopy = fullText;
  
  // Find all question number patterns
  while ((match = questionPattern.exec(textCopy)) !== null) {
    matches.push({
      index: match.index,
      number: match[1],
      subPart: match[2] || null,
      fullMatch: match[0],
    });
  }
  
  // Also look for patterns like "1.4.3 (a)", "1.4.3 (b)" explicitly
  // Must have at least one dot to be a question number
  const subQuestionPattern = /(?:^|\s)(\d+\.\d+(?:\.\d+)*)\s*\(([a-z])\)(?=\s|$)/gi;
  while ((match = subQuestionPattern.exec(textCopy)) !== null) {
    const existing = matches.find(m => Math.abs(m.index - match.index) < 5);
    if (!existing) {
      matches.push({
        index: match.index + (match[0].match(/^\s/) ? 1 : 0), // Adjust for leading space
        number: match[1],
        subPart: match[2],
        fullMatch: match[0].trim(),
      });
    }
  }
  
  // Sort matches by position in text
  matches.sort((a, b) => a.index - b.index);
  
  // Extract text between matches
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    // Extract text after this question number
    // Find where the question number ends (including any sub-part like (a))
    let matchEnd = currentMatch.index + currentMatch.fullMatch.length;
    
    // Skip any leading whitespace or mark indicators
    while (matchEnd < fullText.length && (fullText[matchEnd] === ' ' || fullText[matchEnd] === '\t')) {
      matchEnd++;
    }
    
    // Find where the next question starts (or end of text)
    let textEnd = nextMatch ? nextMatch.index : fullText.length;
    
    // Look for the next question number pattern in the extracted text
    const extractedText = fullText.substring(matchEnd, textEnd);
    const nextQMatch = extractedText.match(/(?:^|\s)(\d+\.\d+(?:\.\d+)*)\s*(?:\([a-z]\))?/);
    if (nextQMatch) {
      textEnd = matchEnd + nextQMatch.index;
    }
    
    let questionText = fullText.substring(matchEnd, textEnd).trim();
    
    // Extract marks from the text (look for patterns like (2), [2], "2 marks")
    const marks = extractMarks(questionText) || extractMarks(fullText.substring(Math.max(0, currentMatch.index - 20), endPos)) || 1;
    
    // Clean the text - remove OCR artifacts and mark indicators
    questionText = cleanQuestionText(questionText);
    
    // Remove mark indicators from question text (but keep meaningful content)
    questionText = questionText
      .replace(/^\s*\((\d+)\)\s*/g, '')  // Remove leading (2)
      .replace(/\s*\((\d+)\)\s*$/g, '')  // Remove trailing (2)
      .replace(/\s*\[(\d+)\]\s*/g, '')   // Remove [2]
      .replace(/\s*\((\d+)\s*marks?\)\s*/gi, '') // Remove (2 marks)
      .trim();
    
    // Skip if text is too short or just artifacts
    if (questionText.length < 3 || /^[)\]\s☐☑]+$/.test(questionText)) {
      continue;
    }
    
    const questionNumber = currentMatch.subPart 
      ? `${currentMatch.number} (${currentMatch.subPart})`
      : currentMatch.number;
    
    if (currentMatch.subPart) {
      // This is a sub-question
      currentSubQuestions.push({
        number: questionNumber,
        text: questionText,
        marks: marks,
        type: questionType === 'multiple_choice' ? 'multiple-choice' : 'normal',
      });
    } else {
      // This is a main question
      // Save previous main question if exists
      if (currentQuestion) {
        questions.push({
          ...currentQuestion,
          subQuestions: currentSubQuestions,
        });
      }
      
      // Start new main question
      currentQuestion = {
        number: questionNumber,
        text: questionText,
        marks: marks,
        type: questionType === 'multiple_choice' ? 'multiple-choice' : 'normal',
        hasDiagram: hasImages || false,
      };
      currentSubQuestions = [];
    }
  }
  
  // Save last question
  if (currentQuestion) {
    questions.push({
      ...currentQuestion,
      subQuestions: currentSubQuestions,
    });
  }
  
  return questions;
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
    .replace(/\s+/g, ' ')
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
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

/**
 * Parse all questions from JSON data
 */
function parseAllQuestions(jsonData) {
  const allQuestions = [];
  
  (jsonData.questions || []).forEach((q, idx) => {
    const fullText = q.full_text || q.question_text || '';
    const extracted = extractQuestionsFromText(fullText, q.question_type, q.images && q.images.length > 0);
    
    // Add image reference to questions that have images
    extracted.forEach(extractedQ => {
      if (q.images && q.images.length > 0) {
        extractedQ.hasDiagram = true;
        extractedQ._imageData = q.images; // Store for later image upload
      }
    });
    
    allQuestions.push(...extracted);
  });
  
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
      const aParts = a.number.split(/[.()]/).map(x => isNaN(parseInt(x)) ? x : parseInt(x));
      const bParts = b.number.split(/[.()]/).map(x => isNaN(parseInt(x)) ? x : parseInt(x));
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i];
        const bVal = bParts[i];
        
        if (aVal === undefined) return -1;
        if (bVal === undefined) return 1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          if (aVal !== bVal) return aVal - bVal;
        } else if (typeof aVal === 'string' && typeof bVal === 'string') {
          if (aVal !== bVal) return aVal.localeCompare(bVal);
        } else {
          return String(aVal).localeCompare(String(bVal));
        }
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
  };
}

// Export for use in other modules
export { parseAllQuestions };

