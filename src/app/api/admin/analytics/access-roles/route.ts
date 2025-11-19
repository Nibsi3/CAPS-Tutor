import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let databases;
    try {
      databases = getServerDatabases();
      if (!databases) {
        return NextResponse.json({
          success: false,
          error: 'Database connection failed',
          users: [],
          total: 0,
          message: 'Server API key not configured - admin features unavailable'
        });
      }
    } catch (initError: any) {
      if (initError.message?.includes('APPWRITE_API_KEY')) {
        console.warn('APPWRITE_API_KEY not available - returning empty access roles');
        return NextResponse.json({
          success: true,
          users: [],
          total: 0,
          message: 'Server API key not configured - admin features unavailable'
        });
      }
      throw initError;
    }

    // Get all users with their roles
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      'user',
      []
    );

    // Get access roles if collection exists
    let accessRoles: Record<string, string> = {};
    try {
      const roles = await databases.listDocuments(
        appwriteConfig.databaseId,
        'accessRoles',
        []
      );
      accessRoles = roles.documents.reduce((acc: Record<string, string>, role: any) => {
        acc[role.userId || role.email] = role.role || 'user';
        return acc;
      }, {});
    } catch (error) {
      // Collection doesn't exist, use default roles
    }

    // Format users with roles
    const usersWithRoles = users.documents.map((user: any) => ({
      id: user.$id,
      email: user.email || '',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      currentRole: accessRoles[user.$id] || accessRoles[user.email] || 'user',
    }));

    return NextResponse.json({
      success: true,
      users: usersWithRoles,
      total: users.total,
    });
  } catch (error: any) {
    console.error('Error fetching access roles:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch access roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, role, adminId } = body;

    if ((!userId && !email) || !role || !adminId) {
      return NextResponse.json(
        { success: false, error: 'User ID/email, role, and admin ID are required' },
        { status: 400 }
      );
    }

    let databases;
    try {
      databases = getServerDatabases();
      if (!databases) {
        return NextResponse.json({
          success: false,
          error: 'Database connection failed - Server API key not configured'
        }, { status: 500 });
      }
    } catch (initError: any) {
      if (initError.message?.includes('APPWRITE_API_KEY')) {
        return NextResponse.json({
          success: false,
          error: 'Server API key not configured - admin features unavailable'
        }, { status: 500 });
      }
      throw initError;
    }

    // Find user if email provided
    let targetUserId = userId;
    let targetEmail = email;
    if (!targetUserId && email) {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        'user',
        [`email.equal("${email}")`]
      );
      if (users.documents.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      targetUserId = users.documents[0].$id;
      targetEmail = users.documents[0].email;
    }

    // Update or create access role
    try {
      // Check if role exists
      const existingRoles = await databases.listDocuments(
        appwriteConfig.databaseId,
        'accessRoles',
        [`userId.equal("${targetUserId}")`]
      );

      if (existingRoles.documents.length > 0) {
        // Update existing
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'accessRoles',
          existingRoles.documents[0].$id,
          {
            role,
            updatedBy: adminId,
            updatedAt: new Date().toISOString(),
          }
        );
      } else {
        // Create new
        const { ID } = await import('@/lib/appwrite-server');
        await databases.createDocument(
          appwriteConfig.databaseId,
          'accessRoles',
          ID.unique(),
          {
            userId: targetUserId,
            email: targetEmail,
            role,
            createdBy: adminId,
            createdAt: new Date().toISOString(),
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Access role updated successfully',
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access roles collection does not exist. Please create it in Appwrite first.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating access role:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update access role' },
      { status: 500 }
    );
  }
}

