'use server';

/**
 * @fileOverview A flow that provides interactive feedback and step-by-step explanations for student answers.
 *
 * - getInteractiveFeedback - A function that handles the interactive feedback process.
 * - InteractiveFeedbackInput - The input type for the getInteractiveFeedback function.
 * - InteractiveFeedbackOutput - The return type for the getInteractiveFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteractiveFeedbackInputSchema = z.object({
  question: z.string().describe('The practice question to be answered.'),
  studentAnswer: z.string().describe('The student\u2019s answer to the question.'),
  gradeLevel: z.number().describe('The grade level of the student.'),
  subject: z.string().describe('The subject of the question.'),
});
export type InteractiveFeedbackInput = z.infer<typeof InteractiveFeedbackInputSchema>;

const InteractiveFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the student\u2019s answer is correct.'),
  explanation: z.string().describe('A step-by-step explanation of the solution.'),
});
export type InteractiveFeedbackOutput = z.infer<typeof InteractiveFeedbackOutputSchema>;

export async function getInteractiveFeedback(
  input: InteractiveFeedbackInput
): Promise<InteractiveFeedbackOutput> {
  return interactiveFeedbackFlow(input);
}

const interactiveFeedbackPrompt = ai.definePrompt({
  name: 'interactiveFeedbackPrompt',
  input: {schema: InteractiveFeedbackInputSchema},
  output: {schema: InteractiveFeedbackOutputSchema},
  prompt: `You are an AI tutor specializing in the South African CAPS syllabus.

You will be given a question, the student's answer, the grade level, and the subject.

Your task is to assess whether the student's answer is correct or incorrect.
Then, provide a step-by-step explanation of the solution, formatted for the given grade level.

Question: {{{question}}}
Student's Answer: {{{studentAnswer}}}
Grade Level: {{{gradeLevel}}}
Subject: {{{subject}}}

Is Correct: {{isCorrect}}
Explanation: {{explanation}}`,
});

const interactiveFeedbackFlow = ai.defineFlow(
  {
    name: 'interactiveFeedbackFlow',
    inputSchema: InteractiveFeedbackInputSchema,
    outputSchema: InteractiveFeedbackOutputSchema,
  },
  async input => {
    const {output} = await interactiveFeedbackPrompt(input);
    return output!;
  }
);
