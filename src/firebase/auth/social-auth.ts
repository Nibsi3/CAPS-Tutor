'use client';

import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(auth: Auth) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
}

export async function logOut(auth: Auth) {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}
