# Troubleshooting: Collection "studentProgress" Not Found

## The Error
```
❌ Collection "studentProgress" not found in database "capstutor"
```

## Quick Checklist

### 1. Verify Collection Exists
- Go to: https://cloud.appwrite.io/console
- Navigate to: **Databases** → **capstutor**
- Look for a collection named **studentProgress**
- **Is it there?** If not, you need to create it.

### 2. Check Collection ID (CRITICAL)
The collection ID must be **exactly** `studentProgress`:
- ✅ Correct: `studentProgress` (lowercase, no spaces)
- ❌ Wrong: `StudentProgress` (capital S)
- ❌ Wrong: `student_progress` (underscore)
- ❌ Wrong: `student Progress` (space)
- ❌ Wrong: `studentprogress` (no capital P)

**To check:**
1. Click on the collection in Appwrite Console
2. Go to **Settings** tab
3. Look at **Collection ID** - it must be exactly `studentProgress`

### 3. Check Database
- Make sure the collection is in the **capstutor** database
- Not in a different database

### 4. Check Permissions
- Go to **Settings** tab in the collection
- Under **Permissions**, make sure **Users** role has:
  - ✅ Create
  - ✅ Read
  - ✅ Update
  - ❌ Delete (should be unchecked)

### 5. Verify All Attributes Exist
Make sure these attributes are created:
- `userId` (String, 255, required)
- `learningObjectiveId` (String, 255, required)
- `masteryLevel` (Integer, 0-100, required)
- `completed` (Boolean, required)
- `lastAccessed` (String, 100, required)
- `topic` (String, 255, optional)
- `subject` (String, 100, optional)
- `gradeLevel` (Integer, 1-12, optional)
- `type` (String, 100, optional)
- `score` (Integer, optional)
- `totalQuestions` (Integer, optional)

## Common Issues

### Issue 1: Collection ID Mismatch
**Problem:** Collection ID is not exactly `studentProgress`

**Solution:**
1. If the collection ID is wrong, you have two options:
   - **Option A:** Delete and recreate with correct ID `studentProgress`
   - **Option B:** Rename the collection (if Appwrite allows it)

### Issue 2: Collection in Wrong Database
**Problem:** Collection exists but in a different database

**Solution:**
1. Check which database the collection is in
2. Either move it to `capstutor` or update your `.env.local` to use the correct database ID

### Issue 3: Collection Not Fully Created
**Problem:** Collection was created but attributes/permissions weren't set up

**Solution:**
1. Make sure all attributes are created
2. Make sure permissions are set
3. Try creating a test document manually to verify it works

### Issue 4: Caching Issue
**Problem:** Appwrite might be caching the collection list

**Solution:**
1. Wait a few minutes after creating the collection
2. Refresh the Appwrite Console
3. Hard refresh your browser (`Ctrl+Shift+R`)

## Step-by-Step Verification

1. **Open Appwrite Console**
   - Go to: https://cloud.appwrite.io/console
   - Select project: **CAPS Tutor**

2. **Navigate to Database**
   - Click **Databases** in left sidebar
   - Click on **capstutor** database

3. **Check Collections List**
   - You should see a list of collections
   - Look for `studentProgress` (or `user`, `studentProgress`, etc.)
   - **What do you see?** List all collection names here

4. **If Collection Exists:**
   - Click on it
   - Go to **Settings** tab
   - Check **Collection ID** - must be exactly `studentProgress`
   - Check **Permissions** - Users role should have Create, Read, Update

5. **If Collection Doesn't Exist:**
   - Click **+ Create Collection**
   - Collection ID: `studentProgress` (exact, lowercase)
   - Name: `Student Progress`
   - Click **Create**
   - Then add all attributes and set permissions

## Quick Test

Try creating a test document manually:

1. Go to: Databases → capstutor → studentProgress
2. Click **+ Create Document**
3. Fill in:
   - `userId`: `test-user-123`
   - `learningObjectiveId`: `test-001`
   - `masteryLevel`: `50`
   - `completed`: `false`
   - `lastAccessed`: `2024-01-15T10:00:00Z`
4. Click **Create**

**If this works:** Collection exists and permissions are correct
**If this fails:** There's a permissions or attribute issue

## Still Not Working?

If you've verified everything above and it still doesn't work:

1. **Check the exact error in browser console**
   - Look for the "Collection details" log
   - It should show the exact collectionId and databaseId being used

2. **Verify your .env.local file**
   - Make sure `NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor`
   - Restart your dev server after changing .env.local

3. **Check Appwrite Project**
   - Make sure you're using the correct Appwrite project
   - The project ID should be: `690a39bf0011810ee554`

4. **Try a different collection name temporarily**
   - Create a test collection with ID `test123`
   - See if that works
   - This will help isolate if it's a naming issue

