import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

const SETTINGS_DOC_ID = 'emailSmsConfig';

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
        email: {
          provider: doc.emailProvider || '',
          smtpServer: doc.smtpServer || '',
          smtpPort: doc.smtpPort || 587,
          fromEmail: doc.fromEmail || '',
          // Don't return sensitive data like passwords
        },
        sms: {
          provider: doc.smsProvider || '',
          // Don't return API keys
        },
      });
    } catch (error: any) {
      // Return default if document doesn't exist
      return NextResponse.json({
        success: true,
        email: {
          provider: '',
          smtpServer: '',
          smtpPort: 587,
          fromEmail: '',
        },
        sms: {
          provider: '',
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching email/SMS config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch email/SMS config' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sms, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Encrypt sensitive data (simplified - use proper encryption in production)
    const updateData: any = {};

    if (email) {
      updateData.emailProvider = email.provider || '';
      updateData.smtpServer = email.smtpServer || '';
      updateData.smtpPort = email.smtpPort || 587;
      updateData.fromEmail = email.fromEmail || '';
      // In production, encrypt the password
      if (email.password) {
        updateData.smtpPassword = email.password; // TODO: Encrypt this
      }
    }

    if (sms) {
      updateData.smsProvider = sms.provider || '';
      // In production, encrypt the API key
      if (sms.apiKey) {
        updateData.smsApiKey = sms.apiKey; // TODO: Encrypt this
      }
    }

    updateData.updatedBy = userId;
    updateData.updatedAt = new Date().toISOString();

    try {
      // Try to update existing document
      await databases.updateDocument(
        appwriteConfig.databaseId,
        'systemsettings',
        SETTINGS_DOC_ID,
        updateData
      );

      return NextResponse.json({
        success: true,
        message: 'Email/SMS configuration updated successfully',
      });
    } catch (error: any) {
      // Create new document if it doesn't exist
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          'systemsettings',
          SETTINGS_DOC_ID,
          updateData
        );

        return NextResponse.json({
          success: true,
          message: 'Email/SMS configuration created successfully',
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
    console.error('Error updating email/SMS config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update email/SMS config' },
      { status: 500 }
    );
  }
}

