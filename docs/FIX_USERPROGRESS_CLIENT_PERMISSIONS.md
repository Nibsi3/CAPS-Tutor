# Fix Client-Side Permissions for userprogress Collection

## Status ✅

Your test results show:
- ✅ Collection `userprogress` exists
- ✅ Collection ID is correct (`userprogress`)
- ✅ Server-side queries work (using API key)
- ❌ Client-side queries fail (users can't access from browser)

## The Problem

The error "Collection with the requested ID could not be found" is misleading. It's actually a **permissions error**. Users don't have permission to read/write to the `userprogress` collection from their browser.

## Quick Fix (2 Minutes)

### Step 1: Open Collection Settings

1. Go to: https://cloud.appwrite.io/console
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor** → **userProgress** (click on it)
4. Click on the **Settings** tab

### Step 2: Set Permissions

1. Scroll down to the **Permissions** section
2. Look for the **Users** role in the list
3. **If Users role doesn't exist:**
   - Click **+ Add role** button
   - Select **Users** from the dropdown
4. **Set these permissions for Users role:**
   - ✅ **Create** - Check this box
   - ✅ **Read** - Check this box
   - ✅ **Update** - Check this box
   - ❌ **Delete** - Leave unchecked

### Step 3: Save

1. Click **Update** or **Save** button
2. Wait a few seconds for permissions to save

### Step 4: Test

1. **Refresh your browser** (hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`)
2. Go to `/dashboard/practice` or `/dashboard/progress`
3. The error should be gone! ✅

## Visual Guide

In the Permissions section, you should see:

```
Role: Users
├── Create  ✅ (checked)
├── Read    ✅ (checked)
├── Update  ✅ (checked)
└── Delete  ❌ (unchecked)
```

## Why This Works

- **Server-side** (API routes): Uses API key with full database access ✅
- **Client-side** (browser): Requires user permissions on the collection ❌ → ✅

Even though the code filters by `userID`, users still need **Read permission** on the collection to query it.

## Security Note

This is safe because:
1. The code uses `Query.equal('userID', user.$id)` to filter results
2. Users can only see their own progress documents
3. This is the standard Appwrite pattern for user-scoped collections

## Verification

After setting permissions, check:

1. **Browser Console** (F12 → Console):
   - No more "Collection not found" errors
   - No permission errors

2. **Practice Page** (`/dashboard/practice`):
   - Loads without errors
   - Can see struggling topics (if any progress exists)

3. **Progress Page** (`/dashboard/progress`):
   - Loads without errors
   - Shows progress data (if any exists)

## Still Not Working?

If you still see errors after setting permissions:

1. **Wait 30 seconds** - Permissions can take a moment to propagate
2. **Hard refresh** - Clear cache: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check Collection ID** - Make sure it's exactly `userprogress` (lowercase)
4. **Check Attribute Name** - Make sure the attribute is `userID` (capital ID), not `userId`
5. **Restart Dev Server** - Stop and restart your Next.js dev server
6. **Check Browser Console** - Look for specific error messages

## Quick Test

After setting permissions, you can test by:

1. Opening browser console (F12)
2. Going to `/dashboard/practice`
3. Checking for errors in the console
4. If no errors, permissions are set correctly! ✅

