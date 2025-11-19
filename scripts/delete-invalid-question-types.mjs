/**
 * Script to delete questions with invalid question types for their subjects
 * 
 * This script:
 * 1. Fetches all past papers from Appwrite
 * 2. For each paper, extracts the subject name
 * 3. Gets all questions for that paper
 * 4. Checks if each question's type is valid for that subject
 * 5. Deletes questions with invalid types
 */

import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Appwrite configuration
const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'capstutor';

if (!projectId || !apiKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   APPWRITE_PROJECT_ID:', projectId ? '✅' : '❌');
  console.error('   APPWRITE_API_KEY:', apiKey ? '✅' : '❌');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

/**
 * Subject name normalization map
 */
const subjectNameMap = {
  "English HL": "English Home Language",
  "English Home Lang": "English Home Language",
  "English FAL": "English First Additional Language",
  "English First Add Lang": "English First Additional Language",
  "Afrikaans HT": "Afrikaans Huistaal",
  "Afrikaans Huistaal": "Afrikaans Huistaal",
  "Afrikaans EAT": "Afrikaans Eerste Addisionele Taal",
  "Afrikaans Eerste Add Taal": "Afrikaans Eerste Addisionele Taal",
  "Technical Sciences": "Technical Sciences",
  "Mathematical Literacy": "Mathematical Literacy",
  "Maths Literacy": "Mathematical Literacy",
  "Engineering Graphics & Design": "Engineering Graphics & Design",
  "EGD": "Engineering Graphics & Design",
  "Life Science": "Life Sciences",
  "Life Science P1": "Life Sciences",
  "Life Science P2": "Life Sciences",
  "Physical Science": "Physical Sciences",
  "Physical Science P1": "Physical Sciences",
  "Physical Science P2": "Physical Sciences",
  // Agricultural subjects
  "Agricultural Science": "Agricultural Sciences",
  "Agricultural Management": "Agricultural Management Practices",
  "Agricultural Tech": "Agricultural Technology",
  "Agri Tech": "Agricultural Technology",
  // Technology subjects
  "Civil Tech": "Civil Technology",
  "Electrical Tech": "Electrical Technology",
  "Mechanical Tech": "Mechanical Technology",
  // Other subjects
  "Dance": "Dance Studies",
  "Marine Science": "Marine Sciences",
  "Equine": "Equine Studies",
  "Equine Science": "Equine Studies",
};

/**
 * Extract base subject from paper title
 */
function getBaseSubject(paperTitle) {
  if (!paperTitle) return '';
  
  const normalizedTitle = paperTitle.trim();
  
  // Check direct mappings first (case-insensitive)
  for (const [key, value] of Object.entries(subjectNameMap)) {
    if (normalizedTitle.toLowerCase().startsWith(key.toLowerCase())) {
      return value;
    }
  }
  
  // Remove "Paper X" suffix
  const withoutPaper = normalizedTitle.replace(/\s*(Paper|P)\s*\d+.*/i, '').trim();
  
  // Check if extracted part matches a known subject (case-insensitive)
  for (const [key, value] of Object.entries(subjectNameMap)) {
    if (withoutPaper.toLowerCase().startsWith(key.toLowerCase())) {
      return value;
    }
  }
  
  // Try matching against valid question types keys (case-insensitive)
  const lowerWithoutPaper = withoutPaper.toLowerCase();
  for (const validSubject of Object.keys(validQuestionTypesBySubject)) {
    if (lowerWithoutPaper.includes(validSubject.toLowerCase()) || 
        validSubject.toLowerCase().includes(lowerWithoutPaper)) {
      return validSubject;
    }
  }
  
  // Return normalized title as fallback
  return withoutPaper || normalizedTitle;
}

/**
 * Valid question types for each subject category
 */
const validQuestionTypesBySubject = {
  // Languages (Home Language & First Additional Language)
  "English Home Language": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "English First Additional Language": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Afrikaans Huistaal": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Afrikaans Eerste Addisionele Taal": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "isiXhosa": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "isiZulu": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Sepedi": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Sesotho": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Setswana": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "siSwati": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Tshivenda": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "Xitsonga": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  "isiNdebele": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  
  // Mathematics / Mathematical Literacy
  "Mathematics": [
    'short-answer', 'reasoning-interpretation', 'true-false-with-reason', 'compare-evaluate-predict',
    'sequencing-ordering', 'multiple-choice', 'matching-pairing', 'fill-in-blank',
    'diagram-interpretation', 'diagram-labeling', 'table-interpretation', 'graph-interpretation',
    'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation',
    'formula-based-calculation', 'accounting-financial-calculation', 'geography-scale-gradient',
    'biology-percentage-ratio'
  ],
  "Mathematical Literacy": [
    'short-answer', 'reasoning-interpretation', 'true-false-with-reason', 'compare-evaluate-predict',
    'sequencing-ordering', 'multiple-choice', 'matching-pairing', 'fill-in-blank',
    'diagram-interpretation', 'diagram-labeling', 'table-interpretation', 'graph-interpretation',
    'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation',
    'formula-based-calculation', 'accounting-financial-calculation', 'geography-scale-gradient',
    'biology-percentage-ratio'
  ],
  
  // Physical Sciences
  "Physical Sciences": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation', 'biology-percentage-ratio'
  ],
  
  // Life Sciences
  "Life Sciences": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'data-set-analysis', 'extract-source', 'case-study',
    'biology-percentage-ratio'
  ],
  
  // History
  "History": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  
  // Geography
  "Geography": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'geography-scale-gradient'
  ],
  
  // Accounting
  "Accounting": [
    'short-answer', 'reasoning-interpretation', 'true-false-with-reason', 'compare-evaluate-predict',
    'multiple-choice', 'matching-pairing', 'fill-in-blank', 'table-interpretation',
    'graph-interpretation', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'accounting-financial-calculation'
  ],
  
  // Business Studies
  "Business Studies": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'data-set-analysis', 'extract-source', 'case-study'
  ],
  
  // Economics
  "Economics": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Consumer Studies
  "Consumer Studies": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation',
    'accounting-financial-calculation', 'biology-percentage-ratio'
  ],
  
  // Engineering Graphics and Design
  "Engineering Graphics & Design": [
    'short-answer', 'reasoning-interpretation', 'true-false-with-reason', 'compare-evaluate-predict',
    'multiple-choice', 'matching-pairing', 'fill-in-blank', 'diagram-interpretation',
    'diagram-labeling', 'table-interpretation', 'graph-interpretation', 'extract-source',
    'case-study', 'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Computer Applications Technology
  "Computer Applications Technology": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Information Technology
  "Information Technology": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Tourism
  "Tourism": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation'
  ],
  
  // Visual Arts
  "Visual Arts": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  
  // Dramatic Arts
  "Dramatic Arts": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'map-cartoon', 'data-set-analysis',
    'extract-source', 'case-study'
  ],
  
  // Music
  "Music": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'extract-source', 'case-study', 'numeric-calculation'
  ],
  
  // Life Orientation
  "Life Orientation": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation',
    'accounting-financial-calculation', 'biology-percentage-ratio'
  ],
  
  // Religion Studies
  "Religion Studies": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  
  // Agricultural Sciences
  "Agricultural Sciences": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation', 'biology-percentage-ratio'
  ],
  
  // Agricultural Management Practices
  "Agricultural Management Practices": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation',
    'formula-based-calculation', 'accounting-financial-calculation'
  ],
  
  // Agricultural Technology
  "Agricultural Technology": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Civil Technology
  "Civil Technology": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Electrical Technology
  "Electrical Technology": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Mechanical Technology
  "Mechanical Technology": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation'
  ],
  
  // Dance Studies
  "Dance Studies": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'extract-source', 'case-study'
  ],
  
  // Design
  "Design": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study'
  ],
  
  // Hospitality Studies
  "Hospitality Studies": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation',
    'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study', 'numeric-calculation',
    'accounting-financial-calculation'
  ],
  
  // Marine Sciences
  "Marine Sciences": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'formula-based-calculation', 'biology-percentage-ratio'
  ],
  
  // Equine Studies
  "Equine Studies": [
    'short-answer', 'paragraph-long-answer', 'reasoning-interpretation', 'true-false-with-reason',
    'compare-evaluate-predict', 'sequencing-ordering', 'multiple-choice', 'matching-pairing',
    'fill-in-blank', 'diagram-interpretation', 'diagram-labeling', 'table-interpretation',
    'graph-interpretation', 'map-cartoon', 'data-set-analysis', 'extract-source', 'case-study',
    'numeric-calculation', 'biology-percentage-ratio'
  ],
};

/**
 * Get valid question types for a subject
 */
function getValidQuestionTypes(subject) {
  const normalizedSubject = getBaseSubject(subject);
  return validQuestionTypesBySubject[normalizedSubject] || [];
}

/**
 * Check if a question type is valid for a subject
 */
function isValidQuestionType(subject, questionType) {
  if (!questionType || questionType === 'free-text' || questionType === '') {
    // Allow questions without type or with default type
    return true;
  }
  
  const validTypes = getValidQuestionTypes(subject);
  if (validTypes.length === 0) {
    // If subject not found, don't delete (safer - might be a new subject)
    return true;
  }
  
  return validTypes.includes(questionType);
}

/**
 * Main function to delete invalid questions
 * @param {boolean} dryRun - If true, only report what would be deleted without actually deleting
 */
async function deleteInvalidQuestions(dryRun = false) {
  if (dryRun) {
    console.log('🔍 DRY RUN MODE: Will report what would be deleted without actually deleting\n');
  } else {
    console.log('🚀 Starting to delete questions with invalid types...\n');
  }
  
  try {
    // Step 1: Get all past papers
    console.log('📚 Fetching all past papers...');
    const BATCH_SIZE = 100;
    let offset = 0;
    let allPapers = [];
    let hasMore = true;
    
    while (hasMore) {
      const papers = await databases.listDocuments(
        databaseId,
        'pastpapers',
        [
          Query.limit(BATCH_SIZE),
          Query.offset(offset)
        ]
      );
      
      allPapers.push(...papers.documents);
      offset += papers.documents.length;
      hasMore = papers.documents.length === BATCH_SIZE;
    }
    
    console.log(`✅ Found ${allPapers.length} past papers\n`);
    
    if (allPapers.length === 0) {
      console.log('✅ No papers found. Exiting.');
      return;
    }
    
    // Step 2: Process each paper
    let totalDeleted = 0;
    let totalChecked = 0;
    const deletionStats = {};
    
    for (let i = 0; i < allPapers.length; i++) {
      const paper = allPapers[i];
      const subject = paper.subject || '';
      const paperId = paper.$id;
      
      console.log(`\n📄 Processing paper ${i + 1}/${allPapers.length}: ${subject} (${paperId.substring(0, 8)}...)`);
      
      // Get all questions for this paper
      let questionOffset = 0;
      let questionHasMore = true;
      let paperDeleted = 0;
      let paperChecked = 0;
      
      while (questionHasMore) {
        const questions = await databases.listDocuments(
          databaseId,
          'questions',
          [
            Query.equal('paperId', paperId),
            Query.limit(BATCH_SIZE),
            Query.offset(questionOffset)
          ]
        );
        
        for (const question of questions.documents) {
          paperChecked++;
          totalChecked++;
          
          const questionType = question.type || 'free-text';
          const questionNumber = question.number || 'unknown';
          
          if (!isValidQuestionType(subject, questionType)) {
            if (dryRun) {
              paperDeleted++;
              totalDeleted++;
              
              if (!deletionStats[subject]) {
                deletionStats[subject] = { count: 0, types: {} };
              }
              deletionStats[subject].count++;
              deletionStats[subject].types[questionType] = (deletionStats[subject].types[questionType] || 0) + 1;
              
              console.log(`  ⚠️  Would delete Q${questionNumber} (type: ${questionType}) - invalid for ${subject}`);
            } else {
              try {
                await databases.deleteDocument(
                  databaseId,
                  'questions',
                  question.$id
                );
                
                paperDeleted++;
                totalDeleted++;
                
                if (!deletionStats[subject]) {
                  deletionStats[subject] = { count: 0, types: {} };
                }
                deletionStats[subject].count++;
                deletionStats[subject].types[questionType] = (deletionStats[subject].types[questionType] || 0) + 1;
                
                console.log(`  ❌ Deleted Q${questionNumber} (type: ${questionType}) - invalid for ${subject}`);
              } catch (error) {
                console.error(`  ⚠️  Failed to delete question ${question.$id}:`, error.message);
              }
            }
          }
        }
        
        questionOffset += questions.documents.length;
        questionHasMore = questions.documents.length === BATCH_SIZE;
      }
      
      if (paperDeleted > 0) {
        if (dryRun) {
          console.log(`  ⚠️  Would delete ${paperDeleted} invalid question(s) from this paper`);
        } else {
          console.log(`  ✅ Deleted ${paperDeleted} invalid question(s) from this paper`);
        }
      } else {
        console.log(`  ✅ All ${paperChecked} question(s) are valid`);
      }
    }
    
    // Step 3: Print summary
    console.log('\n' + '='.repeat(60));
    if (dryRun) {
      console.log('📊 DRY RUN SUMMARY (No questions were actually deleted)');
    } else {
      console.log('📊 DELETION SUMMARY');
    }
    console.log('='.repeat(60));
    console.log(`Total questions checked: ${totalChecked}`);
    if (dryRun) {
      console.log(`Total questions that would be deleted: ${totalDeleted}`);
    } else {
      console.log(`Total questions deleted: ${totalDeleted}`);
    }
    console.log(`Papers processed: ${allPapers.length}`);
    
    if (Object.keys(deletionStats).length > 0) {
      console.log('\n📋 Deletions by subject:');
      for (const [subject, stats] of Object.entries(deletionStats)) {
        console.log(`\n  ${subject}:`);
        console.log(`    Total deleted: ${stats.count}`);
        console.log(`    Types deleted:`);
        for (const [type, count] of Object.entries(stats.types)) {
          console.log(`      - ${type}: ${count}`);
        }
      }
    }
    
    console.log('\n✨ Process complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

// Run the script
deleteInvalidQuestions(dryRun)
  .then(() => {
    if (dryRun) {
      console.log('\n✅ Dry run completed. Run without --dry-run to actually delete questions.');
    } else {
      console.log('\n✅ Script completed successfully');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

