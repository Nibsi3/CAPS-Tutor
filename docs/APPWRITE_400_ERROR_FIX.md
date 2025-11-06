# Fixing 400 Error on Appwrite Cloud Deployment

## The Problem

Your app shows a 400 error when trying to load, which means the Next.js server isn't starting correctly.

## Diagnostic Steps

### Step 1: Check Build Logs

1. Go to **Appwrite Console** → **Your Deployment** → **Logs**
2. Look for:
   - ✅ Build completed successfully
   - ✅ Server starting on port 3000
   - ❌ Build errors
   - ❌ Server startup errors
   - ❌ Missing files errors

### Step 2: Test Health Endpoint

Try accessing: `https://caps-tutor-personal-projects.appwrite.network/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "environment": "production",
  "appwriteConfigured": {
    "endpoint": true,
    "projectId": true,
    "databaseId": true
  }
}
```

**If health endpoint works:**
- Server is running ✅
- Issue is with the root page (likely SSR/rendering issue)

**If health endpoint also returns 400:**
- Server isn't starting correctly ❌
- Check build logs and configuration

### Step 3: Verify Build Output

Check if the build created the standalone output:

1. **In Appwrite Console** → **Your Deployment** → **Logs**
2. Look for messages about `.next/standalone` directory
3. Or check if you can see build artifacts

**Expected files after build:**
- `.next/standalone/server.js` (entry point)
- `.next/standalone/package.json`
- `.next/static/` (static assets)
- `public/` (public assets)

## Common Causes and Fixes

### Issue 1: Output Directory Mismatch

**Problem:** Appwrite might not be using the standalone output correctly.

**Fix Options:**

#### Option A: Try Standard Next.js Mode (Not Standalone)

1. **Temporarily remove standalone mode:**
   - In `next.config.ts`, comment out: `output: 'standalone'`
   - Change output directory to: `./.next`
   - Redeploy

2. **If this works:**
   - Appwrite might not fully support standalone mode
   - Consider using standard Next.js output

#### Option B: Configure Entry Point

If Appwrite supports custom entry points:

1. **Set Output Directory:** `./.next/standalone`
2. **Set Entry Point:** `node server.js`
3. **Set Working Directory:** `./.next/standalone`

**Note:** Appwrite Cloud Sites might not support custom entry points. Check Appwrite documentation.

### Issue 2: Server-Side Rendering Error

**Problem:** The root page (`/`) might be failing during SSR.

**Fix:** Add error boundary to catch SSR errors:

1. Check browser console for specific error messages
2. Look for React hydration errors
3. Check for missing environment variables during SSR

### Issue 3: Port Configuration

**Problem:** Server might not be listening on the correct port.

**Fix:** Ensure environment variables are set:
- `PORT=3000` (or whatever port Appwrite assigns)
- `HOSTNAME=0.0.0.0` (to listen on all interfaces)

### Issue 4: Build Didn't Complete

**Problem:** Build might have failed or timed out.

**Fix:**
1. Check build logs for errors
2. Verify build completed successfully
3. If build times out, see `docs/APPWRITE_DEPLOYMENT.md` for solutions

## Quick Fix: Try Standard Next.js Output

If standalone mode isn't working, try standard Next.js output:

### Step 1: Update next.config.ts

```typescript
const nextConfig: NextConfig = {
  // ... other config ...
  // Comment out or remove this line:
  // output: 'standalone',
  
  // Keep everything else the same
};
```

### Step 2: Update Appwrite Settings

1. **Output Directory:** `./.next`
2. **Build Command:** `npm run build`
3. **No custom entry point needed** (Appwrite will use `next start`)

### Step 3: Redeploy

1. Commit and push changes
2. Redeploy in Appwrite Console
3. Check if the app loads

## Alternative: Use Static Export (If No SSR Needed)

If you don't need server-side rendering:

### Step 1: Update next.config.ts

```typescript
const nextConfig: NextConfig = {
  // ... other config ...
  output: 'export', // Static export
  // Remove output: 'standalone'
};
```

### Step 2: Update Appwrite Settings

1. **Rendering Options:** Select "Static site"
2. **Output Directory:** `./out`
3. **Build Command:** `npm run build`

**Note:** This won't work if you have:
- API routes (`/api/*`)
- Server components that need runtime data
- Dynamic routes that need SSR

## Verification Checklist

After making changes:

- [ ] Build completes successfully (check logs)
- [ ] Health endpoint works: `/api/health`
- [ ] Root page loads: `/`
- [ ] No 400 errors in browser console
- [ ] Environment variables are set correctly
- [ ] Server logs show successful startup

## Still Not Working?

1. **Check Appwrite Documentation:**
   - [Appwrite Sites Docs](https://appwrite.io/docs/products/sites)
   - Look for Next.js-specific deployment guides

2. **Contact Appwrite Support:**
   - Ask about Next.js standalone mode support
   - Request help with 400 error on deployment
   - Share your build logs

3. **Try Alternative Deployment:**
   - Vercel (native Next.js support)
   - Railway (Docker-based)
   - Render (good Next.js support)

## Debugging Commands

If you have SSH access to the deployment:

```bash
# Check if server.js exists
ls -la .next/standalone/server.js

# Check if static files exist
ls -la .next/static

# Check environment variables
env | grep NEXT_PUBLIC

# Try starting server manually
cd .next/standalone
node server.js
```

## Next Steps

1. **First:** Test the health endpoint to see if server is running
2. **Then:** Check build logs for specific errors
3. **Finally:** Try standard Next.js output if standalone isn't working

