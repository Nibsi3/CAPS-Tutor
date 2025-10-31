
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

import { groqChat, extractJsonFromText } from '@/ai/groq';
import { z } from 'zod';

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

const GeneratedQuestionSchema = z.object({
    questionNumber: z.string().describe("The question number, e.g., '1.1' or '2.3.1'"),
    questionText: z.string().describe("The full text of the question."),
    marks: z.number().describe("The number of marks allocated to the question."),
    answer: z.string().describe("A concise, correct answer based on the memo."),
});

const PastPaperOutputSchema = z.object({
    success: z.boolean().describe('Indicates whether the processing was successful.'),
    message: z.string().describe('A message providing details about the outcome.'),
    generatedQuestions: z.array(GeneratedQuestionSchema).optional().describe('An array of questions extracted from the paper.'),
});

export type PastPaperOutput = z.infer<typeof PastPaperOutputSchema>;

export async function processPastPaper(input: PastPaperInput): Promise<PastPaperOutput> {
  // In a real scenario, this would parse PDFs. Here we generate simulated questions via LLM.
  const prompt = `You are an expert in the South African CAPS curriculum. Your task is to simulate the extraction of questions from a past exam paper based on its subject.

Input Details:
- Subject: ${input.subject}
- Grade: ${input.grade}
- Year: ${input.year}

Instructions:
1. Based on the subject, generate a realistic list of 5 exam-style questions.
2. The questions should be typical for a Grade ${input.grade} final exam paper.
3. For each question:
   - Create a plausible question number (e.g., 1.1, 1.2, 2.1.1).
   - Write a concise, relevant question text.
   - Assign a realistic number of marks (between 2 and 5).
   - Provide a short, correct answer as if from the exam memorandum.
4. Ensure the output is a JSON object matching this TypeScript type:
{
  "success": true,
  "message": string,
  "generatedQuestions": Array<{
    "questionNumber": string,
    "questionText": string,
    "marks": number,
    "answer": string
  }>
}
If the subject is not a typical high school subject, return an empty array for generatedQuestions.`;

  try {
    const content = await groqChat(prompt, { temperature: 0.25 });
    const jsonText = extractJsonFromText(content) ?? content;
    const parsed = JSON.parse(jsonText) as PastPaperOutput;
    if (!parsed.generatedQuestions) {
      return { success: false, message: 'AI failed to generate questions.' };
    }
    return parsed;
  } catch (error) {
    console.error('Error during AI paper processing:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during AI processing.',
    };
  }
}
