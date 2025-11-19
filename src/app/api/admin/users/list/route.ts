import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const databases = getServerDatabases();

    // Get users from user collection
    const queries = [];
    if (search) {
      // Search by email or name
      queries.push(Query.contains('email', search));
    }
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    queries.push(Query.orderDesc('$createdAt'));

    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        'user',
        queries
      );

      // Format user data
      const formattedUsers = users.documents.map((user: any) => ({
        id: user.$id,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        grade: user.gradeLevel || null,
        status: 'active', // Default status
        lastActive: user.lastLoginTimestamp || user.lastLoginDate || null,
        createdAt: user.$createdAt,
      }));

      return NextResponse.json({
        success: true,
        users: formattedUsers,
        total: users.total,
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch users' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in users list API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, format } = body; // format: 'csv' | 'json'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Get all users
    const allUsers = await databases.listDocuments(
      appwriteConfig.databaseId,
      'user',
      []
    );

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Email,Name,Grade,Last Active,Created At\n';
      const csvRows = allUsers.documents.map((user: any) => {
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
        const email = user.email || '';
        const grade = user.gradeLevel || '';
        const lastActive = user.lastLoginTimestamp || user.lastLoginDate || '';
        const createdAt = user.$createdAt || '';
        return `${email},${name},${grade},${lastActive},${createdAt}`;
      }).join('\n');

      return new NextResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users-export.csv"',
        },
      });
    }

    // Return JSON
    return NextResponse.json({
      success: true,
      users: allUsers.documents,
      total: allUsers.total,
    });
  } catch (error: any) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export users' },
      { status: 500 }
    );
  }
}

