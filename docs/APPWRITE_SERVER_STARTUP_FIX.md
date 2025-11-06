# Fix: Next.js Server Not Starting (400 Error)

## Problem

The build succeeds, but the server returns 400 errors on all routes, including `/api/health`. This means the Next.js server isn't starting correctly.

## Root Cause

Appwrite Cloud Sites might not be correctly starting the Next.js standalone server. The build creates `.next/standalone/server.js`, but Appwrite might not know how to start it.

## Solution 1: Check Runtime Logs

1. Go to **Appwrite Console** → **Your Deployment** → **Logs**
2. Look for **runtime logs** (not build logs)
3. Check for:
   - Server startup messages
   - Port binding errors
   - Missing file errors
   - Environment variable errors

## Solution 2: Try Standard Next.js Output (Recommended)

Appwrite Cloud Sites might not fully support standalone mode. Try using standard Next.js output:

### Step 1: Remove Standalone Mode

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... other config ...
  // Remove or comment out this line:
  // output: 'standalone',
  
  // Keep everything else the same
};
```

### Step 2: Update Appwrite Settings

1. **Output Directory:** `./.next` (keep as is)
2. **Build Command:** `npm run build` (keep as is)
3. **No custom entry point needed** - Appwrite will automatically use `next start`

### Step 3: Redeploy

1. Commit and push the change
2. Redeploy in Appwrite Console
3. Wait for deployment to complete
4. Test the health endpoint again

## Solution 3: Verify Environment Variables at Runtime

Even though environment variables are set, they might not be available at runtime:

1. **Check Runtime Logs** for environment variable errors
2. **Verify Variables Are Set** in deployment settings (not just build settings)
3. **Check Variable Names** - ensure they start with `NEXT_PUBLIC_` for client-side access

## Solution 4: Check Port Configuration

The server might not be binding to the correct port:

1. **Check Runtime Logs** for port binding errors
2. **Verify PORT Environment Variable** is set (Appwrite usually sets this automatically)
3. **Check HOSTNAME** - should be `0.0.0.0` to listen on all interfaces

## Solution 5: Manual Server Start Test

If you have access to the deployment environment, try starting the server manually:

```bash
# For standalone mode
cd .next/standalone
node server.js

# For standard mode
npm start
```

## Most Likely Fix

**Try Solution 2 first** - remove standalone mode and use standard Next.js output. Appwrite Cloud Sites might not fully support Next.js standalone mode yet.

## Verification

After making changes:

1. ✅ Build completes successfully
2. ✅ Runtime logs show server starting
3. ✅ `/api/health` returns 200 OK
4. ✅ Root page loads correctly
5. ✅ No 400 errors

## Still Not Working?

1. **Check Appwrite Documentation:**
   - Look for Next.js deployment guides
   - Check for known issues with standalone mode
   - Verify Appwrite Cloud Sites supports Next.js 15

2. **Contact Appwrite Support:**
   - Share your build logs
   - Share your runtime logs
   - Ask about Next.js standalone mode support
   - Request help with server startup

3. **Alternative: Use Different Deployment Platform:**
   - **Vercel** - Native Next.js support, free tier
   - **Railway** - Docker-based, good Next.js support
   - **Render** - Good Next.js support, free tier

