import type { NormalizedExtraction, QuestionToken } from './types';

const QUESTION_PATTERN = /^(\d+(?:\.\d+)*)(?:\s*[).:-])?\s*(.*)$/;
const MARKS_PATTERN = /\((\d+)\)\s*$/;

function extractMarks(text: string): { text: string; marks?: number } {
  const match = text.match(MARKS_PATTERN);
  if (!match) {
    return { text };
  }
  const value = Number(match[1]);
  if (Number.isNaN(value)) {
    return { text };
  }
  const trimmed = text.replace(MARKS_PATTERN, '').trim();
  return { text: trimmed, marks: value };
}

export function tokenizeQuestions(normalized: NormalizedExtraction): QuestionToken[] {
  const tokens: QuestionToken[] = [];
  let current: QuestionToken | null = null;

  const pushCurrent = () => {
    if (current) {
      current.rawText = current.rawText.map((line) => line.trim()).filter(Boolean);
      tokens.push(current);
      current = null;
    }
  };

  normalized.pages.forEach((page) => {
    page.lines.forEach((line) => {
      const questionMatch = line.text.match(QUESTION_PATTERN);
      if (questionMatch) {
        const [_, number, rest] = questionMatch;
        const { text, marks } = extractMarks(rest.trim());
        pushCurrent();
        current = {
          number,
          rawText: [text],
          pageRange: [page.page, page.page],
          marks,
        };
        return;
      }

      if (current) {
        current.rawText.push(line.text);
        current.pageRange[1] = page.page;
      }
    });
  });

  pushCurrent();
  return tokens;
}
