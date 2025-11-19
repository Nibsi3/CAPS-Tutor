import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Find user if email provided
    let targetUserId = userId;
    if (!targetUserId && email) {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        'user',
        [Query.equal('email', email), Query.limit(1)]
      );
      if (users.documents.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      targetUserId = users.documents[0].$id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Unable to determine user ID' },
        { status: 400 }
      );
    }

    // Get user profile
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      'user',
      targetUserId
    );

    // Get activity logs if collection exists
    let activityLogs: any[] = [];
    try {
      const logs = await databases.listDocuments(
        appwriteConfig.databaseId,
        'activityLogs',
        [
          Query.equal('userId', targetUserId),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );
      activityLogs = logs.documents;
    } catch (error) {
      // Try alternative collection names
      try {
        const logs = await databases.listDocuments(
          appwriteConfig.databaseId,
          'userActivity',
          [
            Query.equal('userId', targetUserId),
            Query.orderDesc('$createdAt'),
            Query.limit(100),
          ]
        );
        activityLogs = logs.documents;
      } catch (error2) {
        console.warn('Activity logs collection not found');
      }
    }

    // Get user progress if available - try multiple collection names
    let userProgress: any = null;
    try {
      const progress = await databases.listDocuments(
        appwriteConfig.databaseId,
        'userprogress',
        [Query.equal('userId', targetUserId), Query.limit(1)]
      );
      if (progress.documents.length > 0) {
        userProgress = progress.documents[0];
      }
    } catch (error) {
      // Try alternative collection name
      try {
        const progress = await databases.listDocuments(
          appwriteConfig.databaseId,
          'userProgress',
          [Query.equal('userId', targetUserId), Query.limit(1)]
        );
        if (progress.documents.length > 0) {
          userProgress = progress.documents[0];
        }
      } catch (error2) {
        console.warn('User progress collection not found');
      }
    }

    // Get past paper attempts
    let pastPaperAttempts: any[] = [];
    try {
      const attempts = await databases.listDocuments(
        appwriteConfig.databaseId,
        'pastPaperAttempts',
        [
          Query.equal('userId', targetUserId),
          Query.orderDesc('$createdAt'),
        ]
      );
      pastPaperAttempts = attempts.documents;
    } catch (error) {
      // Collection might not exist
    }

    // Get lesson completions
    let lessonCompletions: any[] = [];
    try {
      const completions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'lessonCompletions',
        [
          Query.equal('userId', targetUserId),
          Query.orderDesc('$createdAt'),
        ]
      );
      lessonCompletions = completions.documents;
    } catch (error) {
      // Try alternative name
      try {
        const completions = await databases.listDocuments(
          appwriteConfig.databaseId,
          'completedLessons',
          [
            Query.equal('userId', targetUserId),
            Query.orderDesc('$createdAt'),
          ]
        );
        lessonCompletions = completions.documents;
      } catch (error2) {
        // Collection might not exist
      }
    }

    // Get question attempts/answers
    let questionAttempts: any[] = [];
    try {
      const questions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questionAttempts',
        [
          Query.equal('userId', targetUserId),
          Query.orderDesc('$createdAt'),
        ]
      );
      questionAttempts = questions.documents;
    } catch (error) {
      // Try alternative names
      try {
        const questions = await databases.listDocuments(
          appwriteConfig.databaseId,
          'userAnswers',
          [
            Query.equal('userId', targetUserId),
            Query.orderDesc('$createdAt'),
          ]
        );
        questionAttempts = questions.documents;
      } catch (error2) {
        // Collection might not exist
      }
    }

    // Detect device type from deviceInfo or user agent
    const detectDeviceType = (deviceInfo: string | null | undefined): string => {
      if (!deviceInfo) return 'Unknown';
      
      const info = deviceInfo.toLowerCase();
      if (info.includes('mobile') || info.includes('android') || info.includes('iphone') || info.includes('ipad')) {
        if (info.includes('tablet') || info.includes('ipad')) {
          return 'Tablet';
        }
        return 'Mobile';
      }
      if (info.includes('desktop') || info.includes('windows') || info.includes('mac') || info.includes('linux')) {
        return 'Desktop';
      }
      if (info.includes('tablet')) {
        return 'Tablet';
      }
      return deviceInfo; // Return original if we can't categorize
    };

    const deviceType = detectDeviceType(user.deviceInfo);

    // Log what we found for debugging
    console.log('User Activity Data:', {
      userId: targetUserId,
      hasUserProgress: !!userProgress,
      activityLogsCount: activityLogs.length,
      pastPaperAttemptsCount: pastPaperAttempts.length,
      lessonCompletionsCount: lessonCompletions.length,
      questionAttemptsCount: questionAttempts.length,
      userProgressFields: userProgress ? Object.keys(userProgress) : [],
    });

    // Calculate stats from actual data
    // Use userProgress if available, otherwise calculate from individual collections
    const totalStudyTimeMinutes = userProgress?.totalStudyTimeMinutes || 
      userProgress?.studyTimeMinutes || 
      userProgress?.totalTimeSpent || 
      0;
    
    const questionsAnswered = questionAttempts.length > 0 
      ? questionAttempts.length 
      : (userProgress?.questionsAnswered || userProgress?.totalQuestionsAnswered || 0);
    
    const completedLessons = lessonCompletions.length > 0 
      ? lessonCompletions.length 
      : (userProgress?.completedLessons || userProgress?.lessonsCompleted || 0);
    
    const pastPapersAttempted = pastPaperAttempts.length > 0 
      ? pastPaperAttempts.length 
      : (userProgress?.pastPapersAttempted || userProgress?.papersAttempted || 0);
    
    // Calculate average score from question attempts
    let averageScore = 0;
    if (questionAttempts.length > 0) {
      const scores = questionAttempts
        .map((q: any) => q.score || q.percentage || (q.isCorrect ? 100 : 0))
        .filter((s: any) => typeof s === 'number');
      if (scores.length > 0) {
        averageScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      }
    } else if (userProgress?.averageScore) {
      averageScore = userProgress.averageScore;
    } else if (userProgress?.avgScore) {
      averageScore = userProgress.avgScore;
    }
    
    // Calculate total sessions from activity logs or userProgress
    const totalSessions = userProgress?.totalSessions || 
      userProgress?.sessions || 
      (activityLogs.length > 0 ? new Set(activityLogs.map((log: any) => {
        const date = new Date(log.$createdAt || log.createdAt);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })).size : 0);

    const stats = {
      totalStudyTimeMinutes: totalStudyTimeMinutes,
      totalStudyTimeHours: Math.round(totalStudyTimeMinutes / 60 * 10) / 10,
      questionsAnswered: questionsAnswered,
      completedLessons: completedLessons,
      pastPapersAttempted: pastPapersAttempted,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      totalSessions: totalSessions,
    };

    // Combine all activity logs from different sources
    const allActivityLogs = [
      ...activityLogs.map((log: any) => ({
        ...log,
        type: log.action || log.type || 'activity',
        timestamp: log.$createdAt || log.createdAt,
      })),
      ...pastPaperAttempts.map((attempt: any) => ({
        ...attempt,
        type: 'past_paper_attempt',
        action: `Attempted past paper${attempt.paperTitle ? `: ${attempt.paperTitle}` : ''}`,
        timestamp: attempt.$createdAt || attempt.createdAt,
      })),
      ...lessonCompletions.map((completion: any) => ({
        ...completion,
        type: 'lesson_completion',
        action: `Completed lesson${completion.lessonTitle ? `: ${completion.lessonTitle}` : ''}`,
        timestamp: completion.$createdAt || completion.completedAt || completion.createdAt,
      })),
    ].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA; // Most recent first
    }).slice(0, 100); // Limit to 100 most recent

    return NextResponse.json({
      success: true,
      user: {
        id: user.$id,
        email: user.email || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        grade: user.gradeLevel || null,
        lastLogin: user.lastLoginTimestamp || user.lastLoginDate || null,
        createdAt: user.$createdAt,
        deviceType: deviceType,
        deviceInfo: user.deviceInfo || null,
      },
      activityLogs: allActivityLogs,
      userProgress,
      stats,
      // Include raw data for debugging
      _raw: {
        activityLogsCount: activityLogs.length,
        pastPaperAttemptsCount: pastPaperAttempts.length,
        lessonCompletionsCount: lessonCompletions.length,
        questionAttemptsCount: questionAttempts.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}

