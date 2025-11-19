/**
 * Test script to upload Poppler JSON file
 * Usage: node scripts/test-poppler-upload.mjs [userId]
 * 
 * This script tests the upload API route directly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const JSON_FILE_PATH = 'C:\\Users\\cameron\\Desktop\\Life Sciences P1 Nov 2020 Eng\\exam_structure.json';
const API_URL = 'http://localhost:9002/api/admin/past-papers-v2/upload-poppler-json';
const TEST_USER_ID = process.argv[2] || 'test-user-id'; // Get from command line or use default

async function testUpload() {
  try {
    console.log('='.repeat(60));
    console.log('Testing Poppler JSON Upload');
    console.log('='.repeat(60));
    console.log(`JSON File: ${JSON_FILE_PATH}`);
    console.log(`API URL: ${API_URL}`);
    console.log(`User ID: ${TEST_USER_ID}`);
    console.log('='.repeat(60));
    console.log();

    // Check if file exists
    if (!fs.existsSync(JSON_FILE_PATH)) {
      console.error(`❌ Error: File not found: ${JSON_FILE_PATH}`);
      process.exit(1);
    }

    // Read and validate JSON
    console.log('Reading JSON file...');
    const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    let jsonData;
    try {
      jsonData = JSON.parse(jsonContent);
    } catch (error) {
      console.error('❌ Error: Invalid JSON file');
      console.error(error.message);
      process.exit(1);
    }
    
    console.log(`✅ File loaded: ${jsonData.past_paper_name}`);
    console.log(`   Documents: ${jsonData.documents?.length || 0}`);
    console.log(`   Images: ${jsonData.images?.length || 0}`);
    console.log(`   Total questions: ${jsonData.total_questions || 0}`);
    console.log();

    // Create form data using native FormData (Node.js 18+)
    console.log('Preparing upload...');
    const formData = new FormData();
    
    // Read file as buffer and create File object
    const fileBuffer = fs.readFileSync(JSON_FILE_PATH);
    const fileBlob = new Blob([fileBuffer], { type: 'application/json' });
    const file = new File([fileBlob], 'exam_structure.json', { type: 'application/json' });
    
    formData.append('file', file);
    formData.append('userId', TEST_USER_ID);
    formData.append('subject', 'Life Sciences');
    formData.append('year', '2020');
    formData.append('grade', '12');
    
    console.log('Uploading to API...');
    console.log();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    console.log('='.repeat(60));
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log(`   Paper ID: ${result.paperId}`);
      console.log(`   Message: ${result.message}`);
      if (result.debug) {
        console.log();
        console.log('Debug Information:');
        console.log(`   Total questions converted: ${result.debug.totalQuestions}`);
        console.log(`   Questions saved: ${result.debug.savedCount}`);
        console.log(`   Errors: ${result.debug.errorCount}`);
        console.log(`   Skipped: ${result.debug.skippedCount}`);
        if (result.debug.firstQuestion) {
          console.log(`   First question: ${result.debug.firstQuestion.number} (${result.debug.firstQuestion.type}, ${result.debug.firstQuestion.textLength} chars)`);
        }
        if (result.debug.firstError) {
          console.log();
          console.log('   First Error:', result.debug.firstError);
        }
        if (result.debug.firstErrorDetails) {
          console.log('   Error Details:', JSON.stringify(result.debug.firstErrorDetails, null, 2));
        }
      }
      console.log();
      console.log(`Next steps:`);
      console.log(`1. Navigate to: http://localhost:9002/admin/past-papers-v2/editor/${result.paperId}`);
      console.log(`2. Verify questions are loaded correctly`);
      console.log(`3. Test editing different question types`);
    } else {
      console.log('❌ Upload failed!');
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
      process.exit(1);
    }
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Check if fetch and FormData are available (Node.js 18+)
if (typeof fetch === 'undefined' || typeof FormData === 'undefined') {
  console.error('This script requires Node.js 18+ with native fetch and FormData support');
  process.exit(1);
}

testUpload();

