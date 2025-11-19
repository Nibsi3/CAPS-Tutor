# Fix userprogress Collection Permissions

## The Error

```
Collection with the requested ID could not be found
```

OR

```
The current user is not authorized to perform the requested action
```

## The Problem

The `userprogress` collection exists, but users don't have permission to read/write to it from the client-side (browser). Server-side queries work (using API key), but client-side queries fail.

## Quick Fix

### Step 1: Go to the Collection

1. Go to: https://cloud.appwrite.io/console
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor** → **userProgress** collection
4. Click on the **Settings** tab

### Step 2: Check Collection ID

Make sure the **Collection ID** is exactly `userprogress` (lowercase, no spaces, no capital letters).

- ✅ Correct: `userprogress`
- ❌ Wrong: `userProgress`
- ❌ Wrong: `UserProgress`
- ❌ Wrong: `user progress`

### Step 3: Set Permissions

1. Scroll down to the **Permissions** section
2. Look for the **Users** role
3. If it doesn't exist, click **+ Add role** and select **Users**
4. Set the following permissions for **Users** role:

   - ✅ **Create** - Checked (Users can create their own progress)
   - ✅ **Read** - Checked (Users can read their own progress)
   - ✅ **Update** - Checked (Users can update their own progress)
   - ❌ **Delete** - Unchecked (Users cannot delete progress)

### Step 4: Verify Attributes

Make sure these attributes exist (case-sensitive):

- `userID` (String, 255, required) - **Note: capital ID, not userId**
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

### Step 5: Verify Indexes

Make sure you have at least these indexes:

1. **userID_index** (Key, Attribute: `userID`)
   - This is critical for querying by user ID

2. Optional but recommended:
   - **userID_subject_index** (Key, Attributes: `userID`, `subject`)
   - **userID_gradeLevel_index** (Key, Attributes: `userID`, `gradeLevel`)
   - **userID_topic_index** (Key, Attributes: `userID`, `topic`)

### Step 6: Save and Test

1. Click **Update** or **Save** button
2. Wait for permissions to save
3. Refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
4. The error should be gone!

## Important Notes

### Why the Error Happens

- **Server-side queries** (using API key) work because the API key has full database access
- **Client-side queries** (from browser) require user permissions on the collection
- Even though the code filters by `userID`, users still need Read permission on the collection

### Security

The code already filters by `userID` using `Query.equal('userID', user.$id)`, so users will only see their own progress. Giving all users Read permission is safe because:

1. The query filters by user ID
2. Users can only see their own documents
3. This is the standard Appwrite pattern for user-scoped collections

## Verification

After fixing permissions, test by:

1. **Browser Console**: Check for errors (F12 → Console)
2. **Test Endpoint**: Visit `http://localhost:9002/api/test-userprogress`
3. **Practice Page**: Go to `/dashboard/practice` and check if it loads without errors
4. **Progress Page**: Go to `/dashboard/progress` and check if it loads without errors

## Still Having Issues?

1. **Check Collection ID**: Make sure it's exactly `userprogress` (case-sensitive)
2. **Check Permissions**: Verify Users role has Read, Create, Update permissions
3. **Check Attributes**: Make sure `userID` attribute exists (with capital ID)
4. **Check Indexes**: Make sure `userID_index` exists
5. **Restart Dev Server**: After making changes, restart your dev server
6. **Clear Browser Cache**: Try clearing browser cache or using incognito mode

## Test the Fix

Visit this URL to test if the collection is accessible:
```
http://localhost:9002/api/test-userprogress
```

This will show you:
- ✅ Collection exists
- ✅ Collection ID matches
- ✅ Can query collection
- ✅ Permissions are set correctly

