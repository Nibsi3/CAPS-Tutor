import { Databases } from 'appwrite';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Track user login date
 * Updates the user profile with today's date in loginDates array
 */
export async function trackLogin(databases: Databases, userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const now = new Date().toISOString();

    try {
      const userDoc = await databases.getDocument(
        appwriteConfig.databaseId,
        'users',
        userId
      );

      const loginDates = userDoc.loginDates || [];
      
      // Only add if today's date is not already in the array
      if (!loginDates.includes(today)) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'users',
          userId,
          {
            loginDates: [...loginDates, today],
            lastLoginDate: today,
            lastLoginTimestamp: now,
          }
        );
      } else {
        // Update last login timestamp even if date already exists
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'users',
          userId,
          {
            lastLoginTimestamp: now,
          }
        );
      }
    } catch (error: any) {
      // Document doesn't exist, create it
      if (error.code === 404) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          'users',
          userId,
          {
            loginDates: [today],
            lastLoginDate: today,
            lastLoginTimestamp: now,
          }
        );
      } else {
        throw error;
      }
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
  databases: Databases,
  userId: string,
  minutesStudied: number
): Promise<void> {
  try {
    try {
      const userDoc = await databases.getDocument(
        appwriteConfig.databaseId,
        'users',
        userId
      );

      const currentTotal = userDoc.totalStudyTimeMinutes || 0;
      const newTotal = currentTotal + minutesStudied;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        'users',
        userId,
        {
          totalStudyTimeMinutes: newTotal,
        }
      );
    } catch (error: any) {
      // Document doesn't exist, create it
      if (error.code === 404) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          'users',
          userId,
          {
            totalStudyTimeMinutes: minutesStudied,
          }
        );
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error tracking study time:', error);
  }
}

/**
 * Update unlocked achievements in user profile
 */
export async function updateUnlockedAchievements(
  databases: Databases,
  userId: string,
  achievementIds: string[]
): Promise<void> {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'users',
      userId,
      {
        unlockedAchievements: achievementIds,
      }
    );
  } catch (error) {
    console.error('Error updating unlocked achievements:', error);
  }
}




