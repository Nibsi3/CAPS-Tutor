/**
 * Browser Console Diagnostics
 * 
 * Utility functions that can be run in the browser console to diagnose
 * collection ID mismatches. Expose these to the window object for easy access.
 */

import { appwriteConfig } from '@/appwrite/config';

/**
 * Expose diagnostic utilities to window object for browser console access
 * Call this function once in your app to make diagnostics available globally
 */
export function exposeDiagnosticsToWindow(databases: any) {
  if (typeof window === 'undefined') return;
  
  const diagnostics = {
    /**
     * List all collections in the database
     */
    async listCollections() {
      const databaseId = appwriteConfig.databaseId;
      
      if (!databases) {
        console.error('❌ Appwrite Databases instance not found');
        console.log('Make sure your app has initialized Appwrite.');
        return null;
      }
      
      try {
        const out = await databases.listCollections(databaseId);
        const collections = out.collections.map((c: any) => ({ 
          id: c.$id, 
          name: c.name 
        }));
        
        console.log('📊 Collections in database:', databaseId);
        console.table(collections);
        
        return collections;
      } catch (error: any) {
        console.error('❌ Error listing collections:', error);
        console.log('\nTry the API endpoint instead:');
        console.log("fetch('/api/admin/debug/check-collections').then(r => r.json()).then(console.log)");
        return null;
      }
    },
    
    /**
     * Check if expected collections exist
     */
    async checkCollections() {
      const databaseId = appwriteConfig.databaseId;
      const expected = ['user', 'userprogress', 'questions', 'pastpapers', 'pastpaperprogress', 'adminid'];
      
      const collections = await this.listCollections();
      if (!collections) return;
      
      console.log('\n🔍 Checking expected collections:');
      const results: Array<{ expected: string; found: boolean; actualId?: string; actualName?: string }> = [];
      
      expected.forEach(exp => {
        const found = collections.find((c: any) => 
          c.id === exp || 
          c.id.toLowerCase() === exp.toLowerCase() ||
          c.name === exp ||
          c.name?.toLowerCase() === exp.toLowerCase()
        );
        
        const result = {
          expected: exp,
          found: !!found,
          actualId: found?.id,
          actualName: found?.name,
        };
        
        results.push(result);
        
        if (found) {
          if (found.id === exp) {
            console.log(`  ✅ "${exp}" -> Found as "${found.id}" (exact match)`);
          } else {
            console.log(`  ⚠️  "${exp}" -> Found as "${found.id}" (different ID - update your code!)`);
          }
        } else {
          console.log(`  ❌ "${exp}" -> NOT FOUND`);
        }
      });
      
      console.log('\n📋 Summary:');
      console.table(results);
      
      const missing = results.filter(r => !r.found);
      if (missing.length > 0) {
        console.log('\n⚠️  Missing collections:', missing.map(r => r.expected).join(', '));
        console.log('\nTo fix:');
        console.log('1. Go to: https://cloud.appwrite.io/console');
        console.log(`2. Navigate to: Databases → ${databaseId} → Collections`);
        console.log('3. Check if collections exist with different IDs');
        console.log('4. Copy the Collection ID from: Settings tab → Collection ID');
        console.log('5. Update your code to use the exact Collection ID');
      } else {
        console.log('\n✅ All expected collections found!');
      }
      
      return results;
    },
    
    /**
     * Find collection by name or ID (case-insensitive)
     */
    async findCollection(searchTerm: string) {
      const collections = await this.listCollections();
      if (!collections) return null;
      
      const lowerSearch = searchTerm.toLowerCase();
      const found = collections.filter((c: any) => 
        c.id.toLowerCase().includes(lowerSearch) ||
        c.name?.toLowerCase().includes(lowerSearch)
      );
      
      if (found.length > 0) {
        console.log(`\n🔍 Found ${found.length} collection(s) matching "${searchTerm}":`);
        console.table(found);
        return found;
      } else {
        console.log(`\n❌ No collections found matching "${searchTerm}"`);
        return null;
      }
    },
  };
  
  // Expose to window object
  (window as any).__appwriteDiagnostics = diagnostics;
  (window as any).__appwriteDatabases = databases;
  
  console.log('✅ Appwrite diagnostics available!');
  console.log('Available commands:');
  console.log('  - __appwriteDiagnostics.listCollections()');
  console.log('  - __appwriteDiagnostics.checkCollections()');
  console.log('  - __appwriteDiagnostics.findCollection("searchTerm")');
  console.log('\nOr visit: http://localhost:3000/api/admin/debug/check-collections');
}

