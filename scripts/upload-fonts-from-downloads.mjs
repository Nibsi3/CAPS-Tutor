#!/usr/bin/env node

/**
 * Upload fonts from downloads directory to Appwrite Storage
 * 
 * Usage:
 *   node scripts/upload-fonts-from-downloads.mjs
 * 
 * Required environment variables:
 *   - APPWRITE_ENDPOINT (default: https://fra.cloud.appwrite.io/v1)
 *   - APPWRITE_PROJECT_ID
 *   - APPWRITE_API_KEY (API key with storage write permissions)
 */

import { Client, Storage, ID } from 'node-appwrite';
import fs from 'fs';
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
const BUCKET_ID = '690dafea0021f232399e'; // pastpaperbucket
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

// Stats
let totalFiles = 0;
let uploadedFiles = 0;
let skippedFiles = 0;
let failedFiles = 0;
const uploadedFileIds = [];
const errors = [];

// Helper function to read directory recursively
async function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    return arrayOfFiles;
  }

  const files = await fs.promises.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, arrayOfFiles);
    } else {
      // Only include font files
      const ext = path.extname(file).toLowerCase();
      if (['.woff2', '.woff', '.ttf', '.otf'].includes(ext)) {
        arrayOfFiles.push(filePath);
      }
    }
  }

  return arrayOfFiles;
}

// Helper function to upload a single file
async function uploadFile(storage, filePath, bucketId) {
  const fileName = path.basename(filePath);
  
  // Get file stats for size
  const fileStats = await fs.promises.stat(filePath);
  const fileSizeKB = (fileStats.size / 1024).toFixed(2);
  
  // Create file in Appwrite Storage
  const fileId = ID.unique();
  
  try {
    // Read file as buffer and create File object
    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Detect MIME type from file extension
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.otf': 'font/otf',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Create a File object from the buffer
    const fileObject = new File([fileBuffer], fileName, {
      type: mimeType,
      lastModified: fileStats.mtimeMs
    });
    
    // Upload file with public read access
    const file = await storage.createFile(
      bucketId,
      fileId,
      fileObject,
      ['read("any")'] // Public read access for fonts
    );
    
    console.log(`✅ Uploaded: ${fileName} (ID: ${fileId}) (${fileSizeKB} KB)`);
    uploadedFiles++;
    uploadedFileIds.push({ fileName, fileId, size: fileSizeKB });
    return { success: true, file, fileId, fileName };
  } catch (error) {
    // Check if file already exists (duplicate file ID or name)
    if (error.code === 409) {
      console.log(`⏭️  Skipped: ${fileName} (already exists)`);
      skippedFiles++;
      return { success: false, skipped: true, fileName };
    } else {
      console.error(`❌ Failed: ${fileName} - ${error.message}`);
      failedFiles++;
      errors.push({ file: fileName, error: error.message });
      return { success: false, error: error.message, fileName };
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Starting upload of fonts from downloads directory to Appwrite Storage...\n');

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

  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID.substring(0, 8)}...`);
  console.log(`Bucket ID: ${BUCKET_ID}`);
  console.log(`Downloads Directory: ${DOWNLOADS_DIR}\n`);

  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setKey(API_KEY);
    
    const storage = new Storage(client);
    
    // Verify bucket exists and check permissions
    try {
      const bucket = await storage.getBucket(BUCKET_ID);
      console.log(`✅ Bucket found: ${bucket.name}`);
      console.log(`   Bucket ID: ${bucket.$id}`);
      console.log(`   Maximum file size: ${(bucket.maximumFileSize / 1024 / 1024).toFixed(2)} MB\n`);
    } catch (error) {
      console.error(`❌ Error: Bucket not found or inaccessible: ${BUCKET_ID}`);
      console.error(`   Error: ${error.message || error}`);
      console.error('   Please verify:');
      console.error('   1. The bucket ID is correct');
      console.error('   2. Your API key has "Storage" scope');
      console.error('   3. The bucket exists in your Appwrite project');
      process.exit(1);
    }
    
    // Get all font files from downloads directory
    console.log('📂 Scanning for font files in downloads directory...');
    const allFiles = await getAllFiles(DOWNLOADS_DIR);
    totalFiles = allFiles.length;
    
    console.log(`   Found ${totalFiles} font files\n`);
    
    if (totalFiles === 0) {
      console.log('⚠️  No font files found in the downloads directory');
      console.log(`   Checked: ${DOWNLOADS_DIR}`);
      console.log('   Make sure font files (.woff2, .woff, .ttf, .otf) are in the downloads directory');
      process.exit(0);
    }

    // Display files to upload
    console.log('📋 Files to upload:');
    allFiles.forEach(filePath => {
      const fileName = path.basename(filePath);
      const fileSize = fs.statSync(filePath).size;
      console.log(`   - ${fileName} (${(fileSize / 1024).toFixed(2)} KB)`);
    });
    console.log('');
    
    // Upload files (with rate limiting to avoid overwhelming the API)
    console.log('📤 Uploading fonts...\n');
    const BATCH_SIZE = 5; // Upload 5 files at a time
    const DELAY_MS = 500; // Wait 500ms between batches
    
    for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(filePath => uploadFile(storage, filePath, BUCKET_ID));
      
      await Promise.all(batchPromises);
      
      // Show progress
      const progress = ((i + batch.length) / totalFiles * 100).toFixed(1);
      console.log(`\n📊 Progress: ${i + batch.length}/${totalFiles} (${progress}%)\n`);
      
      // Wait before next batch (except for the last batch)
      if (i + BATCH_SIZE < allFiles.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Upload Summary');
    console.log('='.repeat(80));
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   ✅ Uploaded: ${uploadedFiles}`);
    console.log(`   ⏭️  Skipped (already exist): ${skippedFiles}`);
    console.log(`   ❌ Failed: ${failedFiles}`);
    
    if (uploadedFileIds.length > 0) {
      console.log('\n📝 Uploaded Files with IDs (copy these to font-config.ts):');
      console.log('='.repeat(80));
      uploadedFileIds.forEach(({ fileName, fileId, size }) => {
        console.log(`  '${fileName}': '${fileId}', // ${size} KB`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
    }
    
    console.log('\n✨ Done!');
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Copy the file IDs above to src/lib/font-config.ts`);
    console.log(`   2. Update FontLoaderFromAppwrite.tsx to load these fonts`);
    console.log(`   3. Update tailwind.config.ts to use the new font families`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

