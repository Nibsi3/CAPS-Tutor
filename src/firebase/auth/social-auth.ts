'use client';

import { Auth, GoogleAuthProvider, signInWithPopup, signOut, deleteUser, User } from 'firebase/auth';

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

export async function deleteCurrentUser() {
  const auth = (await import('@/firebase')).useAuth();
  const user = auth.currentUser;
  if (user) {
    try {
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Re-throw the error to be handled by the calling component
      throw error;
    }
  } else {
    throw new Error("No user is currently signed in to delete.");
  }
}
