#!/usr/bin/env node

/**
 * Check font file permissions in Appwrite Storage
 * 
 * Usage:
 *   node scripts/check-font-permissions.mjs
 */

import { Client, Storage } from 'node-appwrite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Font configuration (from src/lib/font-config.ts)
const FONT_BUCKET_ID = '690dafea0021f232399e';
const FONT_FILE_IDS = {
  'FiraCode-Light.woff2': '690dccc40023721b7db4',
  'FiraCode-Light.woff': '690dccc4002375a118c4',
  'FiraCode-Regular.woff2': '690dccc60002a57c716b',
  'FiraCode-Regular.woff': '690dccc60002a47b4614',
  'FiraCode-Medium.woff2': '690dccc60002ab9ef88c',
  'FiraCode-Medium.woff': '690dccc40023783bc6d1',
  'FiraCode-SemiBold.woff2': '690dccc60002ac198ad6',
  'FiraCode-SemiBold.woff': '690dccc60002a5ebb163',
  'FiraCode-Bold.woff2': '690dccc400237a66f085',
  'FiraCode-Bold.woff': '690dccc40023382cb28f',
  'FiraCode-VF.woff2': '690dccc7000f16a19098',
  'FiraCode-VF.woff': '690dccc7000f14650fa7',
  'fira_code.css': '690dccc7000f1fe4ab82',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = FONT_BUCKET_ID;

async function main() {
  console.log('🔍 Checking font file permissions in Appwrite Storage...\n');
  
  if (!PROJECT_ID) {
    console.error('❌ Error: APPWRITE_PROJECT_ID or NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    process.exit(1);
  }
  
  if (!API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY is not set');
    process.exit(1);
  }
  
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  
  const storage = new Storage(client);
  
  try {
    console.log('📋 Font Files to Check:');
    console.log(`   Bucket ID: ${BUCKET_ID}\n`);
    
    for (const [fileName, fileId] of Object.entries(FONT_FILE_IDS)) {
      try {
        const file = await storage.getFile(BUCKET_ID, fileId);
        const permissions = file.$permissions || [];
        const hasPublicRead = permissions.some(p => p === 'read("any")' || p.includes('read("any")'));
        
        console.log(`📄 ${fileName}`);
        console.log(`   File ID: ${fileId}`);
        console.log(`   Name: ${file.name}`);
        console.log(`   Size: ${(file.sizeOriginal / 1024).toFixed(2)} KB`);
        console.log(`   Permissions: ${permissions.length > 0 ? permissions.join(', ') : 'none'}`);
        console.log(`   Public Read: ${hasPublicRead ? '✅ Yes' : '❌ No'}`);
        
        if (!hasPublicRead) {
          console.log(`   ⚠️  WARNING: File does not have public read access!`);
        }
        console.log('');
      } catch (error) {
        console.error(`❌ Error checking ${fileName}:`, error.message || error);
        console.log('');
      }
    }
    
    console.log('✨ Done!');
    console.log('\n📝 Note: If any files show "Public Read: ❌ No", you need to update their permissions.');
    console.log('   Files need "read(\\"any\\")" permission to be publicly accessible.');
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

