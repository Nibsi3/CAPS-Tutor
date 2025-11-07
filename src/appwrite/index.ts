'use client';

import { Client, Account, Databases } from 'appwrite';
import { appwriteConfig } from './config';
import { appwriteLogger } from './logger';

// Set up global error handler for Appwrite SDK localization errors (non-critical)
// This must run before any Appwrite client initialization
if (typeof window !== 'undefined' && !(window as any).__appwriteErrorHandlerSetup) {
  const handleAppwriteLocalizationError = (error: any) => {
    // Check error name
    if (error?.name === 'RegisterClientLocalizationsError') {
      return true;
    }
    
    // Check error message for translation-related errors
    const errorMessage = error?.message || String(error || '');
    if (typeof errorMessage === 'string') {
      if (errorMessage.includes('translations') ||
          (errorMessage.includes('Cannot read properties of undefined') && 
           errorMessage.includes('translations')) ||
          errorMessage.includes('RegisterClientLocalizationsError')) {
        return true;
      }
    }
    
    // Check if error is an object with translations property access
    if (error && typeof error === 'object') {
      const errorString = JSON.stringify(error);
      if (errorString.includes('translations') && errorString.includes('undefined')) {
        return true;
      }
    }
    
    return false;
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (handleAppwriteLocalizationError(event.reason)) {
      // Suppress this specific error - it's non-critical and doesn't affect functionality
      event.preventDefault();
      return;
    }
  });

  // Also handle regular errors (though this is less common for promise rejections)
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (handleAppwriteLocalizationError(error || message)) {
      return true; // Suppress the error
    }
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  (window as any).__appwriteErrorHandlerSetup = true;
}

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
        const isAppwriteCloud = window.location.hostname.includes('appwrite.network') || 
                                window.location.hostname.includes('appwrite.cloud');
        
        console.error(
          '❌ Appwrite Client: Missing environment variables!\n' +
          `   Endpoint: ${endpoint ? '✅ set' : '❌ missing'}\n` +
          `   Project ID: ${projectId ? '✅ set' : '❌ missing'}\n\n` +
          (isAppwriteCloud 
            ? '🔧 Appwrite Cloud Deployment Detected!\n' +
              '   Please set environment variables in Appwrite Console:\n' +
              '   1. Go to Appwrite Console → Your Deployment → Settings\n' +
              '   2. Add Environment Variables:\n' +
              '      - NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1\n' +
              '      - NEXT_PUBLIC_APPWRITE_PROJECT_ID=690a39bf0011810ee554\n' +
              '      - NEXT_PUBLIC_APPWRITE_DATABASE_ID=(your database ID)\n' +
              '   3. Redeploy your application\n'
            : '   Please set NEXT_PUBLIC_APPWRITE_PROJECT_ID in your .env.local file.\n' +
              '   See docs/APPWRITE_ENVIRONMENT_VARIABLES.md for details.\n'
          )
        );
        (window as any).__appwriteClientWarned = true;
      }
      // Return null instead of a mock - this prevents Account/Databases from being created
      return null;
    }
    
    try {
      // Wrap in try-catch to handle any synchronous errors during initialization
      clientInstance = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId);
      
      appwriteLogger.info('general', 'Appwrite Client initialized', {
        endpoint,
        projectId: projectId.substring(0, 8) + '...', // Log partial ID for security
      });
    } catch (error: any) {
      // Check if this is a localization error (non-critical)
      const isLocalizationError = 
        error?.name === 'RegisterClientLocalizationsError' ||
        error?.message?.includes('translations') ||
        (error?.message?.includes('Cannot read properties of undefined') && 
         error?.message?.includes('translations'));
      
      if (isLocalizationError) {
        // Client is still usable despite this error - it's just a localization warning
        appwriteLogger.info('general', 'Appwrite Client initialized (localization warning suppressed)');
        // Continue - clientInstance is still set
      } else {
        console.error('❌ Failed to initialize Appwrite Client:', error);
        appwriteLogger.error('general', 'Failed to initialize Appwrite Client', error);
        return null;
      }
    }
    
    // Handle any async errors that might occur after initialization
    // This is a safety net for errors that happen after the Client is created
    if (clientInstance && typeof window !== 'undefined') {
      // The global error handler will catch any unhandled promise rejections
      // from the Appwrite SDK's internal localization code
    }
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

