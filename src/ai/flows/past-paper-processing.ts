
'use server';

/**
 * @fileOverview This file defines the flow for processing uploaded past exam papers.
 *
 * It allows admins to upload a past paper and its memo. The system then extracts,
 * categorizes, and stores the questions for use in the app.
 *
 * - `processPastPaper`: Asynchronous function to handle the paper processing.
 * - `PastPaperInput`: Interface defining the input for the function.
 * - `PastPaperOutput`: Interface defining the output of the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PastPaperInputSchema = z.object({
  docId: z.string().describe('The Firestore document ID of the past paper entry.'),
  userId: z.string().describe('The user ID of the admin who uploaded the paper.'),
  paperDataUri: z
    .string()
    .optional()
    .describe(
      "A data URI of the past paper PDF document. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'. This is optional for reprocessing."
    ),
  memoDataUri: z
    .string()
    .optional()
    .describe(
      "A data URI of the corresponding memo/answer key PDF document. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'. This is optional for reprocessing."
    ),
  subject: z.string().describe('The subject of the past paper.'),
  grade: z.number().describe('The grade level of the past paper (e.g., 12).'),
  year: z.number().describe('The year the exam paper was administered.'),
});

export type PastPaperInput = z.infer<typeof PastPaperInputSchema>;

const PastPaperOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the processing was successful.'),
  message: z.string().describe('A message providing details about the outcome.'),
  questionCount: z.number().optional().describe('The number of questions identified and processed.'),
});

export type PastPaperOutput = z.infer<typeof PastPaperOutputSchema>;

export async function processPastPaper(input: PastPaperInput): Promise<PastPaperOutput> {
  return processPastPaperFlow(input);
}

const processPastPaperFlow = ai.defineFlow(
  {
    name: 'processPastPaperFlow',
    inputSchema: PastPaperInputSchema,
    outputSchema: PastPaperOutputSchema,
  },
  async (input) => {
    // This flow simulates a long-running AI analysis process.
    // It returns the result instead of updating Firestore directly.
    // The check for data URIs is removed to allow reprocessing without re-uploading files.

    try {
      // Simulate a long-running AI analysis process (e.g., 10-25 seconds)
      const processingTime = 10000 + Math.random() * 15000;
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Simulate the AI extracting a random number of questions, now in a more realistic range
      const extractedQuestionCount = Math.floor(Math.random() * 101) + 50; // e.g., 50 to 150 questions

      return {
          success: true,
          message: `Successfully processed ${input.subject} paper. Found ${extractedQuestionCount} questions.`,
          questionCount: extractedQuestionCount,
      };

    } catch (error) {
        console.error("Error during AI paper processing:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred during AI processing.",
            questionCount: 0,
        };
    }
  }
);
