# Quick Fix: Collection Not Found Error

## The Error

```
Collection with the requested ID could not be found
```

## Immediate Steps

### Step 1: Check the Console

When this error occurs, check your browser console. The error handler automatically provides:

1. **Diagnostic Information** - Shows the collection ID, database ID, and error details
2. **Diagnostic Code** - Copy and paste this code into your browser console
3. **Fix Instructions** - Step-by-step guide to resolve the issue

### Step 2: Run Diagnostics

Choose one of these methods:

#### Option A: Browser Console (Easiest)

In development mode, run:

```javascript
await __appwriteDiagnostics.checkCollections()
```

This will:
- List all collections in your database
- Check which expected collections are missing
- Show which collections exist but have different IDs
- Provide fix instructions

#### Option B: API Endpoint

Visit: `http://localhost:3000/api/check-collections`

Or run:
```bash
curl http://localhost:3000/api/check-collections
```

#### Option C: Node.js Script

```bash
node scripts/check-collections.js
```

### Step 3: Verify Collection IDs

1. Go to: https://cloud.appwrite.io/console
2. Navigate to: **Databases** → Your Database → **Collections**
3. For each collection:
   - Click on the collection
   - Go to **Settings** tab
   - Copy the **Collection ID** (it's case-sensitive!)

### Step 4: Update Your Code

Compare the Collection IDs from Appwrite Console with what your code expects:

```typescript
// If your code uses:
collectionId: 'userprogress'

// But Appwrite Console shows:
Collection ID: 'userProgress'

// Update your code to:
collectionId: 'userProgress'  // Exact match (case-sensitive!)
```

### Step 5: Common Issues

#### Issue 1: Case Sensitivity

✅ Correct: `'userProgress'`  
❌ Wrong: `'userprogress'`  
❌ Wrong: `'UserProgress'`

Appwrite Collection IDs are **case-sensitive**. Use the exact ID from Appwrite Console.

#### Issue 2: Collection Doesn't Exist

If the collection doesn't exist:

1. Create it in Appwrite Console
2. Use the **exact** Collection ID your code expects
3. Or update your code to use the Collection ID you created

#### Issue 3: Wrong Database

If collections exist but aren't found:

1. Check `NEXT_PUBLIC_APPWRITE_DATABASE_ID` in `.env.local`
2. Verify it matches your Appwrite Console database ID
3. Restart your development server

#### Issue 4: Environment Variables

Make sure `.env.local` contains:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key
```

## Expected Collections

Your app expects these collections (case-sensitive):

- `user` - User profiles
- `userprogress` or `userProgress` - Student progress
- `questions` - Question bank (optional)
- `pastPapers` - Past papers (optional)
- `studentProgress` - Student progress (alternative)

**Note:** Not all collections are required. Check which ones your app actually uses.

## Still Having Issues?

1. Check the full diagnostic output in the browser console
2. Visit `/api/check-collections` to see all collections
3. Compare Collection IDs character-by-character (case-sensitive!)
4. Verify you're using the correct database
5. Check environment variables are set correctly
6. Restart your development server after changing environment variables

## Additional Resources

- [Collection Diagnostics Guide](./COLLECTION_DIAGNOSTICS.md)
- [Appwrite Collections Setup](./APPWRITE_COLLECTIONS_SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_COLLECTION_NOT_FOUND.md)

