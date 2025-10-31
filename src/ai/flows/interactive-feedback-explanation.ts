'use server';

/**
 * @fileOverview A flow that provides interactive feedback and step-by-step explanations for student answers.
 *
 * - getInteractiveFeedback - A function that handles the interactive feedback process.
 * - InteractiveFeedbackInput - The input type for the getInteractiveFeedback function.
 * - InteractiveFeedbackOutput - The return type for the getInteractiveFeedback function.
 */

import { groqChat, extractJsonFromText } from '@/ai/groq';
import { z } from 'zod';

const InteractiveFeedbackInputSchema = z.object({
  question: z.string().describe('The practice question that was asked.'),
  studentAnswer: z.string().describe('The student’s answer to the question.'),
  gradeLevel: z.number().describe('The grade level of the student.'),
  subject: z.string().describe('The subject of the question.'),
});
export type InteractiveFeedbackInput = z.infer<typeof InteractiveFeedbackInputSchema>;

const InteractiveFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe('A boolean indicating whether the student’s answer is correct.'),
  explanation: z.string().describe('A friendly, step-by-step explanation for how to arrive at the correct answer. This should be written in a supportive and encouraging tone, tailored to the student\'s grade level. If the answer is correct, provide a positive affirmation and a brief confirmation of the method. If incorrect, gently point out the mistake and provide a clear, detailed walkthrough of the correct solution.'),
});
export type InteractiveFeedbackOutput = z.infer<typeof InteractiveFeedbackOutputSchema>;

export async function getInteractiveFeedback(
  input: InteractiveFeedbackInput
): Promise<InteractiveFeedbackOutput> {
  const prompt = `You are an AI tutor, "Mr. Ranedeer," specializing in the South African CAPS curriculum. A student needs feedback on their answer to a practice question. Your primary goal is to help the student learn, not to give them the answer directly.

Context:
- Subject: ${input.subject}
- Grade Level: ${input.gradeLevel}
- Question: "${input.question}"
- Student's Answer: "${input.studentAnswer}"

Your Task:
1. Assess the Answer: Carefully evaluate the student's answer. Is it correct, partially correct, or incorrect?
2. Determine 'isCorrect': Set the 'isCorrect' boolean field to true if the answer is fundamentally correct, otherwise set it to false.
3. Craft the Explanation:
   - If Correct: Write a positive and encouraging confirmation. Briefly mention why it's correct.
   - If Incorrect: Do NOT solve the original question. Instead:
     a) Acknowledge their effort.
     b) Explain the underlying concept or common mistake.
     c) Create a similar, but different, example problem.
     d) Provide a clear, step-by-step walkthrough of the example.
     e) End with encouragement to try the original question again.

Output strictly as JSON matching this TypeScript type:
{
  "isCorrect": boolean,
  "explanation": string
}`;

  const content = await groqChat(prompt, { temperature: 0.2 });
  const jsonText = extractJsonFromText(content) ?? content;
  try {
    return JSON.parse(jsonText) as InteractiveFeedbackOutput;
  } catch {
    return {
      isCorrect: false,
      explanation: content,
    };
  }
}
