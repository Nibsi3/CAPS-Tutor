/**
 * Question Storage Utility
 * Handles storing questions in Appwrite database with proper ordering and image references
 */

import { Databases, ID, Query } from 'appwrite';
import { appwriteConfig } from '@/appwrite/config';

export interface QuestionToStore {
  questionNumber: string;
  questionText: string;
  marks: number;
  answer: string;
  hasImage?: boolean;
  imageFileId?: string; // Appwrite Storage file ID (not base64)
  imageDataUri?: string; // Deprecated: kept for backward compatibility
  type?: string;
}

/**
 * Calculate numeric order for question number (for sorting)
 * e.g., "1.1" -> 1.1, "2.3.1" -> 2.31
 */
export function calculateQuestionOrder(questionNumber: string): number {
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
 * Store questions in Appwrite database
 * @param databases - Appwrite Databases instance
 * @param paperId - The past paper document ID
 * @param questions - Array of questions to store
 * @param imageMatches - Optional array of image matches from image-matcher
 */
export async function storeQuestions(
  databases: Databases,
  paperId: string,
  questions: QuestionToStore[],
  imageMatches?: Array<{ questionNumber: string; imageIndex: number; imageDataUri: string }>
): Promise<{ stored: number; errors: number }> {
  let stored = 0;
  let errors = 0;
  
  // Create a map of image data URIs by question number
  const imageMap = new Map<string, string>();
  if (imageMatches) {
    for (const match of imageMatches) {
      imageMap.set(match.questionNumber, match.imageDataUri);
    }
  }
  
  // Sort questions by number to ensure proper order
  const sortedQuestions = [...questions].sort((a, b) => {
    return calculateQuestionOrder(a.questionNumber) - calculateQuestionOrder(b.questionNumber);
  });
  
  // Store each question
  for (const question of sortedQuestions) {
    try {
      const order = calculateQuestionOrder(question.questionNumber);
      
      // Get image file ID (preferred) or data URI (fallback for backward compatibility)
      const imageFileId = question.imageFileId;
      const imageDataUri = question.imageDataUri || imageMap.get(question.questionNumber);
      
      // Check if question already exists
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questions',
        [
          Query.equal('paperId', paperId),
          Query.equal('number', question.questionNumber),
        ]
      );
      
      const questionData = {
        paperId,
        number: question.questionNumber,
        question: question.questionText,
        questionText: question.questionText, // Support both field names
        answer: question.answer || '',
        marks: question.marks || 0,
        type: question.type || 'free-text',
        imageFileId: imageFileId || null, // Store Appwrite file ID (small string, < 255 chars)
        image: imageDataUri || null, // Deprecated: kept for backward compatibility
        hasImage: !!imageFileId || !!imageDataUri,
        order,
      };
      
      if (existing.documents.length > 0) {
        // Update existing question
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'questions',
          existing.documents[0].$id,
          questionData
        );
      } else {
        // Create new question
        await databases.createDocument(
          appwriteConfig.databaseId,
          'questions',
          ID.unique(),
          questionData
        );
      }
      
      stored++;
    } catch (error) {
      console.error(`Error storing question ${question.questionNumber}:`, error);
      errors++;
    }
  }
  
  return { stored, errors };
}

/**
 * Update past paper document with question count
 */
export async function updatePaperQuestionCount(
  databases: Databases,
  paperId: string,
  questionCount: number
): Promise<void> {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'pastPapers',
      paperId,
      {
        questionCount,
        status: 'Processed',
      }
    );
  } catch (error) {
    console.error('Error updating paper question count:', error);
    throw error;
  }
}

