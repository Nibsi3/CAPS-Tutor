import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * API route to check if the current user is an admin
 * This is a server-side route that uses an API key to check admin status
 * 
 * GET /api/admin/debug/check-admin?email=user@example.com
 * Returns: { isAdmin: boolean, adminData?: AdminDoc }
 * 
 * Note: This route requires APPWRITE_API_KEY to be set in environment variables
 */
export async function GET(request: NextRequest) {
  try {
    // Get email from query parameter (passed from client)
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { isAdmin: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { isAdmin: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if API key is set
    const apiKey = process.env.APPWRITE_API_KEY;
    if (!apiKey) {
      console.error('❌ APPWRITE_API_KEY is not set in environment variables');
      console.error('   Checked process.env.APPWRITE_API_KEY:', typeof apiKey, apiKey ? 'exists' : 'undefined');
      console.error('   Available env vars:', Object.keys(process.env).filter(k => k.includes('APPWRITE')).join(', '));
      return NextResponse.json(
        { 
          isAdmin: false, 
          error: 'API key not configured',
          message: 'APPWRITE_API_KEY environment variable is required but not found on the server.',
          details: {
            hint: 'For Appwrite Cloud Sites, set environment variables in: Deployment → Settings → Environment Variables (NOT project settings)',
            localDev: 'For local development, set APPWRITE_API_KEY in .env.local and restart the server',
            seeDocs: 'See docs/FIX_ADMIN_PERMISSIONS.md for detailed instructions'
          }
        },
        { status: 500 }
      );
    }

    // Get server-side databases instance (uses API key)
    let databases;
    try {
      databases = getServerDatabases();
      if (!databases) {
        return NextResponse.json(
          { 
            isAdmin: false, 
            error: 'Database connection failed',
            message: 'Appwrite client initialization returned null. Please check your environment variables.',
            hint: 'Check that APPWRITE_API_KEY is set correctly and has databases.read scope'
          },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to get server databases:', error);
      return NextResponse.json(
        { 
          isAdmin: false, 
          error: 'Failed to initialize Appwrite client',
          message: error.message || 'Unknown error',
          hint: 'Check that APPWRITE_API_KEY is set correctly and has databases.read scope'
        },
        { status: 500 }
      );
    }
    
    try {
      // Query the admin collection by email
      // Note: Collection ID is 'adminid' (lowercase) as shown in Appwrite Console
      console.log('🔍 Checking admin status for:', email);
      console.log('   Database ID:', appwriteConfig.databaseId);
      console.log('   Collection ID: adminid');
      
      // First, try with status='active' filter
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'adminid', // Collection ID is lowercase 'adminid'
        [
          Query.equal('email', email),
          Query.equal('status', 'active'),
        ]
      );

      console.log('   Query result: Found', response.documents?.length || 0, 'active admin(s)');

      if (response.documents && response.documents.length > 0) {
        const admin = response.documents[0];
        console.log('✅ Admin found! Role:', admin.role, 'Status:', admin.status);
        return NextResponse.json({
          isAdmin: true,
          adminData: {
            adminId: admin.adminId,
            email: admin.email,
            role: admin.role,
            status: admin.status,
            permissions: admin.permissions || [],
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
            lastLogin: admin.lastLogin,
            notes: admin.notes,
          }
        });
      }

      // If no active admin found, check if admin exists with any status
      // This helps diagnose issues (e.g., status set to wrong value)
      console.log('   No active admin found, checking for any admin with this email...');
      const allAdminsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        'adminid', // Collection ID is lowercase 'adminid'
        [
          Query.equal('email', email),
        ]
      );

      console.log('   Found', allAdminsResponse.documents?.length || 0, 'admin(s) with any status');

      if (allAdminsResponse.documents && allAdminsResponse.documents.length > 0) {
        const admin = allAdminsResponse.documents[0];
        console.log('⚠️ Admin exists but status is:', admin.status, '(expected: active)');
        // Admin exists but status is not 'active'
        return NextResponse.json({
          isAdmin: false,
          adminExists: true,
          currentStatus: admin.status,
          message: `Admin found but status is "${admin.status}" instead of "active". Please update the status in Appwrite Console.`,
          hint: 'Go to Appwrite Console → Databases → capstutor → adminid → Edit document → Change status to "active"'
        });
      }

      // No admin found
      console.log('❌ No admin found with email:', email);
      return NextResponse.json({ 
        isAdmin: false,
        message: 'No admin record found for this email address.',
        hint: 'Verify the email matches exactly (case-sensitive). The email in your admin document must match your logged-in user email.'
      });
    } catch (error: any) {
      // Log detailed error information
      console.error('❌ Error checking admin status:');
      console.error('  Error code:', error.code);
      console.error('  Error type:', error.type);
      console.error('  Error message:', error.message);
      console.error('  Database ID:', appwriteConfig.databaseId);
      console.error('  Collection ID: adminid');
      console.error('  Email:', email);
      
      // Handle specific error cases
      if (error.code === 401 || error.code === 403) {
        return NextResponse.json(
          { 
            isAdmin: false, 
            error: 'Authorization failed',
            message: 'API key is invalid or does not have required permissions',
            code: error.code,
            hint: 'Check that your API key has "databases.read" scope and is correct'
          },
          { status: 401 }
        );
      }
      
      if (error.code === 404) {
        // Check if it's collection not found or document not found
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('collection')) {
          return NextResponse.json(
            { 
              isAdmin: false, 
              error: 'Admin collection not found',
              message: 'The adminid collection does not exist in the database.',
              databaseId: appwriteConfig.databaseId,
              collectionId: 'adminid',
              hint: 'Please create the adminid collection in Appwrite Console. See docs/APPWRITE_ADMINS_COLLECTION_SCHEMA.md'
            },
            { status: 404 }
          );
        } else {
          // Document not found (which is fine - user is not an admin)
          return NextResponse.json({ isAdmin: false });
        }
      }
      
      // Generic error
      return NextResponse.json(
        { 
          isAdmin: false, 
          error: 'Failed to check admin status', 
          message: error.message || 'Unknown error',
          code: error.code,
          type: error.type,
          hint: 'Check server logs for more details'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in check-admin route:', error);
    return NextResponse.json(
      { 
        isAdmin: false, 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

