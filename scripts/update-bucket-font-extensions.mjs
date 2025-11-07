#!/usr/bin/env node

/**
 * Update Appwrite bucket to allow font file extensions
 * 
 * Usage:
 *   node scripts/update-bucket-font-extensions.mjs
 * 
 * Required environment variables:
 *   - APPWRITE_ENDPOINT (default: https://fra.cloud.appwrite.io/v1)
 *   - APPWRITE_PROJECT_ID
 *   - APPWRITE_API_KEY (API key with storage write permissions)
 *   - APPWRITE_BUCKET_ID (default: 690dafea0021f232399e)
 */

import { Client, Storage } from 'node-appwrite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || '690dafea0021f232399e';

// Font file extensions to allow
const FONT_EXTENSIONS = ['ttf', 'woff', 'woff2', 'otf', 'eot', 'css'];

async function main() {
  console.log('🚀 Updating bucket configuration to allow font file extensions...\n');
  
  // Validate environment variables
  if (!PROJECT_ID) {
    console.error('❌ Error: APPWRITE_PROJECT_ID or NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    console.error('   Please set it in your environment or .env.local file');
    process.exit(1);
  }
  
  if (!API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY is not set');
    console.error('   Please create an API key in Appwrite Console:');
    console.error('   1. Go to Appwrite Console → Settings → API Keys');
    console.error('   2. Create a new API key with "Storage" scope');
    console.error('   3. Set APPWRITE_API_KEY environment variable');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   Endpoint: ${ENDPOINT}`);
  console.log(`   Project ID: ${PROJECT_ID.substring(0, 8)}...`);
  console.log(`   Bucket ID: ${BUCKET_ID}\n`);
  
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  
  const storage = new Storage(client);
  
  try {
    // Get current bucket configuration
    console.log('📂 Fetching current bucket configuration...');
    const bucket = await storage.getBucket(BUCKET_ID);
    console.log(`✅ Bucket found: ${bucket.name}`);
    
    // Get current allowed file extensions
    const currentExtensions = bucket.fileSecurity?.allowedFileExtensions || [];
    const isFileSecurityEnabled = bucket.fileSecurity?.enabled || false;
    
    console.log(`   File security enabled: ${isFileSecurityEnabled}`);
    console.log(`   Current allowed extensions: ${currentExtensions.length > 0 ? currentExtensions.join(', ') : 'none (all allowed)'}\n`);
    
    // If file security is not enabled, we need to enable it and include common extensions
    // that might already be in use (like PDFs for past papers)
    const commonExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'txt'];
    
    // Merge with font extensions (avoid duplicates)
    const allExtensions = isFileSecurityEnabled 
      ? [...new Set([...currentExtensions, ...FONT_EXTENSIONS])]
      : [...new Set([...commonExtensions, ...FONT_EXTENSIONS])];
    
    console.log(`📝 ${isFileSecurityEnabled ? 'Adding' : 'Enabling file security and adding'} font extensions: ${FONT_EXTENSIONS.join(', ')}`);
    if (!isFileSecurityEnabled) {
      console.log(`   Also including common extensions: ${commonExtensions.join(', ')}`);
    }
    console.log(`   Total extensions after update: ${allExtensions.join(', ')}\n`);
    
    // Update bucket with new file extensions
    console.log('🔄 Updating bucket configuration...');
    // Get current bucket settings to preserve them
    // Ensure enabled is a boolean
    const currentEnabled = typeof bucket.enabled === 'boolean' ? bucket.enabled : true;
    // Enable file security if it wasn't enabled, or keep current state
    const newFileSecurityEnabled = true; // Enable file security to restrict to allowed extensions
    
    console.log(`   Setting enabled: ${currentEnabled} (type: ${typeof currentEnabled})`);
    console.log(`   Setting fileSecurity.enabled: ${newFileSecurityEnabled}`);
    console.log(`   Setting allowedFileExtensions: ${allExtensions.join(', ')}\n`);
    
    const updatedBucket = await storage.updateBucket(
      BUCKET_ID,
      bucket.name,
      undefined, // permissions (keep existing)
      newFileSecurityEnabled, // fileSecurity.enabled (enable to restrict to allowed extensions)
      allExtensions.length > 0 ? allExtensions : undefined, // allowedFileExtensions
      undefined, // maximumFileSize (keep existing)
      undefined, // compression (keep existing)
      undefined, // encryption (keep existing)
      undefined, // antivirus (keep existing)
      currentEnabled, // enabled
    );
    
    console.log('✅ Bucket updated successfully!');
    console.log(`   Allowed file extensions: ${updatedBucket.fileSecurity?.allowedFileExtensions?.join(', ') || 'all'}\n`);
    
    console.log('✨ Done! You can now upload font files to this bucket.');
    
  } catch (error) {
    console.error(`❌ Error updating bucket: ${error.message || error}`);
    console.error('\n   Please verify:');
    console.error('   1. The bucket ID is correct');
    console.error('   2. Your API key has "Storage" scope with write permissions');
    console.error('   3. The bucket exists in your Appwrite project');
    console.error('\n   Alternatively, you can update the bucket manually in Appwrite Console:');
    console.error('   1. Go to Appwrite Console → Storage → Buckets');
    console.error(`   2. Click on bucket "${BUCKET_ID}"`);
    console.error('   3. Go to Settings tab');
    console.error('   4. Under "File Security", add these extensions:');
    FONT_EXTENSIONS.forEach(ext => console.error(`      - ${ext}`));
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

