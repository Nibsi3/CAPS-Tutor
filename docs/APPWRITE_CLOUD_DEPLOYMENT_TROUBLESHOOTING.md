# Appwrite Cloud Deployment Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: 400 Error on App Load

**Symptoms:**
- Browser shows `Failed to load resource: the server responded with a status of 400`
- App doesn't load or shows blank page

**Causes:**
1. Missing environment variables
2. Incorrect endpoint configuration
3. Build/deployment issues

**Solutions:**

#### Step 1: Verify Environment Variables

Go to **Appwrite Console** → **Your Deployment** → **Settings** → **Environment Variables**

**Required Variables:**
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=690a39bf0011810ee554
NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor
```

**Important Notes:**
- All `NEXT_PUBLIC_*` variables must be set in Appwrite Console
- Variables set in `.env.local` are NOT available in Appwrite Cloud
- You must set them in the Appwrite Console deployment settings
- After setting variables, **redeploy** your application

#### Step 2: Verify Endpoint

For Appwrite Cloud, use:
- **Endpoint**: `https://fra.cloud.appwrite.io/v1` (or your region's endpoint)
- **NOT** `https://cloud.appwrite.io/v1` (this is incorrect)

To find your correct endpoint:
1. Go to Appwrite Console → Settings → General
2. Check your project's endpoint URL
3. Use that exact URL with `/v1` appended

#### Step 3: Check Build Logs

1. Go to **Appwrite Console** → **Your Deployment** → **Logs**
2. Look for:
   - ✅ Build successful
   - ✅ Server starting on port 3000
   - ❌ Missing environment variables
   - ❌ Build errors

### Issue 2: CORS Font Errors

**Symptoms:**
```
Access to font at 'https://assets.appwrite.io/fonts/...' from origin '...' 
has been blocked by CORS policy
```

**Cause:**
These errors are from Appwrite's console UI, not your app. They can be ignored if your app loads correctly.

**Solution:**
- These are harmless console warnings
- They don't affect your application
- If your app loads, you can ignore them

### Issue 3: Connection Error

**Symptoms:**
```
RegisterClientLocalizationsError: Could not establish connection. 
Receiving end does not exist.
```

**Causes:**
1. Appwrite client can't connect to Appwrite API
2. Missing or incorrect endpoint
3. Network/CORS issues

**Solutions:**

#### Step 1: Verify Endpoint and Project ID

Check browser console for:
```
❌ Appwrite Client: Missing environment variables!
```

If you see this:
1. Set environment variables in Appwrite Console (see Issue 1)
2. Redeploy your application
3. Clear browser cache and reload

#### Step 2: Check Network Tab

1. Open browser DevTools → Network tab
2. Look for requests to `fra.cloud.appwrite.io`
3. Check if they return:
   - ✅ 200 OK (success)
   - ❌ 400/401/403 (configuration issue)
   - ❌ CORS error (endpoint issue)

#### Step 3: Verify Project ID

1. Go to Appwrite Console → Settings → General
2. Copy your **Project ID**
3. Ensure it matches `NEXT_PUBLIC_APPWRITE_PROJECT_ID` in environment variables

### Issue 4: App Starts but Features Don't Work

**Symptoms:**
- App loads but authentication fails
- Database queries return errors
- Features that require Appwrite don't work

**Causes:**
1. Missing `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
2. Incorrect database ID
3. Permissions not configured

**Solutions:**

#### Step 1: Set Database ID

1. Go to Appwrite Console → Databases
2. Click on your database
3. Copy the **Database ID** from the URL or settings
4. Set it as `NEXT_PUBLIC_APPWRITE_DATABASE_ID` in environment variables
5. Redeploy

#### Step 2: Verify Database Permissions

1. Go to Appwrite Console → Databases → Your Database → Settings
2. Check **Permissions**
3. Ensure appropriate permissions are set for:
   - Users collection
   - Past papers collection
   - Student progress collection
   - Other collections your app uses

### Issue 5: Build Fails or Times Out

**Symptoms:**
- Build fails with timeout error
- "Build archive was not created" error

**Solutions:**

#### Option 1: Pre-build Locally

1. Build locally:
   ```bash
   npm run build
   ```

2. Deploy the built files:
   - Upload `.next/standalone`, `.next/static`, and `public` directories
   - Configure Appwrite to use pre-built files

#### Option 2: Optimize Build

1. Reduce build complexity
2. Exclude large files (see `next.config.ts` → `outputFileTracingExcludes`)
3. Use standalone output mode (already configured)

## Quick Checklist

Before deploying to Appwrite Cloud:

- [ ] Environment variables set in Appwrite Console:
  - [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT`
  - [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- [ ] Endpoint is correct (e.g., `https://fra.cloud.appwrite.io/v1`)
- [ ] Project ID matches your Appwrite project
- [ ] Database ID matches your Appwrite database
- [ ] Application redeployed after setting variables
- [ ] Build logs show successful build
- [ ] Server logs show server starting on port 3000

## Verification Steps

### 1. Check Environment Variables

In browser console, you should see:
```
✅ Appwrite Config: Project ID is set (690a39b...)
✅ Appwrite Config: Database ID is set (capstutor)
```

If you see warnings instead, environment variables are not set correctly.

### 2. Check Appwrite Client

In browser console, you should see:
```
✅ Appwrite Client initialized
```

If you see errors, check the error message for specific issues.

### 3. Test Authentication

1. Try to log in
2. Check browser console for errors
3. Check Network tab for Appwrite API calls

### 4. Test Database Queries

1. Navigate to a page that uses database
2. Check browser console for errors
3. Verify data loads correctly

## Getting Help

If issues persist:

1. **Check Logs:**
   - Appwrite Console → Your Deployment → Logs
   - Browser Console (F12)
   - Network Tab (F12 → Network)

2. **Verify Configuration:**
   - Environment variables are set correctly
   - Endpoint matches your Appwrite project
   - Project ID is correct
   - Database ID is correct

3. **Test Locally:**
   - Set up `.env.local` with same values
   - Run `npm run dev`
   - Verify it works locally
   - Compare with deployed version

4. **Contact Support:**
   - Appwrite Discord: https://discord.gg/appwrite
   - Appwrite GitHub: https://github.com/appwrite/appwrite

## Common Environment Variable Mistakes

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

**Why:** Next.js only embeds `NEXT_PUBLIC_*` variables in the client bundle. Variables without this prefix are not available in the browser.

## Additional Resources

- [Appwrite Cloud Documentation](https://appwrite.io/docs/products/cloud)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Appwrite Client SDK](https://appwrite.io/docs/getting-started-for-web)

