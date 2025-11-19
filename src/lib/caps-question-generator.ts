import { QuestionType, Question, SubQuestion, Section, PaperStructure } from '@/app/admin/past-papers/[id]/page';
import { getAllowedQuestionTypesForSubject } from '@/app/admin/past-papers/[id]/page';
import { getPresetsForType, getAllPresetsForType, QuestionPreset } from './question-presets';

/**
 * CAPS Section Structure Definitions
 * Defines the typical structure for each subject's exam paper
 */
export interface CAPSSectionStructure {
  sectionA: {
    label: string;
    description: string;
    questionTypes: QuestionType[];
    questionCount: number;
    totalMarks: number;
  };
  sectionB: {
    label: string;
    description: string;
    questionTypes: QuestionType[];
    questionCount: number;
    totalMarks: number;
  };
  sectionC: {
    label: string;
    description: string;
    questionTypes: QuestionType[];
    questionCount: number;
    totalMarks: number;
  };
}

/**
 * CAPS-compliant section structures for Grade 12 subjects
 */
export const CAPS_SECTION_STRUCTURES: Record<string, CAPSSectionStructure> = {
  'Life Sciences': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'diagram-labeling', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation', 'data-set-analysis', 'matching-pairing', 'fill-in-blank'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'compare-evaluate-predict', 'case-study', 'extract-source'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'Mathematics': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 10,
      totalMarks: 10,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'numeric-calculation', 'formula-based-calculation', 'graph-interpretation', 'table-interpretation'],
      questionCount: 10,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'numeric-calculation', 'formula-based-calculation', 'graph-interpretation'],
      questionCount: 5,
      totalMarks: 40,
    },
  },
  'Physical Sciences': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'numeric-calculation', 'formula-based-calculation', 'diagram-interpretation', 'graph-interpretation', 'table-interpretation', 'data-set-analysis'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'numeric-calculation', 'formula-based-calculation', 'case-study'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'Business Studies': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'table-interpretation', 'graph-interpretation', 'data-set-analysis', 'matching-pairing', 'fill-in-blank'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'compare-evaluate-predict', 'case-study', 'extract-source'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'Economics': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'table-interpretation', 'graph-interpretation', 'data-set-analysis', 'matching-pairing', 'fill-in-blank'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'compare-evaluate-predict', 'case-study', 'extract-source'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'History': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'table-interpretation', 'graph-interpretation', 'map-cartoon', 'matching-pairing', 'fill-in-blank', 'sequencing-ordering'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'compare-evaluate-predict', 'case-study', 'extract-source'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'Geography': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'table-interpretation', 'graph-interpretation', 'map-cartoon', 'diagram-interpretation', 'matching-pairing', 'fill-in-blank'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'compare-evaluate-predict', 'case-study', 'extract-source'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'Accounting': {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'table-interpretation', 'graph-interpretation', 'data-set-analysis', 'numeric-calculation', 'accounting-financial-calculation', 'matching-pairing'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'case-study', 'accounting-financial-calculation', 'formula-based-calculation'],
      questionCount: 3,
      totalMarks: 30,
    },
  },
  'English Home Language': {
    sectionA: {
      label: 'SECTION A',
      description: 'Comprehension',
      questionTypes: ['multiple-choice', 'short-answer', 'extract-source'],
      questionCount: 10,
      totalMarks: 30,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Summary and Language',
      questionTypes: ['short-answer', 'paragraph-long-answer', 'extract-source', 'fill-in-blank'],
      questionCount: 5,
      totalMarks: 30,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Essay and Creative Writing',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation', 'compare-evaluate-predict'],
      questionCount: 2,
      totalMarks: 40,
    },
  },
  'English First Additional Language': {
    sectionA: {
      label: 'SECTION A',
      description: 'Comprehension',
      questionTypes: ['multiple-choice', 'short-answer', 'extract-source'],
      questionCount: 10,
      totalMarks: 30,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Summary and Language',
      questionTypes: ['short-answer', 'paragraph-long-answer', 'extract-source', 'fill-in-blank'],
      questionCount: 5,
      totalMarks: 30,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Essay and Creative Writing',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation'],
      questionCount: 2,
      totalMarks: 40,
    },
  },
};

/**
 * Get CAPS section structure for a subject
 * Falls back to a default structure if subject not found
 */
export function getCAPSSectionStructure(subject: string): CAPSSectionStructure {
  // Try exact match first
  if (CAPS_SECTION_STRUCTURES[subject]) {
    return CAPS_SECTION_STRUCTURES[subject];
  }

  // Try partial matches
  const normalizedSubject = subject.toLowerCase().trim();
  
  if (normalizedSubject.includes('life') && normalizedSubject.includes('science')) {
    return CAPS_SECTION_STRUCTURES['Life Sciences'];
  }
  if (normalizedSubject.includes('physical') && normalizedSubject.includes('science')) {
    return CAPS_SECTION_STRUCTURES['Physical Sciences'];
  }
  if (normalizedSubject.includes('business') && normalizedSubject.includes('stud')) {
    return CAPS_SECTION_STRUCTURES['Business Studies'];
  }
  if (normalizedSubject.includes('economic') && !normalizedSubject.includes('management')) {
    return CAPS_SECTION_STRUCTURES['Economics'];
  }
  if (normalizedSubject.includes('history') || normalizedSubject.includes('hist')) {
    return CAPS_SECTION_STRUCTURES['History'];
  }
  if (normalizedSubject.includes('geography') || normalizedSubject.includes('geo')) {
    return CAPS_SECTION_STRUCTURES['Geography'];
  }
  if (normalizedSubject.includes('accounting') || normalizedSubject.includes('account')) {
    return CAPS_SECTION_STRUCTURES['Accounting'];
  }
  if (normalizedSubject.includes('english') && (normalizedSubject.includes('home') || normalizedSubject.includes('hl'))) {
    return CAPS_SECTION_STRUCTURES['English Home Language'];
  }
  if (normalizedSubject.includes('english') && (normalizedSubject.includes('first') || normalizedSubject.includes('additional') || normalizedSubject.includes('fal'))) {
    return CAPS_SECTION_STRUCTURES['English First Additional Language'];
  }
  if (normalizedSubject.includes('math') && !normalizedSubject.includes('literacy')) {
    return CAPS_SECTION_STRUCTURES['Mathematics'];
  }

  // Default structure for unknown subjects
  return {
    sectionA: {
      label: 'SECTION A',
      description: 'Multiple Choice Questions',
      questionTypes: ['multiple-choice'],
      questionCount: 20,
      totalMarks: 20,
    },
    sectionB: {
      label: 'SECTION B',
      description: 'Short Questions',
      questionTypes: ['short-answer', 'table-interpretation', 'graph-interpretation'],
      questionCount: 8,
      totalMarks: 50,
    },
    sectionC: {
      label: 'SECTION C',
      description: 'Long Questions',
      questionTypes: ['paragraph-long-answer', 'reasoning-interpretation'],
      questionCount: 3,
      totalMarks: 30,
    },
  };
}

/**
 * Generate a random question from presets for a given type and subject
 */
function generateRandomQuestion(
  questionType: QuestionType,
  subject: string,
  questionNumber: string,
  sectionLabel: string,
  customPresets?: QuestionPreset[]
): Question | null {
  // Use getAllPresetsForType to get both built-in and custom presets
  const presets = getAllPresetsForType(questionType, subject, customPresets);
  
  if (presets.length === 0) {
    // Fallback: create a basic question
    return {
      id: `q-${Date.now()}-${Math.random()}`,
      number: questionNumber,
      type: questionType,
      text: `[${sectionLabel}] ${questionType} question ${questionNumber}`,
      marks: 2,
      instructionText: '',
      subQuestions: [],
    };
  }

  // Randomly select a preset
  const randomPreset = presets[Math.floor(Math.random() * presets.length)];
  
  // Create question from preset
  const question: Question = {
    id: `q-${Date.now()}-${Math.random()}`,
    number: questionNumber,
    type: questionType,
    text: randomPreset.text,
    marks: randomPreset.marks,
    instructionText: randomPreset.instructionText || '',
    subQuestions: [],
  };

  // Add type-specific data
  if (randomPreset.options && questionType === 'multiple-choice') {
    question.options = randomPreset.options;
  }
  if (randomPreset.tableData && (questionType === 'table-interpretation' || questionType === 'table' || questionType === 'data-set-analysis' || questionType === 'matching-pairing')) {
    question.tableData = randomPreset.tableData;
  }
  if (randomPreset.graphData && (questionType === 'graph-interpretation' || questionType === 'graph')) {
    question.graphData = randomPreset.graphData;
  }
  if (randomPreset.extractText && (questionType === 'extract-source' || questionType === 'extract' || questionType === 'case-study')) {
    question.extractText = randomPreset.extractText;
  }
  if (randomPreset.hasDiagram || randomPreset.diagramLabel) {
    question.hasDiagram = true;
    question.diagramLabel = randomPreset.diagramLabel || 'Diagram';
  }

  return question;
}

/**
 * Generate sub-questions for a question based on section and question type
 */
function generateSubQuestions(
  question: Question,
  subject: string,
  sectionIndex: number,
  customPresets?: QuestionPreset[]
): SubQuestion[] {
  const subQuestions: SubQuestion[] = [];
  
  // Section A (multiple choice) typically doesn't have sub-questions
  if (sectionIndex === 0) {
    return subQuestions;
  }
  
  // Section B: Some questions have 1-3 sub-questions
  // Section C: Most questions have 2-4 sub-questions
  const shouldHaveSubQuestions = sectionIndex === 2 || (sectionIndex === 1 && Math.random() > 0.3); // 100% for Section C, 70% chance for Section B
  
  if (!shouldHaveSubQuestions) {
    return subQuestions;
  }
  
  const subQuestionCount = sectionIndex === 1 
    ? Math.floor(Math.random() * 3) + 1 // 1-3 sub-questions for Section B
    : Math.floor(Math.random() * 3) + 2; // 2-4 sub-questions for Section C
  
  // Determine appropriate question types for sub-questions
  const subQuestionTypes: QuestionType[] = [];
  if (question.type === 'paragraph-long-answer' || question.type === 'case-study') {
    subQuestionTypes.push('short-answer', 'reasoning-interpretation', 'compare-evaluate-predict');
  } else if (question.type === 'numeric-calculation' || question.type === 'formula-based-calculation') {
    subQuestionTypes.push('numeric-calculation', 'short-answer');
  } else {
    subQuestionTypes.push('short-answer', 'numeric-calculation', 'reasoning-interpretation');
  }
  
  for (let i = 1; i <= subQuestionCount; i++) {
    const subQuestionType = subQuestionTypes[Math.floor(Math.random() * subQuestionTypes.length)];
    const presets = getAllPresetsForType(subQuestionType, subject, customPresets);
    
    if (presets.length > 0) {
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      const subQuestionNumber = `${question.number}.${i}`;
      
      const subQuestion: SubQuestion = {
        id: `sq-${Date.now()}-${Math.random()}`,
        number: subQuestionNumber,
        type: subQuestionType,
        text: randomPreset.text,
        marks: Math.max(1, randomPreset.marks - 1) || 2, // Sub-questions typically worth slightly less
      };
      
      // Add type-specific data for sub-questions
      if (randomPreset.options && subQuestionType === 'multiple-choice') {
        subQuestion.options = randomPreset.options;
      }
      if (randomPreset.tableData) {
        subQuestion.tableData = randomPreset.tableData;
      }
      if (randomPreset.graphData) {
        subQuestion.graphData = randomPreset.graphData;
      }
      if (randomPreset.extractText) {
        subQuestion.extractText = randomPreset.extractText;
      }
      if (randomPreset.hasDiagram || randomPreset.diagramLabel) {
        subQuestion.hasDiagram = true;
        subQuestion.diagramLabel = randomPreset.diagramLabel || 'Diagram';
      }
      
      subQuestions.push(subQuestion);
    } else {
      // Fallback sub-question
      const subQuestionNumber = `${question.number}.${i}`;
      subQuestions.push({
        id: `sq-${Date.now()}-${Math.random()}`,
        number: subQuestionNumber,
        type: subQuestionType,
        text: `Sub-question ${subQuestionNumber}`,
        marks: 2,
      });
    }
  }
  
  return subQuestions;
}

/**
 * Generate questions for a section based on CAPS structure
 */
function generateSectionQuestions(
  sectionConfig: CAPSSectionStructure['sectionA'] | CAPSSectionStructure['sectionB'] | CAPSSectionStructure['sectionC'],
  subject: string,
  sectionIndex: number,
  startMainQuestion: number,
  customPresets?: QuestionPreset[]
): Question[] {
  const questions: Question[] = [];
  
  // Distribute questions across question types
  const questionTypes = sectionConfig.questionTypes;
  const questionsPerType = Math.ceil(sectionConfig.questionCount / questionTypes.length);
  
  let questionIndex = 0;
  let mainQuestionNum = startMainQuestion;
  let subQuestionNum = 1;
  
  for (const questionType of questionTypes) {
    const countForThisType = Math.min(
      questionsPerType,
      sectionConfig.questionCount - questionIndex
    );
    
    for (let i = 0; i < countForThisType; i++) {
      let questionNumber: string;
      
      if (sectionIndex === 0) {
        // Section A: Simple sequential numbering (1, 2, 3, 4...)
        questionNumber = `${mainQuestionNum}`;
        mainQuestionNum++;
      } else if (sectionIndex === 1) {
        // Section B: Structured numbering (1.1, 1.2, 2.1, 2.2, 3.1, 3.2...)
        questionNumber = `${mainQuestionNum}.${subQuestionNum}`;
        subQuestionNum++;
        // Move to next main question after 2 sub-questions typically
        if (subQuestionNum > 2) {
          subQuestionNum = 1;
          mainQuestionNum++;
        }
      } else {
        // Section C: Long questions (1, 2, 3... with optional sub-questions 1.1, 1.2, etc.)
        // For Section C, we typically have fewer main questions with sub-questions
        if (i === 0 || (questions.length > 0 && !questions[questions.length - 1].number.includes('.'))) {
          questionNumber = `${mainQuestionNum}`;
          // Some questions in Section C have sub-questions
          if (Math.random() > 0.5 && i < countForThisType - 1) {
            // This question will have a sub-question, so next one will be sub
            subQuestionNum = 1;
          } else {
            mainQuestionNum++;
            subQuestionNum = 1;
          }
        } else {
          // This is a sub-question
          const prevMainNum = questions[questions.length - 1].number.split('.')[0];
          questionNumber = `${prevMainNum}.${subQuestionNum}`;
          subQuestionNum++;
          if (subQuestionNum > 2) {
            mainQuestionNum++;
            subQuestionNum = 1;
          }
        }
      }
      
      const question = generateRandomQuestion(questionType, subject, questionNumber, sectionConfig.label, customPresets);
      if (question) {
        // Generate sub-questions for this question
        const subQuestions = generateSubQuestions(question, subject, sectionIndex, customPresets);
        if (subQuestions.length > 0) {
          question.subQuestions = subQuestions;
        }
        questions.push(question);
      }
      questionIndex++;
    }
    
    if (questionIndex >= sectionConfig.questionCount) break;
  }

  return questions;
}

/**
 * Generate a complete CAPS-compliant question set for a subject
 */
export function generateCAPSQuestionSet(
  subject: string,
  grade: number = 12,
  year: string = new Date().getFullYear().toString(),
  customPresets?: QuestionPreset[]
): PaperStructure {
  const structure = getCAPSSectionStructure(subject);
  const sections: Section[] = [];
  
  // Generate Section A
  const sectionAQuestions = generateSectionQuestions(structure.sectionA, subject, 0, 1, customPresets);
  sections.push({
    id: 'section-a',
    label: structure.sectionA.label,
    number: 1,
    questions: sectionAQuestions,
    totalMarks: sectionAQuestions.reduce((sum, q) => {
      const questionMarks = q.marks || 0;
      const subQuestionMarks = (q.subQuestions || []).reduce((subSum, sq) => subSum + (sq.marks || 0), 0);
      return sum + questionMarks + subQuestionMarks;
    }, 0),
  });

  // Generate Section B
  const sectionBQuestions = generateSectionQuestions(structure.sectionB, subject, 1, 2, customPresets);
  sections.push({
    id: 'section-b',
    label: structure.sectionB.label,
    number: 2,
    questions: sectionBQuestions,
    totalMarks: sectionBQuestions.reduce((sum, q) => {
      const questionMarks = q.marks || 0;
      const subQuestionMarks = (q.subQuestions || []).reduce((subSum, sq) => subSum + (sq.marks || 0), 0);
      return sum + questionMarks + subQuestionMarks;
    }, 0),
  });

  // Generate Section C
  const sectionCQuestions = generateSectionQuestions(structure.sectionC, subject, 2, 3, customPresets);
  sections.push({
    id: 'section-c',
    label: structure.sectionC.label,
    number: 3,
    questions: sectionCQuestions,
    totalMarks: sectionCQuestions.reduce((sum, q) => {
      const questionMarks = q.marks || 0;
      const subQuestionMarks = (q.subQuestions || []).reduce((subSum, sq) => subSum + (sq.marks || 0), 0);
      return sum + questionMarks + subQuestionMarks;
    }, 0),
  });

  const totalMarks = sections.reduce((sum, s) => sum + (s.totalMarks || 0), 0);

  return {
    sections,
    header: {
      subject: subject,
      paperNumber: '1',
      year: year,
      grade: grade,
      examBoard: 'DBE',
      certificateType: 'SC/NSC',
    },
    totalMarks,
  };
}

