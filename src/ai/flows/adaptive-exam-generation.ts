'use server';

/**
 * @fileOverview This file implements the adaptive exam generation flow.
 *
 * The flow analyzes a student's weak topics and automatically generates custom past papers focused on those areas.
 *
 * - generateAdaptiveExam - A function that generates an adaptive exam for a student.
 * - AdaptiveExamInput - The input type for the generateAdaptiveExam function.
 * - AdaptiveExamOutput - The return type for the generateAdaptiveExam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveExamInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  numQuestions: z.number().describe('The number of questions to include in the exam.'),
});
export type AdaptiveExamInput = z.infer<typeof AdaptiveExamInputSchema>;

const AdaptiveExamOutputSchema = z.object({
  examQuestions: z.array(
    z.object({
      question: z.string().describe('The text of the question.'),
      topic: z.string().describe('The topic of the question.'),
      difficulty: z.string().describe('The difficulty level of the question.'),
    })
  ).describe('An array of exam questions tailored to the student.'),
});
export type AdaptiveExamOutput = z.infer<typeof AdaptiveExamOutputSchema>;

export async function generateAdaptiveExam(input: AdaptiveExamInput): Promise<AdaptiveExamOutput> {
  return adaptiveExamGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveExamPrompt',
  input: {schema: AdaptiveExamInputSchema},
  output: {schema: AdaptiveExamOutputSchema},
  prompt: `You are an expert at generating custom exams for students based on their weaknesses.

You will analyze the student's past performance data and identify their weak topics.
Based on these weak topics, you will generate an exam with {{numQuestions}} questions focused on those areas.

Student ID: {{{studentId}}}
Number of Questions: {{{numQuestions}}}

Ensure that the generated exam questions cover the identified weak topics and are appropriate for the student's grade level.

Output the exam questions as a JSON array.`, //Fixed handlebars templating issue
});

const adaptiveExamGenerationFlow = ai.defineFlow(
  {
    name: 'adaptiveExamGenerationFlow',
    inputSchema: AdaptiveExamInputSchema,
    outputSchema: AdaptiveExamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
