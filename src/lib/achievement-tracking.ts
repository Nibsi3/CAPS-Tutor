import { doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

/**
 * Track user login date
 * Updates the user profile with today's date in loginDates array
 */
export async function trackLogin(firestore: Firestore, userId: string): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const now = Timestamp.now();

    if (userSnap.exists()) {
      const data = userSnap.data();
      const loginDates = data.loginDates || [];
      
      // Only add if today's date is not already in the array
      if (!loginDates.includes(today)) {
        await updateDoc(userRef, {
          loginDates: [...loginDates, today],
          lastLoginDate: today,
          lastLoginTimestamp: now,
        });
      } else {
        // Update last login timestamp even if date already exists
        await updateDoc(userRef, {
          lastLoginTimestamp: now,
        });
      }
    } else {
      // Create user document with login tracking
      await setDoc(userRef, {
        loginDates: [today],
        lastLoginDate: today,
        lastLoginTimestamp: now,
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error tracking login:', error);
  }
}

/**
 * Track study time for a session
 * Adds minutes to the user's totalStudyTimeMinutes
 */
export async function trackStudyTime(
  firestore: Firestore,
  userId: string,
  minutesStudied: number
): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const currentTotal = data.totalStudyTimeMinutes || 0;
      const newTotal = currentTotal + minutesStudied;

      await updateDoc(userRef, {
        totalStudyTimeMinutes: newTotal,
      });
    } else {
      // Create user document with study time tracking
      await setDoc(userRef, {
        totalStudyTimeMinutes: minutesStudied,
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error tracking study time:', error);
  }
}

/**
 * Update unlocked achievements in user profile
 */
export async function updateUnlockedAchievements(
  firestore: Firestore,
  userId: string,
  achievementIds: string[]
): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      unlockedAchievements: achievementIds,
    });
  } catch (error) {
    console.error('Error updating unlocked achievements:', error);
  }
}




