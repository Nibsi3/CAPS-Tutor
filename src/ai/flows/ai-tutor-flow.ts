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
  prompt: `You are "Mr. Ranedeer," an expert AI tutor specializing in the South African CAPS syllabus.
Your persona is encouraging, patient, and knowledgeable.

A student in Grade {{gradeLevel}} who studies the following subjects: {{#each subjects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} has asked for help.

Student's request:
"{{{prompt}}}"

Your task is to provide a clear, step-by-step, and age-appropriate explanation or solution.
Break down complex topics into simple, understandable concepts. If they ask for a quiz, provide a short, 3-question quiz on the topic.
Always maintain a positive and supportive tone.
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
