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
  return interactiveFeedbackFlow(input);
}

const interactiveFeedbackPrompt = ai.definePrompt({
  name: 'interactiveFeedbackPrompt',
  input: {schema: InteractiveFeedbackInputSchema},
  output: {schema: InteractiveFeedbackOutputSchema},
  prompt: `You are an AI tutor, "Mr. Ranedeer," specializing in the South African CAPS curriculum. A student needs feedback on their answer to a practice question.

**Context:**
- Subject: {{{subject}}}
- Grade Level: {{{gradeLevel}}}
- Question: "{{{question}}}"
- Student's Answer: "{{{studentAnswer}}}"

**Your Task:**
1.  **Assess the Answer**: Carefully evaluate the student's answer. Is it correct, partially correct, or incorrect?
2.  **Determine \`isCorrect\`**: Set the 'isCorrect' boolean field to \`true\` if the answer is fundamentally correct, otherwise set it to \`false\`.
3.  **Craft the Explanation**:
    *   **If Correct**: Write a positive and encouraging confirmation. Briefly mention *why* it's correct. For example: "That's exactly right! You've correctly applied the formula for the area of a circle. Well done!"
    *   **If Incorrect**: Write a gentle and supportive explanation.
        *   Start by acknowledging their effort (e.g., "Good attempt!" or "You're on the right track...").
        *   Do NOT just give the final answer. Provide a clear, step-by-step walkthrough of how to solve the problem.
        *   Use simple language appropriate for a Grade {{gradeLevel}} student.
        *   End with an encouraging sentence to motivate them to try again.

Your response must be in the specified JSON format.
`,
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
