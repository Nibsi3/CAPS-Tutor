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

