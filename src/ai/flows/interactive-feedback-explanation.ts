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
  studentAnswer: z.string().describe("The student's answer to the question."),
  correctAnswer: z.string().optional().describe('The correct answer(s) for the question. May include multiple acceptable formats.'),
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
  const correctAnswerText = input.correctAnswer 
    ? `\n- Correct Answer(s): "${input.correctAnswer}"\n\nIMPORTANT: Be lenient when assessing answers. Accept equivalent formats:\n- Mathematical notation: Accept 2^2, 2², 2 squared, 2 to the power of 2\n- Units: Accept 2m2, 2 m^2, 2 m², 2 meter squared, 2 meters square\n- Fractions: Accept 1/2, ½, 0.5, one half\n- Variables: Accept x=5, x = 5, 5\n- Scientific notation: Accept 2×10^8, 2e8, 2 × 10^8\n- Common abbreviations and variations are acceptable\n\nWhen checking correctness, normalize the student's answer and compare meaning, not exact formatting.`
    : '';

  const prompt = `You are an AI tutor, "Mr. Ranedeer," specializing in the South African CAPS curriculum. A student needs feedback on their answer to a practice question. Your role is to GUIDE and TEACH, not to give direct answers. Your primary goal is to help students discover the answer themselves through examples, similar problems, and conceptual guidance.

Context:
- Subject: ${input.subject}
- Grade Level: ${input.gradeLevel}
- Question: "${input.question}"
- Student's Answer: "${input.studentAnswer}"${correctAnswerText}

Your Task:
1. Assess the Answer: Carefully evaluate the student's answer. Is it correct, partially correct, or incorrect?
   - BE LENIENT: Accept answers that are mathematically/scientifically equivalent even if formatted differently
   - Normalize formats before comparison (e.g., 2^2 = 2² = 2 squared; 2m2 = 2 m^2 = 2 m²)
   - Accept common abbreviations and variations
   - Consider if the student's answer demonstrates understanding of the concept
2. Determine 'isCorrect': Set the 'isCorrect' boolean field to true if the answer is fundamentally correct (accounting for format variations), otherwise set it to false.
3. Craft the Explanation (Your role as a TUTOR - guide them to understanding, but be CONCISE):
   - If Correct: Write a brief, positive confirmation (1-2 sentences max). Validate their understanding and encourage them. Do NOT provide additional examples or walkthroughs for correct answers.
   - If Incorrect: Your job is to TEACH concisely, not to reveal the answer. Guide them toward the solution:
     a) Acknowledge their effort briefly (1 sentence).
     b) Identify the specific concept or misconception that led to the mistake. Explain this concept clearly but concisely (2-3 sentences).
     c) Provide ONE simple, SIMILAR but DIFFERENT example problem (same concept, different numbers/scenario). Just state the example - don't over-explain it.
     d) Walk through the example step-by-step in 3-4 concise steps. Be direct and clear, not verbose.
     e) Connect back to the original problem briefly - one sentence on how to apply the method (1 sentence).
     f) End with brief encouragement to try again (1 sentence).
   - CRITICAL LENGTH GUIDELINE: Keep explanations SHORT and FOCUSED. Maximum 4-5 short paragraphs total. Each paragraph should be 2-3 sentences maximum. Be direct and get to the point quickly. Students appreciate concise, clear explanations over long-winded ones. If you find yourself writing more than 5 paragraphs, you're being too verbose - cut it down.
   - REMEMBER: You are a TUTOR. Your goal is to help students learn efficiently through concise guidance, not lengthy explanations. Quality over quantity - teach the concept clearly but briefly.

Formatting Guidelines (Use formatting to enhance readability and create professional, polished explanations):
   - **Bold text** (IMPORTANT - USE THIS STRATEGICALLY): You MUST use bold formatting for:
     * Key mathematical terms and rule names (e.g., "**exponent rule**", "**power of a power rule**")
     * Important concepts when first introduced (e.g., "**scale factor**", "**coefficient**")
     * Critical action steps (e.g., "**multiply the exponents**", "**simplify**")
     Use bold to make the most important information stand out. Don't overuse it - typically 2-4 bolded terms per explanation is ideal.
   
   - PARAGRAPH STRUCTURE (CRITICAL FOR READABILITY):
     * Use exactly TWO newlines (one blank line) between each paragraph - this creates nice visual separation
     * Keep paragraphs focused: Each paragraph should cover ONE main idea
     * Start each paragraph with a clear topic sentence
     * Make paragraphs roughly equal in length (2-3 sentences each) for visual balance
   
   - FORMATTING STYLE:
     * Write in a clear, conversational tone that's warm and encouraging
     * Use short, direct sentences when explaining steps
     * For step-by-step instructions, you can use simple numbering or bullet points if helpful
     * Ensure smooth transitions between paragraphs so the explanation flows naturally
   
   - VISUAL PRESENTATION:
     * Start explanations with an engaging, friendly opening
     * Break up long concepts into digestible chunks
     * Use strategic paragraph breaks to create a clean, professional appearance
     * End with an encouraging, brief closing statement
   
   - GENERAL RULE: Create explanations that are visually appealing and easy to scan. Well-structured paragraphs with strategic bold formatting and proper spacing make explanations much more pleasant to read and easier to understand.

CRITICAL OUTPUT FORMATTING RULES (MANDATORY):
   - NEVER use backtick characters anywhere in your explanation - not at the start, not at the end, not in the middle
   - Do NOT wrap the explanation in markdown code blocks - do NOT use triple backticks
   - Do NOT add backticks around the explanation text
   - NEVER include JSON structure in the explanation field - do NOT include "json", "isCorrect", "explanation:", or any JSON syntax in the explanation text
   - The explanation string should start directly with your text content (e.g., "You've attempted..." or "Great job!")
   - Do NOT include labels like "json" or field names like "explanation:" in your explanation text
   - Write the explanation as plain text with markdown formatting (bold, underline) where appropriate
   - The explanation should be a clean string value in the JSON with NO special formatting characters, JSON labels, or JSON structure at the start or end

Output strictly as JSON matching this TypeScript type:
{
  "isCorrect": boolean,
  "explanation": string
}`;

  const content = await groqChat(prompt, { temperature: 0.2 });
  const jsonText = extractJsonFromText(content) ?? content;
  try {
    const parsed = JSON.parse(jsonText) as InteractiveFeedbackOutput;
    // Ensure explanation is a clean string, remove any JSON artifacts
    if (parsed.explanation) {
      parsed.explanation = parsed.explanation
        // FIRST: Remove any JSON structure that might be embedded in the explanation
        .replace(/^json\s*/i, '') // Remove "json" label at start
        .replace(/^\s*{\s*"isCorrect"[^}]*"explanation"\s*:\s*/i, '') // Remove JSON structure prefix
        .replace(/^"explanation"\s*:\s*/i, '') // Remove just "explanation": part
        // Remove ALL backticks of any kind
        .replace(/`+/g, '') // Remove all backticks (single, double, triple, any number)
        .replace(/```[\w]*/g, '') // Remove triple backticks with optional language identifier
        // Remove surrounding quotes
        .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
        .replace(/\\n/g, '\n') // Convert escaped newlines
        .replace(/\\"/g, '"') // Unescape quotes
        // Remove leading/trailing whitespace and newlines (but preserve paragraph breaks)
        .replace(/^[\s\r\n]+|[\s\r\n]+$/g, '') // Remove leading/trailing whitespace and newlines
        // Clean up excessive whitespace (normalize to exactly two newlines for paragraphs)
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with exactly 2 (single blank line between paragraphs)
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces on lines
        .trim();
    }
    return parsed;
  } catch (error) {
    // If parsing fails, try to extract just the explanation text
    let cleanExplanation = content;
    
    // Try to extract explanation from JSON-like structure
    const explanationMatch = content.match(/"explanation"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
    if (explanationMatch) {
      cleanExplanation = explanationMatch[1]
        // Remove any JSON structure artifacts
        .replace(/^json\s*/i, '') // Remove "json" label at start
        .replace(/^"explanation"\s*:\s*/i, '') // Remove "explanation": part if present
        // FIRST: Remove ALL backticks of any kind (most aggressive - do this first)
        .replace(/`+/g, '') // Remove all backticks (single, double, triple, any number)
        .replace(/```[\w]*/g, '') // Remove triple backticks with optional language identifier
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        // Remove leading/trailing whitespace and newlines (but preserve paragraph breaks)
        .replace(/^[\s\r\n]+|[\s\r\n]+$/g, '') // Remove leading/trailing whitespace and newlines
        // Clean up excessive whitespace (normalize to exactly two newlines for paragraphs)
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with exactly 2 (single blank line between paragraphs)
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces on lines
        .trim()
    } else {
      // Remove JSON structure artifacts more aggressively
      cleanExplanation = content
        // Remove "json" label
        .replace(/^json\s*/i, '')
        // Remove JSON structure prefix patterns
        .replace(/^\s*{\s*"isCorrect"[^}]*"explanation"\s*:\s*/i, '')
        .replace(/^{.*?"explanation"\s*:\s*"?/, '')
        .replace(/"?\s*}[^}]*$/, '')
        // Remove "explanation": part if still present
        .replace(/^"explanation"\s*:\s*/i, '')
        // FIRST: Remove ALL backticks of any kind (most aggressive - do this first)
        .replace(/`+/g, '') // Remove all backticks (single, double, triple, any number)
        .replace(/```[\w]*/g, '') // Remove triple backticks with optional language identifier
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        // Remove leading/trailing whitespace and newlines (but preserve paragraph breaks)
        .replace(/^[\s\r\n]+|[\s\r\n]+$/g, '') // Remove leading/trailing whitespace and newlines
        // Clean up excessive whitespace (normalize to exactly two newlines for paragraphs)
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with exactly 2 (single blank line between paragraphs)
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces on lines
        .trim();
    }
    
    return {
      isCorrect: false,
      explanation: cleanExplanation || 'Unable to parse response. Please try again.',
    };
  }
}
