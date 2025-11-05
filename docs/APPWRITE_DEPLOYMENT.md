# Appwrite Deployment Guide

## Current Status

This document tracks the deployment process for the CAPS Tutor Next.js application to Appwrite Cloud.

## Build Configuration

### Current Setup
- **Next.js Version**: 15.3.3
- **Output Mode**: `standalone` (creates `.next/standalone` directory)
- **Build Command**: `NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096 NEXT_TELEMETRY_DISABLED=1 next build`
- **Memory Allocation**: 4GB (4096MB)

### Files Created
- `Dockerfile` - Multi-stage Docker build for standalone deployment
- `.dockerignore` - Excludes large files from build context
- `scripts/verify-build.sh` - Verifies build output structure
- `scripts/post-build.sh` - Post-build verification script

## Known Issues

### Build Timeout Issue
**Problem**: Build fails with "Build archive was not created" after ~90 seconds

**Root Cause**: 
- Appwrite appears to have a hard timeout limit (~90-120 seconds)
- Next.js builds can take longer than this limit, especially for large applications
- Appwrite is running `npm run build` directly, not using Dockerfile

**Attempted Solutions**:
1. ✅ Added `output: 'standalone'` to next.config.ts
2. ✅ Optimized webpack configuration (disabled expensive analysis)
3. ✅ Reduced memory allocation from 6GB to 4GB
4. ✅ Disabled source maps in production
5. ✅ Excluded large files from build context (.dockerignore, outputFileTracingExcludes)
6. ✅ Simplified chunk splitting strategy
7. ✅ Disabled telemetry collection
8. ✅ Created Dockerfile for potential Docker-based deployment

**Current Status**: Build still times out after ~90 seconds

## Appwrite Configuration

### Required Settings (if using Appwrite Console)

When deploying via Appwrite Console, ensure these settings:

1. **Install Command**: `npm install`
2. **Build Command**: `npm run build`
3. **Output Directory**: 
   - For standalone: `./.next/standalone` (if Appwrite supports it)
   - Standard Next.js: `./.next`
4. **Runtime**: Node.js 20.x
5. **Entry Point**: `node server.js` (for standalone mode)

### Dockerfile Configuration

If Appwrite can use Docker (check your Appwrite plan):
- The `Dockerfile` is configured for multi-stage build
- Outputs minimal production image from `.next/standalone`
- Entry point: `node server.js`
- Port: 3000

## Alternative Deployment Approaches

If the build timeout persists, consider these alternatives:

### Option 1: Pre-build Locally and Deploy

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Verify standalone output**:
   ```bash
   ls -la .next/standalone
   ```

3. **Deploy only built files**:
   - Upload `.next/standalone`, `.next/static`, and `public` directories
   - Configure Appwrite to use these pre-built files
   - Set entry point to `node server.js`

**Pros**: 
- Avoids build timeout
- Faster deployments after initial build
- Can test builds locally first

**Cons**:
- Requires local build environment
- Can't use Appwrite's automatic builds
- Manual deployment process

### Option 2: Use Different Deployment Platform

Consider alternatives that support longer build times:

1. **Vercel** (Recommended for Next.js)
   - Native Next.js support
   - Automatic optimizations
   - Generous build time limits
   - Free tier available

2. **Railway**
   - Docker-based deployment
   - No strict build timeouts
   - Easy deployment from GitHub

3. **Render**
   - Docker support
   - Longer build time limits
   - Free tier available

4. **Fly.io**
   - Docker-based
   - Good for Node.js apps
   - Flexible configuration

### Option 3: Optimize Build Further

If you want to continue with Appwrite:

1. **Split the application**:
   - Move API routes to separate Appwrite Functions
   - Use static export for frontend (if API routes can be externalized)

2. **Reduce build size**:
   - Remove unused dependencies
   - Optimize images and assets
   - Use dynamic imports more aggressively
   - Consider code splitting

3. **Contact Appwrite Support**:
   - Request increased build timeout limit
   - Ask about Docker-based deployment options
   - Request guidance on Next.js standalone deployment

### Option 4: Hybrid Approach

1. **Build on CI/CD** (GitHub Actions, etc.)
2. **Deploy built artifacts to Appwrite**:
   - Use Appwrite's storage API
   - Upload built files programmatically
   - Configure Appwrite to use pre-built files

## Verification Scripts

### Verify Build Output
```bash
bash scripts/verify-build.sh
```

This script checks:
- `.next` directory exists
- `.next/standalone` directory exists (for standalone mode)
- `server.js` entry point exists
- Static files are present
- Public directory exists

### Post-Build Verification
```bash
bash scripts/post-build.sh
```

Creates a `.build-success` marker file to indicate successful build completion.

## Next Steps

1. **Test current configuration** with latest optimizations
2. **If timeout persists**, consider Option 1 (pre-build) or Option 2 (different platform)
3. **Contact Appwrite support** about timeout limits
4. **Monitor build logs** for any specific errors beyond timeout

## References

- [Appwrite Sites Documentation](https://appwrite.io/docs/products/sites)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output#standalone)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Troubleshooting

### Build fails with "Build archive was not created"
- Check build logs for specific errors
- Verify all required files are present
- Check if build completed but output isn't found
- Ensure output directory is correctly configured

### Build times out
- Reduce build complexity
- Exclude more files from build
- Consider pre-building locally
- Contact Appwrite support about timeout limits

### Dockerfile not used
- Appwrite may not use Dockerfile automatically
- Check Appwrite plan/features for Docker support
- May need to configure explicitly in Appwrite console

