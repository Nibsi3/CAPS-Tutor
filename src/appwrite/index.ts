'use client';

import { Client, Account, Databases } from 'appwrite';
import { appwriteConfig } from './config';
import { appwriteLogger } from './logger';

let clientInstance: Client | null = null;
let accountInstance: Account | null = null;
let databasesInstance: Databases | null = null;

export function getClient(): Client | null {
  // Only initialize on client-side to prevent server-side API calls
  if (typeof window === 'undefined') {
    return null;
  }

  if (!clientInstance) {
    // Guard: Never initialize client if endpoint or projectId is missing
    const endpoint = appwriteConfig.endpoint;
    const projectId = appwriteConfig.projectId;
    
    if (!endpoint || !projectId) {
      // Only warn once
      if (!(window as any).__appwriteClientWarned) {
        console.warn(
          '⚠️ Appwrite Client: Missing environment variables. ' +
          `Endpoint: ${endpoint ? 'set' : 'missing'}, ` +
          `Project ID: ${projectId ? 'set' : 'missing'}. ` +
          'Client will not be initialized. Please set NEXT_PUBLIC_APPWRITE_PROJECT_ID (and NEXT_PUBLIC_APPWRITE_ENDPOINT if needed).'
        );
        (window as any).__appwriteClientWarned = true;
      }
      // Return null instead of a mock - this prevents Account/Databases from being created
      return null;
    }
    
    clientInstance = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);
    
    appwriteLogger.info('general', 'Appwrite Client initialized', {
      endpoint,
      projectId: projectId.substring(0, 8) + '...', // Log partial ID for security
    });
  }
  return clientInstance;
}

export function getAccount(): Account | null {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  const client = getClient();
  // Only create Account if client is properly initialized (non-null)
  // If getClient() returns null, env vars are missing and client wasn't created
  if (!client) {
    return null;
  }

  if (!accountInstance) {
    accountInstance = new Account(client);
    appwriteLogger.info('auth', 'Appwrite Account service initialized');
  }
  return accountInstance;
}

export function getDatabases(): Databases | null {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  const client = getClient();
  // Only create Databases if client is properly initialized (non-null)
  // If getClient() returns null, env vars are missing and client wasn't created
  if (!client) {
    return null;
  }

  if (!databasesInstance) {
    databasesInstance = new Databases(client);
    appwriteLogger.info('database', 'Appwrite Databases service initialized');
  }
  return databasesInstance;
}

export * from './provider';
export * from './client-provider';
export * from './database/use-doc';
export * from './database/use-collection';
export * from './auth/use-user';
export * from './auth/social-auth';
export * from './auth/email-auth';
export * from './logger';

