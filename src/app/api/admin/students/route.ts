import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * GET /api/admin/students
 * Fetches all students from the user collection
 */
export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const databaseId = appwriteConfig.databaseId;

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const queries = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('$createdAt'), // Most recent first
    ];

    // Fetch users from the 'user' collection
    const response = await databases.listDocuments(
      databaseId,
      'user',
      queries
    );

    // Format the response
    const students = response.documents.map((doc: any) => ({
      id: doc.$id,
      email: doc.email || '',
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      fullName: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'N/A',
      gradeLevel: doc.gradeLevel || null,
      subjects: doc.subjects || [],
      language: doc.language || 'en',
      lastLoginDate: doc.lastLoginDate || null,
      lastLoginTimestamp: doc.lastLoginTimestamp || null,
      totalStudyTimeMinutes: doc.totalStudyTimeMinutes || 0,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    }));

    return NextResponse.json({
      success: true,
      students,
      total: response.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch students',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}
