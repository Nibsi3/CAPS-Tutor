#!/usr/bin/env node

/**
 * Get information about uploaded fonts from Appwrite Storage
 * This will help identify which font file is which
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
const BUCKET_ID = '690dafea0021f232399e';

// File IDs provided by user
const FILE_IDS = [
  '691ede4e000c5db2e14c',
  '691ede4700201f6ca8e4',
  '691ede3e001ae56ac7e3',
];

async function main() {
  console.log('🔍 Getting information about uploaded fonts...\n');

  if (!PROJECT_ID || !API_KEY) {
    console.error('❌ PROJECT_ID or API_KEY not set');
    console.error('   Set NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY in .env.local');
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

    console.log('📋 Fetching font file information...\n');

    for (const fileId of FILE_IDS) {
      try {
        const file = await storage.getFile(BUCKET_ID, fileId);
        const fileName = file.name;
        const fileSize = (file.sizeOriginal / 1024).toFixed(2);
        const permissions = file.$permissions || [];
        
        // Determine font family from filename
        let fontFamily = 'Unknown';
        let fontWeight = 'Regular';
        
        const fileNameLower = fileName.toLowerCase();
        if (fileNameLower.includes('pt') && fileNameLower.includes('sans')) {
          fontFamily = 'PT Sans';
          if (fileNameLower.includes('bold')) fontWeight = 'Bold';
          else if (fileNameLower.includes('regular')) fontWeight = 'Regular';
        } else if (fileNameLower.includes('space') && fileNameLower.includes('grotesk')) {
          fontFamily = 'Space Grotesk';
          if (fileNameLower.includes('variable')) fontWeight = 'Variable';
          else if (fileNameLower.includes('bold')) fontWeight = 'Bold';
          else if (fileNameLower.includes('regular')) fontWeight = 'Regular';
        } else if (fileNameLower.includes('source') && (fileNameLower.includes('code') || fileNameLower.includes('pro'))) {
          fontFamily = 'Source Code Pro';
          if (fileNameLower.includes('variable')) fontWeight = 'Variable';
          else if (fileNameLower.includes('bold')) fontWeight = 'Bold';
          else if (fileNameLower.includes('regular')) fontWeight = 'Regular';
        }

        console.log('='.repeat(80));
        console.log(`📄 File Name: ${fileName}`);
        console.log(`   File ID: ${fileId}`);
        console.log(`   Size: ${fileSize} KB`);
        console.log(`   Font Family: ${fontFamily}`);
        console.log(`   Font Weight: ${fontWeight}`);
        console.log(`   URL: ${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Error fetching file ${fileId}:`, error.message);
        console.log('');
      }
    }

    console.log('✨ Done!');
    console.log('\n📝 Copy the file IDs above to update font-config.ts');
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

