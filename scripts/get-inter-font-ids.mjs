#!/usr/bin/env node

/**
 * Script to get Inter font file IDs from Appwrite Storage
 * Uses the Appwrite REST API to search for Inter font files
 */

import { Client, Storage, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = '690dafea0021f232399e'; // pastpaperbucket

async function main() {
  console.log('🔍 Searching for Inter font files in Appwrite Storage...\n');

  if (!PROJECT_ID) {
    console.error('❌ PROJECT_ID is not set');
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('❌ APPWRITE_API_KEY is not set');
    console.error('   Note: You can also get file IDs manually from Appwrite Console');
    process.exit(1);
  }

  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setKey(API_KEY);

    const storage = new Storage(client);

    console.log(`Endpoint: ${ENDPOINT}`);
    console.log(`Project ID: ${PROJECT_ID.substring(0, 8)}...`);
    console.log(`Bucket ID: ${BUCKET_ID}\n`);

    // Search for Inter fonts - try different query methods
    console.log('📂 Searching for Inter font files...\n');

    const interFileNames = [
      'Inter-Regular.woff2',
      'Inter-Medium.woff2',
      'Inter-SemiBold.woff2',
      'Inter-Bold.woff2',
    ];

    let allFiles = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let attempts = 0;

    // Get all files from bucket
    while (hasMore && attempts < 10) {
      try {
        const response = await storage.listFiles(BUCKET_ID, [], limit, offset);
        
        if (response.files && response.files.length > 0) {
          allFiles = allFiles.concat(response.files);
          offset += limit;
          
          if (response.files.length < limit) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching files at offset ${offset}:`, error.message);
        hasMore = false;
      }
      attempts++;
    }

    console.log(`📊 Found ${allFiles.length} total files in bucket\n`);

    // Filter to Inter fonts
    const interFiles = allFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.includes('inter') && fileName.includes('.woff2');
    });

    if (interFiles.length === 0) {
      console.log('⚠️  No Inter font files found in the bucket\n');
      console.log('💡 To find Inter font file IDs manually:');
      console.log('   1. Go to https://cloud.appwrite.io');
      console.log('   2. Navigate to Storage → Buckets → pastpaperbucket');
      console.log('   3. Click on Files tab');
      console.log('   4. Search for files containing "Inter" in the name');
      console.log('   5. Copy the File ID (the long alphanumeric ID) for each Inter font file');
      console.log('   6. Update src/lib/font-config.ts with the file IDs\n');
      console.log('Required Inter font files:');
      interFileNames.forEach(name => {
        console.log(`   - ${name}`);
      });
      process.exit(0);
    }

    // Display found Inter fonts
    console.log('✅ Found Inter font files:\n');
    console.log('='.repeat(80));

    const fontMap = {};
    
    interFiles.forEach(file => {
      const fileName = file.name;
      console.log(`📄 ${fileName}`);
      console.log(`   File ID: ${file.$id}`);
      console.log(`   Size: ${(file.sizeOriginal / 1024).toFixed(2)} KB`);
      console.log(`   URL: ${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`);
      console.log('');
      
      // Map file to expected name (case-insensitive match)
      const expectedName = interFileNames.find(expected => 
        fileName.toLowerCase().includes(expected.toLowerCase().replace('.woff2', ''))
      );
      if (expectedName) {
        fontMap[expectedName] = file.$id;
      }
    });

    // Generate code snippet for font-config.ts
    console.log('\n📝 Update src/lib/font-config.ts with these file IDs:\n');
    console.log('='.repeat(80));
    console.log('');
    
    // Show only the Inter fonts section
    interFileNames.forEach(fileName => {
      const fileId = fontMap[fileName] || `'' // TODO: Find file ID for ${fileName}`;
      console.log(`  '${fileName}': '${fileId}',`);
    });
    
    console.log('\n✨ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
      console.error(`   Type: ${error.type}`);
    }
    console.error('\n💡 If you get permission errors, you can get file IDs manually from Appwrite Console');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

