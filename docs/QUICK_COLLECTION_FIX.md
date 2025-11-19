# Quick Fix: Collection Not Found Error

## Step 1: Identify Which Collection is Missing

Visit this URL in your browser:
```
http://localhost:9002/api/check-all-collections
```

This will show you:
- All collections that exist in your database
- Which collections the app expects
- Which ones are missing
- Case sensitivity mismatches

## Step 2: Common Missing Collections

Based on the code, these collections are commonly used:

### Required Collections:
1. **`user`** - User profiles (required)
2. **`userprogress`** - Student progress tracking (required for practice page)

### Optional Collections:
3. **`adminid`** - Admin users (you have this ✅)
4. **`pastPapers`** - Past exam papers
5. **`questions`** - Question bank
6. **`pastPaperProgress`** - Past paper progress tracking

## Step 3: Check Browser Console

When you see the error, check your browser console (F12 → Console). The error message should tell you which collection is missing.

Look for messages like:
```
❌ Collection "userprogress" not found in database "capstutor"
```

## Step 4: Create Missing Collections

### Create `userprogress` Collection

If `userprogress` is missing (most common):

1. Go to: https://cloud.appwrite.io/console
2. Navigate to: **Databases** → `capstutor`
3. Click: **Create Collection**
4. **Collection ID**: `userprogress` (exactly this, lowercase, no spaces)
5. **Name**: `User Progress`
6. Click: **Create**

### Add Attributes:

1. **userId** (String, 255, required)
2. **learningObjectiveId** (String, 255, required)
3. **masteryLevel** (Integer, 0-100, required)
4. **completed** (Boolean, required)
5. **lastAccessed** (String, 100, required)
6. **topic** (String, 255, optional)
7. **subject** (String, 100, optional)
8. **gradeLevel** (Integer, 1-12, optional)
9. **type** (String, 100, optional)
10. **score** (Integer, optional)
11. **totalQuestions** (Integer, optional)

### Set Permissions:

1. Go to **Settings** tab
2. Under **Permissions**:
   - **Create**: Users ✅
   - **Read**: Users ✅
   - **Update**: Users ✅
   - **Delete**: None ❌

### Create Index:

1. Go to **Indexes** tab
2. Click **Create Index**
3. **Key**: `userId_index`
4. **Type**: Key
5. **Attributes**: `userId`
6. Click **Create**

## Step 5: Verify

After creating the collection:

1. Refresh your browser
2. The error should be gone
3. Check `/api/check-all-collections` again to verify

## Still Having Issues?

1. **Check collection ID case sensitivity**: `userprogress` vs `userProgress` vs `UserProgress`
2. **Verify database ID**: Make sure you're using the correct database
3. **Check API key**: Ensure `APPWRITE_API_KEY` has `databases.read` scope
4. **Restart dev server**: After creating collections, restart your dev server

## Quick Diagnostic Command

You can also check collections from the terminal:

```bash
# Visit in browser
http://localhost:9002/api/check-all-collections

# Or use the test admin endpoint
http://localhost:9002/api/test-admin
```

