'use client';

import { Account, OAuthProvider } from 'appwrite';
import { Databases } from 'appwrite';
import { appwriteConfig } from '../config';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(account: Account, databases: Databases): Promise<void> {
  try {
    // Create OAuth session
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/dashboard`,
      `${window.location.origin}/login`,
    );

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
export async function ensureUserProfile(databases: Databases, userId: string, email: string, name?: string): Promise<void> {
  try {
    const databaseId = appwriteConfig.databaseId;
    
    // Check if user document exists
    try {
      await databases.getDocument(databaseId, 'users', userId);
      // Document exists, no need to create
    } catch (error: any) {
      // Document doesn't exist, create it
      if (error.code === 404) {
        const firstName = name?.split(' ')[0] || 'New';
        const lastName = name?.split(' ').slice(1).join(' ') || 'User';
        
        await databases.createDocument(databaseId, 'users', userId, {
          firstName,
          lastName,
          email,
        });
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
    await account.deleteSession('current');
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}

/**
 * Delete the current user
 */
export async function deleteCurrentUser(account: Account): Promise<void> {
  try {
    await account.delete();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

