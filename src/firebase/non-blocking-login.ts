'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/**
 * Initiates email/password sign-up (non-blocking).
 * Returns a promise that resolves on success or rejects on error.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(authInstance, email, password)
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

/**
 * Initiates email/password sign-in (non-blocking).
 * Returns a promise that resolves on success or rejects on error.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(authInstance, email, password)
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

    