/**
 * Standalone script to check Appwrite collections
 * 
 * Usage:
 *   node scripts/check-collections.js
 * 
 * Or in browser console (requires authentication):
 *   Copy the code below and run it in the browser console
 * 
 * Prerequisites:
 *   - APPWRITE_API_KEY must be set in environment variables (for Node.js)
 *   - NEXT_PUBLIC_APPWRITE_DATABASE_ID must be set
 *   - NEXT_PUBLIC_APPWRITE_ENDPOINT must be set
 *   - NEXT_PUBLIC_APPWRITE_PROJECT_ID must be set
 */

// For Node.js environment
if (typeof window === 'undefined') {
  const { Client, Databases } = require('node-appwrite');
  
  // Try to load .env.local (optional - may already be loaded)
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv might not be needed if env vars are already set
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   ENDPOINT:', endpoint ? '✅' : '❌');
    console.error('   PROJECT_ID:', projectId ? '✅' : '❌');
    console.error('   DATABASE_ID:', databaseId ? '✅' : '❌');
    console.error('   API_KEY:', apiKey ? '✅' : '❌');
    console.error('\nPlease set these in your .env.local file');
    process.exit(1);
  }

  async function checkCollections() {
    try {
      const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);

      const databases = new Databases(client);

      console.log('🔍 Checking collections in database:', databaseId);
      console.log('');

      const out = await databases.listCollections(databaseId);
      const collections = out.collections.map(c => ({ id: c.$id, name: c.name }));

      console.log('📊 Collections found:', collections.length);
      console.log('');
      console.log('Collections:');
      collections.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ID: "${c.id}" | Name: "${c.name || 'N/A'}"`);
      });

      console.log('');
      console.log('Expected collections:');
      const expected = ['user', 'questions', 'userProgress', 'userprogress'];
      expected.forEach(exp => {
        const found = collections.find(c => 
          c.id === exp || 
          c.id.toLowerCase() === exp.toLowerCase() ||
          c.name === exp ||
          c.name?.toLowerCase() === exp.toLowerCase()
        );
        if (found) {
          console.log(`  ✅ "${exp}" -> Found as "${found.id}"`);
        } else {
          console.log(`  ❌ "${exp}" -> NOT FOUND`);
        }
      });

      console.log('');
      const missing = expected.filter(exp => 
        !collections.find(c => 
          c.id === exp || 
          c.id.toLowerCase() === exp.toLowerCase() ||
          c.name === exp ||
          c.name?.toLowerCase() === exp.toLowerCase()
        )
      );

      if (missing.length > 0) {
        console.log('⚠️  Missing collections:', missing.join(', '));
        console.log('');
        console.log('To fix:');
        console.log('1. Go to Appwrite Console → Database →', databaseId);
        console.log('2. Check the Collections tab');
        console.log('3. Verify Collection IDs match exactly (case-sensitive)');
        console.log('4. Copy Collection ID from: Settings tab → Collection ID');
        console.log('5. Update your code to use the exact Collection ID');
      } else {
        console.log('✅ All expected collections found!');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.code === 401 || error.code === 403) {
        console.error('   Authentication failed. Check your APPWRITE_API_KEY.');
      } else if (error.code === 404) {
        console.error('   Database not found. Check your DATABASE_ID.');
      }
      process.exit(1);
    }
  }

  checkCollections();
} else {
  // Browser console version instructions
  console.log(`
═══════════════════════════════════════════════════════════════
Browser Console Version
═══════════════════════════════════════════════════════════════

To check collections in browser console, use the diagnostic API:

1. Open browser console
2. Run:
   fetch('/api/check-collections')
     .then(r => r.json())
     .then(data => {
       console.log('Collections:', data.collections);
       console.log('Expected collections status:', data.foundCollections);
     });

Or visit: http://localhost:3000/api/check-collections

Alternatively, if you have access to your app's Appwrite client:
  const databases = getDatabases(); // Your app's client
  const databaseId = 'YOUR_DATABASE_ID';
  const out = await databases.listCollections(databaseId);
  console.log(out.collections.map(c => ({ id: c.$id, name: c.name })));
`);
}

