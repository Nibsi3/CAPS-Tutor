import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'appwrite';
import { appwriteConfig } from '@/appwrite/config';

/**
 * API route to create an admin user in the admins collection
 * This should be called server-side or with proper authentication
 * 
 * POST /api/admin/utilities/create-admin
 * Body: { email: string, role?: string, permissions?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role = 'superadmin', permissions, passwordHash = '' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Initialize Appwrite client (server-side)
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    const databases = new Databases(client);

    // Generate UUID for adminId
    const adminId = ID.unique();

    // Check if admin already exists
    try {
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        'adminid', // Collection ID is lowercase 'adminid' as shown in Appwrite Console
        [`email.equal("${email}")`]
      );

      if (existing.documents && existing.documents.length > 0) {
        return NextResponse.json(
          { 
            error: 'Admin with this email already exists',
            adminId: existing.documents[0].$id 
          },
          { status: 409 }
        );
      }
    } catch (error: any) {
      // If collection doesn't exist, we'll get an error when trying to create
      // We'll handle that below
    }

    // Create admin document
    const now = new Date().toISOString();
    const defaultPermissions = permissions || [
      'edit_users',
      'view_stats',
      'manage_papers',
      'delete_content',
      'manage_admins'
    ];

    const adminData = {
      adminId,
      email,
      passwordHash,
      role,
      permissions: defaultPermissions,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      notes: `Admin account created via API for ${email}`
    };

    try {
      const result = await databases.createDocument(
        appwriteConfig.databaseId,
        'adminid', // Collection ID is lowercase 'adminid' as shown in Appwrite Console
        ID.unique(), // Document ID (Appwrite will generate)
        adminData
      );

      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: result.$id,
          email: result.email,
          role: result.role,
          status: result.status
        }
      });
    } catch (error: any) {
      // Handle collection not found error
      if (error.code === 404 && error.message?.toLowerCase().includes('collection')) {
        return NextResponse.json(
          { 
            error: 'Admins collection not found',
            message: `The collection "adminid" does not exist. Please check:\n` +
                     `1. Collection ID should be "adminid" (lowercase)\n` +
                     `2. Collection exists in database: ${appwriteConfig.databaseId}\n` +
                     `3. See docs/APPWRITE_ADMINS_COLLECTION_SCHEMA.md for setup instructions`
          },
          { status: 404 }
        );
      }

      // Handle other errors
      console.error('Error creating admin:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create admin',
          message: error.message || 'Unknown error',
          code: error.code
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in create-admin route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

