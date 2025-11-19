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
      
      // Validate and truncate fields to prevent size limit errors
      // Appwrite string fields typically have a 10,000 character limit for large text fields
      const MAX_TEXT_LENGTH = 10000; // Safe limit for Appwrite text fields
      const MAX_ANSWER_LENGTH = 5000; // Answers are usually shorter
      
      const questionText = question.questionText 
        ? (question.questionText.length > MAX_TEXT_LENGTH 
            ? question.questionText.substring(0, MAX_TEXT_LENGTH) + '... [truncated]'
            : question.questionText)
        : '';
      
      const answer = question.answer 
        ? (question.answer.length > MAX_ANSWER_LENGTH 
            ? question.answer.substring(0, MAX_ANSWER_LENGTH) + '... [truncated]'
            : question.answer)
        : '';
      
      // NEW ARCHITECTURE: Never store base64 image data URIs - only use imageFileId
      // All images are uploaded to Appwrite Storage and referenced by file ID
      // This prevents large base64 strings in the database and improves performance
      
      // Check if question already exists
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questions',
        [
          Query.equal('paperId', paperId),
          Query.equal('number', question.questionNumber),
        ]
      );
      
      // Ensure order is a valid number (convert to integer if needed for collection schema)
      // Some Appwrite collections require integer types for numeric fields
      const orderValue = Math.round(order * 1000); // Multiply by 1000 to preserve 3 decimal places as integer
      
      // Ensure answer is not empty (use placeholder if empty, as some schemas require non-empty answer)
      const finalAnswer = answer && answer.trim().length > 0 
        ? answer 
        : '(No answer provided)'; // Placeholder for empty answers
      
      // Build question data object, only including fields that have values
      const questionData: Record<string, any> = {
        paperId: paperId,
        number: question.questionNumber || '0',
        question: questionText || '(No question text)',
        answer: finalAnswer,
        marks: Math.round(question.marks || 0), // Ensure integer
        type: question.type || 'free-text',
        hasImage: !!imageFileId, // Only true if we have a file ID
        order: orderValue, // Use integer value
      };
      
      // Only include imageFileId if it exists (never store base64)
      if (imageFileId) {
        questionData.imageFileId = imageFileId;
      }
      
      // Note: imageDataUri is no longer stored - all images use file IDs from Appwrite Storage
      
      // Validate required fields before attempting to save
      if (!questionData.paperId || !questionData.number) {
        throw new Error(`Missing required fields: paperId=${questionData.paperId}, number=${questionData.number}`);
      }
      
      try {
        if (existing.documents.length > 0) {
          // Update existing question
          await databases.updateDocument(
            appwriteConfig.databaseId,
            'questions',
            existing.documents[0].$id,
            questionData
          );
        } else {
          // Create new question - log the data being sent for debugging
          console.log(`Creating question ${question.questionNumber} with data:`, {
            paperId: questionData.paperId,
            number: questionData.number,
            questionLength: questionData.question?.length || 0,
            answerLength: questionData.answer?.length || 0,
            marks: questionData.marks,
            type: questionData.type,
            hasImage: questionData.hasImage,
            order: questionData.order,
            hasImageFileId: !!questionData.imageFileId,
          });
          
          await databases.createDocument(
            appwriteConfig.databaseId,
            'questions',
            ID.unique(),
            questionData
          );
        }
        
        stored++;
      } catch (createError: any) {
        // Log detailed error information
        console.error(`Failed to save question ${question.questionNumber}:`, {
          error: createError.message || createError,
          errorCode: createError.code,
          errorResponse: createError.response,
          questionData: {
            paperId: questionData.paperId,
            number: questionData.number,
            questionPreview: questionData.question?.substring(0, 50),
            answerPreview: questionData.answer?.substring(0, 50),
            marks: questionData.marks,
            type: questionData.type,
            order: questionData.order,
            hasImage: questionData.hasImage,
            imageFileId: questionData.imageFileId || 'none',
          },
        });
        throw createError; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      // Enhanced error logging
      const errorDetails: any = {
        error: error.message || error,
        errorType: error.constructor?.name,
        questionNumber: question.questionNumber,
        questionTextLength: question.questionText?.length || 0,
        answerLength: question.answer?.length || 0,
        hasImageFileId: !!question.imageFileId,
        paperId,
      };
      
      // Try to extract more details from Appwrite error
      if (error.code) {
        errorDetails.errorCode = error.code;
      }
      if (error.response) {
        errorDetails.errorResponse = error.response;
      }
      if (error.type) {
        errorDetails.errorType = error.type;
      }
      
      console.error(`Error storing question ${question.questionNumber}:`, errorDetails);
      
      // Log the full error stack for debugging
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      
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
      'pastpapers',
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

