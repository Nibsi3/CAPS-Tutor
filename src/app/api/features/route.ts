import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

const SETTINGS_DOC_ID = 'systemSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let databases;
    try {
      databases = getServerDatabases();
      if (!databases) {
        // Return defaults if database connection fails
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
    } catch (initError: any) {
      // Return defaults if API key is missing
      if (initError.message?.includes('APPWRITE_API_KEY')) {
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
      throw initError;
    }
    
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
    // Log more details for debugging
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      stack: error?.stack,
    });

    // Return defaults on error with error info for debugging
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
      error: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code,
        type: error?.type,
      } : undefined,
    });
  }
}

