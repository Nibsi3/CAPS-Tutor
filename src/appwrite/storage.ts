'use client';

import { Storage } from 'appwrite';
import { getClient } from './index';
import { appwriteConfig } from './config';

let storageInstance: Storage | null = null;

export function getStorage(): Storage | null {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  const client = getClient();
  // Only create Storage if client is properly initialized (non-null)
  if (!client) {
    return null;
  }

  if (!storageInstance) {
    storageInstance = new Storage(client);
  }
  return storageInstance;
}

/**
 * Get the public URL for a file in Appwrite Storage
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns The public URL to access the file
 */
export function getFileUrl(bucketId: string, fileId: string): string {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  
  if (!endpoint || !projectId) {
    console.warn('Appwrite config not available, cannot generate file URL');
    return '';
  }
  
  // Appwrite Storage file URL format: {endpoint}/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/**
 * Get the download URL for a file in Appwrite Storage
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns The download URL to access the file
 */
export function getFileDownloadUrl(bucketId: string, fileId: string): string {
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  
  if (!endpoint || !projectId) {
    console.warn('Appwrite config not available, cannot generate file URL');
    return '';
  }
  
  // Appwrite Storage file download URL format: {endpoint}/storage/buckets/{bucketId}/files/{fileId}/download?project={projectId}
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
}

/**
 * Get server-side Storage instance for API routes
 * @returns Storage instance or null
 */
export function getServerStorage(): Storage | null {
  // Server-side only
  if (typeof window !== 'undefined') {
    return null;
  }

  const { Client } = require('appwrite');
  const endpoint = appwriteConfig.endpoint;
  const projectId = appwriteConfig.projectId;
  
  if (!endpoint || !projectId) {
    return null;
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
  
  return new Storage(client);
}

/**
 * List files in a storage bucket
 * @param bucketId - The bucket ID
 * @param queries - Optional query filters
 * @returns List of files
 */
export async function listStorageFiles(
  bucketId: string,
  queries?: string[]
): Promise<{ files: any[]; total: number }> {
  const storage = typeof window === 'undefined' 
    ? getServerStorage() 
    : getStorage();
  
  if (!storage) {
    throw new Error('Storage not available');
  }

  try {
    const response = await storage.listFiles(bucketId, queries);
    return {
      files: response.files,
      total: response.total,
    };
  } catch (error) {
    console.error('Error listing storage files:', error);
    throw error;
  }
}

/**
 * Download a file from Appwrite Storage as a buffer
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns File buffer
 */
export async function downloadStorageFile(
  bucketId: string,
  fileId: string
): Promise<ArrayBuffer> {
  const downloadUrl = getFileDownloadUrl(bucketId, fileId);
  
  if (!downloadUrl) {
    throw new Error('Could not generate download URL');
  }

  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error downloading storage file:', error);
    throw error;
  }
}

/**
 * Download a file from Appwrite Storage and convert to base64 data URI
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @param mimeType - MIME type (default: application/pdf)
 * @returns Base64 data URI
 */
export async function downloadStorageFileAsDataUri(
  bucketId: string,
  fileId: string,
  mimeType: string = 'application/pdf'
): Promise<string> {
  const buffer = await downloadStorageFile(bucketId, fileId);
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Get file metadata from Appwrite Storage
 * @param bucketId - The bucket ID
 * @param fileId - The file ID
 * @returns File metadata
 */
export async function getStorageFileMetadata(
  bucketId: string,
  fileId: string
): Promise<any> {
  const storage = typeof window === 'undefined' 
    ? getServerStorage() 
    : getStorage();
  
  if (!storage) {
    throw new Error('Storage not available');
  }

  try {
    const file = await storage.getFile(bucketId, fileId);
    return file;
  } catch (error) {
    console.error('Error getting storage file metadata:', error);
    throw error;
  }
}

