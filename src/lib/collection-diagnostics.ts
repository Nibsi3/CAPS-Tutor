/**
 * Collection Diagnostics Utility
 * 
 * Provides utilities to diagnose "Collection not found" errors
 * by listing all collections in the database and comparing with expected IDs.
 */

import { appwriteConfig } from '@/appwrite/config';

/**
 * Diagnostic information about collections
 */
export interface CollectionDiagnostic {
  collectionId: string;
  found: boolean;
  actualId?: string;
  actualName?: string;
  suggestions?: string[];
}

/**
 * Expected collection IDs used in the application
 */
export const EXPECTED_COLLECTIONS = [
  'user',
  'userprogress',
  'questions',
  'pastpapers',
  'pastpaperprogress',
  'adminid',
] as const;

/**
 * Collection ID mappings - maps expected IDs to actual IDs
 * Update this when you know the actual collection IDs in your database
 */
export const COLLECTION_ID_MAP: Record<string, string> = {
  // Add mappings here if collection IDs differ from expected
  // All collection IDs should be lowercase to match Appwrite Table IDs
  // Example: 'userprogress': 'userprogress',
};

/**
 * Get the actual collection ID to use, checking mappings first
 */
export function getCollectionId(expectedId: string): string {
  return COLLECTION_ID_MAP[expectedId] || expectedId;
}

/**
 * Generate diagnostic code to run in browser console
 */
export function generateDiagnosticCode(): string {
  const databaseId = appwriteConfig.databaseId;
  
  return `
// Diagnostic Code - Run this in your browser console
// This will list all collections in your database

const databaseId = "${databaseId}";
const databases = window.__appwriteDatabases; // Your Appwrite Databases instance

if (!databases) {
  console.error("❌ Appwrite Databases instance not found. Make sure your app has initialized Appwrite.");
  console.log("Try: fetch('/api/admin/debug/check-collections').then(r => r.json()).then(console.log)");
} else {
  databases.listCollections(databaseId)
    .then(out => {
      console.log("📊 Collections in database:", databaseId);
      console.log(out.collections.map(c => ({ id: c.$id, name: c.name })));
      
      const expected = ${JSON.stringify(EXPECTED_COLLECTIONS, null, 2)};
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
      console.log("fetch('/api/admin/debug/check-collections').then(r => r.json()).then(console.log)");
    });
}
`.trim();
}

/**
 * Generate instructions for fixing collection ID mismatches
 */
export function generateFixInstructions(
  collectionId: string,
  databaseId: string,
  availableCollections?: Array<{ id: string; name: string }>
): string {
  let instructions = `\n🔧 To fix "Collection "${collectionId}" not found":\n\n`;
  
  instructions += `1. Go to: https://cloud.appwrite.io/console\n`;
  instructions += `2. Select your project\n`;
  instructions += `3. Go to: Databases → ${databaseId}\n`;
  instructions += `4. Click on: Collections tab\n\n`;
  
  if (availableCollections && availableCollections.length > 0) {
    instructions += `📋 Available collections in your database:\n`;
    availableCollections.forEach((c, idx) => {
      instructions += `   ${idx + 1}. ID: "${c.id}" | Name: "${c.name || 'N/A'}"\n`;
      
      // Check if this might be the collection we're looking for
      if (
        c.id.toLowerCase() === collectionId.toLowerCase() ||
        c.name?.toLowerCase() === collectionId.toLowerCase()
      ) {
        instructions += `      ⚠️  This might be the collection you're looking for!\n`;
        instructions += `      Update your code to use: collectionId: "${c.id}"\n`;
      }
    });
    instructions += `\n`;
  }
  
  instructions += `5. Check if collection "${collectionId}" exists:\n`;
  instructions += `   - If it exists: Copy the Collection ID from Settings tab (it's case-sensitive!)\n`;
  instructions += `   - If it doesn't exist: Create it with Collection ID: "${collectionId}"\n\n`;
  
  instructions += `6. Verify Collection ID matches exactly (case-sensitive):\n`;
  instructions += `   ✅ Correct: "${collectionId}"\n`;
  instructions += `   ❌ Wrong: "${collectionId.charAt(0).toUpperCase() + collectionId.slice(1)}" (different case)\n`;
  instructions += `   ❌ Wrong: "${collectionId.replace(/([A-Z])/g, '_$1').toLowerCase()}" (different format)\n\n`;
  
  instructions += `7. Run diagnostics: Visit /api/admin/debug/check-collections or run:\n`;
  instructions += `   node scripts/check-collections.js\n\n`;
  
  instructions += `8. See docs/COLLECTION_DIAGNOSTICS.md for more help\n`;
  
  return instructions;
}

/**
 * Enhanced error message for collection not found errors
 */
export function getCollectionNotFoundMessage(
  collectionId: string,
  databaseId: string,
  error?: Error
): string {
  let message = `Collection "${collectionId}" not found in database "${databaseId}".\n\n`;
  
  message += `Common causes:\n`;
  message += `1. Collection ID mismatch (case-sensitive)\n`;
  message += `2. Collection doesn't exist in database\n`;
  message += `3. Wrong database ID in environment variables\n`;
  message += `4. Collection ID copied from old project\n\n`;
  
  message += `Quick diagnosis:\n`;
  message += `- Visit: http://localhost:3000/api/admin/debug/check-collections\n`;
  message += `- Or run: node scripts/check-collections.js\n`;
  message += `- Or run this in browser console:\n`;
  message += generateDiagnosticCode().split('\n').slice(0, 5).join('\n') + '\n...\n\n';
  
  message += generateFixInstructions(collectionId, databaseId);
  
  if (error) {
    message += `\nOriginal error: ${error.message}`;
  }
  
  return message;
}

