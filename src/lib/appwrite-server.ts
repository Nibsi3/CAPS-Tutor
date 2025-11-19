/**
 * Server-side Appwrite client utilities
 * This file uses ONLY node-appwrite to prevent browser SDK from leaking into server builds
 * 
 * CRITICAL: This file must ONLY import from "node-appwrite", never from "appwrite"
 */

import { Client, Storage, Databases, ID } from 'node-appwrite';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Get server-side Appwrite client with API key
 * Validates that node-appwrite SDK is being used (has .key property)
 */
export function getServerClient(): Client {
  const endpoint = process.env.APPWRITE_ENDPOINT || appwriteConfig.endpoint;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT || appwriteConfig.projectId;
  const apiKey = process.env.APPWRITE_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY environment variable is required for server-side operations');
  }
  
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  
  // Validate that we're using node-appwrite SDK (not browser SDK)
  // Node SDK has .key in config, browser SDK does not
  const config = (client as any).config || {};
  if (!config.key) {
    console.error('❌ ERROR: Browser SDK detected! Client config:', config);
    throw new Error('Browser Appwrite SDK detected in server code. This should never happen. Check imports.');
  }
  
  // Log validation once (use a flag to avoid spam)
  if (!(globalThis as any).__appwriteServerClientValidated) {
    console.log('✅ Appwrite Server SDK: node-appwrite confirmed (has .key property)');
    console.log('Appwrite SDK config:', { endpoint, project: projectId, key: '***' });
    (globalThis as any).__appwriteServerClientValidated = true;
  }
  
  return client;
}

/**
 * Get server-side Storage instance
 */
export function getServerStorage(): Storage {
  const client = getServerClient();
  return new Storage(client);
}

/**
 * Get server-side Databases instance
 */
export function getServerDatabases(): Databases {
  const client = getServerClient();
  return new Databases(client);
}

/**
 * Re-export ID for convenience
 */
export { ID };


