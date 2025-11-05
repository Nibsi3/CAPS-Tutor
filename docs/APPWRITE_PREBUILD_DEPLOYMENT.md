# Appwrite Pre-Build Deployment Guide

## Overview

This guide explains how to deploy the CAPS Tutor Next.js application to Appwrite using a **pre-build approach**. This method builds the application locally (or via CI/CD) and deploys the built artifacts, bypassing Appwrite's build process entirely.

## Why Pre-Build?

- **Local build**: Completes in **16.7 seconds** ✅
- **Appwrite build**: Times out after **~2 minutes** ❌
- **Solution**: Pre-build locally and deploy artifacts

## Prerequisites

- Node.js 20+ installed locally
- npm installed
- Appwrite account and project set up
- Environment variables configured

## Step 1: Build and Package the Application

### Option A: Using PowerShell (Windows)

```powershell
# Navigate to project directory
cd "C:\Users\cameron\Documents\CAPS Tutor\CAPS-Tutor"

# Run the build script
.\scripts\build-for-appwrite.ps1
```

### Option B: Using Bash (Linux/Mac)

```bash
# Navigate to project directory
cd /path/to/CAPS-Tutor

# Make script executable
chmod +x scripts/build-for-appwrite.sh

# Run the build script
./scripts/build-for-appwrite.sh
```

### Option C: Manual Build

```bash
# Set environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# Build the application
npm run build

# Verify build output
ls -la .next/standalone/server.js
```

## Step 2: Verify Build Output

After running the build script, verify the following:

1. **`.next/standalone/server.js`** exists (entry point)
2. **`.next/standalone/node_modules/`** contains production dependencies
3. **`.next/static/`** contains static assets
4. **`public/`** contains public files

The build script creates a `appwrite-deploy/` directory with all necessary files.

## Step 3: Deploy to Appwrite

### Method 1: Using Appwrite Storage (Recommended)

1. **Create a Storage Bucket** in Appwrite Console
   - Go to Storage → Create Bucket
   - Name: `nextjs-deployments`
   - Set appropriate permissions

2. **Upload the Deployment Package**
   - Compress the `appwrite-deploy/` directory:
     ```bash
     # On Linux/Mac
     tar -czf appwrite-deploy.tar.gz appwrite-deploy/
     
     # On Windows (PowerShell)
     Compress-Archive -Path appwrite-deploy -DestinationPath appwrite-deploy.zip
     ```
   - Upload the archive to Appwrite Storage

3. **Extract and Deploy**
   - Use Appwrite Functions or Cloud Functions to extract and deploy
   - Or manually extract and configure

### Method 2: Using Appwrite Sites (Manual Upload)

Since Appwrite Sites doesn't directly support pre-built files, you have these options:

#### Option A: Use GitHub Actions + Appwrite CLI

1. **Create GitHub Actions Workflow**
   ```yaml
   name: Build and Deploy to Appwrite
   
   on:
     push:
       branches: [main]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '20'
         - run: npm ci
         - run: npm run build
         - run: ./scripts/build-for-appwrite.sh
         # Upload to Appwrite Storage or deploy
   ```

2. **Configure Appwrite CLI**
   - Install Appwrite CLI
   - Authenticate with Appwrite
   - Deploy the built artifacts

#### Option B: Use Docker with Pre-Built Files

1. **Create a Dockerfile that uses pre-built files**:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY appwrite-deploy/ .
   EXPOSE 3000
   ENV PORT=3000
   CMD ["node", "server.js"]
   ```

2. **Build and push Docker image**
3. **Deploy to Appwrite using Docker**

### Method 3: Direct File Upload (If Appwrite Supports It)

1. **Configure Appwrite Site**:
   - Set **Build Command**: `echo "Using pre-built files"`
   - Set **Output Directory**: `/` (root)
   - Set **Entry Point**: `node server.js`

2. **Upload Files**:
   - Use Appwrite CLI or API to upload files
   - Upload entire `appwrite-deploy/` directory structure

## Step 4: Configure Environment Variables

Set the following environment variables in Appwrite:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
PORT=3000
NODE_ENV=production
```

## Step 5: Verify Deployment

1. **Check Application Logs**:
   - Monitor Appwrite logs for startup messages
   - Verify `server.js` is running

2. **Test Endpoints**:
   - Test API routes: `/api/news`, `/api/demo`
   - Test pages load correctly
   - Verify Appwrite integration works

3. **Monitor Performance**:
   - Check response times
   - Monitor memory usage
   - Verify no errors in logs

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Ensure all dependencies are included in `.next/standalone/node_modules/`

### Issue: Static files not loading

**Solution**: Verify `.next/static/` and `public/` directories are copied correctly

### Issue: Environment variables not set

**Solution**: Check Appwrite environment variable configuration matches your `.env.local` values

### Issue: Port conflicts

**Solution**: Ensure `PORT=3000` is set and Appwrite routes traffic correctly

## Alternative: GitHub Actions Workflow

For automated deployments, create `.github/workflows/deploy-appwrite.yml`:

```yaml
name: Deploy to Appwrite

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          NODE_OPTIONS: --max-old-space-size=4096
          NEXT_TELEMETRY_DISABLED: 1
      
      - name: Package for deployment
        run: chmod +x scripts/build-for-appwrite.sh && ./scripts/build-for-appwrite.sh
      
      - name: Deploy to Appwrite
        # Add Appwrite deployment step here
        # This could use Appwrite CLI, API, or Storage
```

## Best Practices

1. **Version Control**: Tag releases before deploying
2. **Testing**: Test builds locally before deploying
3. **Backups**: Keep previous deployment packages
4. **Monitoring**: Set up monitoring and alerts
5. **Documentation**: Document any custom deployment steps

## File Structure After Build

```
appwrite-deploy/
├── server.js              # Entry point
├── package.json           # Minimal package.json
├── node_modules/          # Production dependencies only
├── .next/
│   └── static/           # Static assets
└── public/               # Public files
```

## Next Steps

1. ✅ Build the application locally
2. ✅ Package using the build script
3. ⬜ Deploy to Appwrite using one of the methods above
4. ⬜ Verify deployment works
5. ⬜ Set up automated deployment (optional)

## Support

If you encounter issues:
- Check Appwrite documentation: https://appwrite.io/docs
- Review Appwrite community forums
- Check GitHub Issues for known problems
- Verify all environment variables are set correctly

