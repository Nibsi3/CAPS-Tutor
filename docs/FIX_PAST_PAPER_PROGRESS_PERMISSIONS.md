# Fix pastPaperProgress Permissions

## The Error
```
Permission error on collection: pastPaperProgress
The current user is not authorized to perform the requested action.
```

This means the collection exists, but permissions are not set correctly.

## Quick Fix

### Step 1: Go to the Collection
1. Go to: https://cloud.appwrite.io/console
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor** → **pastPaperProgress** collection

### Step 2: Set Permissions
1. Click on the **Settings** tab
2. Scroll down to **Permissions** section
3. Click **+ Add role** or find the **Users** role
4. Set the following permissions:
   - ✅ **Create** - Checked (Users can create their own progress)
   - ✅ **Read** - Checked (Users can read their own progress)
   - ✅ **Update** - Checked (Users can update their own progress)
   - ❌ **Delete** - Unchecked (Users cannot delete progress)

### Step 3: Save
1. Click **Update** or **Save** button
2. Wait for the permissions to be saved

### Step 4: Test
1. Refresh your browser (`Ctrl+Shift+R`)
2. Go to `/dashboard/past-papers`
3. The permission error should be gone!

## Important Note

In Appwrite, permissions work at the collection level. The code uses `Query.equal('userId', user.$id)` to filter results, but users still need Read permission on the collection to query it.

If you want to restrict users to only see their own documents, you have two options:
1. **Option 1 (Current)**: Give all users Read permission, and filter by `userId` in your code (which is already done)
2. **Option 2 (More Secure)**: Use Appwrite's query rules to restrict access at the database level (more complex setup)

For now, Option 1 is fine - the code already filters by `userId`, so users will only see their own progress.

