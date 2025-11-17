import { parsePaperMetadata } from '@/lib/past-paper-processor';
import type { PyMuPDFExtractionResult } from '@/lib/pdf-pymupdf-extractor';
import { normalizeExtraction } from './text-normalizer';
import { tokenizeQuestions } from './question-tokenizer';
import { extractMultipleChoiceOptions, inferQuestionType } from './question-type';
import { createImageMatcher } from './image-matcher';
import type {
  ExtractedPaperV3,
  ExtractedSection,
  ExtractionOptions,
  QuestionType,
  SectionId,
} from './types';

const DEFAULT_SECTION_TITLES: Record<string, string> = {
  A: 'Section A',
  B: 'Section B',
  C: 'Section C',
};

function defaultSectionResolver(questionNumber: string): SectionId {
  const [main] = questionNumber.split('.');
  const idx = Number(main);
  if (idx === 1) return 'A';
  if (idx === 2 || idx === 3) return 'B';
  return 'C';
}

function guessMarks(type: QuestionType): number {
  switch (type) {
    case 'multiple-choice':
    case 'true-false':
      return 2;
    case 'matching':
      return 3;
    case 'diagram':
      return 4;
    default:
      return 4;
  }
}

function ensureSection(
  map: Map<SectionId, ExtractedSection>,
  id: SectionId
): ExtractedSection {
  if (!map.has(id)) {
    const title = DEFAULT_SECTION_TITLES[id] ?? `Section ${id}`;
    map.set(id, { id, title });
  }
  return map.get(id)!;
}

export function buildExtractedPaperV3(
  extraction: PyMuPDFExtractionResult,
  options: ExtractionOptions = {}
): ExtractedPaperV3 {
  const normalized = normalizeExtraction(extraction);
  const tokens = tokenizeQuestions(normalized);
  const { media, findImageForToken } = createImageMatcher(normalized);

  const filename = extraction.filename ?? '';
  const meta = parsePaperMetadata(filename);

  const sectionMap = new Map<SectionId, ExtractedSection>();
  const sectionResolver = options.sectionResolver ?? defaultSectionResolver;

  const questions = tokens.map((token) => {
    const joinedText = token.rawText.join('\n').trim();
    const type = inferQuestionType(token, joinedText);
    const optionsList = extractMultipleChoiceOptions(token.rawText);
    const image = findImageForToken(token);
    const section = sectionResolver(token.number);
    ensureSection(sectionMap, section);

    return {
      questionNumber: token.number,
      section,
      type,
      marks: token.marks ?? guessMarks(type),
      text: joinedText,
      options: optionsList,
      hasImage: Boolean(image),
      imageFilename: image?.filename,
      imageLabel: image?.label,
      pageRange: token.pageRange,
    };
  });

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);

  return {
    subject: options.subject ?? meta.subject,
    grade: options.grade ?? meta.grade,
    paper: options.paper ?? meta.paper,
    year: options.year ?? meta.year,
    sections: Array.from(sectionMap.values()),
    questions,
    media,
    totalMarks,
    sourceFilename: filename,
  };
}
