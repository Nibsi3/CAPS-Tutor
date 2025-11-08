/**
 * Test REST API pagination to see what works
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = '690dafea0021f232399e';

async function testPagination() {
  console.log('🧪 Testing REST API Pagination\n');
  console.log('='.repeat(60));
  
  // Test 1: Basic request
  console.log('\n1. Basic request (no pagination):');
  try {
    const url1 = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`;
    const response1 = await fetch(url1, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data1 = await response1.json();
    console.log(`   Files: ${data1.files?.length || 0}`);
    console.log(`   Total: ${data1.total || 0}`);
    console.log(`   Has cursorAfter: ${!!data1.cursorAfter}`);
    console.log(`   cursorAfter value: ${data1.cursorAfter || 'none'}`);
    if (data1.cursorAfter) {
      console.log(`   cursorAfter preview: ${data1.cursorAfter.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  // Test 2: With limit
  console.log('\n2. With limit=100:');
  try {
    const url2 = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files?limit=100`;
    const response2 = await fetch(url2, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data2 = await response2.json();
    console.log(`   Files: ${data2.files?.length || 0}`);
    console.log(`   Total: ${data2.total || 0}`);
    console.log(`   Has cursorAfter: ${!!data2.cursorAfter}`);
    if (data2.cursorAfter) {
      console.log(`   cursorAfter preview: ${data2.cursorAfter.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  // Test 3: Try using queries parameter (Appwrite format)
  console.log('\n3. With queries parameter:');
  try {
    const queries = encodeURIComponent(JSON.stringify([
      { method: 'limit', values: [100] }
    ]));
    const url3 = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files?queries=${queries}`;
    const response3 = await fetch(url3, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data3 = await response3.json();
    console.log(`   Files: ${data3.files?.length || 0}`);
    console.log(`   Total: ${data3.total || 0}`);
    console.log(`   Has cursorAfter: ${!!data3.cursorAfter}`);
    if (data3.cursorAfter) {
      console.log(`   cursorAfter preview: ${data3.cursorAfter.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  // Test 4: Try with cursorAfter if we got one
  console.log('\n4. Testing pagination with cursor:');
  try {
    // First get initial response
    const url4a = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files?limit=100`;
    const response4a = await fetch(url4a, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const data4a = await response4a.json();
    
    if (data4a.cursorAfter) {
      console.log(`   Got cursorAfter, trying next page...`);
      const queries4b = encodeURIComponent(JSON.stringify([
        { method: 'limit', values: [100] },
        { method: 'cursorAfter', values: [data4a.cursorAfter] }
      ]));
      const url4b = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files?queries=${queries4b}`;
      const response4b = await fetch(url4b, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': PROJECT_ID,
          'X-Appwrite-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      });
      const data4b = await response4b.json();
      console.log(`   Second page files: ${data4b.files?.length || 0}`);
      console.log(`   Total: ${data4b.total || 0}`);
    } else {
      console.log('   No cursorAfter in first response');
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

testPagination().catch(console.error);

