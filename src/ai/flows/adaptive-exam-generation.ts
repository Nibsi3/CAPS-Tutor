'use server';

/**
 * @fileOverview This file implements the adaptive exam generation flow.
 *
 * The flow analyzes a student's weak topics or a specific topic and generates custom practice questions.
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
  topic: z.string().optional().describe('A specific topic to generate questions for.'),
  gradeLevel: z.number().optional().describe('The grade level of the student.'),
  subject: z.string().optional().describe('The subject for the questions.'),
});
export type AdaptiveExamInput = z.infer<typeof AdaptiveExamInputSchema>;

const AdaptiveExamOutputSchema = z.object({
  examQuestions: z.array(
    z.object({
      question: z.string().describe('The text of the question. It should be a challenging and relevant question based on the CAPS curriculum.'),
      topic: z.string().describe('The specific topic from the curriculum that the question covers.'),
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
  prompt: `You are an expert question generator for the South African CAPS curriculum. Your task is to create a set of practice questions for a student.

**Student Profile:**
- Grade: {{{gradeLevel}}}
- Subject: {{{subject}}}

**Instructions:**
1.  **Analyze Request**: The user wants {{numQuestions}} practice questions.
2.  **Topic Focus**:
    {{#if topic}}
    - The questions MUST focus exclusively on the topic: **"{{{topic}}}"**.
    {{else}}
    - The user has not specified a topic. You should identify common weak areas for a Grade {{gradeLevel}} student in {{subject}} and generate questions based on those.
    {{/if}}
3.  **Question Generation**:
    - Generate exactly {{numQuestions}} questions.
    - Each question must be relevant to the specified topic and appropriate for the student's grade level.
    - The questions should be varied and test different aspects of the topic. They should not be simple recall questions.
    - For the 'topic' field in the output, use the specific sub-topic each question relates to (e.g., if the main topic is 'Algebra', a sub-topic could be 'Factorizing Trinomials').

**Source Material**: Your questions should be based on the principles and content found in official CAPS documents, Siyavula textbooks, and past DBE exam papers.

Generate the questions and output them as a JSON array.`,
});

const adaptiveExamGenerationFlow = ai.defineFlow(
  {
    name: 'adaptiveExamGenerationFlow',
    inputSchema: AdaptiveExamInputSchema,
    outputSchema: AdaptiveExamOutputSchema,
  },
  async input => {
    // In a real application, you might fetch student weakness data here if a topic isn't provided.
    const {output} = await prompt(input);
    return output!;
  }
);
