/**
 * Server-side Appwrite Storage utilities
 * These functions can only be used in API routes and server components
 */

import { Client, Storage, Query } from 'node-appwrite';
import { appwriteConfig } from './config';

let serverStorageInstance: Storage | null = null;

/**
 * Get server-side Storage instance
 * @returns Storage instance or null
 */
export function getServerStorage(): Storage | null {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  
  if (!endpoint || !projectId) {
    return null;
  }

  if (!serverStorageInstance) {
    // Get API key from environment variable
    // For server-side operations, we need an API key (not user session)
    const apiKey = typeof process !== 'undefined' 
      ? (process as any).env?.APPWRITE_API_KEY 
      : undefined;
    
    if (!apiKey) {
      console.error('❌ APPWRITE_API_KEY is not set. Server-side storage operations require an API key.');
      console.error('   Please create an API key in Appwrite Console:');
      console.error('   1. Go to Appwrite Console → Settings → API Keys');
      console.error('   2. Create a new API key with "Storage" scope');
      console.error('   3. Set APPWRITE_API_KEY environment variable in .env.local');
      return null;
    }
    
    // Log API key info for debugging (only first 10 chars for security)
    const apiKeyPreview = apiKey.substring(0, 10) + '...';
    console.log(`🔑 Using API key: ${apiKeyPreview} (length: ${apiKey.length})`);
    console.log(`📦 Endpoint: ${endpoint}`);
    console.log(`🆔 Project ID: ${projectId.substring(0, 8)}...`);
    
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey); // Set API key for server-side authentication
    
    serverStorageInstance = new Storage(client);
  }
  
  return serverStorageInstance;
}

/**
 * List files in a storage bucket using REST API (server-side only)
 * This bypasses the SDK to avoid Next.js environment variable issues
 * @param bucketId - The bucket ID
 * @param queries - Optional query filters (not used, kept for compatibility)
 * @returns List of all files
 */
export async function listStorageFilesServer(
  bucketId: string,
  queries?: string[]
): Promise<{ files: any[]; total: number }> {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = typeof process !== 'undefined' 
    ? (process as any).env?.APPWRITE_API_KEY 
    : undefined;
  
  if (!endpoint || !projectId) {
    throw new Error('Storage not available: Appwrite endpoint or project ID is not set');
  }
  
  if (!apiKey) {
    throw new Error('Storage not available: APPWRITE_API_KEY is not set. Please create an API key in Appwrite Console with files.read and files.write scopes.');
  }
  
  // Use SDK with proper initialization - it handles pagination correctly
  console.log(`🔑 Using SDK with API key: ${apiKey.substring(0, 10)}...`);
  console.log(`📦 Endpoint: ${endpoint}`);
  console.log(`🆔 Project ID: ${projectId.substring(0, 8)}...`);
  console.log(`📁 Bucket ID: ${bucketId}`);
  
  try {
    // Initialize client and storage fresh each time to avoid caching issues
    const { Client, Storage } = await import('node-appwrite');
    
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    
    const storage = new Storage(client);
    
    const allFiles: any[] = [];
    let total = 0;
    const limit = 100;
    let offset = 0;
    let hasMore = true;
    
    // Use SDK's listFiles with Query for pagination
    while (hasMore) {
      const { Query } = await import('node-appwrite');
      
      const response = await storage.listFiles(
        bucketId,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      
      const files = response.files || [];
      allFiles.push(...files);
      
      if (total === 0) {
        total = response.total || 0;
      }
      
      const filesInBatch = files.length;
      console.log(`Fetched batch: ${filesInBatch} files (offset: ${offset}, total so far: ${allFiles.length}/${total})`);
      
      offset += filesInBatch;
      
      // Continue if we got a full batch and haven't fetched all files
      hasMore = filesInBatch === limit && allFiles.length < total;
      
      // Safety check
      if (allFiles.length >= total && total > 0) {
        hasMore = false;
      }
      
      // Prevent infinite loops
      if (offset > 10000) {
        console.warn('⚠️ Stopping pagination at 10000 files to prevent infinite loop');
        hasMore = false;
      }
    }
    
    console.log(`✅ Final: Fetched ${allFiles.length} files from storage (total: ${total})`);
    
    return {
      files: allFiles,
      total: total,
    };
  } catch (error: any) {
    console.error('Error listing storage files via SDK:', error);
    const errorCode = error?.code;
    const errorType = error?.type;
    const errorMessage = error?.message || String(error);
    
    if (errorCode === 401 || errorCode === 403 || errorType === 'user_unauthorized') {
      throw new Error(
        `❌ Authorization failed: ${errorMessage}\n\n` +
        `Make sure your API key has files.read and buckets.read scopes.`
      );
    }
    
    throw error;
  }
}

/**
 * Download a file from Appwrite Storage as a buffer (server-side only)
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns File buffer
 */
export async function downloadStorageFileServer(
  bucketId: string,
  fileId: string
): Promise<ArrayBuffer> {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = typeof process !== 'undefined' 
    ? (process as any).env?.APPWRITE_API_KEY 
    : undefined;
  
  if (!endpoint || !projectId) {
    throw new Error('Appwrite config not available');
  }
  
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY is not set');
  }

  try {
    // Use REST API directly with API key authentication
    const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
    
    console.log(`   Downloading file: ${fileId.substring(0, 20)}...`);
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const errorCode = errorData.code || response.status;
      const errorMessage = errorData.message || response.statusText;
      
      throw new Error(
        `❌ Failed to download file: ${errorMessage}\n` +
        `   Code: ${errorCode}\n` +
        `   Status: ${response.status}\n\n` +
        `Make sure your API key has files.read scope.`
      );
    }
    
    const fileBuffer = await response.arrayBuffer();
    console.log(`   ✅ Downloaded file: ${(fileBuffer.byteLength / 1024).toFixed(2)} KB`);
    return fileBuffer;
  } catch (error: any) {
    console.error('Error downloading storage file:', error);
    const errorCode = error?.code;
    const errorMessage = error?.message || String(error);
    
    if (errorCode === 401 || errorCode === 403 || errorMessage.includes('unauthorized')) {
      throw new Error(
        `❌ Authorization failed when downloading file: ${errorMessage}\n\n` +
        `Make sure your API key has files.read scope.`
      );
    }
    
    throw error;
  }
}

/**
 * Download a file from Appwrite Storage and convert to base64 data URI (server-side only)
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @param mimeType - MIME type (default: application/pdf)
 * @returns Base64 data URI
 */
export async function downloadStorageFileAsDataUriServer(
  bucketId: string,
  fileId: string,
  mimeType: string = 'application/pdf'
): Promise<string> {
  const buffer = await downloadStorageFileServer(bucketId, fileId);
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Get file metadata from Appwrite Storage (server-side only)
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns File metadata
 */
export async function getStorageFileMetadataServer(
  bucketId: string,
  fileId: string
): Promise<any> {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  const apiKey = typeof process !== 'undefined' 
    ? (process as any).env?.APPWRITE_API_KEY 
    : undefined;
  
  if (!endpoint || !projectId || !apiKey) {
    throw new Error('Appwrite config or API key not available');
  }

  try {
    // Use SDK with fresh instance to avoid caching issues
    const { Client, Storage } = await import('node-appwrite');
    
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    
    const storage = new Storage(client);
    
    const file = await storage.getFile(bucketId, fileId);
    return file;
  } catch (error: any) {
    console.error('Error getting storage file metadata:', error);
    const errorCode = error?.code;
    const errorMessage = error?.message || String(error);
    
    if (errorCode === 401 || errorCode === 403) {
      throw new Error(
        `❌ Authorization failed when getting file metadata: ${errorMessage}\n\n` +
        `Make sure your API key has files.read scope.`
      );
    }
    
    throw error;
  }
}

/**
 * Get the download URL for a file in Appwrite Storage
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns The download URL to access the file
 */
function getFileDownloadUrl(bucketId: string, fileId: string): string {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  
  if (!endpoint || !projectId) {
    throw new Error('Appwrite config not available');
  }
  
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
}

