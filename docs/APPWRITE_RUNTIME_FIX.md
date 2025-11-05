# Appwrite Runtime Fix - Site Timeout Issue

## Problem
Build completes successfully (~4 minutes) but site times out with 400 error when accessing.

## Root Cause
Appwrite Functions may not be correctly configured to run the Next.js standalone server. The entry point needs to be set correctly.

## Solution

### 1. Check Appwrite Function Entry Point

In Appwrite Console → Functions → Your Function → Settings:

**Entry Point should be:**
```
node .next/standalone/server.js
```

**OR if Appwrite uses relative paths from build root:**
```
server.js
```

### 2. Verify Environment Variables

Ensure these are set in Appwrite Function settings:

- `PORT=3000` (or the port Appwrite assigns)
- `NODE_ENV=production`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID=690a39bf0011810ee554`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` (your database ID)

### 3. Check Appwrite Function Runtime Settings

- **Runtime**: Node.js 20.x
- **Entry Point**: `node .next/standalone/server.js` or `server.js`
- **Working Directory**: Leave default (usually `/usr/local/build`)

### 4. Alternative: Use Custom Entry Point Script

If Appwrite doesn't find the server.js automatically, create a custom entry point:

Create `index.js` in project root:
```javascript
// index.js - Entry point for Appwrite Functions
const { spawn } = require('child_process');
const path = require('path');

// Start Next.js standalone server
const serverPath = path.join(__dirname, '.next/standalone/server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || 3000,
    HOSTNAME: '0.0.0.0',
  },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

Then set entry point to: `node index.js`

### 5. Check Logs

In Appwrite Console → Functions → Your Function → Logs:

Look for:
- Server startup messages
- Port binding errors
- Missing environment variable errors
- Module resolution errors

### 6. Verify Standalone Output Structure

After build, verify `.next/standalone/server.js` exists:
- The build log shows "Detected standalone Next.js build"
- This confirms `server.js` was created

## Quick Fix Checklist

1. ✅ Entry point set to `node .next/standalone/server.js`
2. ✅ PORT environment variable set
3. ✅ All NEXT_PUBLIC_* variables configured
4. ✅ Runtime is Node.js 20.x
5. ✅ Check function logs for startup errors

## If Still Not Working

The issue might be that Appwrite Functions expects a different structure. Consider:

1. **Check Appwrite's build output location** - The standalone folder might be in a different location
2. **Use Appwrite Sites instead of Functions** - Sites is better suited for full Next.js apps
3. **Check if Appwrite supports standalone mode** - Some platforms require different configurations

