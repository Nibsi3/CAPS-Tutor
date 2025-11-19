import { NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

/**
 * Comprehensive collection checker
 * Lists ALL collections and checks against what the app expects
 */
export async function GET() {
  try {
    const databaseId = appwriteConfig.databaseId;
    const databases = getServerDatabases();
    
    // List all collections
    const collectionsResponse = await databases.listCollections(databaseId);
    const allCollections = collectionsResponse.collections.map(c => ({
      id: c.$id,
      name: c.name,
    }));
    
    // Expected collections based on code analysis (all lowercase to match Appwrite Table IDs)
    const expectedCollections = [
      { id: 'user', name: 'User Profiles', required: true },
      { id: 'userprogress', name: 'Student Progress', required: true },
      { id: 'adminid', name: 'Admins', required: false },
      { id: 'pastpapers', name: 'Past Papers', required: false },
      { id: 'questions', name: 'Questions', required: false },
      { id: 'pastpaperprogress', name: 'Past Paper Progress', required: false },
    ];
    
    // Check each expected collection
    const checked = expectedCollections.map(exp => {
      // Try exact match first
      let found = allCollections.find(c => c.id === exp.id);
      
      // Try case-insensitive match
      if (!found) {
        found = allCollections.find(c => 
          c.id.toLowerCase() === exp.id.toLowerCase()
        );
      }
      
      return {
        expectedId: exp.id,
        expectedName: exp.name,
        required: exp.required,
        found: !!found,
        actualId: found?.id || null,
        actualName: found?.name || null,
        matchType: found 
          ? (found.id === exp.id ? 'exact' : 'case-insensitive')
          : 'not found'
      };
    });
    
    const missing = checked.filter(c => !c.found && c.required);
    const found = checked.filter(c => c.found);
    const caseMismatches = checked.filter(c => 
      c.found && c.matchType === 'case-insensitive'
    );
    
    return NextResponse.json({
      success: true,
      databaseId,
      totalCollections: allCollections.length,
      allCollections,
      expectedCollections: expectedCollections.map(e => ({
        id: e.id,
        name: e.name,
        required: e.required
      })),
      checked,
      summary: {
        totalExpected: expectedCollections.length,
        found: found.length,
        missing: missing.length,
        caseMismatches: caseMismatches.length,
        allFound: missing.length === 0
      },
      missingRequired: missing.map(m => ({
        expectedId: m.expectedId,
        name: m.expectedName,
        action: `Create collection with ID: "${m.expectedId}"`
      })),
      caseMismatches: caseMismatches.map(m => ({
        expectedId: m.expectedId,
        actualId: m.actualId,
        action: `Update code to use: "${m.actualId}" instead of "${m.expectedId}"`
      })),
      recommendations: [
        ...(missing.length > 0 ? [
          `Create missing required collections: ${missing.map(m => m.expectedId).join(', ')}`
        ] : []),
        ...(caseMismatches.length > 0 ? [
          `Update code to use correct collection IDs: ${caseMismatches.map(m => `${m.expectedId} → ${m.actualId}`).join(', ')}`
        ] : []),
        ...(missing.length === 0 && caseMismatches.length === 0 ? [
          '✅ All expected collections found!'
        ] : [])
      ]
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.code === 401 || error.code === 403
        ? 'Check APPWRITE_API_KEY has databases.read scope'
        : 'Check server logs for details'
    }, { status: 500 });
  }
}

