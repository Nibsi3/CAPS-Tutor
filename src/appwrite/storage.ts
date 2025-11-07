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

