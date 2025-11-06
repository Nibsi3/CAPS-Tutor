# Quick Fix: Appwrite Cloud Deployment Issues

## The Problem

Your app is deployed on Appwrite Cloud but showing:
- ❌ 400 errors
- ❌ Connection errors
- ❌ "Could not establish connection" errors

## The Solution (5 Minutes)

### Step 1: Set Environment Variables in Appwrite Console

1. **Go to Appwrite Console**
   - Navigate to your deployment/project

2. **Open Settings**
   - Click on your deployment
   - Go to **Settings** tab
   - Find **Environment Variables** section

3. **Add These Variables:**

   ```
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=690a39bf0011810ee554
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor
   ```

   **Important:** 
   - Use `NEXT_PUBLIC_` prefix (required for Next.js)
   - Replace `capstutor` with your actual database ID if different
   - Get your database ID from: Appwrite Console → Databases → Your Database

### Step 2: Redeploy

1. **Save** the environment variables
2. **Redeploy** your application
   - Appwrite should automatically redeploy, or
   - Manually trigger a redeploy from the console

### Step 3: Verify

1. **Wait for deployment to complete** (usually 1-2 minutes)
2. **Open your app** in browser
3. **Check browser console** (F12)
   - You should see: `✅ Appwrite Client initialized`
   - You should NOT see: `❌ Appwrite Client: Missing environment variables!`

## Still Not Working?

### Check These:

1. **Environment Variables Are Set:**
   - Go back to Settings → Environment Variables
   - Verify all three variables are there
   - Check for typos (especially `NEXT_PUBLIC_` prefix)

2. **Database ID is Correct:**
   - Go to Appwrite Console → Databases
   - Click on your database
   - Copy the Database ID from the URL or settings
   - Make sure it matches `NEXT_PUBLIC_APPWRITE_DATABASE_ID`

3. **Endpoint is Correct:**
   - Go to Appwrite Console → Settings → General
   - Check your project's endpoint
   - It should be something like `https://fra.cloud.appwrite.io/v1`
   - Make sure it matches `NEXT_PUBLIC_APPWRITE_ENDPOINT`

4. **Project ID is Correct:**
   - Go to Appwrite Console → Settings → General
   - Copy your Project ID
   - Make sure it matches `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

5. **Check Build Logs:**
   - Go to Appwrite Console → Your Deployment → Logs
   - Look for build errors
   - Verify build completed successfully

6. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

## Common Mistakes

❌ **Wrong:**
```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=690a39bf0011810ee554
```

✅ **Correct:**
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=690a39bf0011810ee554
NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor
```

**Why:** Next.js only embeds variables with `NEXT_PUBLIC_` prefix in the client bundle.

## Need More Help?

See the detailed troubleshooting guide:
- `docs/APPWRITE_CLOUD_DEPLOYMENT_TROUBLESHOOTING.md`

Or check:
- `docs/APPWRITE_ENVIRONMENT_VARIABLES.md`

