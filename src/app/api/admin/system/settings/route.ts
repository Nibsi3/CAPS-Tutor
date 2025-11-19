import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
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
        return NextResponse.json(
          {
            success: false,
            error: 'Database connection failed',
            details: 'Appwrite client initialization returned null. Please check your environment variables.',
          },
          { status: 500 }
        );
      }
    } catch (initError: any) {
      console.error('Failed to initialize Appwrite client:', initError);
      return NextResponse.json(
        {
          success: false,
          error: initError.message || 'Failed to initialize database connection',
          details: initError.message?.includes('APPWRITE_API_KEY')
            ? 'APPWRITE_API_KEY environment variable is required. Please set it in .env.local and restart the server.'
            : undefined,
        },
        { status: 500 }
      );
    }

    // Use lowercase collection ID to match Appwrite
    const actualCollectionId = 'systemsettings';

    try {
      const doc = await databases.getDocument(
        appwriteConfig.databaseId,
        actualCollectionId,
        SETTINGS_DOC_ID
      );

      return NextResponse.json({
        success: true,
        settings: {
          maintenanceMode: doc.maintenanceMode || false,
          maintenanceMessage: doc.maintenanceMessage || '',
          maintenanceDuration: doc.maintenanceDuration || '',
          features: doc.features || {
            aiTutor: true,
            pastPapers: true,
            practiceQuestions: true,
            weeklyTasks: false,
            achievements: true,
            progressTracking: true,
          },
          aiConfig: doc.aiConfig || {
            responseLimit: 100,
            safetyFilters: true,
            difficultyLevel: 'medium',
          },
          cacheSettings: doc.cacheSettings || {
            autoUpdate: true,
            updateFrequency: 'daily',
          },
          retentionPolicies: doc.retentionPolicies || {
            userData: '7years',
            activityLogs: '2years',
          },
          customSubjects: doc.customSubjects || [],
        },
      });
    } catch (error: any) {
      const errorCode = error?.code || error?.response?.code;
      const errorType = error?.type || error?.response?.type;
      const errorMessage = error?.message || error?.response?.message || 'Unknown error';
      const normalizedMessage = errorMessage.toLowerCase();
      const isCollectionError =
        errorType === 'collection_not_found' ||
        normalizedMessage.includes('collection');
      const isDocumentError =
        errorType === 'document_not_found' ||
        normalizedMessage.includes('document');
      
      // Check if it's a collection not found error
      if (isCollectionError) {
        console.error('System settings collection not found:', {
          collectionId: actualCollectionId,
          databaseId: appwriteConfig.databaseId,
          errorCode,
          errorMessage,
        });
        return NextResponse.json(
          {
            success: false,
            error: `System settings collection "systemsettings" not found in database "${appwriteConfig.databaseId}". Please verify the collection ID matches exactly (case-sensitive).`,
            details: {
              collectionId: actualCollectionId,
              databaseId: appwriteConfig.databaseId,
              errorCode,
              errorMessage,
              hint: 'Check the collection ID in Appwrite Console - it must match exactly (case-sensitive)',
            },
          },
          { status: 404 }
        );
      }
      
      // Return default settings if document doesn't exist (but collection exists)
      if (isDocumentError || errorCode === 404) {
        console.warn('System settings document not found, returning defaults:', errorMessage);
      } else {
        console.warn('System settings error, returning defaults:', {
          errorMessage,
          errorCode,
          errorType,
        });
      }
      return NextResponse.json({
        success: true,
        settings: {
          maintenanceMode: false,
          maintenanceMessage: '',
          maintenanceDuration: '',
          features: {
            aiTutor: true,
            pastPapers: true,
            practiceQuestions: true,
            weeklyTasks: false,
            achievements: true,
            progressTracking: true,
          },
          aiConfig: {
            responseLimit: 100,
            safetyFilters: true,
            difficultyLevel: 'medium',
          },
          cacheSettings: {
            autoUpdate: true,
            updateFrequency: 'daily',
          },
          retentionPolicies: {
            userData: '7years',
            activityLogs: '2years',
          },
          customSubjects: [],
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { success: false, error: 'Section and data are required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Use lowercase collection ID to match Appwrite
    const actualCollectionId = 'systemsettings';

    try {
      // Try to get existing document
      const existingDoc = await databases.getDocument(
        appwriteConfig.databaseId,
        actualCollectionId,
        SETTINGS_DOC_ID
      );

      // Update specific section
      const updates: any = {};
      if (section === 'maintenance') {
        updates.maintenanceMode = data.maintenanceMode;
        updates.maintenanceMessage = data.maintenanceMessage || '';
        updates.maintenanceDuration = data.maintenanceDuration || '';
      } else if (section === 'features') {
        updates.features = data;
      } else if (section === 'aiConfig') {
        updates.aiConfig = data;
      } else if (section === 'cacheSettings') {
        updates.cacheSettings = data;
      } else if (section === 'retentionPolicies') {
        updates.retentionPolicies = data;
      } else if (section === 'customSubjects') {
        updates.customSubjects = data.customSubjects || [];
      }

      await databases.updateDocument(
        appwriteConfig.databaseId,
        actualCollectionId,
        SETTINGS_DOC_ID,
        updates
      );

      return NextResponse.json({
        success: true,
        message: 'System settings updated successfully',
      });
    } catch (error: any) {
      // Create new document if it doesn't exist
      try {
        const defaultSettings: any = {
          maintenanceMode: false,
          maintenanceMessage: '',
          maintenanceDuration: '',
          features: {
            aiTutor: true,
            pastPapers: true,
            practiceQuestions: true,
            weeklyTasks: false,
            achievements: true,
            progressTracking: true,
          },
          aiConfig: {
            responseLimit: 100,
            safetyFilters: true,
            difficultyLevel: 'medium',
          },
          cacheSettings: {
            autoUpdate: true,
            updateFrequency: 'daily',
          },
          retentionPolicies: {
            userData: '7years',
            activityLogs: '2years',
          },
          customSubjects: [],
        };
        
        // Merge provided data with defaults
        if (section === 'customSubjects' && data.customSubjects) {
          defaultSettings.customSubjects = data.customSubjects;
        } else if (section === 'maintenance') {
          defaultSettings.maintenanceMode = data.maintenanceMode || false;
          defaultSettings.maintenanceMessage = data.maintenanceMessage || '';
          defaultSettings.maintenanceDuration = data.maintenanceDuration || '';
        } else if (section === 'features') {
          defaultSettings.features = data;
        } else if (section === 'aiConfig') {
          defaultSettings.aiConfig = data;
        } else if (section === 'cacheSettings') {
          defaultSettings.cacheSettings = data;
        } else if (section === 'retentionPolicies') {
          defaultSettings.retentionPolicies = data;
        }

        await databases.createDocument(
          appwriteConfig.databaseId,
          actualCollectionId,
          SETTINGS_DOC_ID,
          defaultSettings
        );

        return NextResponse.json({
          success: true,
          message: 'System settings created successfully',
        });
      } catch (createError: any) {
        console.error('Error creating system settings document:', createError);
        const errorCode = createError?.code || createError?.response?.code;
        const errorMessage = createError?.message || createError?.response?.message || 'Unknown error';
        
        // Check if it's a collection not found error
        if (errorCode === 404 || errorMessage.includes('Collection') || errorMessage.includes('collection')) {
          return NextResponse.json(
            {
              success: false,
              error: `System settings collection "systemsettings" does not exist. Please verify the collection ID matches exactly (case-sensitive).`,
              details: {
                collectionId: 'systemsettings',
                databaseId: appwriteConfig.databaseId,
                errorCode,
                errorMessage,
              },
            },
            { status: 404 }
          );
        }
        
        // Check if it's a permission error
        if (errorCode === 401 || errorCode === 403 || errorMessage.includes('permission') || errorMessage.includes('Permission')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Permission denied. Please check that the API key has write permissions for the systemsettings collection.',
              details: {
                collectionId: 'systemsettings',
                databaseId: appwriteConfig.databaseId,
                errorCode,
                errorMessage,
              },
            },
            { status: 403 }
          );
        }
        
        // Generic error
        return NextResponse.json(
          {
            success: false,
              error: `Failed to create system settings document: ${errorMessage}`,
              details: {
                collectionId: 'systemsettings',
              databaseId: appwriteConfig.databaseId,
              errorCode,
              errorMessage,
            },
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update system settings' },
      { status: 500 }
    );
  }
}

