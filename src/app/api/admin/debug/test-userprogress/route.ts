import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Test endpoint to check userprogress collection
 * GET /api/admin/debug/test-userprogress?userId=test
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'test-user-id';
    
    const databases = getServerDatabases();
    const databaseId = appwriteConfig.databaseId;
    
    // Test collection ID (lowercase to match Appwrite Table ID)
    const collectionIds = ['userprogress'];
    
    const results: any = {
      databaseId,
      testedCollectionIds: collectionIds,
      results: [],
    };
    
    for (const collectionId of collectionIds) {
      try {
        // Try to list collections first to see what exists
        const collections = await databases.listCollections(databaseId);
        const found = collections.collections.find(c => 
          c.$id === collectionId || 
          c.$id.toLowerCase() === collectionId.toLowerCase()
        );
        
        if (found) {
          // Collection exists, try to query it
          try {
            const response = await databases.listDocuments(
              databaseId,
              found.$id, // Use the actual collection ID
              [Query.equal('userID', userId), Query.limit(1)]
            );
            
            results.results.push({
              collectionId: collectionId,
              actualId: found.$id,
              exists: true,
              canQuery: true,
              documentCount: response.total,
              columns: found.attributes ? Object.keys(found.attributes).slice(0, 10) : 'unknown'
            });
          } catch (queryError: any) {
            results.results.push({
              collectionId: collectionId,
              actualId: found.$id,
              exists: true,
              canQuery: false,
              queryError: queryError.message,
              code: queryError.code
            });
          }
        } else {
          results.results.push({
            collectionId: collectionId,
            exists: false,
            canQuery: false
          });
        }
      } catch (error: any) {
        results.results.push({
          collectionId: collectionId,
          exists: false,
          error: error.message,
          code: error.code
        });
      }
    }
    
    // Also list all collections to show what's available
    try {
      const allCollections = await databases.listCollections(databaseId);
      results.allCollections = allCollections.collections.map(c => ({
        id: c.$id,
        name: c.name
      }));
    } catch (error: any) {
      results.allCollectionsError = error.message;
    }
    
    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}

