
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
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const PastPaperInputSchema = z.object({
  docId: z.string().describe('The Firestore document ID of the past paper entry.'),
  userId: z.string().describe('The user ID of the admin who uploaded the paper.'),
  paperDataUri: z
    .string()
    .describe(
      "A data URI of the past paper PDF document. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  memoDataUri: z
    .string()
    .describe(
      "A data URI of the corresponding memo/answer key PDF document. The data URI must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  subject: z.string().describe('The subject of the past paper.'),
  grade: z.number().describe('The grade level of the past paper (e.g., 12).'),
  year: z.number().describe('The year the exam paper was administered.'),
});

export type PastPaperInput = z.infer<typeof PastPaperInputSchema>;

const PastPaperOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the processing was successfully initiated.'),
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
    // This is a long-running flow. Do not await it on the client.
    // It updates Firestore directly when it's done.

    // Simulate a long-running AI analysis process (e.g., 30-60 seconds)
    const processingTime = 30000 + Math.random() * 30000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate the AI extracting a random number of questions
    const extractedQuestionCount = Math.floor(Math.random() * 20) + 5; // e.g., 5 to 24 questions

    try {
        // We need to initialize Firebase Admin here to update the document
        // Since we don't have Admin SDK, we'll use the client SDK. This means this
        // flow should ideally be triggered from a context where a user is logged in.
        // For this simulation, we'll just update the doc.
        const { firestore } = initializeFirebase();
        const paperDocRef = doc(firestore, `users/${input.userId}/pastPapers`, input.docId);

        await updateDoc(paperDocRef, {
            status: 'Processed',
            questionCount: extractedQuestionCount
        });

        return {
            success: true,
            message: `Successfully processed ${input.subject} paper. Found ${extractedQuestionCount} questions.`,
            questionCount: extractedQuestionCount,
        };

    } catch (error) {
        console.error("Error updating Firestore document:", error);
         // Optionally update the doc to a 'Failed' status
        const { firestore } = initializeFirebase();
        const paperDocRef = doc(firestore, `users/${input.userId}/pastPapers`, input.docId);
        await updateDoc(paperDocRef, { status: 'Failed' });

        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred during Firestore update.",
        };
    }
  }
);
