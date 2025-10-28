'use client';

import { Auth, GoogleAuthProvider, signInWithPopup, signOut, deleteUser, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(auth: Auth, firestore: Firestore): Promise<UserCredential | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // After sign-in, check if a user document exists. If not, create one.
    if (user && firestore) {
      const userProfileRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userProfileRef);
      if (!docSnap.exists()) {
        // Document doesn't exist, create it with basic info
        await setDoc(userProfileRef, {
          firstName: user.displayName?.split(' ')[0] || 'New',
          lastName: user.displayName?.split(' ')[1] || 'User',
          email: user.email,
        }, { merge: true });
      }
    }
    return result;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    // Re-throw the error to be handled by the calling component (e.g., to show a toast notification)
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

export async function deleteCurrentUser(auth: Auth) {
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
