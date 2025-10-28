'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(error => {
    // This is a generic error handler. In a real app, you might want more specific error handling.
    console.error("Anonymous Sign-In Error:", error);
    // Optionally, you could emit a global error event here
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: 'auth', // This is a convention, as there's no real path
        operation: 'create', // Representing user creation
        requestResourceData: { email },
      })
    )
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(error => {
     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: 'auth', // This is a convention
        operation: 'get', // Representing sign-in
        requestResourceData: { email },
      })
    )
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
