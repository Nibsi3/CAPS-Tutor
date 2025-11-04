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

import { groqChat, extractJsonFromText } from '@/ai/groq';
import { z } from 'zod';

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
  const grade = input.gradeLevel ?? 'unspecified';
  const subject = input.subject ?? 'General';
  const topicLine = input.topic
    ? `The questions MUST focus exclusively on the topic: "${input.topic}".`
    : `The user has not specified a topic. Identify common weak areas for a Grade ${grade} student in ${subject} and generate questions based on those.`;

  const prompt = `You are an expert question generator for the South African CAPS curriculum. Your task is to create a set of practice questions for a student.

Student Profile:
- Grade: ${grade}
- Subject: ${subject}

Instructions:
1. Analyze Request: The user wants ${input.numQuestions} practice questions.
2. Topic Focus:
   - ${topicLine}
3. Question Generation:
   - Generate exactly ${input.numQuestions} questions.
    - Each question must be relevant to the specified topic and appropriate for the student's grade level.
    - The questions should be varied and test different aspects of the topic. They should not be simple recall questions.
    - For the 'topic' field in the output, use the specific sub-topic each question relates to (e.g., if the main topic is 'Algebra', a sub-topic could be 'Factorizing Trinomials').

Source Material: Your questions should be based on the principles and content found in official CAPS documents, Siyavula textbooks, and past DBE exam papers.

Output strictly as JSON matching this TypeScript type:
{
  "examQuestions": Array<{ "question": string; "topic": string }>
}`;

  const content = await groqChat(prompt, { temperature: 0.3 });
  let jsonText = extractJsonFromText(content) ?? content;
  try {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      return { examQuestions: parsed } as AdaptiveExamOutput;
    }
    return parsed as AdaptiveExamOutput;
  } catch {
    // Best-effort graceful fallback
    const lines = content.split('\n').filter(Boolean).slice(0, input.numQuestions);
    return { examQuestions: lines.map(l => ({ question: l, topic: input.topic ?? 'General' })) };
  }
}
