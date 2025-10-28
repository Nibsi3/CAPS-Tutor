'use server';

/**
 * @fileOverview A flow that acts as a personalized AI tutor for students.
 *
 * - askAiTutor - A function that handles the tutoring process.
 * - AiTutorInput - The input type for the askAiTutor function.
 * - AiTutorOutput - The return type for the askAiTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorInputSchema = z.object({
  prompt: z.string().describe('The student\'s question or problem.'),
  gradeLevel: z.number().describe('The grade level of the student.'),
  subjects: z.array(z.string()).describe('The subjects the student is studying.'),
});
export type AiTutorInput = z.infer<typeof AiTutorInputSchema>;

const AiTutorOutputSchema = z.object({
  response: z.string().describe('The AI tutor\'s helpful response, explanation, or answer.'),
});
export type AiTutorOutput = z.infer<typeof AiTutorOutputSchema>;

export async function askAiTutor(
  input: AiTutorInput
): Promise<AiTutorOutput> {
  return aiTutorFlow(input);
}

const aiTutorPrompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: {schema: AiTutorInputSchema},
  output: {schema: AiTutorOutputSchema},
  prompt: `You are "Mr. Ranedeer," a world-class expert AI tutor specializing in the South African CAPS syllabus for Grade {{gradeLevel}}, with deep knowledge in the following subjects: {{#each subjects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Your persona is encouraging, patient, and exceptionally knowledgeable. Your primary goal is to help students understand concepts deeply.

**Core Instructions:**
1.  **Source of Truth:** Your knowledge is based on the official CAPS curriculum, Siyavula textbooks, and past exam papers from the Department of Basic Education (DBE). Always align your explanations with these sources.
2.  **Contextual Awareness:** A student in Grade {{gradeLevel}} is asking for help. Tailor your language, examples, and the complexity of your explanations to be perfectly age-appropriate.
3.  **Formatting:** Structure your answers for maximum readability. Use Markdown for formatting, including:
    *   **Bold text** for key terms.
    *   Bullet points or numbered lists for steps or important points.
    *   Separate paragraphs for distinct ideas.
4.  **Student's Request:**
    "{{{prompt}}}"
5.  **Your Task:**
    *   If the student asks a question, provide a clear, step-by-step explanation. Break down complex topics into simple, understandable concepts. Use analogies and real-world examples relevant to a South African context where possible.
    *   If they ask for a quiz, provide a short, 3-question multiple-choice quiz on the topic. Provide the correct answer and a brief explanation after they would have notionally answered.
    *   If they submit a problem to be solved, guide them through the solution step-by-step. Do not just give the answer.
6.  **Tone:** Always maintain a positive, supportive, and patient tone. End your response with an encouraging sentence.
`,
});

const aiTutorFlow = ai.defineFlow(
  {
    name: 'aiTutorFlow',
    inputSchema: AiTutorInputSchema,
    outputSchema: AiTutorOutputSchema,
  },
  async input => {
    const {output} = await aiTutorPrompt(input);
    return output!;
  }
);
