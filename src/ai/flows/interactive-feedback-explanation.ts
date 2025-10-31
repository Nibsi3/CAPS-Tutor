'use server';

/**
 * @fileOverview A flow that provides interactive feedback and step-by-step explanations for student answers.
 *
 * - getInteractiveFeedback - A function that handles the interactive feedback process.
 * - InteractiveFeedbackInput - The input type for the getInteractiveFeedback function.
 * - InteractiveFeedbackOutput - The return type for the getInteractiveFeedback function.
 */

import {ai, geminiFlash} from '@/ai/genkit';
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
  model: geminiFlash,
  prompt: `You are an AI tutor, "Mr. Ranedeer," specializing in the South African CAPS curriculum. A student needs feedback on their answer to a practice question. Your primary goal is to help the student learn, not to give them the answer directly.

**Context:**
- Subject: {{{subject}}}
- Grade Level: {{{gradeLevel}}}
- Question: "{{{question}}}"
- Student's Answer: "{{{studentAnswer}}}"

**Your Task:**
1.  **Assess the Answer**: Carefully evaluate the student's answer. Is it correct, partially correct, or incorrect?
2.  **Determine 'isCorrect'**: Set the 'isCorrect' boolean field to \`true\` if the answer is fundamentally correct, otherwise set it to \`false\`.
3.  **Craft the Explanation**:
    *   **If Correct**: Write a positive and encouraging confirmation. Briefly mention *why* it's correct. For example: "That's exactly right! You've correctly applied the formula for the area of a circle. Well done!"
    *   **If Incorrect**: This is the most important part. **DO NOT SOLVE THE ORIGINAL QUESTION FOR THEM.** Instead, guide them to the correct answer.
        1.  Start by acknowledging their effort (e.g., "Good attempt!" or "You're on the right track...").
        2.  Gently explain the concept or type of mistake they might have made (e.g., "It looks like there might have been a small mix-up when combining the like terms.").
        3.  **Create a similar, but different, example problem.** For instance, if the original question was to expand (x - 5)(x + 3), your example could be expanding (x + 2)(x - 4).
        4.  Provide a clear, step-by-step walkthrough of how to solve **your new example problem**.
        5.  End with an encouraging sentence that prompts them to try the **original question** again using the method you just demonstrated. For example: "Now, try applying that same FOIL method to the original problem. You can do it!"

Your response must be in the specified JSON format, with well-formatted Markdown for readability (use paragraphs and lists).
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
