import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

const SETTINGS_DOC_ID = 'dbeDashboardAccess';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();

    try {
      const doc = await databases.getDocument(
        appwriteConfig.databaseId,
        'systemsettings',
        SETTINGS_DOC_ID
      );

      return NextResponse.json({
        success: true,
        enabled: doc.enabled || false,
        authorizedUsers: doc.authorizedUsers || [],
      });
    } catch (error: any) {
      // Return default if document doesn't exist
      return NextResponse.json({
        success: true,
        enabled: false,
        authorizedUsers: [],
      });
    }
  } catch (error: any) {
    console.error('Error fetching DBE access settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch DBE access settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled, authorizedUsers } = body;

    if (enabled === undefined) {
      return NextResponse.json(
        { success: false, error: 'Enabled status is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    try {
      // Try to update existing document
      await databases.updateDocument(
        appwriteConfig.databaseId,
        'systemsettings',
        SETTINGS_DOC_ID,
        {
          enabled,
          authorizedUsers: authorizedUsers || [],
        }
      );

      return NextResponse.json({
        success: true,
        message: 'DBE access settings updated successfully',
      });
    } catch (error: any) {
      // Create new document if it doesn't exist
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          'systemsettings',
          SETTINGS_DOC_ID,
          {
            enabled,
            authorizedUsers: authorizedUsers || [],
          }
        );

        return NextResponse.json({
          success: true,
          message: 'DBE access settings created successfully',
        });
      } catch (createError: any) {
        return NextResponse.json(
          {
            success: false,
            error: 'System settings collection does not exist. Please create it in Appwrite first.',
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error updating DBE access settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update DBE access settings' },
      { status: 500 }
    );
  }
}

