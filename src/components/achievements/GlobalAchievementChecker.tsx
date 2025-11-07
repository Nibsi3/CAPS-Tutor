'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser, useDoc, useCollection, useMemoAppwrite, useDatabases } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'appwrite';
import { checkAchievements, calculateUserStats } from '@/lib/achievement-checker';
import { updateUnlockedAchievements } from '@/lib/achievement-tracking';
import { Achievement } from '@/lib/achievements';
import { AchievementUnlockNotification } from './AchievementUnlockNotification';

export function GlobalAchievementChecker() {
  const { user } = useUser();
  const databases = useDatabases();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [newUnlockedAchievement, setNewUnlockedAchievement] = useState<Achievement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set());

  // Get user profile
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile } = useDoc(userProfileRef);

  // Get student progress for score calculations
  const progressQuery = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'userprogress',
      queries: [
        Query.equal('userID', user.$id),
      ],
    };
  }, [user]);

  const { data: progressData } = useCollection(progressQuery);

  // Create stable string representations of Sets for dependency tracking
  // This ensures the dependency array always has the same size
  const unlockedAchievementsKey = useMemo(
    () => Array.from(unlockedAchievements).sort().join(','),
    [unlockedAchievements]
  );

  const shownAchievementsKey = useMemo(
    () => Array.from(shownAchievements).sort().join(','),
    [shownAchievements]
  );

  // Initialize unlocked achievements from user profile and shown achievements from localStorage
  useEffect(() => {
    if (userProfile?.unlockedAchievements && !isInitialized) {
      setUnlockedAchievements(new Set(userProfile.unlockedAchievements));
      
      // Load shown achievements from localStorage
      if (user) {
        const storageKey = `shownAchievements_${user.$id}`;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              setShownAchievements(new Set(JSON.parse(stored)));
            } catch (e) {
              // Silently handle parsing errors - non-critical
            }
          }
        } catch (e) {
          // Silently handle localStorage access errors (can happen with Chrome extensions blocking access)
          // This is non-critical and doesn't affect functionality
        }
      }
      
      setIsInitialized(true);
    }
  }, [userProfile, isInitialized, user]);

  // Calculate user stats and check achievements
  useEffect(() => {
    if (!user || !userProfile || !progressData || !isInitialized) {
      return;
    }

    const stats = calculateUserStats(userProfile, progressData);

    // Check and unlock achievements
    const newlyUnlocked = checkAchievements(stats, unlockedAchievements);
    
    if (newlyUnlocked.length > 0) {
      // Update unlocked achievements
      const newUnlockedSet = new Set([...unlockedAchievements, ...newlyUnlocked.map(a => a.id)]);
      setUnlockedAchievements(newUnlockedSet);
      
      // Find achievements that haven't been shown yet
      const achievementsToShow = newlyUnlocked.filter(a => !shownAchievements.has(a.id));
      
      // Show notification for first newly unlocked achievement that hasn't been shown
      if (achievementsToShow.length > 0 && achievementsToShow[0]) {
        setNewUnlockedAchievement(achievementsToShow[0]);
        // Mark as shown
        const newShownSet = new Set([...shownAchievements, achievementsToShow[0].id]);
        setShownAchievements(newShownSet);
        
        // Save to localStorage
        if (user) {
          const storageKey = `shownAchievements_${user.$id}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(newShownSet)));
          } catch (e) {
            // Silently handle localStorage errors (can happen with Chrome extensions blocking access)
            // This is non-critical and doesn't affect functionality
          }
        }
      }
      
      // Update user profile with unlocked achievements
      if (user && databases) {
        const allUnlocked = Array.from(newUnlockedSet);
        updateUnlockedAchievements(databases, user.$id, allUnlocked).catch((error) => {
          // Silently handle errors - non-critical, achievements will sync on next check
        });
      }
    }
    // Using string keys instead of Set objects to ensure consistent dependency array size
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, progressData, unlockedAchievementsKey, shownAchievementsKey, isInitialized, databases]);

  return (
    <AchievementUnlockNotification
      achievement={newUnlockedAchievement}
      onClose={() => setNewUnlockedAchievement(null)}
    />
  );
}

