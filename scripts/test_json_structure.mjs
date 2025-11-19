/**
 * Test script to examine JSON structure before processing
 */

import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

const jsonFilePath = process.argv[2];
if (!jsonFilePath || !existsSync(jsonFilePath)) {
  console.error('Usage: node test_json_structure.mjs <path-to-json-file>');
  process.exit(1);
}

try {
  console.log('Reading JSON file...');
  const jsonContent = readFileSync(jsonFilePath, 'utf-8');
  const jsonData = JSON.parse(jsonContent);
  
  console.log('\n=== METADATA ===');
  console.log(JSON.stringify(jsonData.metadata || {}, null, 2));
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total questions: ${jsonData.questions?.length || 0}`);
  console.log(`Total images: ${jsonData.questions?.reduce((sum, q) => sum + (q.images?.length || 0), 0) || 0}`);
  
  console.log(`\n=== FIRST 3 QUESTIONS ===`);
  jsonData.questions?.slice(0, 3).forEach((q, idx) => {
    console.log(`\n--- Question ${idx + 1} ---`);
    console.log(`Number: ${q.question_number}`);
    console.log(`Type: ${q.question_type}`);
    console.log(`Page: ${q.page_number}`);
    console.log(`Has Images: ${q.images && q.images.length > 0}`);
    console.log(`Image Count: ${q.images?.length || 0}`);
    console.log(`Question Text Length: ${q.question_text?.length || 0}`);
    console.log(`Full Text Length: ${q.full_text?.length || 0}`);
    console.log(`Question Text Preview: ${(q.question_text || '').substring(0, 100)}...`);
    console.log(`Full Text Preview: ${(q.full_text || '').substring(0, 200)}...`);
    
    if (q.images && q.images.length > 0) {
      console.log(`Images:`);
      q.images.slice(0, 2).forEach((img, imgIdx) => {
        if (typeof img === 'string') {
          console.log(`  [${imgIdx}] Path: ${img}`);
        } else if (img && typeof img === 'object') {
          console.log(`  [${imgIdx}] Type: object, Keys: ${Object.keys(img).join(', ')}`);
          if (img.path) console.log(`    Path: ${img.path}`);
          if (img.dataUri) console.log(`    DataUri: ${img.dataUri.substring(0, 50)}...`);
        }
      });
    }
  });
  
  console.log(`\n=== QUESTION TYPE DISTRIBUTION ===`);
  const typeCounts = {};
  jsonData.questions?.forEach(q => {
    const type = q.question_type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log(`\n✅ JSON file is valid and readable`);
  console.log(`\nNext step: Run process_json_past_paper.mjs to convert and upload`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}


