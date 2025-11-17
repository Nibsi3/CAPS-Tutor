import type { PyMuPDFExtractionResult, PageData, ExtractedImage as PyMuPDFImage } from '@/lib/pdf-pymupdf-extractor';

export type SectionId = 'A' | 'B' | 'C' | 'D' | 'Memo' | string;

export type QuestionType =
  | 'multiple-choice'
  | 'free-text'
  | 'diagram'
  | 'matching'
  | 'true-false';

export interface ExtractedSection {
  id: SectionId;
  title: string;
  description?: string;
  marks?: number;
}

export interface QuestionMedia {
  filename: string;
  page: number;
  bbox: [number, number, number, number];
  width: number;
  height: number;
  label?: string;
  fileId?: string;
}

export interface ExtractedQuestion {
  questionNumber: string;
  section: SectionId;
  type: QuestionType;
  marks: number;
  text: string;
  options?: string[];
  hasImage: boolean;
  imageFilename?: string;
  imageLabel?: string;
  answer?: string;
  pageRange?: [number, number];
}

export interface ExtractedPaperV3 {
  subject: string;
  grade: number;
  paper: string;
  year: number;
  durationMinutes?: number;
  totalMarks?: number;
  sections: ExtractedSection[];
  questions: ExtractedQuestion[];
  media: Record<string, QuestionMedia>;
  sourceFilename?: string;
}

export interface NormalizedLine {
  text: string;
  page: number;
  y0: number;
  y1: number;
  blockIndex: number;
}

export interface QuestionToken {
  number: string;
  rawText: string[];
  pageRange: [number, number];
  marks?: number;
}

export interface ExtractionOptions {
  subject?: string;
  grade?: number;
  paper?: string;
  year?: number;
  memoText?: string;
  sectionResolver?: (questionNumber: string) => SectionId;
}

export interface NormalizedExtraction {
  pages: Array<{ page: number; lines: NormalizedLine[]; images: PyMuPDFImage[] }>;
}

export type PyMuPDFExtraction = PyMuPDFExtractionResult;

export type { PageData, PyMuPDFImage };
