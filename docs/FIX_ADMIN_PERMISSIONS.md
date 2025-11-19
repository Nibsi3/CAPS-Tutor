# Fix Admin Authorization Error

## Problem

You're getting a `401 Unauthorized` error when trying to check admin status. This is because:
1. The API route needs an Appwrite API key to read from the collection
2. Your admin document has incorrect field values

## Solution: Two Steps Required

### Step 1: Set Up API Key (Required)

The API route uses a server-side Appwrite API key to read from the `adminId` collection. You need to create and configure this key:

1. **Go to Appwrite Console**: https://cloud.appwrite.io/console
2. **Navigate to**: **Settings** → **API Keys**
3. **Click**: **Create API Key**
4. **Give it a name**: e.g., "Server API Key"
5. **Select scopes**: 
   - ✅ **databases.read** (required)
   - ✅ **databases.write** (optional, for creating admins via API)
6. **Click**: **Create**
7. **Copy the API key** (you won't see it again!)
8. **Add to `.env.local`**:
   ```env
   APPWRITE_API_KEY=your_api_key_here
   ```
9. **Restart your development server**

### Step 2: Fix Your Admin Document (Critical)

Your admin document has incorrect values that prevent it from working:

#### Current Issues:
- ❌ `status` is set to `"admin"` but should be `"active"`
- ❌ `role` is set to `"admin"` but should be `"superadmin"`, `"manager"`, or `"viewer"`

#### How to Fix:

1. **Go to Appwrite Console**: https://cloud.appwrite.io/console
2. **Navigate to**: **Databases** → `capstutor` → `adminId` collection
3. **Click on the document** (the one with email `cameronfalck03@gmail.com`)
4. **Click**: **Edit**
5. **Update these fields**:
   - **status**: Change from `"admin"` to `"active"` ⚠️ **This is critical!**
   - **role**: Change from `"admin"` to `"superadmin"` (or `"manager"` or `"viewer"`)
   - **permissions**: Add an array like `["edit_users", "view_stats", "manage_papers", "delete_content", "manage_admins"]` (optional but recommended)
6. **Click**: **Update**

#### Correct Document Example:

```json
{
  "$id": "690f78f10003bc406249",
  "adminId": "[your-uuid-here]",
  "email": "cameronfalck03@gmail.com",
  "passwordHash": "",
  "role": "superadmin",
  "permissions": ["edit_users", "view_stats", "manage_papers", "delete_content", "manage_admins"],
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "notes": "Super administrator account"
}
```

## Verify Fix

After completing both steps:

1. **Restart your development server** (to load the API key)
2. **Log out** and **log back in** with `cameronfalck03@gmail.com`
3. **Check the browser console** - you should see no errors
4. **Look for the Admin Mode toggle button** in the header
5. **Click the toggle** - it should work without errors
6. **Navigate to `/admin`** - you should have access

## How It Works Now

The code now uses a server-side API route (`/api/check-admin`) that:
- ✅ Uses an Appwrite API key (not user sessions)
- ✅ Can read from the collection even if user permissions don't allow it
- ✅ Provides helpful error messages if the admin document has wrong values
- ✅ Automatically detects if status is set incorrectly and suggests a fix

## Troubleshooting

### Still Getting 401 Error
- ✅ Verify `APPWRITE_API_KEY` is set in `.env.local`
- ✅ Restart your development server after adding the API key
- ✅ Check that the API key has `databases.read` scope
- ✅ Verify the API key is correct (no extra spaces or quotes)

### Admin Toggle Not Showing
- ✅ Check browser console for error messages
- ✅ Verify admin document exists in `adminId` collection
- ✅ Verify `email` matches exactly (case-sensitive): `cameronfalck03@gmail.com`
- ✅ Ensure `status` is set to `"active"` (not `"admin"`)
- ✅ Check the API route response in browser DevTools → Network tab

### API Route Returns Error
- ✅ Check server logs (terminal where dev server is running)
- ✅ Verify `APPWRITE_API_KEY` environment variable is set
- ✅ Ensure API key has correct scopes (`databases.read`)
- ✅ Check that collection ID is exactly `adminId` (case-sensitive)

### Admin Document Status Issue
The API route will automatically detect if your admin document exists but has the wrong status. Check the browser console for messages like:
```
Admin found but status is "admin" instead of "active". Please update the status in Appwrite Console.
```

If you see this message, update the `status` field to `"active"` as described in Step 2.

## Optional: Update Collection Permissions

**Note**: You don't need to change collection permissions anymore since we're using an API key. However, if you want to allow users to read directly (for debugging), you can:

1. Go to Appwrite Console → Databases → `capstutor` → `adminId` → Settings
2. Under **Permissions** → **Read Permission**, add **"Users"** role
3. Click **Update**

This is optional and not required for the API route to work.
