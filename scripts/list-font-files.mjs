#!/usr/bin/env node

/**
 * Script to list all font files in Appwrite Storage bucket
 * This helps identify file IDs for font configuration
 */

import { Client, Storage } from 'node-appwrite';
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
  console.log('📋 Listing font files in Appwrite Storage bucket...\n');

  if (!PROJECT_ID) {
    console.error('❌ PROJECT_ID is not set');
    console.error('   Set NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local');
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('❌ APPWRITE_API_KEY is not set');
    console.error('   Set APPWRITE_API_KEY in .env.local');
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

    // Try to list all files in the bucket
    // Note: Appwrite Storage listFiles supports queries, but for font files
    // we'll just list all and filter by extension/name
    let allFiles = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let attempts = 0;
    const maxAttempts = 10; // Safety limit

    console.log('📂 Listing all files in bucket...');
    
    while (hasMore && attempts < maxAttempts) {
      try {
        const response = await storage.listFiles(BUCKET_ID, [], limit, offset);
        
        if (response.files && response.files.length > 0) {
          allFiles = allFiles.concat(response.files);
          console.log(`   Found ${response.files.length} files (offset: ${offset}, total so far: ${allFiles.length})`);
        }
        
        if (!response.files || response.files.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      } catch (error) {
        console.error(`   Error at offset ${offset}:`, error.message);
        // Try to continue with next offset
        offset += limit;
        attempts++;
        if (attempts >= maxAttempts) {
          console.error('   Too many errors, stopping...');
          break;
        }
      }
      attempts++;
    }
    
    console.log(`\n📊 Total files found: ${allFiles.length}\n`);

    // Filter to font files only
    const fontExtensions = ['.woff2', '.woff', '.ttf', '.otf', '.eot', '.css'];
    const fontFiles = allFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      return fontExtensions.some(ext => fileName.endsWith(ext));
    });

    console.log(`📊 Found ${fontFiles.length} font files (out of ${allFiles.length} total files)\n`);

    if (fontFiles.length === 0) {
      console.log('⚠️  No font files found in the bucket');
      console.log('   Make sure fonts are uploaded to bucket 690dafea0021f232399e');
      process.exit(0);
    }

    // Group by font family
    const firaCodeFiles = fontFiles.filter(f => f.name.toLowerCase().includes('fira'));
    const interFiles = fontFiles.filter(f => f.name.toLowerCase().includes('inter'));
    const otherFiles = fontFiles.filter(f => 
      !f.name.toLowerCase().includes('fira') && !f.name.toLowerCase().includes('inter')
    );

    // Display Fira Code fonts
    if (firaCodeFiles.length > 0) {
      console.log('🔤 Fira Code Fonts:');
      console.log('='.repeat(80));
      firaCodeFiles.forEach(file => {
        console.log(`  '${file.name}': '${file.$id}',`);
        console.log(`    // Size: ${(file.sizeOriginal / 1024).toFixed(2)} KB`);
        console.log(`    // URL: ${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`);
        console.log('');
      });
    }

    // Display Inter fonts
    if (interFiles.length > 0) {
      console.log('\n🔤 Inter Fonts:');
      console.log('='.repeat(80));
      interFiles.forEach(file => {
        console.log(`  '${file.name}': '${file.$id}',`);
        console.log(`    // Size: ${(file.sizeOriginal / 1024).toFixed(2)} KB`);
        console.log(`    // URL: ${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`);
        console.log('');
      });
    }

    // Display other fonts
    if (otherFiles.length > 0) {
      console.log('\n📄 Other Font Files:');
      console.log('='.repeat(80));
      otherFiles.forEach(file => {
        console.log(`  '${file.name}': '${file.$id}',`);
        console.log(`    // Size: ${(file.sizeOriginal / 1024).toFixed(2)} KB`);
        console.log('');
      });
    }

    // Generate code snippet for font-config.ts
    console.log('\n📝 Copy this to src/lib/font-config.ts:');
    console.log('='.repeat(80));
    console.log('');
    console.log('export const FONT_FILE_IDS = {');
    fontFiles.forEach(file => {
      console.log(`  '${file.name}': '${file.$id}',`);
    });
    console.log('} as const;');
    console.log('');

    console.log('✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
      console.error(`   Type: ${error.type}`);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

