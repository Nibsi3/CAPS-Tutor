import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Test endpoint to diagnose admin API issues
 * GET /api/admin/debug/test-admin
 */
export async function GET(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: [],
      errors: [],
    };

    // Check 1: API Key
    const apiKey = process.env.APPWRITE_API_KEY;
    if (apiKey) {
      results.checks.push({
        check: 'API Key exists',
        status: '✅',
        details: `API key length: ${apiKey.length} characters`
      });
    } else {
      results.checks.push({
        check: 'API Key exists',
        status: '❌',
        details: 'APPWRITE_API_KEY is not set in environment variables'
      });
      results.errors.push('APPWRITE_API_KEY is missing');
    }

    // Check 2: Database ID
    const databaseId = appwriteConfig.databaseId;
    if (databaseId) {
      results.checks.push({
        check: 'Database ID',
        status: '✅',
        details: `Database ID: ${databaseId}`
      });
    } else {
      results.checks.push({
        check: 'Database ID',
        status: '❌',
        details: 'Database ID is not configured'
      });
      results.errors.push('Database ID is missing');
    }

    // Check 3: Initialize Databases
    try {
      const databases = getServerDatabases();
      results.checks.push({
        check: 'Initialize Databases',
        status: '✅',
        details: 'Server databases instance created successfully'
      });

      // Check 4: List Collections
      try {
        const collections = await databases.listCollections(databaseId);
        // Check for adminid (lowercase) - collection IDs must be lowercase
        const adminCollection = collections.collections.find(c => 
          c.$id === 'adminid' || c.$id.toLowerCase() === 'adminid'
        );
        
        if (adminCollection) {
          results.checks.push({
            check: 'Admin Collection Exists',
            status: '✅',
            details: `Found collection: ${adminCollection.$id} (name: ${adminCollection.name})`
          });
        } else {
          results.checks.push({
            check: 'Admin Collection Exists',
            status: '❌',
            details: `Collection "adminid" not found. Available collections: ${collections.collections.map(c => c.$id).join(', ')}`
          });
          results.errors.push('adminid collection not found');
        }

        // Check 5: Query Admin Collection
        if (adminCollection) {
          try {
            const testEmail = 'cameronfalck03@gmail.com';
            const { Query } = await import('node-appwrite');
            // Use the actual collection ID found above
            const collectionId = adminCollection.$id;
            const response = await databases.listDocuments(
              databaseId,
              collectionId,
              [Query.equal('email', testEmail)]
            );
            
            if (response.documents && response.documents.length > 0) {
              const admin = response.documents[0];
              results.checks.push({
                check: 'Query Admin Collection',
                status: '✅',
                details: `Found admin document for ${testEmail}`,
                adminData: {
                  email: admin.email,
                  role: admin.role,
                  status: admin.status,
                  adminId: admin.adminId
                }
              });
            } else {
              results.checks.push({
                check: 'Query Admin Collection',
                status: '⚠️',
                details: `No admin document found for ${testEmail}`
              });
            }
          } catch (queryError: any) {
            results.checks.push({
              check: 'Query Admin Collection',
              status: '❌',
              details: `Error querying: ${queryError.message}`,
              code: queryError.code
            });
            results.errors.push(`Query error: ${queryError.message}`);
          }
        }
      } catch (listError: any) {
        results.checks.push({
          check: 'List Collections',
          status: '❌',
          details: `Error: ${listError.message}`,
          code: listError.code
        });
        results.errors.push(`List collections error: ${listError.message}`);
      }
    } catch (initError: any) {
      results.checks.push({
        check: 'Initialize Databases',
        status: '❌',
        details: `Error: ${initError.message}`
      });
      results.errors.push(`Initialization error: ${initError.message}`);
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      ...results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

