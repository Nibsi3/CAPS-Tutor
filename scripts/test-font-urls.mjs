#!/usr/bin/env node

/**
 * Test font URLs to verify they're accessible
 * 
 * Usage:
 *   node scripts/test-font-urls.mjs
 */

// Font configuration
const FONT_BUCKET_ID = '690dafea0021f232399e';
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '690a39bf0011810ee554';

const FONT_FILE_IDS = {
  'FiraCode-Regular.woff2': '690dccc60002a57c716b',
  'FiraCode-Regular.woff': '690dccc60002a47b4614',
};

function getFontUrl(fileName) {
  const fileId = FONT_FILE_IDS[fileName];
  if (!fileId) return '';
  return `${ENDPOINT}/storage/buckets/${FONT_BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

console.log('🔗 Font URLs:\n');

for (const [fileName, fileId] of Object.entries(FONT_FILE_IDS)) {
  const url = getFontUrl(fileName);
  console.log(`📄 ${fileName}`);
  console.log(`   URL: ${url}`);
  console.log(`   File ID: ${fileId}\n`);
}

console.log('\n💡 Test these URLs in your browser to verify they load correctly.');
console.log('   If you see CORS errors, check Appwrite project-level CORS settings.');

