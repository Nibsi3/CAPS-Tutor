import { NextRequest, NextResponse } from 'next/server';
import { Query, ID, Client, Users } from 'node-appwrite';
import { getServerDatabases, getServerClient } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Populate userprogress collection with sample data for testing
 * POST /api/admin/utilities/populate-user-progress
 * Body: { email: "user@example.com", gradeLevel: 12 }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email || 'cameronfalck03@gmail.com';
    const gradeLevel = body.gradeLevel || 12;

    // Get server-side clients
    const client = getServerClient();
    const users = new Users(client);
    const databases = getServerDatabases();
    const databaseId = appwriteConfig.databaseId;
    const collectionId = 'userprogress';

    // Find user by email - search in the user collection
    let userId: string;
    try {
      // First, try to find user in Appwrite Auth
      const usersList = await users.list([
        Query.equal('email', email),
        Query.limit(1)
      ]);

      if (usersList.users && usersList.users.length > 0) {
        userId = usersList.users[0].$id;
      } else {
        // If not found in Auth, try to find in user collection
        const userDocs = await databases.listDocuments(
          databaseId,
          'user',
          [Query.equal('email', email), Query.limit(1)]
        );
        
        if (userDocs.documents && userDocs.documents.length > 0) {
          userId = userDocs.documents[0].$id;
        } else {
          return NextResponse.json(
            { error: `User with email ${email} not found in Auth or user collection` },
            { status: 404 }
          );
        }
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to find user', message: error.message, code: error.code },
        { status: 500 }
      );
    }

    // Sample progress data for Grade 12
    // These are topics with low mastery (< 70%) so they show up as struggling topics
    const sampleProgressData = [
      // Mathematics
      {
        userID: userId,
        learningObjectiveId: `topic-Algebra`,
        masteryLevel: 45,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Algebra',
        subject: 'Mathematics',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 45,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Trigonometry`,
        masteryLevel: 55,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Trigonometry',
        subject: 'Mathematics',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 55,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Calculus`,
        masteryLevel: 38,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Calculus',
        subject: 'Mathematics',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 38,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Functions`,
        masteryLevel: 62,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Functions',
        subject: 'Mathematics',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 62,
        totalQuestions: 100
      },
      // Physical Sciences
      {
        userID: userId,
        learningObjectiveId: `topic-Mechanics`,
        masteryLevel: 52,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Mechanics',
        subject: 'Physical Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 52,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Electricity`,
        masteryLevel: 48,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Electricity and Magnetism',
        subject: 'Physical Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 48,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Waves`,
        masteryLevel: 58,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Waves, Sound and Light',
        subject: 'Physical Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 58,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Chemical-Bonding`,
        masteryLevel: 42,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Chemical Bonding',
        subject: 'Physical Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 42,
        totalQuestions: 100
      },
      // Life Sciences
      {
        userID: userId,
        learningObjectiveId: `topic-Cell-Biology`,
        masteryLevel: 65,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Cell Biology',
        subject: 'Life Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 65,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Genetics`,
        masteryLevel: 50,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Genetics',
        subject: 'Life Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 50,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Ecology`,
        masteryLevel: 55,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Ecology',
        subject: 'Life Sciences',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 55,
        totalQuestions: 100
      },
      // Accounting
      {
        userID: userId,
        learningObjectiveId: `topic-Financial-Statements`,
        masteryLevel: 60,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Financial Statements',
        subject: 'Accounting',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 60,
        totalQuestions: 100
      },
      {
        userID: userId,
        learningObjectiveId: `topic-Cost-Accounting`,
        masteryLevel: 47,
        completed: false,
        lastAccessed: new Date().toISOString(),
        topic: 'Cost Accounting',
        subject: 'Accounting',
        gradeLevel: gradeLevel,
        type: 'practice',
        score: 47,
        totalQuestions: 100
      },
    ];

    // Check if progress already exists for this user
    try {
      const existingProgress = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('userID', userId), Query.limit(1)]
      );

      if (existingProgress.total > 0) {
        return NextResponse.json({
          success: false,
          message: `User already has ${existingProgress.total} progress records. Delete existing records first or use a different user.`,
          existingCount: existingProgress.total,
          hint: 'To repopulate, delete existing progress records first'
        }, { status: 400 });
      }
    } catch (error: any) {
      // If query fails, continue (might be permission issue, but we'll try to create anyway)
      console.warn('Could not check existing progress:', error.message);
    }

    // Create progress records
    const created = [];
    const errors = [];

    for (const progress of sampleProgressData) {
      try {
        const result = await databases.createDocument(
          databaseId,
          collectionId,
          ID.unique(),
          progress
        );
        created.push({
          topic: progress.topic,
          subject: progress.subject,
          masteryLevel: progress.masteryLevel,
          id: result.$id
        });
      } catch (error: any) {
        errors.push({
          topic: progress.topic,
          subject: progress.subject,
          error: error.message,
          code: error.code
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} progress records for ${email}`,
      userId,
      created: created.length,
      errors: errors.length,
      records: created,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error populating user progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

