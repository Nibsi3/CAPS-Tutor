'use client';

import { Account, ID } from 'appwrite';

/**
 * Initiates email/password sign-up (non-blocking).
 */
export async function initiateEmailSignUp(account: Account, email: string, password: string, name?: string): Promise<{ userId: string }> {
  const userId = ID.unique();
  await account.create(userId, email, password, name);
  return { userId };
}

/**
 * Initiates email/password sign-in (non-blocking).
 */
export async function initiateEmailSignIn(account: Account, email: string, password: string): Promise<void> {
  await account.createEmailPasswordSession(email, password);
}

/**
 * Sends email verification.
 */
export async function sendEmailVerification(account: Account): Promise<void> {
  // Guard: Handle missing env var (becomes false in preview mode)
  const verificationUrl = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_APPWRITE_VERIFICATION_URL) 
    ? String((process as any).env.NEXT_PUBLIC_APPWRITE_VERIFICATION_URL)
    : (typeof window !== 'undefined' ? window.location.origin + '/verify-email' : '/verify-email');
  
  await account.createVerification(verificationUrl);
}

/**
 * Updates the user's password (no old password required when authenticated).
 * Note: For email/password users, Appwrite may require old password on the server side.
 * For OAuth users, old password is optional. This implementation attempts without old password.
 */
export async function updatePassword(account: Account, password: string, oldPassword?: string): Promise<void> {
  // Appwrite SDK signature: updatePassword(password: string, oldPassword?: string)
  // oldPassword is optional in the signature but may be required server-side for email/password users
  await account.updatePassword(password, oldPassword);
}

/**
 * Creates a password recovery request.
 */
export async function createPasswordRecovery(account: Account, email: string, url: string): Promise<void> {
  await account.createRecovery(email, url);
}

/**
 * Completes the password recovery process.
 */
export async function updatePasswordRecovery(account: Account, userId: string, secret: string, password: string, passwordAgain: string): Promise<void> {
  await account.updateRecovery(userId, secret, password, passwordAgain);
}

