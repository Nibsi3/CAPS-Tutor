/**
 * Fix script to regenerate and re-upload questions
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const EXTRACTED_FOLDER = join(ROOT_DIR, 'extracted_papers');

console.log('🔧 Checking what needs to be fixed...\n');

// Check extraction summary
const extractionSummary = join(EXTRACTED_FOLDER, 'extraction_summary.json');
if (!existsSync(extractionSummary)) {
    console.log('❌ Extraction summary not found!');
    console.log('\n📋 Run this first:');
    console.log('   python scripts/extract_pdfs_with_metadata.py');
    process.exit(1);
}

const allPdfs = JSON.parse(readFileSync(extractionSummary, 'utf-8'));
console.log(`✓ Found ${allPdfs.length} extracted PDF(s)\n`);

// Check for questions
const questionsSummary = join(EXTRACTED_FOLDER, 'questions_summary.json');
if (!existsSync(questionsSummary)) {
    console.log('❌ Questions not generated yet!');
    console.log('\n📋 Run this next:');
    console.log('   node scripts/generate_questions_with_metadata.mjs');
    process.exit(1);
}

const questionsData = JSON.parse(readFileSync(questionsSummary, 'utf-8'));
const papersWithQuestions = questionsData.filter(pdf => pdf.ai_output && pdf.ai_output.questions && pdf.ai_output.questions.length > 0);

if (papersWithQuestions.length === 0) {
    console.log('❌ No questions found in questions_summary.json!');
    console.log('\n📋 The AI question generation failed or returned empty results.');
    console.log('   Run this to regenerate:');
    console.log('   node scripts/generate_questions_with_metadata.mjs');
    console.log('\n   Make sure GROQ_API_KEY is set in your environment.');
} else {
    console.log(`✅ Found ${papersWithQuestions.length} paper(s) with questions:`);
    papersWithQuestions.forEach(pdf => {
        console.log(`   - ${pdf.pdf}: ${pdf.ai_output.questions.length} questions`);
    });
    console.log('\n📋 Now upload to Firestore:');
    console.log('   node scripts/upload_to_firebase_with_metadata.mjs');
}



