# Appwrite Deployment Solutions

## Problem Summary

Appwrite Functions is trying to build your Next.js app during deployment, but:

1. **When deploying pre-built code** (`appwrite-deploy`): 
   - Error: "Couldn't find any `pages` or `app` directory"
   - Appwrite expects source code to build, not pre-built artifacts

2. **When deploying full source**:
   - Build times out after ~90-120 seconds
   - Appwrite's build environment has strict timeout limits

## Solution Options

### Option 1: Deploy Full Source Code (May Still Timeout)

Use the script to deploy your entire source code:

```powershell
.\scripts\deploy-full-source.ps1
```

**Pros:**
- Appwrite can build from source
- Uses your optimized build configuration

**Cons:**
- May still timeout (build takes ~16s locally, but Appwrite is slower)
- Requires Appwrite to have all dependencies

**Configure in Appwrite Console:**
- **Install Command**: `npm install`
- **Build Command**: `npm run build` (or `npx next build`)
- **Entry Point**: `node .next/standalone/server.js`
- **Runtime**: Node.js 20.x

### Option 2: Use Appwrite Sites (Recommended)

Appwrite Sites is designed for full-stack applications like Next.js, while Functions are for serverless functions.

**Steps:**
1. Go to Appwrite Console → Sites
2. Create a new Site (or use existing)
3. Connect your GitHub repository
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node Version**: 20.x

**Pros:**
- Better suited for Next.js apps
- May have longer build timeouts
- Automatic deployments from Git

**Cons:**
- Requires GitHub integration
- May require Appwrite Cloud plan

### Option 3: Configure Function to Skip Build (If Supported)

Some Appwrite configurations allow skipping the build step. Check your Appwrite Function settings:

1. Go to Functions → Your Function → Settings
2. Look for "Build" or "Skip Build" options
3. If available, disable build and set:
   - **Entry Point**: `server.js`
   - **Code Directory**: Upload `appwrite-deploy` directory

### Option 4: Use Alternative Platform

Consider platforms better suited for Next.js:

**Vercel** (Best for Next.js):
- Native Next.js support
- No build timeouts
- Free tier available
- Automatic deployments

**Railway**:
- Docker support
- No strict timeouts
- Easy GitHub integration

**Render**:
- Good for Node.js apps
- Longer build timeouts
- Free tier available

## Quick Commands

### Deploy Full Source
```powershell
.\scripts\deploy-full-source.ps1
```

### Deploy Pre-Built (Won't work with Functions)
```powershell
.\scripts\deploy-to-appwrite.ps1
```

### Manual Full Source Deployment
```powershell
appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id="690a39bf0011810ee554"
appwrite functions create-deployment --function-id="690a3b49003855f68c7e" --code="." --activate
```

## Recommended Next Steps

1. **Try Appwrite Sites** (if available in your plan)
   - Best fit for Next.js applications
   - Designed for full-stack apps

2. **If using Functions, deploy full source**:
   ```powershell
   .\scripts\deploy-full-source.ps1
   ```
   - Monitor the build in Appwrite Console
   - If it times out, consider Option 4

3. **Check Appwrite Function Settings**:
   - Ensure build command is correct
   - Check if there's a way to skip build
   - Verify timeout limits

## Environment Variables

After deployment, ensure these are set in Appwrite:

- `PORT=3000`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`

## Troubleshooting

**"Couldn't find any `pages` or `app` directory"**
- You're deploying pre-built code
- Deploy full source instead using `deploy-full-source.ps1`

**"Build archive was not created"**
- Build is timing out
- Try Appwrite Sites or an alternative platform

**"Session not found"**
- Run `appwrite login` first

