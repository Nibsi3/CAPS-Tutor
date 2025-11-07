#!/usr/bin/env node

/**
 * Upload all past paper files to Appwrite Storage
 * 
 * Usage:
 *   node scripts/upload-past-papers-to-appwrite.mjs
 * 
 * Required environment variables:
 *   - APPWRITE_ENDPOINT (default: https://fra.cloud.appwrite.io/v1)
 *   - APPWRITE_PROJECT_ID
 *   - APPWRITE_API_KEY (API key with storage write permissions)
 *   - APPWRITE_BUCKET_ID (default: 690dafea0021f232399e)
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
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || '690dafea0021f232399e';
const PAST_PAPERS_DIR = path.join(__dirname, '..', 'past papers');

// Stats
let totalFiles = 0;
let uploadedFiles = 0;
let skippedFiles = 0;
let failedFiles = 0;
const errors = [];

// Helper function to read directory recursively
async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = await fs.promises.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }

  return arrayOfFiles;
}

// Helper function to upload a single file
async function uploadFile(storage, filePath, bucketId) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(PAST_PAPERS_DIR, filePath);
  
  // Get file stats for size
  const fileStats = await fs.promises.stat(filePath);
  const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
  
  // Create file in Appwrite Storage
  // Using relativePath as the file ID to maintain directory structure
  // Replace path separators with underscores for file ID, but keep it readable
  // Appwrite file IDs should be unique and URL-safe
  const fileId = ID.unique(); // Use unique ID to avoid conflicts
  
  try {
    // Read file as buffer and create File object
    // Node.js 18+ has native File API support
    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Detect MIME type from file extension
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Create a File object from the buffer
    // File constructor: new File(bits, name, options)
    const fileObject = new File([fileBuffer], fileName, {
      type: mimeType,
      lastModified: fileStats.mtimeMs
    });
    
    // Upload file
    // Permissions: 'read("any")' allows public read access, or use 'read("users")' for authenticated users only
    const file = await storage.createFile(
      bucketId,
      fileId,
      fileObject,
      ['read("any")'] // Public read access - adjust as needed
    );
    
    console.log(`✅ Uploaded: ${fileName} → ${fileId} (${fileSizeMB} MB)`);
    uploadedFiles++;
    return { success: true, file, fileId, fileName };
  } catch (error) {
    // Check if file already exists (duplicate file ID or name)
    if (error.code === 409 || error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log(`⏭️  Skipping (already exists): ${fileName}`);
      skippedFiles++;
      return { success: true, skipped: true };
    }
    
    console.error(`❌ Failed to upload ${fileName}:`, error.message || error);
    errors.push({ file: relativePath, error: error.message || String(error) });
    failedFiles++;
    return { success: false, error: error.message || String(error) };
  }
}

// Main function
async function main() {
  console.log('🚀 Starting upload of past papers to Appwrite Storage...\n');
  
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
  
  // Check if past papers directory exists
  if (!fs.existsSync(PAST_PAPERS_DIR)) {
    console.error(`❌ Error: Directory not found: ${PAST_PAPERS_DIR}`);
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   Endpoint: ${ENDPOINT}`);
  console.log(`   Project ID: ${PROJECT_ID.substring(0, 8)}...`);
  console.log(`   Bucket ID: ${BUCKET_ID}`);
  console.log(`   Source Directory: ${PAST_PAPERS_DIR}\n`);
  
  // Initialize Appwrite client
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
  
  // Get all files
  console.log('📂 Scanning for files...');
  const allFiles = await getAllFiles(PAST_PAPERS_DIR);
  totalFiles = allFiles.length;
  
  console.log(`   Found ${totalFiles} files to upload\n`);
  
  if (totalFiles === 0) {
    console.log('⚠️  No files found in the past papers directory');
    process.exit(0);
  }
  
  // Upload files (with rate limiting to avoid overwhelming the API)
  console.log('📤 Uploading files...\n');
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
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`   Total files: ${totalFiles}`);
  console.log(`   ✅ Uploaded: ${uploadedFiles}`);
  console.log(`   ⏭️  Skipped (already exist): ${skippedFiles}`);
  console.log(`   ❌ Failed: ${failedFiles}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }
  
  console.log('\n✨ Done!');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

