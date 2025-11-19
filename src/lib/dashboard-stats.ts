import { Databases } from 'appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'appwrite';

export interface DashboardStats {
  usage: {
    activeLearnersByGrade: Record<number, number>;
    activeLearnersByProvince: Record<string, number>;
    dailyActiveLearners: number;
    weeklyActiveLearners: number;
    sessionsPerLearner: Record<string, number>;
    dropOffPoints: Array<{ topic: string; count: number }>;
    subjectLoad: Record<string, number>;
    subjectSelectionRates: Record<string, number>;
    timePerSubject: Record<string, number>;
    timePastPapersVsAI: { pastPapers: number; aiHelp: number };
  };
  mastery: {
    correctVsIncorrect: { correct: number; incorrect: number };
    weakestTopicsByProvince: Record<string, Array<{ topic: string; avgMastery: number }>>;
    improvementOverTime: Array<{ date: string; avgMastery: number }>;
    atpCompletionPercentage: number;
  };
  performance: {
    avgPastPaperScore: number;
    difficultyHeatmap: Record<string, Record<string, number>>;
    predictedExamReadiness: Record<string, number>;
  };
  equity: {
    ruralVsUrban: { rural: number; urban: number };
    lowDeviceVsHighDevice: { lowDevice: number; highDevice: number };
    dataSavingModeUsage: number;
  };
  engagement: {
    uploadsPerLearner: Record<string, number>;
    aiChatInteractionsPerDay: number;
    completedToStartedRatio: number;
  };
  infrastructure: {
    appCrashes: number;
    slowLoadEvents: number;
    offlineModeActivations: number;
  };
}

/**
 * Get all users from the database
 */
async function getAllUsers(databases: Databases): Promise<any[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      'user',
      [Query.limit(10000)] // Adjust limit as needed
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get all student progress records
 */
async function getAllStudentProgress(databases: Databases): Promise<any[]> {
  try {
    // Use userprogress collection (lowercase to match Appwrite Table ID)
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      'userprogress',
      [Query.limit(10000)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return [];
  }
}

/**
 * Get all past paper progress records
 */
async function getAllPastPaperProgress(databases: Databases): Promise<any[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      'pastpaperprogress',
      [Query.limit(10000)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching past paper progress:', error);
    return [];
  }
}

/**
 * Check if a date is within the last N days
 */
function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}

/**
 * Check if a date is today
 */
function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate dashboard statistics
 */
export async function calculateDashboardStats(databases: Databases): Promise<DashboardStats> {
  const users = await getAllUsers(databases);
  const progressRecords = await getAllStudentProgress(databases);
  const pastPaperProgress = await getAllPastPaperProgress(databases);

  const now = new Date();
  const today = getDateString(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAgoStr = getDateString(sevenDaysAgo);

  // Usage Stats
  const activeLearnersByGrade: Record<number, number> = {};
  const activeLearnersByProvince: Record<string, number> = {};
  let dailyActiveLearners = 0;
  let weeklyActiveLearners = 0;
  const sessionsPerLearner: Record<string, number> = {};
  const subjectLoad: Record<string, number> = {};
  const subjectSelectionRates: Record<string, number> = {};
  const timePerSubject: Record<string, number> = {};
  let pastPaperTime = 0;
  let aiHelpTime = 0;

  // Track active learners
  const weeklyActiveUserIds = new Set<string>();
  const dailyActiveUserIds = new Set<string>();

  users.forEach((user) => {
    if (!user || !user.$id) return;
    
    const gradeLevel = user.gradeLevel || 0;
    const province = user.province || 'Unknown';
    const loginDates = Array.isArray(user.loginDates) ? user.loginDates : [];
    const lastLogin = user.lastLoginDate || user.lastLoginTimestamp;

    // Daily active learners
    if (lastLogin && isToday(lastLogin)) {
      dailyActiveLearners++;
      dailyActiveUserIds.add(user.$id);
    }

    // Weekly active learners
    if (lastLogin && isWithinDays(lastLogin, 7)) {
      weeklyActiveLearners++;
      weeklyActiveUserIds.add(user.$id);
    }

    // Active by grade
    if (gradeLevel > 0 && gradeLevel <= 12) {
      activeLearnersByGrade[gradeLevel] = (activeLearnersByGrade[gradeLevel] || 0) + 1;
    }

    // Active by province
    if (province) {
      activeLearnersByProvince[province] = (activeLearnersByProvince[province] || 0) + 1;
    }

    // Sessions per learner (using login dates)
    const sessionCount = loginDates.length;
    if (sessionCount > 0) {
      sessionsPerLearner[user.$id] = sessionCount;
    }

    // Subject selection rates
    const subjects = Array.isArray(user.subjects) ? user.subjects : [];
    subjects.forEach((subject: string) => {
      if (subject && typeof subject === 'string') {
        subjectSelectionRates[subject] = (subjectSelectionRates[subject] || 0) + 1;
      }
    });

    // Time per subject (using totalStudyTimeMinutes)
    const studyTime = user.totalStudyTimeMinutes || 0;
    if (subjects.length > 0 && studyTime > 0) {
      const timePerSubjectAmount = studyTime / subjects.length;
      subjects.forEach((subject: string) => {
        if (subject && typeof subject === 'string') {
          timePerSubject[subject] = (timePerSubject[subject] || 0) + timePerSubjectAmount;
        }
      });
    }
  });

  // Process progress records for subject load and drop-off points
  const dropOffPoints: Record<string, number> = {};
  const topicAccessCounts: Record<string, number> = {};
  const topicCompletionCounts: Record<string, number> = {};

  progressRecords.forEach((progress) => {
    if (!progress) return;
    
    const subject = progress.subject;
    const topic = progress.topic;
    const completed = progress.completed || false;
    const lastAccessed = progress.lastAccessed;

    if (subject) {
      subjectLoad[subject] = (subjectLoad[subject] || 0) + 1;
    }

    if (topic) {
      topicAccessCounts[topic] = (topicAccessCounts[topic] || 0) + 1;
      
      if (!completed && lastAccessed) {
        // If accessed but not completed, it's a drop-off point
        dropOffPoints[topic] = (dropOffPoints[topic] || 0) + 1;
      }
    }

    // Track time spent (estimate based on progress records)
    if (progress.type === 'pastPaper') {
      pastPaperTime += 5; // Estimate 5 minutes per past paper progress
    } else if (progress.type === 'ai' || progress.type === 'tutor') {
      aiHelpTime += 3; // Estimate 3 minutes per AI interaction
    }
  });

  // Convert drop-off points to array
  const dropOffPointsArray = Object.entries(dropOffPoints)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Mastery Stats
  // Count correct/incorrect based on score percentage (>= 60% = correct, < 60% = incorrect)
  let correctCount = 0;
  let incorrectCount = 0;
  
  progressRecords.forEach((p) => {
    if (p.score !== undefined && p.totalQuestions && p.totalQuestions > 0) {
      const scorePercentage = (p.score / p.totalQuestions) * 100;
      if (scorePercentage >= 60) {
        correctCount++;
      } else if (scorePercentage >= 0) {
        incorrectCount++;
      }
    }
  });

  // Weakest topics by province
  const weakestTopicsByProvince: Record<string, Record<string, { total: number; count: number }>> = {};
  users.forEach((user) => {
    const province = user.province || 'Unknown';
    if (!weakestTopicsByProvince[province]) {
      weakestTopicsByProvince[province] = {};
    }
  });

  progressRecords.forEach((progress) => {
    if (!progress || !progress.userId) return;
    
    const province = users.find((u) => u && u.$id === progress.userId)?.province || 'Unknown';
    const topic = progress.topic;
    const mastery = progress.masteryLevel || 0;

    if (topic && typeof topic === 'string' && weakestTopicsByProvince[province]) {
      if (!weakestTopicsByProvince[province][topic]) {
        weakestTopicsByProvince[province][topic] = { total: 0, count: 0 };
      }
      weakestTopicsByProvince[province][topic].total += mastery;
      weakestTopicsByProvince[province][topic].count += 1;
    }
  });

  const weakestTopicsByProvinceFinal: Record<string, Array<{ topic: string; avgMastery: number }>> = {};
  Object.entries(weakestTopicsByProvince).forEach(([province, topics]) => {
    weakestTopicsByProvinceFinal[province] = Object.entries(topics)
      .map(([topic, data]) => ({
        topic,
        avgMastery: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => a.avgMastery - b.avgMastery)
      .slice(0, 5);
  });

  // Improvement over time (simplified - group by month)
  const improvementOverTime: Record<string, { total: number; count: number }> = {};
  progressRecords.forEach((progress) => {
    if (progress.lastAccessed) {
      try {
        const date = new Date(progress.lastAccessed);
        const month = date.getMonth() + 1;
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        const monthKey = `${date.getFullYear()}-${monthStr}`;
        if (!improvementOverTime[monthKey]) {
          improvementOverTime[monthKey] = { total: 0, count: 0 };
        }
        improvementOverTime[monthKey].total += progress.masteryLevel || 0;
        improvementOverTime[monthKey].count += 1;
      } catch (error) {
        // Skip invalid dates
        console.warn('Invalid date in progress record:', progress.lastAccessed);
      }
    }
  });

  const improvementOverTimeArray = Object.entries(improvementOverTime)
    .map(([date, data]) => ({
      date,
      avgMastery: data.count > 0 ? data.total / data.count : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ATP completion (completed progress records)
  const completedCount = progressRecords.filter((p) => p.completed).length;
  const atpCompletionPercentage = progressRecords.length > 0 
    ? (completedCount / progressRecords.length) * 100 
    : 0;

  // Performance Stats
  let totalPastPaperScore = 0;
  let pastPaperScoreCount = 0;
  const difficultyHeatmap: Record<string, Record<string, number>> = {};
  const predictedExamReadiness: Record<string, number> = {};
  const subjectScoreCounts: Record<string, number> = {};

  progressRecords.forEach((progress) => {
    if (!progress) return;
    
    if (progress.score !== undefined && progress.totalQuestions && progress.totalQuestions > 0) {
      const score = (progress.score / progress.totalQuestions) * 100;
      totalPastPaperScore += score;
      pastPaperScoreCount++;

      // Difficulty heatmap (subject vs topic)
      if (progress.subject && progress.topic && typeof progress.subject === 'string' && typeof progress.topic === 'string') {
        if (!difficultyHeatmap[progress.subject]) {
          difficultyHeatmap[progress.subject] = {};
        }
        // Higher score = easier, so difficulty = 100 - score
        const difficulty = 100 - score;
        if (!difficultyHeatmap[progress.subject][progress.topic]) {
          difficultyHeatmap[progress.subject][progress.topic] = 0;
        }
        difficultyHeatmap[progress.subject][progress.topic] += difficulty;
      }

      // Predicted exam readiness (based on mastery and scores)
      if (progress.subject && typeof progress.subject === 'string') {
        const mastery = progress.masteryLevel || 0;
        const scorePercent = score;
        const readiness = (mastery * 0.6 + scorePercent * 0.4); // Weighted average
        predictedExamReadiness[progress.subject] = 
          (predictedExamReadiness[progress.subject] || 0) + readiness;
        subjectScoreCounts[progress.subject] = (subjectScoreCounts[progress.subject] || 0) + 1;
      }
    }
  });

  // Average past paper score
  const avgPastPaperScore = pastPaperScoreCount > 0 
    ? totalPastPaperScore / pastPaperScoreCount 
    : 0;

  // Normalize predicted exam readiness
  Object.keys(predictedExamReadiness).forEach((subject) => {
    if (subjectScoreCounts[subject]) {
      predictedExamReadiness[subject] = predictedExamReadiness[subject] / subjectScoreCounts[subject];
    }
  });

  // Normalize difficulty heatmap (average difficulty per topic)
  const heatmapCounts: Record<string, Record<string, number>> = {};
  progressRecords.forEach((progress) => {
    if (!progress) return;
    
    if (progress.subject && progress.topic && typeof progress.subject === 'string' && typeof progress.topic === 'string' && progress.score !== undefined && progress.totalQuestions && progress.totalQuestions > 0) {
      if (!heatmapCounts[progress.subject]) {
        heatmapCounts[progress.subject] = {};
      }
      heatmapCounts[progress.subject][progress.topic] = 
        (heatmapCounts[progress.subject][progress.topic] || 0) + 1;
    }
  });
  Object.keys(difficultyHeatmap).forEach((subject) => {
    if (difficultyHeatmap[subject]) {
      Object.keys(difficultyHeatmap[subject]).forEach((topic) => {
        if (heatmapCounts[subject]?.[topic] && heatmapCounts[subject][topic] > 0) {
          difficultyHeatmap[subject][topic] = 
            difficultyHeatmap[subject][topic] / heatmapCounts[subject][topic];
        }
      });
    }
  });

  // Equity Stats (simplified - using province as proxy for rural/urban)
  const ruralProvinces = ['Northern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State'];
  let ruralCount = 0;
  let urbanCount = 0;

  users.forEach((user) => {
    const province = user.province || '';
    if (ruralProvinces.includes(province)) {
      ruralCount++;
    } else if (province && province !== 'Unknown') {
      urbanCount++;
    }
  });

  // Engagement Stats
  const uploadsPerLearner: Record<string, number> = {};
  // Note: File uploads would need to be tracked separately
  // For now, we'll use past paper progress as a proxy
  pastPaperProgress.forEach((progress) => {
    if (!progress) return;
    
    const userId = progress.userId;
    if (userId && typeof userId === 'string') {
      uploadsPerLearner[userId] = (uploadsPerLearner[userId] || 0) + 1;
    }
  });

  // Completed vs started questions
  const startedQuestions = progressRecords.filter((p) => p && p.lastAccessed).length;
  const completedQuestions = progressRecords.filter((p) => p && p.completed).length;
  const completedToStartedRatio = startedQuestions > 0 
    ? (completedQuestions / startedQuestions) * 100 
    : 0;

  return {
    usage: {
      activeLearnersByGrade,
      activeLearnersByProvince,
      dailyActiveLearners,
      weeklyActiveLearners,
      sessionsPerLearner,
      dropOffPoints: dropOffPointsArray,
      subjectLoad,
      subjectSelectionRates,
      timePerSubject,
      timePastPapersVsAI: {
        pastPapers: pastPaperTime,
        aiHelp: aiHelpTime,
      },
    },
    mastery: {
      correctVsIncorrect: {
        correct: correctCount,
        incorrect: incorrectCount,
      },
      weakestTopicsByProvince: weakestTopicsByProvinceFinal,
      improvementOverTime: improvementOverTimeArray,
      atpCompletionPercentage,
    },
    performance: {
      avgPastPaperScore,
      difficultyHeatmap,
      predictedExamReadiness,
    },
    equity: {
      ruralVsUrban: {
        rural: ruralCount,
        urban: urbanCount,
      },
      lowDeviceVsHighDevice: {
        lowDevice: 0, // Would need device tracking
        highDevice: 0, // Would need device tracking
      },
      dataSavingModeUsage: 0, // Would need data-saving mode tracking
    },
    engagement: {
      uploadsPerLearner,
      aiChatInteractionsPerDay: 0, // Would need AI chat tracking
      completedToStartedRatio,
    },
    infrastructure: {
      appCrashes: 0, // Would need crash tracking
      slowLoadEvents: 0, // Would need performance tracking
      offlineModeActivations: 0, // Would need offline mode tracking
    },
  };
}

