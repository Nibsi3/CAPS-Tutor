'use client';

import { Client, Account, Databases } from 'appwrite';
import { appwriteConfig } from './config';

let clientInstance: Client | null = null;
let accountInstance: Account | null = null;
let databasesInstance: Databases | null = null;

export function getClient(): Client {
  // Only initialize on client-side to prevent server-side API calls
  if (typeof window === 'undefined') {
    // Return a mock client for server-side rendering
    // This prevents server-side Appwrite API calls that could block startup
    return {
      setEndpoint: () => {},
      setProject: () => {},
    } as any;
  }

  if (!clientInstance) {
    // Guard: Never initialize client if endpoint or projectId is missing
    const endpoint = appwriteConfig.endpoint;
    const projectId = appwriteConfig.projectId;
    
    if (!endpoint || !projectId) {
      console.warn(
        'Appwrite Client: Missing environment variables. ' +
        `Endpoint: ${endpoint ? 'set' : 'missing'}, ` +
        `Project ID: ${projectId ? 'set' : 'missing'}. ` +
        'Client will not be initialized. Please set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID.'
      );
      // Return a no-op mock client instead of initializing with missing values
      return {
        setEndpoint: () => {},
        setProject: () => {},
      } as any;
    }
    
    clientInstance = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);
  }
  return clientInstance;
}

export function getAccount(): Account {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return {} as any;
  }

  const client = getClient();
  if (!accountInstance) {
    accountInstance = new Account(client);
  }
  return accountInstance;
}

export function getDatabases(): Databases {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return {} as any;
  }

  const client = getClient();
  if (!databasesInstance) {
    databasesInstance = new Databases(client);
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

