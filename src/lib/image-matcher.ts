/**
 * Image Matcher Service
 * Matches extracted images from PDFs to specific questions based on:
 * - Text references (e.g., "Refer to diagram", "Figure 1")
 * - Page proximity
 * - Question context
 */

import { ExtractedImage, ExtractedPage } from './past-paper-processor';

export interface QuestionImageMatch {
  questionNumber: string;
  imageIndex: number;
  confidence: number;
  reason: string;
}

/**
 * Match images to questions based on OCR text analysis
 * @param pages - Extracted pages with text and images
 * @param questions - Array of questions with question numbers
 * @returns Array of matches between questions and images
 */
export function matchImagesToQuestions(
  pages: ExtractedPage[],
  questions: Array<{ number: string; text: string; pageNumber?: number }>
): QuestionImageMatch[] {
  const matches: QuestionImageMatch[] = [];
  
  // Create a map of questions by page number for quick lookup
  const questionsByPage = new Map<number, typeof questions>();
  questions.forEach(q => {
    const pageNum = q.pageNumber || 1;
    if (!questionsByPage.has(pageNum)) {
      questionsByPage.set(pageNum, []);
    }
    questionsByPage.get(pageNum)!.push(q);
  });
  
  // Process each page
  for (const page of pages) {
    const pageQuestions = questionsByPage.get(page.pageNumber) || [];
    
    // Process each image on the page
    for (const image of page.images) {
      const bestMatch = findBestQuestionMatch(image, page, pageQuestions, pages);
      
      if (bestMatch) {
        matches.push(bestMatch);
      }
    }
  }
  
  return matches;
}

/**
 * Find the best question match for an image
 */
function findBestQuestionMatch(
  image: ExtractedImage,
  page: ExtractedPage,
  pageQuestions: Array<{ number: string; text: string }>,
  allPages: ExtractedPage[]
): QuestionImageMatch | null {
  let bestMatch: QuestionImageMatch | null = null;
  let bestScore = 0;
  
  // Check each question on the page
  for (const question of pageQuestions) {
    const score = calculateMatchScore(image, question, page, pageQuestions, allPages);
    
    if (score > bestScore && score > 0.3) { // Minimum confidence threshold
      bestScore = score;
      bestMatch = {
        questionNumber: question.number,
        imageIndex: image.imageIndex,
        confidence: score,
        reason: generateMatchReason(image, question, score),
      };
    }
  }
  
  return bestMatch;
}

/**
 * Calculate match score between an image and a question
 */
function calculateMatchScore(
  image: ExtractedImage,
  question: { number: string; text: string },
  page: ExtractedPage,
  pageQuestions: Array<{ number: string; text: string }>,
  allPages: ExtractedPage[]
): number {
  let score = 0;
  
  // 1. Check for explicit image references in question text
  const questionText = question.text.toLowerCase();
  const imageKeywords = [
    'diagram', 'figure', 'fig', 'image', 'photograph', 'photo',
    'graph', 'chart', 'illustration', 'picture', 'drawing'
  ];
  
  const hasImageReference = imageKeywords.some(keyword => 
    questionText.includes(keyword)
  );
  
  if (hasImageReference) {
    score += 0.5; // Strong indicator
    
    // Check if question mentions specific figure/diagram number
    const figureMatch = questionText.match(/(?:figure|fig|diagram)\s*(\d+)/i);
    if (figureMatch) {
      const figureNum = parseInt(figureMatch[1]);
      // If image label contains this number, boost score
      if (image.label && image.label.includes(figureNum.toString())) {
        score += 0.3;
      }
    }
  }
  
  // 2. Check image label for question number reference
  if (image.label) {
    const labelLower = image.label.toLowerCase();
    
    // Check if label contains question number pattern
    const questionNumPattern = question.number.replace(/\./g, '[.\s]*');
    const questionNumRegex = new RegExp(questionNumPattern, 'i');
    if (questionNumRegex.test(labelLower)) {
      score += 0.4;
    }
    
    // Check for common question-image patterns
    if (labelLower.includes('question') || labelLower.includes('q')) {
      score += 0.2;
    }
  }
  
  // 3. Proximity scoring - images closer to question text score higher
  if (image.coordinates && page.text) {
    // Find question position in text
    const questionIndex = page.text.indexOf(question.text.substring(0, 50));
    if (questionIndex >= 0) {
      // Calculate approximate Y position of question in page
      // This is a rough estimate - in reality we'd need text block coordinates
      const questionY = estimateTextYPosition(questionIndex, page.text);
      const imageY = image.coordinates.y0;
      
      // Closer images score higher (within 200 points)
      const distance = Math.abs(imageY - questionY);
      if (distance < 200) {
        score += (200 - distance) / 200 * 0.3;
      }
    }
  }
  
  // 4. Check if image appears after question but before next question
  const questionPosition = findQuestionPosition(question.number, page.text);
  if (questionPosition >= 0 && image.coordinates) {
    // Check if there's a next question after this one
    const nextQuestion = findNextQuestion(question.number, pageQuestions);
    if (nextQuestion) {
      const nextQuestionPosition = findQuestionPosition(nextQuestion.number, page.text);
      if (nextQuestionPosition > questionPosition) {
        // Image should be between current and next question
        const imageY = image.coordinates.y0;
        // Rough check: if image is after question, boost score
        score += 0.2;
      }
    }
  }
  
  // 5. Check for shared diagrams (same image used by multiple sub-questions)
  // If this image is already matched to a parent question, sub-questions can also use it
  const parentQuestionNum = getParentQuestionNumber(question.number);
  if (parentQuestionNum && parentQuestionNum !== question.number) {
    // Check if parent question would also match this image
    const parentQuestion = pageQuestions.find(q => q.number === parentQuestionNum);
    if (parentQuestion) {
      const parentScore = calculateMatchScore(image, parentQuestion, page, pageQuestions, allPages);
      if (parentScore > 0.5) {
        score += 0.2; // Boost for sub-questions of questions with images
      }
    }
  }
  
  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Estimate Y position of text in page (rough approximation)
 */
function estimateTextYPosition(textIndex: number, fullText: string): number {
  // Rough estimate: assume text flows top to bottom
  // Each line is approximately 20 points high
  const linesBefore = fullText.substring(0, textIndex).split('\n').length;
  return linesBefore * 20;
}

/**
 * Find question position in text
 */
function findQuestionPosition(questionNumber: string, text: string): number {
  // Look for question number pattern in text
  const patterns = [
    new RegExp(`\\b${questionNumber.replace(/\./g, '\\.')}\\b`, 'i'),
    new RegExp(`\\b${questionNumber}\\b`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = text.search(pattern);
    if (match >= 0) {
      return match;
    }
  }
  
  return -1;
}

/**
 * Find next question after current one
 */
function findNextQuestion(
  currentNumber: string,
  questions: Array<{ number: string }>
): { number: string } | null {
  // Parse question numbers to compare
  const currentParts = currentNumber.split('.').map(Number);
  
  let nextQuestion: { number: string } | null = null;
  let minDiff = Infinity;
  
  for (const q of questions) {
    const qParts = q.number.split('.').map(Number);
    
    // Check if this question comes after current
    let isAfter = false;
    for (let i = 0; i < Math.max(currentParts.length, qParts.length); i++) {
      const currentVal = currentParts[i] || 0;
      const qVal = qParts[i] || 0;
      
      if (qVal > currentVal) {
        isAfter = true;
        break;
      } else if (qVal < currentVal) {
        break;
      }
    }
    
    if (isAfter) {
      // Calculate difference
      const diff = calculateQuestionNumberDiff(currentNumber, q.number);
      if (diff < minDiff) {
        minDiff = diff;
        nextQuestion = q;
      }
    }
  }
  
  return nextQuestion;
}

/**
 * Calculate numeric difference between question numbers
 */
function calculateQuestionNumberDiff(num1: string, num2: string): number {
  const parts1 = num1.split('.').map(Number);
  const parts2 = num2.split('.').map(Number);
  
  let diff = 0;
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const val1 = parts1[i] || 0;
    const val2 = parts2[i] || 0;
    diff += Math.abs(val2 - val1) * Math.pow(10, 3 - i);
  }
  
  return diff;
}

/**
 * Get parent question number (e.g., "1.1.2" -> "1.1")
 */
function getParentQuestionNumber(questionNumber: string): string | null {
  const parts = questionNumber.split('.');
  if (parts.length > 1) {
    return parts.slice(0, -1).join('.');
  }
  return null;
}

/**
 * Generate human-readable reason for match
 */
function generateMatchReason(
  image: ExtractedImage,
  question: { number: string; text: string },
  score: number
): string {
  const reasons: string[] = [];
  
  if (score > 0.5) {
    reasons.push('Strong match');
  } else if (score > 0.3) {
    reasons.push('Moderate match');
  }
  
  const questionText = question.text.toLowerCase();
  if (/diagram|figure|fig|image/.test(questionText)) {
    reasons.push('Question references diagram/image');
  }
  
  if (image.label && image.label.toLowerCase().includes(question.number)) {
    reasons.push('Image label matches question number');
  }
  
  return reasons.join('; ') || 'Proximity match';
}

/**
 * Filter out images that are not attached to questions
 * (e.g., logos, headers, watermarks)
 */
export function filterQuestionImages(
  images: ExtractedImage[],
  pages: ExtractedPage[]
): ExtractedImage[] {
  return images.filter(image => {
    // Skip very small images (likely icons)
    if (image.coordinates) {
      const width = image.coordinates.x1 - image.coordinates.x0;
      const height = image.coordinates.y1 - image.coordinates.y0;
      if (width < 100 || height < 100) {
        return false;
      }
    }
    
    // Skip images with labels suggesting they're not question-related
    if (image.label) {
      const labelLower = image.label.toLowerCase();
      const excludeKeywords = [
        'logo', 'header', 'footer', 'watermark', 'department',
        'education', 'province', 'cape', 'gauteng'
      ];
      
      if (excludeKeywords.some(keyword => labelLower.includes(keyword))) {
        return false;
      }
    }
    
    return true;
  });
}

