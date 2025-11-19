# Collection Diagnostics Tool

This document explains how to diagnose and fix "Collection with the requested ID could not be found" errors in Appwrite.

## Quick Diagnosis

### Method 1: Automatic Error Diagnostics (Recommended)

When a collection error occurs, the error handler automatically provides diagnostic information in the browser console:

1. Open your browser's Developer Console (F12)
2. Look for the error message with diagnostic information
3. The console will show:
   - Collection details (ID, database ID, error code)
   - Diagnostic code you can copy and run
   - Instructions on how to fix the issue

### Method 2: Browser Console Diagnostics (Easiest)

In development mode, diagnostic utilities are automatically exposed to the browser console:

```javascript
// List all collections
await __appwriteDiagnostics.listCollections()

// Check expected collections
await __appwriteDiagnostics.checkCollections()

// Find a specific collection
await __appwriteDiagnostics.findCollection("user")
```

**Note:** These utilities are only available in development mode after the app has loaded.

### Method 3: API Endpoint

Call the diagnostic API endpoint:

```bash
curl http://localhost:3000/api/check-collections
```

Or visit in browser: `http://localhost:3000/api/check-collections`

The API response includes:
- All collections in the database
- Expected collections status
- Diagnostic code you can run in the browser console
- Step-by-step fix instructions

### Method 4: Node.js Script

Run the standalone diagnostic script:

```bash
node scripts/check-collections.js
```

**Prerequisites:**
- `.env.local` file must contain:
  - `APPWRITE_API_KEY`
  - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
  - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
  - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

### Method 5: Admin Dashboard

1. Navigate to `/admin/monitor`
2. Click on the **Infrastructure** tab
3. Scroll down to see the **Collection Diagnostics** section
4. Review the list of collections and check which expected collections are missing

### Method 6: Manual Browser Console

Run this code in your browser console (requires authentication):

```javascript
const databases = __appwriteDatabases; // Available in dev mode
const databaseId = 'YOUR_DATABASE_ID'; // Get from your config

const out = await databases.listCollections(databaseId);
console.log(out.collections.map(c => ({ id: c.$id, name: c.name })));
```

## Common Issues

### Issue 1: Collection ID Mismatch

**Symptoms:**
- Error: "Collection with the requested ID could not be found"
- Expected collection IDs: `user`, `questions`, `userProgress`

**Solution:**
1. Go to Appwrite Console → Database → Your Database
2. Click on the Collections tab
3. Click on each collection
4. Go to the Settings tab
5. Copy the **Collection ID** (not the name)
6. Update your code to use the exact Collection ID (case-sensitive)

### Issue 2: Wrong Database ID

**Symptoms:**
- Error: "Database not found"
- Collections exist but aren't found

**Solution:**
1. Verify `NEXT_PUBLIC_APPWRITE_DATABASE_ID` in `.env.local`
2. Check Appwrite Console → Database → Your Database → Settings
3. Copy the Database ID and update your `.env.local` file
4. Restart your development server

### Issue 3: Case Sensitivity

**Symptoms:**
- Collection exists but still shows as missing
- Collection ID looks correct but doesn't match

**Solution:**
- Appwrite Collection IDs are **case-sensitive**
- `user` is different from `User` or `USER`
- Use the exact Collection ID from Appwrite Console

### Issue 4: Environment Variables Not Set

**Symptoms:**
- Error: "Database ID not configured"
- Diagnostic shows missing environment variables

**Solution:**
1. Create `.env.local` file in project root
2. Add required variables:
   ```
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_API_KEY=your_api_key
   ```
3. Restart your development server

## Expected Collections

The diagnostic tool checks for these collections:

- `user` - User profiles and settings
- `questions` - Question bank (optional)
- `userProgress` or `userprogress` - Student progress tracking

**Note:** Not all collections may be required. Check your application's requirements.

## Verifying Collection IDs in Code

After getting the correct Collection IDs from Appwrite Console, update your code:

```typescript
// Example: Using the correct collection ID
const userProfileRef = useMemoAppwrite(() => ({
  databaseId: appwriteConfig.databaseId,
  collectionId: 'user', // Use exact ID from Appwrite Console (case-sensitive!)
  documentId: userId,
}));
```

## Using Collection ID Mappings

If your collection IDs differ from the expected IDs, you can create a mapping in `src/lib/collection-diagnostics.ts`:

```typescript
export const COLLECTION_ID_MAP: Record<string, string> = {
  'userprogress': 'userProgress', // Map expected ID to actual ID
  'pastpapers': 'pastPapers',
};
```

Then use the `getCollectionId()` function:

```typescript
import { getCollectionId } from '@/lib/collection-diagnostics';

const collectionId = getCollectionId('userprogress'); // Returns 'userProgress' if mapped
```

## Troubleshooting Steps

1. **Run the diagnostic tool** (Method 1, 2, or 3 above)
2. **Check the output** - Which collections are missing?
3. **Verify in Appwrite Console** - Do the collections exist?
4. **Copy Collection IDs** - From Settings tab, not the name
5. **Update your code** - Use exact Collection IDs
6. **Restart server** - After updating environment variables
7. **Check permissions** - Ensure API key has `databases.read` scope

## API Route Details

The diagnostic API route (`/api/check-collections`) provides:

- List of all collections in the database
- Status of expected collections (found/missing)
- Similar collections (fuzzy matching for case issues)
- Step-by-step instructions to fix issues
- Direct links to Appwrite Console

## Support

If issues persist:
1. Check Appwrite Console logs
2. Verify API key permissions
3. Check network connectivity
4. Review Appwrite documentation: https://appwrite.io/docs

