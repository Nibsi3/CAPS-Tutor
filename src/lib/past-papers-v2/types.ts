/**
 * TypeScript types for Poppler-generated JSON structure and editor data models
 */

// Poppler JSON Structure Types
export interface PopplerTextBlock {
  type: string;
  text: string;
  bbox: [number, number, number, number];
  page: number;
}

export interface PopplerDiagram {
  bbox: [number, number, number, number];
  image_data: string; // Base64 encoded
  image_format: string;
  page: number;
  number: string | null;
  title: string | null;
  type: string | null;
  question_number: string | null;
  label: string;
  document_type?: string;
}

export interface PopplerPageData {
  page: number;
  text_blocks: PopplerTextBlock[];
  page_image: string | null;
  embedded_images: any[];
  vector_shapes: any[];
  diagrams: PopplerDiagram[];
  width: number;
  height: number;
}

export interface PopplerQuestion {
  number: string;
  type: string; // "multiple_choice", "text", "diagram", "subquestion"
  text: string;
  marks: number | null;
  options?: Record<string, Record<string, string>> | Record<string, string> | null;
  subquestions?: PopplerQuestion[] | null;
  diagram?: string | null;
  title?: string | null;
}

export interface PopplerSection {
  name: string;
  questions: PopplerQuestion[];
}

export interface PopplerStructured {
  heading: string;
  total_marks: number | null;
  sections: PopplerSection[];
}

export interface PopplerNormalizedQuestion {
  QuestionNumber: string;
  QuestionType: string;
  QuestionText: string;
  Marks: number | null;
  Section: string;
  LinkedDiagram: string | null;
  Title: string | null;
  ParentQuestion?: string;
  [key: string]: any; // For options like Option1.1.1, etc.
}

export interface PopplerDocument {
  document_type: string; // "question_paper", "memo", "addendum"
  pdf_path: string;
  pdf_name: string;
  raw_extraction: PopplerPageData[];
  structured: PopplerStructured;
  normalized: PopplerNormalizedQuestion[];
}

export interface PopplerImage {
  document_type: string;
  source_pdf: string;
  page: number;
  image_data: string; // Base64 encoded
  image_format: string;
  label: string;
  question_number: string | null;
  title: string | null;
  type: string; // "diagram", "graph", "table", etc.
  number: string | null; // e.g., "Diagram 1"
  bbox: [number, number, number, number];
  order: number;
}

export interface PopplerJSON {
  past_paper_name: string;
  output_directory: string;
  documents: PopplerDocument[];
  images: PopplerImage[];
  total_documents: number;
  total_questions: number;
  total_images: number;
}

// Editor Data Models
export interface EditorQuestion {
  id?: string; // Database ID
  paperId: string;
  number: string;
  type: 'normal' | 'multiple-choice' | 'table' | 'graph' | 'diagram' | 'extract' | 'subquestion' | 'true-false';
  text: string;
  marks: number;
  answer?: string;
  section?: string;
  parentQuestion?: string;
  order: number;
  
  // Multiple choice
  options?: string[];
  correctAnswer?: string;
  
  // Table
  tableData?: {
    headers: string[];
    rows: string[][];
    description?: string;
  };
  
  // Graph
  graphData?: {
    type?: 'line' | 'bar' | 'pie' | 'scatter';
    xAxisLabel?: string;
    yAxisLabel?: string;
    dataPoints?: Array<{ label: string; value: number }>;
    description?: string;
  };
  
  // Diagram
  diagramData?: {
    imageFileId?: string;
    imageData?: string; // Base64 fallback
    label?: string;
    title?: string;
    type?: string;
  };
  
  // Multiple images support (for questions with multiple diagrams/graphs/extracts)
  images?: Array<{
    imageFileId: string;
    type?: string; // 'diagram', 'graph', 'table', 'extract', etc.
    label?: string;
    title?: string;
  }>;
  
  // Extract
  extractText?: string;
  
  // Image reference (backward compatibility - use images array for multiple images)
  hasImage?: boolean;
  imageFileId?: string; // Primary image (first in images array if multiple)
  
  // Header question (e.g., "QUESTION 1", "SECTION A", instruction headers)
  isHeader?: boolean;
}

export interface EditorPaper {
  id?: string;
  teacherId: string;
  subject: string;
  year: string;
  grade: number;
  paperName: string;
  memoName: string;
  status: 'Processing' | 'Processed' | 'Failed' | 'Draft';
  questionCount: number;
  sections?: Array<{
    name: string;
    questionCount: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// API Request/Response Types
export interface UploadPopplerJSONRequest {
  file: File;
  userId: string;
  subject?: string;
  year?: string;
  grade?: string;
}

export interface UploadPopplerJSONResponse {
  success: boolean;
  paperId?: string;
  message?: string;
  error?: string;
}

