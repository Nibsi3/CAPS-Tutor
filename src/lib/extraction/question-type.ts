import type { QuestionToken, QuestionType } from './types';

const MCQ_OPTION_REGEX = /^([A-D])\s*[).:-]\s*(.+)$/i;
const DIAGRAM_KEYWORDS = ['diagram', 'figure', 'identify part', 'study the', 'refer to the'];
const MATCHING_KEYWORDS = ['match column', 'column a', 'column b'];
const TRUE_FALSE_KEYWORDS = ['true or false', 'indicate whether', 'answer true', 'write true'];

export function extractMultipleChoiceOptions(lines: string[]): string[] | undefined {
  const options: string[] = [];
  lines.forEach((line) => {
    const match = line.match(MCQ_OPTION_REGEX);
    if (match) {
      options.push(line.trim());
    }
  });
  if (options.length >= 3) {
    return options;
  }
  return undefined;
}

function textContainsKeyword(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function inferQuestionType(token: QuestionToken, joinedText: string): QuestionType {
  const options = extractMultipleChoiceOptions(token.rawText);
  if (options) {
    return 'multiple-choice';
  }
  if (textContainsKeyword(joinedText, DIAGRAM_KEYWORDS)) {
    return 'diagram';
  }
  if (textContainsKeyword(joinedText, MATCHING_KEYWORDS)) {
    return 'matching';
  }
  if (textContainsKeyword(joinedText, TRUE_FALSE_KEYWORDS)) {
    return 'true-false';
  }
  return 'free-text';
}
