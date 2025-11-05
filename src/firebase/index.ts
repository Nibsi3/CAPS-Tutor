// Firebase migration: This file is deprecated but kept for API route compatibility
// Most exports have been removed to prevent client-side build errors
// API routes can import directly from specific files if needed

// Removed Firebase-dependent client-side exports to prevent build errors
// These are no longer used in client-side code after migration to Appwrite
// export * from './provider';
// export * from './client-provider';
// export * from './firestore/use-collection';
// export * from './firestore/use-doc';
// export * from './auth/use-user';
// export * from './non-blocking-updates';
// export * from './non-blocking-login';

// Keep these exports that don't depend on Firebase SDK
export * from './errors';
export * from './error-emitter';

// Keep initializeFirebase for API routes (server-side only)
// This function is only used in API routes, not in client-side code
export function initializeFirebase() {
  // Server-side only - API routes use this
  // Using require() to avoid bundling Firebase SDK in client builds
  const { firebaseConfig } = require('@/firebase/config');
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  const { getFirestore } = require('firebase/firestore');
  
  let firebaseApp;
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
