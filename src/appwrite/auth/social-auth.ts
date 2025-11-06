'use client';

import { Account, OAuthProvider, ID } from 'appwrite';
import { Databases } from 'appwrite';
import { appwriteConfig } from '../config';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(account: Account | null | undefined, databases: Databases | null | undefined): Promise<void> {
  try {
    // Guard: Check if account is available
    if (!account || typeof account.createOAuth2Session !== 'function') {
      // Provide detailed error message with current config values
      const config = appwriteConfig;
      const errorMsg = `Appwrite is not configured. 
Current config:
- Endpoint: ${config.endpoint || 'MISSING'}
- Project ID: ${config.projectId || 'MISSING'}
- Database ID: ${config.databaseId || 'MISSING'}

Please ensure:
1. NEXT_PUBLIC_APPWRITE_PROJECT_ID is set in .env.local
2. NEXT_PUBLIC_APPWRITE_ENDPOINT is set in .env.local
3. The dev server was restarted after updating .env.local
4. Hard refresh the browser (Ctrl+Shift+R) to clear cache`;
      
      // Enhanced debug info - log everything we can find
      const debugInfo: any = {
        config: {
          endpoint: config.endpoint,
          projectId: config.projectId,
          databaseId: config.databaseId,
        },
        accountAvailable: !!account,
        accountType: typeof account,
      };
      
      // Check what's actually available in the environment
      if (typeof window !== 'undefined') {
        debugInfo.window = {
          hasProcess: typeof (window as any).process !== 'undefined',
          hasEnv: typeof (window as any).__ENV__ !== 'undefined',
          hasNextData: typeof (window as any).__NEXT_DATA__ !== 'undefined',
        };
        
        if ((window as any).process?.env) {
          const envKeys = Object.keys((window as any).process.env).filter((k: string) => k.startsWith('NEXT_PUBLIC_'));
          debugInfo.windowProcessEnv = {
            keys: envKeys,
            projectId: (window as any).process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
            databaseId: (window as any).process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            endpoint: (window as any).process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
          };
        }
        
        if ((window as any).__NEXT_DATA__?.env) {
          debugInfo.nextDataEnv = {
            keys: Object.keys((window as any).__NEXT_DATA__.env),
            projectId: (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
            databaseId: (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          };
        }
      }
      
      if (typeof process !== 'undefined') {
        const envKeys = Object.keys((process as any).env || {}).filter((k: string) => k.startsWith('NEXT_PUBLIC_'));
        debugInfo.processEnv = {
          exists: true,
          keys: envKeys,
          projectId: (process as any).env?.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          databaseId: (process as any).env?.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          endpoint: (process as any).env?.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        };
      }
      
      console.error('🔍 Appwrite Config Debug (Full Details):', JSON.stringify(debugInfo, null, 2));
      
      throw new Error(errorMsg);
    }

    // Validate callback URLs before making OAuth request
    // Per Appwrite documentation: callback URLs must match exactly in Appwrite Console
    const successUrl = `${window.location.origin}/auth/callback`;
    const failureUrl = `${window.location.origin}/login`;
    
    // Log callback URLs for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('OAuth Callback URLs:', { successUrl, failureUrl });
      console.log('⚠️ Ensure these URLs are added in Appwrite Console → Authentication → Settings → Redirect URLs');
    }
    
    // Create OAuth session
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl,
      );
    } catch (oauthError: any) {
      // Handle specific OAuth errors per Appwrite documentation
      if (oauthError.code === 412 || oauthError.message?.includes('provider is disabled')) {
        throw new Error(
          'Google OAuth is not enabled in your Appwrite project. ' +
          'Please enable it in the Appwrite Console under Authentication > Providers > Google. ' +
          'See docs/APPWRITE_BEST_PRACTICES.md for setup instructions.'
        );
      }
      
      // Handle 400 errors - often from callback URL mismatch
      if (oauthError.code === 400) {
        throw new Error(
          'OAuth configuration error (400). Please verify:\n' +
          '1. Callback URLs match in Appwrite Console → Authentication → Settings\n' +
          '2. Callback URLs match in Google OAuth Console\n' +
          '3. Platform is added in Appwrite Console → Settings → Platforms\n' +
          `Current callback URL: ${successUrl}\n` +
          'See docs/APPWRITE_BEST_PRACTICES.md for detailed setup instructions.'
        );
      }
      
      // Handle CORS errors
      if (oauthError.message?.includes('CORS') || oauthError.message?.includes('cross-origin')) {
        throw new Error(
          'CORS error detected. Please add your domain as a platform in Appwrite Console:\n' +
          '1. Go to Appwrite Console → Settings → Platforms\n' +
          '2. Click "Add Platform" → Select "Web"\n' +
          `3. Add: ${window.location.origin}\n` +
          'See docs/APPWRITE_BEST_PRACTICES.md for platform configuration.'
        );
      }
      
      throw oauthError;
    }

    // Note: After redirect, the user will be automatically logged in
    // We'll create the user profile in the callback or after session is established
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
}

/**
 * Create or update user profile after OAuth sign-in
 * Returns true if a new profile was created, false if it already existed
 */
export async function ensureUserProfile(databases: Databases, userId: string, email: string, name?: string): Promise<boolean> {
  try {
    const databaseId = appwriteConfig.databaseId;
    
    if (!databaseId) {
      throw new Error('Database ID is not configured. Please set NEXT_PUBLIC_APPWRITE_DATABASE_ID in .env.local');
    }
    
    // Check if user document exists
    try {
      await databases.getDocument(databaseId, 'user', userId);
      // Document exists, no need to create
      return false;
    } catch (error: any) {
      // Document doesn't exist, create it
      if (error.code === 404) {
        const firstName = name?.split(' ')[0] || 'New';
        const lastName = name?.split(' ').slice(1).join(' ') || 'User';
        
        try {
          // Validate userId format (should be a valid Appwrite ID)
          // Appwrite document IDs must be: string, max 36 chars, alphanumeric + .-_ only
          if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('Invalid userId provided');
          }
          
          // Validate userId format according to Appwrite requirements
          // Document IDs should not start with special characters and should be valid
          const documentId = userId.trim();
          if (documentId.length > 36) {
            throw new Error('Document ID exceeds maximum length of 36 characters');
          }
          
          // Create document data following Appwrite best practices:
          // 1. Only include attributes defined in collection schema
          // 2. Never include 'id' or '$id' in data (these are reserved)
          // 3. Never include '$createdAt', '$updatedAt' (managed by Appwrite)
          // 4. Use simple object literal to avoid prototype pollution
          const documentData = {
            firstName: String(firstName || 'New').trim(),
            lastName: String(lastName || 'User').trim(),
            email: String(email || '').trim(),
          };
          
          // Ensure email is not empty
          if (!documentData.email) {
            throw new Error('Email is required to create user profile');
          }
          
          // Use the exact same simple pattern as register page (which works)
          // Simple object literal - no complex cleanup needed
          // According to Appwrite docs: documentId parameter becomes $id automatically
          // We must NOT include $id or id in the data object
          
          // NOTE: If using custom documentId causes issues, we could use ID.unique() instead
          // But we want to use the OAuth user's ID to match the user account
          console.log('Creating document with:', {
            databaseId,
            collectionId: 'user',
            documentId,
            data: { firstName: documentData.firstName, lastName: documentData.lastName, email: documentData.email }
          });
          
          const result = await databases.createDocument(
            databaseId,
            'user',
            documentId,
            {
              firstName: documentData.firstName,
              lastName: documentData.lastName,
              email: documentData.email,
            }
          );
          
          console.log('User document created successfully');
          return true; // New profile was created
        } catch (createError: any) {
          // Log the full error for debugging
          console.error('=== ERROR CREATING USER DOCUMENT ===');
          console.error('Error object:', createError);
          console.error('Error code:', createError.code);
          console.error('Error message:', createError.message);
          console.error('Error type:', createError.type);
          
          // Check if error has response property
          if (createError.response) {
            console.error('Error response:', createError.response);
            try {
              console.error('Error response data:', JSON.stringify(createError.response, null, 2));
            } catch (e) {
              console.error('Could not stringify response:', e);
            }
          }
          
          // Check if error has a data property
          if (createError.data) {
            console.error('Error data:', createError.data);
            try {
              console.error('Error data JSON:', JSON.stringify(createError.data, null, 2));
            } catch (e) {
              console.error('Could not stringify data:', e);
            }
          }
          
          // Log all error properties
          console.error('Error object keys:', Object.keys(createError));
          console.error('Error object properties:', Object.getOwnPropertyNames(createError));
          
          // Try to get more details from the error
          if (createError.message && createError.message.includes('id')) {
            console.error('⚠️ ERROR MENTIONS "id" - This suggests Appwrite received an id field');
            console.error('Please check:');
            console.error('1. Collection settings for computed attributes');
            console.error('2. Collection settings for default values');
            console.error('3. Appwrite SDK version compatibility');
          }
          // Handle collection not found error
          if (createError.code === 404 && createError.message?.includes('Collection')) {
            throw new Error(
              'The "user" collection does not exist in your Appwrite database. ' +
              'Please create it in the Appwrite Console: ' +
              'Databases → ' + databaseId + ' → Create Collection → Collection ID: "user". ' +
              'See docs/APPWRITE_COLLECTIONS_SETUP.md for detailed instructions.'
            );
          }
          throw createError;
        }
      } else if (error.code === 404 && error.message?.includes('Collection')) {
        // Collection itself doesn't exist
        throw new Error(
          'The "user" collection does not exist in your Appwrite database. ' +
          'Please create it in the Appwrite Console: ' +
          'Databases → ' + databaseId + ' → Create Collection → Collection ID: "user". ' +
          'See docs/APPWRITE_COLLECTIONS_SETUP.md for detailed instructions.'
        );
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    throw error;
  }
}

/**
 * Log out the current user
 * Uses deleteSessions() to delete all sessions from the user account
 * This is the recommended approach per Appwrite documentation
 */
export async function logOut(account: Account): Promise<void> {
  try {
    // Use deleteSessions() which deletes all sessions and removes session cookies
    // This is more reliable than deleteSession('current') which has validation issues
    await account.deleteSessions();
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}

/**
 * Delete the current user
 * Note: This may require the user to be logged in recently
 */
export async function deleteCurrentUser(account: Account): Promise<void> {
  try {
    // Appwrite Account.delete() method - may require recent login
    // @ts-ignore - Account.delete() exists but may not be in types
    await (account as any).delete();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

