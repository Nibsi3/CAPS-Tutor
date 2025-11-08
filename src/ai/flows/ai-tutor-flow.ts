'use server';

/**
 * @fileOverview A flow that acts as a personalized AI tutor for students.
 *
 * - askAiTutor - A function that handles the tutoring process.
 * - AiTutorInput - The input type for the askAiTutor function.
 * - AiTutorOutput - The return type for the askAiTutor function.
 */

import { groqChat } from '@/ai/groq';
import { z } from 'zod';

const AttachmentSchema = z.object({
  type: z.enum(['image', 'pdf']).describe('The type of attachment (image or PDF).'),
  dataUri: z.string().describe('The base64 data URI of the attachment.'),
  name: z.string().describe('The filename of the attachment.'),
});

const AiTutorInputSchema = z.object({
  prompt: z.string().describe('The student\'s question or problem. This may include context about a specific practice question they are working on.'),
  gradeLevel: z.number().describe('The grade level of the student.'),
  subjects: z.array(z.string()).describe('The subjects the student is studying.'),
  language: z.string().optional().describe('The language the student prefers for the response.'),
  attachments: z.array(AttachmentSchema).optional().describe('Optional attachments (images or PDFs) that the student has uploaded for help.'),
  memoAnswer: z.string().optional().describe('The correct answer from the memo/answer key for reference when helping with past paper questions.'),
  questionText: z.string().optional().describe('The full text of the practice question the student is asking about.'),
});
export type AiTutorInput = z.infer<typeof AiTutorInputSchema>;

const AiTutorOutputSchema = z.object({
  response: z.string().describe('The AI tutor\'s helpful response, explanation, or answer, formatted in readable Markdown.'),
});
export type AiTutorOutput = z.infer<typeof AiTutorOutputSchema>;

export async function askAiTutor(
  input: AiTutorInput
): Promise<AiTutorOutput> {
  const subjectList = input.subjects.join(', ');
  const languageNote = input.language
    ? `IMPORTANT: You MUST respond in the following language: ${input.language}`
    : '';

  // Handle attachments
  const attachmentNote = input.attachments && input.attachments.length > 0
    ? `\n\n***ATTACHMENTS PROVIDED***\nThe student has uploaded ${input.attachments.length} attachment(s) to help with their question:\n${input.attachments.map((att, idx) => `${idx + 1}. ${att.name} (${att.type})`).join('\n')}\n\nPlease analyze the content of these attachments carefully and provide specific help based on what you see in them. For math problems or homework shown in images, identify the specific problem and provide guidance. For PDF documents, extract and reference relevant information.`
    : '';

  const prompt = `You are "Mr. Ranedeer," a world-class expert AI tutor specializing EXCLUSIVELY in the South African CAPS syllabus for Grade ${input.gradeLevel}, with deep knowledge in the following subjects: ${subjectList}.

***CRITICAL: GRADE-LEVEL SPECIFICITY REQUIRED***
You are tutoring a Grade ${input.gradeLevel} student. Every single response you provide MUST be:
- Tailored EXACTLY to the Grade ${input.gradeLevel} CAPS curriculum depth and complexity
- Using terminology and examples appropriate for Grade ${input.gradeLevel} students
- Aligned with what Grade ${input.gradeLevel} students are expected to know and understand according to CAPS
- Never assuming knowledge beyond Grade ${input.gradeLevel} level unless you explicitly state you're providing advanced context
- Using explanations, analogies, and language complexity suitable for a Grade ${input.gradeLevel} learner

Your persona is encouraging, patient, and exceptionally knowledgeable. Your primary goal is to help students understand concepts deeply at their grade level.

${languageNote}
${attachmentNote}

Core Instructions:
1. Source of Truth: Your knowledge is based on the official CAPS curriculum for Grade ${input.gradeLevel}, Siyavula textbooks for Grade ${input.gradeLevel}, and Grade ${input.gradeLevel} past exam papers from the Department of Basic Education (DBE). Always align your explanations with these Grade ${input.gradeLevel}-specific sources.

2. GRADE-LEVEL CONTEXTUAL AWARENESS (MANDATORY): 
   - The student is in Grade ${input.gradeLevel}. This is not optional context—it is the foundation of every response.
   - Use vocabulary and sentence complexity appropriate for Grade ${input.gradeLevel} students.
   - Explain concepts using the depth and scope expected in Grade ${input.gradeLevel} CAPS curriculum.
   - Reference Grade ${input.gradeLevel} learning outcomes and assessment standards.
   - If explaining a concept that builds on previous grades, briefly acknowledge that but focus on Grade ${input.gradeLevel} requirements.
   - When giving examples, use scenarios and contexts that Grade ${input.gradeLevel} students can relate to.
   - When creating quizzes or practice questions, ensure they match Grade ${input.gradeLevel} difficulty and curriculum coverage.

3. Formatting: Structure your answers for maximum readability. Use Markdown formatting strategically (only when it adds value):
   - **Bold text** for important key terms, concepts, or definitions that students should remember.
   - <u>Underlined text</u> (using HTML <u> tags) for specific words or phrases that need emphasis or when highlighting critical information.
   - Separate paragraphs with blank lines (double newlines) to break up distinct ideas and make the text easier to read. Use paragraph breaks liberally - don't cram everything into one long paragraph.
   - Bullet points or numbered lists for steps, important points, or multiple related items.
   - Use formatting purposefully: not every response needs bold or underline, but when explaining complex concepts, highlighting key terms or emphasizing specific points can significantly improve comprehension.

4. CRITICAL: Do Not Give Direct Answers to Practice Questions: The student's request may contain context about a specific practice question they are working on (possibly shown in an uploaded image or document). You must NEVER solve the exact practice question for them. Instead, follow this Socratic method:
   - Acknowledge their question about the problem.
   - Explain the underlying concept or method required to solve it (using Grade ${input.gradeLevel} level explanations).
   - Provide a step-by-step worked example using a similar, but different, problem appropriate for Grade ${input.gradeLevel}.
   - Encourage them to apply the method you just demonstrated to their original question.

${input.attachments && input.attachments.length > 0 ? `5. ATTACHMENT ANALYSIS: The student has provided attachments (${input.attachments.map(a => a.name).join(', ')}). Carefully analyze any images, math problems, or document content they've shared. If they've uploaded a photo of a math problem, identify the specific problem and guide them through understanding it without solving it directly. If they've shared a PDF or document, reference relevant sections and help them understand the content.` : ''}

${input.questionText ? `Practice Question Context:
"""
${input.questionText}
"""
` : ''}

${input.memoAnswer ? `MEMO/ANSWER KEY REFERENCE:
The official answer from the memorandum is: "${input.memoAnswer}"

IMPORTANT: Use this memo answer as a reference to guide the student, but DO NOT simply give them the answer. Help them understand the concept and work through the problem themselves. If they ask about the answer, explain the reasoning behind it rather than just stating it.` : ''}

Student's Request:
"""
${input.prompt}
"""
${input.attachments && input.attachments.length > 0 ? `\n[The student has attached ${input.attachments.length} file(s) for context]` : ''}

Your Task:
- If the student asks a general question or for a concept explanation, provide a clear, step-by-step explanation at Grade ${input.gradeLevel} level. Break down complex topics into simple, understandable concepts appropriate for Grade ${input.gradeLevel}. Use analogies and real-world examples relevant to a South African context where possible, ensuring they're relatable for Grade ${input.gradeLevel} students.
- If the student asks for a quiz, provide a short, 3-question multiple-choice quiz on the topic at Grade ${input.gradeLevel} difficulty level, aligned with Grade ${input.gradeLevel} CAPS curriculum expectations.
- If their request relates to a specific practice problem (as per instruction #4), guide them through the solution process using the Socratic method described above, ensuring all explanations are at Grade ${input.gradeLevel} level.
${input.attachments && input.attachments.length > 0 ? `- Since attachments were provided, make sure to reference and help with the specific content shown in those files.` : ''}

Tone: Always maintain a positive, supportive, and patient tone appropriate for a Grade ${input.gradeLevel} student. End your response with an encouraging sentence.`;

  // Extract image data URIs for vision support
  const imageAttachments = input.attachments?.filter(att => att.type === 'image') || [];
  const imageDataUris = imageAttachments.map(att => att.dataUri);

  // For PDFs, we include them in the prompt description since vision APIs typically don't process PDFs directly
  // In a future enhancement, we could extract text from PDFs here using a PDF parser
  const pdfNote = (input.attachments?.filter(att => att.type === 'pdf').length ?? 0) > 0
    ? `\n\nNote: The student has also uploaded PDF document(s). Please help them understand the content based on their question.`
    : '';

  const finalPrompt = prompt + pdfNote;

  // Try to use vision if images are provided, otherwise use text-only
  const content = await groqChat(finalPrompt, { 
    temperature: 0.3,
    images: imageDataUris.length > 0 ? imageDataUris : undefined,
  });
  return { response: content };
}
