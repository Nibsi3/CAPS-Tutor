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
  await account.createVerification(process.env.NEXT_PUBLIC_APPWRITE_VERIFICATION_URL || window.location.origin + '/verify-email');
}

