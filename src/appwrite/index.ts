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
    // Validate project ID before initializing
    if (!appwriteConfig.projectId) {
      console.error(
        'Appwrite Client: NEXT_PUBLIC_APPWRITE_PROJECT_ID is required but not set. ' +
        'Please set it in your Appwrite Function environment variables.'
      );
      // Still create client but it will fail on requests
      // This prevents the app from crashing during initialization
    }
    clientInstance = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId || 'missing-project-id');
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

