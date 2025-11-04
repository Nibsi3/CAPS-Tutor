/**
 * Utility functions for filtering questions and past papers based on user's literature selections
 */

import { Question } from './questions';

export interface UserLiteratureSelection {
  'english-hl'?: {
    novel?: string;
    drama?: string;
    poems?: string[];
  };
  'english-fal'?: {
    novel?: string;
    drama?: string;
    poems?: string[];
  };
  'afrikaans-ht'?: {
    novel?: string;
    drama?: string;
    poems?: string[];
  };
  'afrikaans-eat'?: {
    novel?: string;
    drama?: string;
    poems?: string[];
  };
}

/**
 * Maps subject names to literature keys
 */
const subjectToLiteratureKey: Record<string, keyof UserLiteratureSelection> = {
  'English Home Language': 'english-hl',
  'English First Additional Language': 'english-fal',
  'Afrikaans Huistaal': 'afrikaans-ht',
  'Afrikaans Home Language': 'afrikaans-ht',
  'Afrikaans Eerste Addisionele Taal': 'afrikaans-eat',
  'Afrikaans First Additional Language': 'afrikaans-eat',
};

/**
 * Checks if a question should be shown based on user's literature selections
 */
export function shouldShowQuestion(
  question: Question,
  subject: string,
  userLiterature?: UserLiteratureSelection
): boolean {
  // If question has no literature metadata, always show it
  if (!question.literature) {
    return true;
  }

  // If user has no literature selections, don't show literature-specific questions
  if (!userLiterature) {
    return false;
  }

  const literatureKey = subjectToLiteratureKey[subject];
  if (!literatureKey) {
    // Not a literature subject, show the question
    return true;
  }

  const userSelection = userLiterature[literatureKey];
  if (!userSelection) {
    // User hasn't selected literature for this subject
    return false;
  }

  const { work, type } = question.literature;

  // Check if the user has selected this specific work
  if (type === 'novel' && userSelection.novel === work) {
    return true;
  }

  if (type === 'drama' && userSelection.drama === work) {
    return true;
  }

  if (type === 'poem' && userSelection.poems?.includes(work)) {
    return true;
  }

  // User hasn't selected this specific work
  return false;
}

/**
 * Filters questions based on user's literature selections
 */
export function filterQuestionsByLiterature<T extends Question>(
  questions: T[],
  subject: string,
  userLiterature?: UserLiteratureSelection
): T[] {
  // Check if this is a literature subject that requires filtering
  const literatureKey = subjectToLiteratureKey[subject];
  const isLiteratureSubject = !!literatureKey;

  // If not a literature subject, return all questions without filtering
  if (!isLiteratureSubject) {
    return questions;
  }

  // For literature subjects:
  // - Questions without literature tags (grammar, general topics) should ALWAYS be shown
  // - Questions with literature tags should only be shown if user has selected that literature

  // If user has no literature selections at all, only show non-literature questions
  if (!userLiterature || !userLiterature[literatureKey]) {
    return questions.filter(q => !q.literature);
  }

  const userSelection = userLiterature[literatureKey];
  
  // If user selection exists but is empty (no novel, drama, or poems selected)
  if (!userSelection || (!userSelection.novel && !userSelection.drama && (!userSelection.poems || userSelection.poems.length === 0))) {
    // Only show non-literature questions (grammar, etc.)
    return questions.filter(q => !q.literature);
  }

  // User has selected some literature - show matching literature questions AND all non-literature questions
  return questions.filter(q => {
    // Always show questions without literature tags (grammar, comprehension, etc.)
    if (!q.literature) {
      return true;
    }

    // For questions with literature tags, check if they match user's selections
    return shouldShowQuestion(q, subject, userLiterature);
  });
}

/**
 * Checks if a subject is a literature subject (English/Afrikaans)
 */
export function isLiteratureSubject(subject: string): boolean {
  return subject in subjectToLiteratureKey;
}

/**
 * Checks if Paper 2 questions should be shown for a subject
 * Paper 2 is the literature paper for English/Afrikaans
 */
export function shouldShowPaper2Questions(
  subject: string,
  paperNumber: string | undefined,
  userLiterature?: UserLiteratureSelection
): boolean {
  // Only filter Paper 2 for literature subjects
  if (paperNumber !== 'Paper 2') {
    return true;
  }

  const literatureKey = subjectToLiteratureKey[subject];
  if (!literatureKey) {
    return true;
  }

  // For Paper 2, user must have selected at least some literature
  if (!userLiterature || !userLiterature[literatureKey]) {
    return false;
  }

  const selection = userLiterature[literatureKey];
  // Check if user has selected at least one novel, drama, or poem
  return !!(selection?.novel || selection?.drama || (selection?.poems && selection.poems.length > 0));
}

