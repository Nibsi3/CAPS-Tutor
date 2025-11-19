import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();

    try {
      const requests = await databases.listDocuments(
        appwriteConfig.databaseId,
        'popiaRequests',
        ['orderDesc("$createdAt")']
      );

      return NextResponse.json({
        success: true,
        requests: requests.documents,
        total: requests.total,
      });
    } catch (error: any) {
      // Collection doesn't exist yet
      return NextResponse.json({
        success: true,
        requests: [],
        total: 0,
      });
    }
  } catch (error: any) {
    console.error('Error fetching POPIA requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch POPIA requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action, adminId } = body; // action: 'approve' | 'reject'

    if (!requestId || !action || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Request ID, action, and admin ID are required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    try {
      const request = await databases.getDocument(
        appwriteConfig.databaseId,
        'popiaRequests',
        requestId
      );

      if (action === 'approve') {
        // Delete user data
        const userId = request.userId || request.email;

        // Delete user document
        try {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            'user',
            userId
          );
        } catch (error) {
          console.warn('Could not delete user document:', error);
        }

        // Delete user progress
        try {
          const progress = await databases.listDocuments(
            appwriteConfig.databaseId,
            'userprogress',
            [`userId.equal("${userId}")`]
          );
          for (const doc of progress.documents) {
            await databases.deleteDocument(
              appwriteConfig.databaseId,
              'userprogress',
              doc.$id
            );
          }
        } catch (error) {
          console.warn('Could not delete user progress:', error);
        }

        // Update request status
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'popiaRequests',
          requestId,
          {
            status: 'completed',
            processedBy: adminId,
            processedAt: new Date().toISOString(),
          }
        );

        return NextResponse.json({
          success: true,
          message: 'User data deleted successfully',
        });
      } else if (action === 'reject') {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'popiaRequests',
          requestId,
          {
            status: 'rejected',
            processedBy: adminId,
            processedAt: new Date().toISOString(),
            rejectionReason: body.reason || 'Request rejected',
          }
        );

        return NextResponse.json({
          success: true,
          message: 'Request rejected',
        });
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'POPIA requests collection does not exist. Please create it in Appwrite first.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing POPIA request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process POPIA request' },
      { status: 500 }
    );
  }
}

