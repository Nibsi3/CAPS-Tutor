import { Achievement, ALL_ACHIEVEMENTS } from './achievements';

export interface UserStats {
  dailyLoginStreak: number;
  totalStudyTimeMinutes: number;
  quizScores: number[];
  perfectScoreCount: number;
  averageScore: number;
  subjectsActive: string[];
  currentStreak: number;
  loginDates: string[]; // Array of date strings in YYYY-MM-DD format
  subjectScores: Record<string, number[]>; // Subject -> array of scores
}

export interface StudentProgress {
  masteryLevel?: number;
  score?: number;
  subject?: string;
  completed?: boolean;
  lastAccessed?: string;
}

export interface UserProfile {
  loginDates?: string[];
  unlockedAchievements?: string[];
  lastLoginDate?: string;
  totalStudyTimeMinutes?: number;
}

export function calculateUserStats(
  userProfile: UserProfile | null,
  progressData: StudentProgress[] | null
): UserStats {
  // Calculate daily login streak
  const loginDates = userProfile?.loginDates || [];
  const dailyLoginStreak = calculateLoginStreak(loginDates);

  // Calculate total study time
  const totalStudyTimeMinutes = userProfile?.totalStudyTimeMinutes || 0;

  // Extract scores from progress data
  const quizScores: number[] = [];
  const subjectScores: Record<string, number[]> = {};
  let perfectScoreCount = 0;

  if (progressData) {
    progressData.forEach((progress) => {
      if (progress.score !== undefined) {
        const score = progress.score;
        quizScores.push(score);

        if (progress.subject) {
          if (!subjectScores[progress.subject]) {
            subjectScores[progress.subject] = [];
          }
          subjectScores[progress.subject].push(score);
        }

        if (score === 100) {
          perfectScoreCount++;
        }
      } else if (progress.masteryLevel !== undefined) {
        // Treat mastery level as a score if no score exists
        const score = progress.masteryLevel;
        quizScores.push(score);

        if (progress.subject) {
          if (!subjectScores[progress.subject]) {
            subjectScores[progress.subject] = [];
          }
          subjectScores[progress.subject].push(score);
        }

        if (score === 100) {
          perfectScoreCount++;
        }
      }
    });
  }

  // Calculate average score
  const averageScore = quizScores.length > 0
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
    : 0;

  // Get unique active subjects
  const subjectsActive = Object.keys(subjectScores);

  // Calculate current streak (consecutive days with activity)
  const currentStreak = calculateStudyStreak(progressData);

  return {
    dailyLoginStreak: dailyLoginStreak,
    totalStudyTimeMinutes: totalStudyTimeMinutes,
    quizScores: quizScores,
    perfectScoreCount: perfectScoreCount,
    averageScore: averageScore,
    subjectsActive: subjectsActive,
    currentStreak: currentStreak,
    loginDates: loginDates,
    subjectScores: subjectScores,
  };
}

function calculateLoginStreak(loginDates: string[]): number {
  if (loginDates.length === 0) return 0;

  // Sort dates and get unique dates, filtering out invalid dates
  const sortedDates = [...new Set(loginDates)]
    .filter(dateStr => {
      try {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    })
    .sort()
    .reverse();
    
  if (sortedDates.length === 0) return 0;

  // Check if most recent login is today or yesterday
  const today = new Date().toISOString().split('T')[0];

  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sortedDates) {
    try {
      const loginDate = new Date(dateStr);
      
      // Validate date
      if (isNaN(loginDate.getTime())) {
        continue;
      }
      
      const daysDiff = Math.floor((currentDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(loginDate);
      } else if (daysDiff > streak) {
        // Gap in streak
        break;
      }
    } catch (error) {
      console.warn('Error processing login date in streak calculation:', error);
      continue;
    }
  }

  return streak;
}

function calculateStudyStreak(progressData: StudentProgress[] | null): number {
  if (!progressData || progressData.length === 0) return 0;

  // Get unique dates from progress data
  const activityDates = progressData
    .filter(p => p.lastAccessed)
    .map(p => {
      try {
        let date: Date;
        
        // Handle Firestore Timestamp
        if (p.lastAccessed && typeof p.lastAccessed === 'object' && 'toDate' in p.lastAccessed) {
          date = (p.lastAccessed as any).toDate();
        } 
        // Handle string or number
        else if (p.lastAccessed) {
          date = new Date(p.lastAccessed);
        } 
        else {
          return null;
        }
        
        // Validate date
        if (isNaN(date.getTime())) {
          return null;
        }
        
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('Error parsing date in calculateStudyStreak:', error);
        return null;
      }
    })
    .filter((date): date is string => date !== null);

  const uniqueDates = [...new Set(activityDates)].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of uniqueDates) {
    try {
      const activityDate = new Date(dateStr);
      
      // Validate date
      if (isNaN(activityDate.getTime())) {
        continue;
      }
      
      const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(activityDate);
      } else if (daysDiff > streak) {
        break;
      }
    } catch (error) {
      console.warn('Error processing date in streak calculation:', error);
      continue;
    }
  }

  return streak;
}

export function checkAchievements(
  stats: UserStats,
  alreadyUnlocked: Set<string>
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ALL_ACHIEVEMENTS) {
    // Skip if already unlocked
    if (alreadyUnlocked.has(achievement.id)) {
      continue;
    }

    let isUnlocked = false;

    switch (achievement.requirement.type) {
      case 'daily_login':
        if (stats.dailyLoginStreak >= achievement.requirement.value) {
          isUnlocked = true;
        }
        break;

      case 'total_time':
        if (stats.totalStudyTimeMinutes >= achievement.requirement.value) {
          isUnlocked = true;
        }
        break;

      case 'single_score':
        // Check if any score meets the requirement
        if (stats.quizScores.some(score => score >= achievement.requirement.value)) {
          isUnlocked = true;
        }
        break;

      case 'avg_score':
        // Check average score
        if (achievement.requirement.subject) {
          // Subject-specific average
          const subjectScores = stats.subjectScores[achievement.requirement.subject] || [];
          if (subjectScores.length > 0) {
            const avg = subjectScores.reduce((sum, s) => sum + s, 0) / subjectScores.length;
            if (avg >= achievement.requirement.value) {
              isUnlocked = true;
            }
          }
        } else {
          // Overall average
          if (stats.averageScore >= achievement.requirement.value) {
            isUnlocked = true;
          }
        }
        break;

      case 'subject_count':
        if (stats.subjectsActive.length >= achievement.requirement.value) {
          isUnlocked = true;
        }
        break;

      case 'streak':
        if (stats.currentStreak >= achievement.requirement.value) {
          isUnlocked = true;
        }
        break;

      case 'perfect_score':
        if (stats.perfectScoreCount >= achievement.requirement.value) {
          isUnlocked = true;
        }
        break;
    }

    if (isUnlocked) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

