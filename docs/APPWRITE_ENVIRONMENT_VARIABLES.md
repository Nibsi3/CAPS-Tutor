# Appwrite Environment Variables Configuration

## Critical Issue: Runtime Timeout

If your app is timing out on Appwrite, it's likely because **required environment variables are not set**.

## Required Environment Variables

You MUST set these in Appwrite Console → Functions → Your Function → Settings → Environment Variables:

### Required Variables

1. **NEXT_PUBLIC_APPWRITE_ENDPOINT**
   - Value: `https://cloud.appwrite.io/v1`
   - Required: Yes
   - Purpose: Appwrite API endpoint

2. **NEXT_PUBLIC_APPWRITE_PROJECT_ID**
   - Value: `690a39bf0011810ee554` (your project ID)
   - Required: **YES - Critical**
   - Purpose: Identifies your Appwrite project
   - **Without this, the app will timeout!**

3. **NEXT_PUBLIC_APPWRITE_DATABASE_ID**
   - Value: Your database ID (get from Appwrite Console → Databases)
   - Required: Yes (for database features)
   - Purpose: Identifies your Appwrite database

### Optional but Recommended

4. **PORT**
   - Value: `3000` (or the port Appwrite assigns)
   - Required: No (defaults to 3000)
   - Purpose: Server port

5. **NODE_ENV**
   - Value: `production`
   - Required: No
   - Purpose: Production mode

## How to Set Environment Variables in Appwrite

1. Go to **Appwrite Console** → **Functions** → **Your Function**
2. Click **Settings** tab
3. Scroll to **Environment Variables** section
4. Click **Add Variable** for each required variable
5. Enter:
   - **Key**: `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - **Value**: `690a39bf0011810ee554`
6. Repeat for all required variables
7. **Save** and **redeploy**

## Verification

After setting variables, check the logs:

1. Go to **Functions** → **Your Function** → **Logs**
2. Look for:
   - ✅ No errors about missing project ID
   - ✅ Server starting successfully
   - ❌ If you see "NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set", variables aren't configured

## Troubleshooting

### Timeout Error
- **Cause**: Missing `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- **Fix**: Set all required environment variables

### "Route not found" Error
- **Cause**: Wrong endpoint or project ID
- **Fix**: Verify `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

### App Starts but Database Queries Fail
- **Cause**: Missing `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- **Fix**: Set the database ID variable

## Quick Setup Checklist

- [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT` = `https://cloud.appwrite.io/v1`
- [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID` = `690a39bf0011810ee554`
- [ ] `NEXT_PUBLIC_APPWRITE_DATABASE_ID` = (your database ID)
- [ ] `PORT` = `3000` (if needed)
- [ ] Redeploy after setting variables

## Finding Your Database ID

1. Go to **Appwrite Console** → **Databases**
2. Click on your database
3. Copy the **Database ID** from the URL or settings
4. Use it as `NEXT_PUBLIC_APPWRITE_DATABASE_ID`

