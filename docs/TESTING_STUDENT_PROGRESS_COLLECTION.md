# Testing the studentProgress Collection

## Quick Test Steps

### 1. **Refresh Your Browser**
- Hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`
- This ensures the app loads the latest code

### 2. **Check Browser Console**
- Open Developer Tools (`F12`)
- Go to the **Console** tab
- Look for any errors related to `studentProgress`
- You should NOT see "Collection not found" errors anymore

### 3. **Test User Sign-In**
- Sign in with Google (or your account)
- The app should work without collection errors

### 4. **Test Progress Tracking**
- Go to `/dashboard/practice`
- Complete a practice quiz
- When you finish, it should save progress to `studentProgress`
- Check the console for success messages

### 5. **Test Progress Page**
- Go to `/dashboard/progress`
- This page queries the `studentProgress` collection
- It should load without errors (even if empty)

### 6. **Verify in Appwrite Console**
- Go to: https://cloud.appwrite.io/console
- Navigate to: Databases → `capstutor` → `studentProgress`
- Go to the **Documents** tab
- After completing a practice quiz, you should see a new document

## What to Look For

### ✅ Success Indicators:
- No "Collection not found" errors in console
- Progress page loads without errors
- Practice quiz completion saves successfully
- Documents appear in Appwrite Console

### ❌ Error Indicators:
- "Collection 'studentProgress' not found" error
- "Permission denied" errors
- Progress page shows error messages
- Practice quiz doesn't save progress

## Manual Test: Create a Test Document

If you want to manually test creating a document:

1. **In Appwrite Console:**
   - Go to: Databases → `capstutor` → `studentProgress`
   - Click **+ Create Document**
   - Fill in:
     - `userId`: Your user ID (from Users collection)
     - `learningObjectiveId`: `test-001`
     - `masteryLevel`: `75`
     - `completed`: `true`
     - `lastAccessed`: `2024-01-15T10:00:00Z`
     - `topic`: `Test Topic`
     - `subject`: `Mathematics`
     - `gradeLevel`: `10`
     - `type`: `practice`
   - Click **Create**

2. **In Your App:**
   - Go to `/dashboard/progress`
   - You should see the test document appear

## Troubleshooting

### If you see "Collection not found":
1. Verify collection ID is exactly `studentProgress` (lowercase, no spaces)
2. Check it's in the `capstutor` database
3. Verify permissions are set (Users role: Create, Read, Update)

### If you see "Permission denied":
1. Check permissions in Appwrite Console
2. Make sure Users role has Create, Read, Update permissions
3. Verify you're signed in

### If progress doesn't save:
1. Check browser console for errors
2. Verify all required attributes exist
3. Check that `userId` matches your current user ID

## Next Steps

Once testing is successful:
- The app should work normally
- Progress tracking will function
- Students can complete practice quizzes and see their progress

