/**
 * Test script to verify Appwrite Storage API key works
 * This helps debug authorization issues
 */

import { Client, Storage } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = '690dafea0021f232399e';

async function testWithSDK() {
  console.log('\n📦 Testing with node-appwrite SDK...\n');
  
  if (!PROJECT_ID) {
    console.error('❌ PROJECT_ID is not set');
    return false;
  }
  
  if (!API_KEY) {
    console.error('❌ APPWRITE_API_KEY is not set');
    return false;
  }
  
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID.substring(0, 8)}...`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}... (length: ${API_KEY.length})`);
  console.log(`Bucket ID: ${BUCKET_ID}\n`);
  
  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setKey(API_KEY);
    
    const storage = new Storage(client);
    
    console.log('Attempting to list files...');
    const response = await storage.listFiles(BUCKET_ID);
    
    console.log(`✅ SUCCESS! Found ${response.files.length} files (total: ${response.total})`);
    if (response.files.length > 0) {
      console.log('Sample files:');
      response.files.slice(0, 5).forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }
    return true;
  } catch (error) {
    console.error('❌ SDK Test Failed:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Type: ${error.type}`);
    console.error(`   Message: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
    }
    return false;
  }
}

async function testWithREST() {
  console.log('\n🌐 Testing with REST API directly...\n');
  
  if (!PROJECT_ID || !API_KEY) {
    console.log('⚠️ Skipping REST test (missing credentials)');
    return false;
  }
  
  try {
    const url = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`;
    console.log(`URL: ${url}`);
    console.log(`Method: GET`);
    console.log(`Headers: X-Appwrite-Project: ${PROJECT_ID.substring(0, 8)}...`);
    console.log(`Headers: X-Appwrite-Key: ${API_KEY.substring(0, 10)}...\n`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ REST API Test Failed:');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
    
    console.log(`✅ SUCCESS! Found ${data.files?.length || 0} files (total: ${data.total || 0})`);
    if (data.files && data.files.length > 0) {
      console.log('Sample files:');
      data.files.slice(0, 5).forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }
    return true;
  } catch (error) {
    console.error('❌ REST API Test Failed:');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Appwrite Storage API Key Access\n');
  console.log('='.repeat(60));
  
  const sdkResult = await testWithSDK();
  const restResult = await testWithREST();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`   SDK Test: ${sdkResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   REST Test: ${restResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!sdkResult && !restResult) {
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify APPWRITE_API_KEY in .env.local matches your API key in Appwrite Console');
    console.log('   2. Check that the API key has these Storage scopes:');
    console.log('      - files.read');
    console.log('      - files.write');
    console.log('      - buckets.read');
    console.log('      - buckets.write');
    console.log('   3. Verify bucket permissions allow API key access');
    console.log('   4. Make sure you restarted your dev server after updating .env.local');
  } else if (sdkResult && !restResult) {
    console.log('\n⚠️ SDK works but REST doesn\'t - this is unusual');
  } else if (!sdkResult && restResult) {
    console.log('\n⚠️ REST works but SDK doesn\'t - there may be an issue with node-appwrite');
  } else {
    console.log('\n✅ Both tests passed! Your API key is working correctly.');
  }
}

main().catch(console.error);

