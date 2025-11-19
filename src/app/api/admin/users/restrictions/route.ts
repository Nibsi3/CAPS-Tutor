import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, restrictionType, reason, adminId } = body;

    if ((!userId && !email) || !restrictionType || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // If email provided, find user by email
    let targetUserId = userId;
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
    }

    // Create restriction record
    try {
      const restrictionId = ID.unique();
      await databases.createDocument(
        appwriteConfig.databaseId,
        'userRestrictions',
        restrictionId,
        {
          userId: targetUserId,
          email: email || '',
          restrictionType, // 'ban' | 'temporary' | 'limited'
          reason: reason || '',
          appliedBy: adminId,
          appliedAt: new Date().toISOString(),
          status: 'active',
          expiresAt: restrictionType === 'temporary' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        }
      );

      // Update user status in user collection
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'user',
          targetUserId,
          {
            status: restrictionType === 'ban' ? 'banned' : 'restricted',
            restrictionReason: reason || '',
          }
        );
      } catch (updateError) {
        // User collection might not have status field, that's okay
        console.warn('Could not update user status:', updateError);
      }

      return NextResponse.json({
        success: true,
        restrictionId,
        message: 'Restriction applied successfully',
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'User restrictions collection does not exist. Please create it in Appwrite first.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error applying restriction:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to apply restriction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    try {
      const queries: string[] = [];
      if (userId) {
        queries.push(`userId.equal("${userId}")`);
      }
      if (email) {
        queries.push(`email.equal("${email}")`);
      }
      queries.push('orderDesc("$createdAt")');

      const restrictions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'userRestrictions',
        queries.length > 0 ? queries : []
      );

      return NextResponse.json({
        success: true,
        restrictions: restrictions.documents,
        total: restrictions.total,
      });
    } catch (error: any) {
      return NextResponse.json({
        success: true,
        restrictions: [],
        total: 0,
      });
    }
  } catch (error: any) {
    console.error('Error fetching restrictions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch restrictions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restrictionId = searchParams.get('restrictionId');
    const userId = searchParams.get('userId');

    if (!restrictionId && !userId) {
      return NextResponse.json(
        { success: false, error: 'Restriction ID or User ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    if (restrictionId) {
      // Delete specific restriction
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        'userRestrictions',
        restrictionId
      );
    } else if (userId) {
      // Remove all restrictions for user
      const restrictions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'userRestrictions',
        [`userId.equal("${userId}")`, 'status.equal("active")']
      );

      for (const restriction of restrictions.documents) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'userRestrictions',
          restriction.$id,
          { status: 'removed' }
        );
      }

      // Update user status
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'user',
          userId,
          {
            status: 'active',
            restrictionReason: null,
          }
        );
      } catch (updateError) {
        console.warn('Could not update user status:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Restriction removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing restriction:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove restriction' },
      { status: 500 }
    );
  }
}

