/**
 * Diagnostic API route to check Appwrite collections
 * Lists all collections in the database and verifies expected collections exist
 * 
 * Usage: GET /api/admin/debug/check-collections
 */

import { NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function GET() {
  try {
    const databaseId = appwriteConfig.databaseId;
    
    if (!databaseId) {
      return NextResponse.json({
        error: 'Database ID not configured',
        message: 'NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set in environment variables',
        databaseId: null,
        collections: [],
        expectedCollections: ['user', 'questions', 'userprogress'],
      }, { status: 400 });
    }

    // Get server-side databases instance
    const databases = getServerDatabases();

    // List all collections in the database
    const collectionsResponse = await databases.listCollections(databaseId);
    
    // Map collections to simple objects with id and name
    const collections = collectionsResponse.collections.map(c => ({
      id: c.$id,
      name: c.name,
      $createdAt: c.$createdAt,
      $updatedAt: c.$updatedAt,
    }));

    // Expected collection IDs (case-sensitive - Appwrite collection IDs are case-sensitive)
    const expectedCollectionIds = ['user', 'questions', 'userprogress', 'pastpapers', 'pastpaperprogress', 'adminid'];
    const expectedCollectionNames = ['user', 'questions', 'userprogress', 'pastpapers', 'pastpaperprogress', 'adminid'];
    
    // Check which expected collections exist
    const foundCollections = expectedCollectionIds.map(expectedId => {
      const found = collections.find(c => 
        c.id === expectedId || 
        c.id.toLowerCase() === expectedId.toLowerCase() ||
        c.name === expectedId ||
        c.name?.toLowerCase() === expectedId.toLowerCase()
      );
      return {
        expectedId,
        found: !!found,
        actualId: found?.id || null,
        actualName: found?.name || null,
      };
    });

    // Check for collections that might be similar (fuzzy match)
    const similarCollections = collections.filter(c => {
      const lowerId = c.id.toLowerCase();
      const lowerName = c.name?.toLowerCase() || '';
      return expectedCollectionIds.some(expected => {
        const lowerExpected = expected.toLowerCase();
        return lowerId.includes(lowerExpected) || 
               lowerExpected.includes(lowerId) ||
               lowerName.includes(lowerExpected) ||
               lowerExpected.includes(lowerName);
      });
    });

    // Generate diagnostic code for browser console
    const diagnosticCode = `
// Run this in browser console to list collections
const databaseId = "${databaseId}";
const databases = window.__appwriteDatabases; // Your Appwrite Databases instance

if (!databases) {
  console.error("❌ Appwrite Databases instance not found.");
  console.log("Try: fetch('/api/admin/debug/check-collections').then(r => r.json()).then(console.log)");
} else {
  databases.listCollections(databaseId)
    .then(out => {
      console.log("📊 Collections in database:", databaseId);
      console.log(out.collections.map(c => ({ id: c.$id, name: c.name })));
      
      const expected = ${JSON.stringify(expectedCollectionIds)};
      console.log("\\n🔍 Checking expected collections:");
      expected.forEach(exp => {
        const found = out.collections.find(c => 
          c.$id === exp || 
          c.$id.toLowerCase() === exp.toLowerCase() ||
          c.name === exp ||
          c.name?.toLowerCase() === exp.toLowerCase()
        );
        if (found) {
          console.log(\`  ✅ "\${exp}" -> Found as "\${found.$id}"\`);
        } else {
          console.log(\`  ❌ "\${exp}" -> NOT FOUND\`);
        }
      });
    })
    .catch(err => {
      console.error("❌ Error:", err);
      console.log("\\nTry the API endpoint instead:");
      console.log("fetch('/api/check-collections').then(r => r.json()).then(console.log)");
    });
}
`.trim();

    return NextResponse.json({
      success: true,
      databaseId,
      totalCollections: collections.length,
      collections: collections.map(c => ({
        id: c.id,
        name: c.name,
        $createdAt: c.$createdAt,
        $updatedAt: c.$updatedAt,
      })),
      expectedCollections: expectedCollectionIds,
      foundCollections,
      similarCollections: similarCollections.map(c => ({
        id: c.id,
        name: c.name,
      })),
      missingCollections: foundCollections
        .filter(f => !f.found)
        .map(f => f.expectedId),
      diagnostic: {
        message: foundCollections.every(f => f.found)
          ? '✅ All expected collections found!'
          : `⚠️ Missing collections: ${foundCollections.filter(f => !f.found).map(f => f.expectedId).join(', ')}`,
        instructions: foundCollections.some(f => !f.found)
          ? [
              '1. Go to Appwrite Console → Database → ' + databaseId,
              '2. Check the Collections tab',
              '3. Verify the Collection IDs match exactly (case-sensitive)',
              '4. Copy the Collection ID from: Settings tab → Collection ID',
              '5. Update your code to use the exact Collection ID',
              '6. If collection exists but ID is different, update your code to use the actual ID',
            ]
          : [],
        diagnosticCode,
      },
      fixInstructions: foundCollections.some(f => !f.found) ? {
        step1: `Go to: https://cloud.appwrite.io/console`,
        step2: `Navigate to: Databases → ${databaseId} → Collections`,
        step3: `For each missing collection:`,
        step4: `  - If it exists: Copy the Collection ID from Settings tab (case-sensitive!)`,
        step5: `  - If it doesn't exist: Create it with Collection ID exactly as: ${foundCollections.filter(f => !f.found).map(f => f.expectedId).join(', ')}`,
        step6: `Update your code to use the exact Collection IDs from Appwrite Console`,
      } : null,
    });
  } catch (error: any) {
    console.error('Error checking collections:', error);
    
    const errorMessage = error?.message || String(error);
    const errorCode = error?.code;
    
    // Check for common errors
    if (errorCode === 401 || errorCode === 403) {
      return NextResponse.json({
        error: 'Authorization failed',
        message: 'APPWRITE_API_KEY is missing or invalid. Please check your environment variables.',
        code: errorCode,
        hint: 'Set APPWRITE_API_KEY in your .env.local file with databases.read scope',
      }, { status: 401 });
    }
    
    if (errorCode === 404 || errorMessage.includes('Database') || errorMessage.includes('not found')) {
      return NextResponse.json({
        error: 'Database not found',
        message: errorMessage,
        code: errorCode,
        hint: 'Verify NEXT_PUBLIC_APPWRITE_DATABASE_ID matches your Appwrite Console database ID',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      error: 'Failed to check collections',
      message: errorMessage,
      code: errorCode,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }, { status: 500 });
  }
}
