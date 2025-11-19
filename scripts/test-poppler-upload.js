/**
 * Test script to upload Poppler JSON file
 * Usage: node scripts/test-poppler-upload.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const JSON_FILE_PATH = 'C:\\Users\\cameron\\Desktop\\Life Sciences P1 Nov 2020 Eng\\exam_structure.json';
const API_URL = 'http://localhost:9002/api/admin/past-papers-v2/upload-poppler-json';
const TEST_USER_ID = 'test-user-id'; // Replace with actual user ID

async function testUpload() {
  try {
    console.log('Reading JSON file...');
    const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    
    console.log(`File loaded: ${jsonData.past_paper_name}`);
    console.log(`Documents: ${jsonData.documents.length}`);
    console.log(`Images: ${jsonData.images.length}`);
    console.log(`Total questions: ${jsonData.total_questions}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(JSON_FILE_PATH), {
      filename: 'exam_structure.json',
      contentType: 'application/json',
    });
    formData.append('userId', TEST_USER_ID);
    formData.append('subject', 'Life Sciences');
    formData.append('year', '2020');
    formData.append('grade', '12');
    
    console.log('\nUploading to API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ Upload successful!');
      console.log(`Paper ID: ${result.paperId}`);
      console.log(`Message: ${result.message}`);
    } else {
      console.log('\n❌ Upload failed!');
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node.js 18+ with native fetch support');
  console.error('Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

testUpload();

