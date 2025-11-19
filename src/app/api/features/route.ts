import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

const SETTINGS_DOC_ID = 'systemSettings';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const actualCollectionId = 'systemsettings';

    try {
      const doc = await databases.getDocument(
        appwriteConfig.databaseId,
        actualCollectionId,
        SETTINGS_DOC_ID
      );

      return NextResponse.json({
        success: true,
        features: doc.features || {
          aiTutor: true,
          pastPapers: true,
          practiceQuestions: true,
          weeklyTasks: false,
          achievements: true,
          progressTracking: true,
        },
      });
    } catch (error: any) {
      // Return defaults if document doesn't exist
      return NextResponse.json({
        success: true,
        features: {
          aiTutor: true,
          pastPapers: true,
          practiceQuestions: true,
          weeklyTasks: false,
          achievements: true,
          progressTracking: true,
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching features:', error);
    // Return defaults on error
    return NextResponse.json({
      success: true,
      features: {
        aiTutor: true,
        pastPapers: true,
        practiceQuestions: true,
        weeklyTasks: false,
        achievements: true,
        progressTracking: true,
      },
    });
  }
}

