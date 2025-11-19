import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Debug endpoint to test userprogress collection queries
 * GET /api/admin/debug/debug-userprogress?userId=test&test=all
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'test-user-id';
    const test = searchParams.get('test') || 'basic';
    
    const databases = getServerDatabases();
    const databaseId = appwriteConfig.databaseId;
    const collectionId = 'userprogress';
    
    const results: any = {
      databaseId,
      collectionId,
      userId,
      tests: {},
    };
    
    // Test 1: Basic query - just check if collection is accessible
    try {
      const basicQuery = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.limit(1)]
      );
      results.tests.basic = {
        success: true,
        total: basicQuery.total,
        message: 'Collection is accessible'
      };
    } catch (error: any) {
      results.tests.basic = {
        success: false,
        error: error.message,
        code: error.code,
        type: error.type
      };
    }
    
    // Test 2: Query by userID (capital ID)
    try {
      const userIDQuery = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('userID', userId), Query.limit(1)]
      );
      results.tests.queryByUserID = {
        success: true,
        total: userIDQuery.total,
        message: 'Query by userID (capital ID) works'
      };
    } catch (error: any) {
      results.tests.queryByUserID = {
        success: false,
        error: error.message,
        code: error.code,
        type: error.type,
        hint: 'Check if userID attribute exists and is indexed'
      };
    }
    
    // Test 3: Query by userId (lowercase d)
    try {
      const userIdQuery = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('userId', userId), Query.limit(1)]
      );
      results.tests.queryByUserId = {
        success: true,
        total: userIdQuery.total,
        message: 'Query by userId (lowercase d) works'
      };
    } catch (error: any) {
      results.tests.queryByUserId = {
        success: false,
        error: error.message,
        code: error.code,
        hint: 'userId (lowercase) attribute does not exist or is not indexed'
      };
    }
    
    // Test 4: Get collection attributes
    try {
      const collections = await databases.listCollections(databaseId);
      const collection = collections.collections.find(c => c.$id === collectionId);
      
      if (collection) {
        // Get attributes
        const attributesResponse = await databases.listAttributes(databaseId, collectionId);
        results.tests.attributes = {
          success: true,
          attributes: attributesResponse.attributes.map((attr: any) => ({
            key: attr.key,
            type: attr.type,
            required: attr.required,
            array: attr.array,
            size: attr.size,
            default: attr.default
          })),
          message: 'Attributes retrieved successfully'
        };
        
        // Get indexes
        try {
          const indexesResponse = await databases.listIndexes(databaseId, collectionId);
          results.tests.indexes = {
            success: true,
            indexes: indexesResponse.indexes.map((idx: any) => ({
              key: idx.key,
              type: idx.type,
              attributes: idx.attributes,
              orders: idx.orders
            })),
            message: 'Indexes retrieved successfully'
          };
        } catch (indexError: any) {
          results.tests.indexes = {
            success: false,
            error: indexError.message,
            code: indexError.code
          };
        }
      } else {
        results.tests.attributes = {
          success: false,
          error: 'Collection not found in list'
        };
      }
    } catch (error: any) {
      results.tests.attributes = {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    // Test 5: Complex query (like practice page uses)
    if (test === 'all') {
      try {
        const complexQuery = await databases.listDocuments(
          databaseId,
          collectionId,
          [
            Query.equal('userID', userId),
            Query.equal('gradeLevel', 10),
            Query.lessThan('masteryLevel', 70),
            Query.orderAsc('masteryLevel'),
            Query.limit(10)
          ]
        );
        results.tests.complexQuery = {
          success: true,
          total: complexQuery.total,
          message: 'Complex query works (practice page style)'
        };
      } catch (error: any) {
        results.tests.complexQuery = {
          success: false,
          error: error.message,
          code: error.code,
          hint: 'Check if gradeLevel and masteryLevel attributes exist and are indexed'
        };
      }
    }
    
    // Summary
    const allTestsPassed = Object.values(results.tests).every((test: any) => test.success);
    results.summary = {
      allTestsPassed,
      totalTests: Object.keys(results.tests).length,
      passedTests: Object.values(results.tests).filter((test: any) => test.success).length,
      failedTests: Object.values(results.tests).filter((test: any) => !test.success).length
    };
    
    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      type: error.type,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

