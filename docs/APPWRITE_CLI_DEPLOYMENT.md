# Appwrite CLI Deployment Guide

This guide explains how to deploy your pre-built Next.js application to Appwrite using the CLI.

## Prerequisites

1. **Appwrite CLI installed**
   ```powershell
   npm install -g appwrite-cli
   ```

2. **Pre-built deployment package**
   - Run `.\scripts\build-for-appwrite.ps1` first to create the `appwrite-deploy` directory

## Quick Start

### Step 1: Login to Appwrite

```powershell
appwrite login
```

This will prompt you to:
- Enter your Appwrite endpoint (default: `https://cloud.appwrite.io/v1`)
- Enter your email
- Enter your password

### Step 2: Set Project

```powershell
appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id="690a39bf0011810ee554"
```

### Step 3: Deploy

**Option A: Using the deployment script (Recommended)**
```powershell
.\scripts\deploy-to-appwrite.ps1
```

**Option B: Manual deployment**
```powershell
appwrite functions create-deployment `
    --function-id="690a3b49003855f68c7e" `
    --code="appwrite-deploy" `
    --entrypoint="server.js" `
    --activate
```

## Configuration

The deployment script uses these values (configured in `scripts/deploy-to-appwrite.ps1`):

- **Project ID**: `690a39bf0011810ee554`
- **Function ID**: `690a3b49003855f68c7e`
- **Code Directory**: `appwrite-deploy`
- **Entry Point**: `server.js`

## Environment Variables

After deployment, ensure these environment variables are set in Appwrite Function settings:

- `PORT=3000`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`

## Troubleshooting

### "Session not found"
- Run `appwrite login` first

### "Invalid endpoint URL"
- Explicitly set the endpoint: `appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id="YOUR_PROJECT_ID"`

### "Function not found"
- Verify the function ID in Appwrite Console
- Check that the function exists in your project

### Deployment fails
- Ensure `appwrite-deploy` directory exists and contains `server.js`
- Check that you're logged in: `appwrite account get`
- Verify project ID and function ID are correct

## Alternative: Direct Command

If you prefer a single command (after logging in):

```powershell
appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id="690a39bf0011810ee554" && appwrite functions create-deployment --function-id="690a3b49003855f68c7e" --code="appwrite-deploy" --entrypoint="server.js" --activate
```

## Verification

After deployment:

1. Check Appwrite Console → Functions → Your Function → Deployments
2. Verify the deployment is active (green checkmark)
3. Test the function endpoint
4. Check logs for any runtime errors

