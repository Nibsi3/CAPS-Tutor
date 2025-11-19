'use client';

import { Account, OAuthProvider } from 'appwrite';
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

    // Create OAuth session
    try {
      await account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/login`,
    );
    } catch (oauthError: any) {
      // Handle specific OAuth errors
      if (oauthError.code === 412 || oauthError.message?.includes('provider is disabled')) {
        throw new Error(
          'Google OAuth is not enabled in your Appwrite project. ' +
          'Please enable it in the Appwrite Console under Authentication > Providers > Google.'
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
 */
export async function ensureUserProfile(databases: Databases, userId: string, email: string, name?: string, photoURL?: string): Promise<void> {
  try {
    const databaseId = appwriteConfig.databaseId;
    
    if (!databaseId) {
      throw new Error('Database ID is not configured. Please set NEXT_PUBLIC_APPWRITE_DATABASE_ID in .env.local');
    }
    
    // Check if user document exists
    try {
      const existingDoc = await databases.getDocument(databaseId, 'user', userId);
      // Document exists, update photoURL if provided and different (or if user doesn't have one)
      const currentPhotoURL = existingDoc.photoURL || null;
      if (photoURL && (currentPhotoURL !== photoURL || !currentPhotoURL)) {
        try {
          await databases.updateDocument(databaseId, 'user', userId, {
            photoURL,
          });
          console.log('✅ Updated photoURL for user:', userId);
          console.log('📸 Photo URL:', photoURL.substring(0, 50) + '...');
        } catch (updateError: any) {
          // If photoURL attribute doesn't exist (400 or 422 error), that's okay - we'll just skip it
          if (updateError.code === 400 || updateError.code === 422) {
            console.warn('⚠️ photoURL attribute does not exist in collection. Please add it to the user collection:', updateError.message);
          } else {
            console.error('❌ Could not update photoURL:', updateError);
          }
        }
      } else if (photoURL) {
        console.log('ℹ️ Photo URL already matches stored value, skipping update');
      }
    } catch (error: any) {
      // Document doesn't exist, create it
      if (error.code === 404) {
        const firstName = name?.split(' ')[0] || 'New';
        const lastName = name?.split(' ').slice(1).join(' ') || 'User';
        
        const profileData: any = {
          firstName,
          lastName,
          email,
        };
        
        // Add photoURL if provided (only if attribute exists in collection)
        if (photoURL) {
          profileData.photoURL = photoURL;
          console.log('📸 Creating profile with photoURL:', photoURL.substring(0, 50) + '...');
        }
        
        try {
          await databases.createDocument(databaseId, 'user', userId, profileData);
          console.log('✅ Created user profile with photoURL');
        } catch (createError: any) {
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
 */
export async function logOut(account: Account): Promise<void> {
  try {
    await account.deleteSession("current");
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

