# Appwrite Best Practices Guide

This guide is based on the official [Appwrite Documentation](https://appwrite.io/docs) to ensure proper configuration and prevent common errors.

## Critical Configuration Steps

### 1. Platform Configuration (REQUIRED for CORS)

**Why:** Appwrite requires you to register your application's domain as a platform to allow CORS requests. Without this, you'll get CORS errors.

**Steps:**

1. Go to **Appwrite Console** → **Settings** → **Platforms**
2. Click **Add Platform**
3. Select **Web** platform type
4. Add your domains:
   - **Production**: `https://gearshift.co.za`
   - **Development**: `http://localhost:3000` (if testing locally)
5. Click **Create**

**Important Notes:**
- You must add both `http://localhost:3000` (for development) and your production domain
- The domain must match exactly (including protocol: `http://` vs `https://`)
- Wildcards are supported: `https://*.gearshift.co.za`
- This configuration prevents CORS errors when making API requests

**Reference:** [Appwrite Platforms Documentation](https://appwrite.io/docs/getting-started-for-web)

### 2. OAuth Provider Configuration

**Why:** OAuth providers must be configured in Appwrite Console with correct callback URLs.

**Steps:**

1. Go to **Appwrite Console** → **Authentication** → **Providers**
2. Enable **Google** (or your chosen provider)
3. Configure OAuth settings:
   - **App ID**: Your Google OAuth Client ID
   - **App Secret**: Your Google OAuth Client Secret
   - **Scopes**: `openid email profile` (default)
4. **Critical**: Add redirect URLs in Google Console:
   - `https://gearshift.co.za/auth/callback` (production)
   - `http://localhost:3000/auth/callback` (development)

**OAuth Redirect URLs in Appwrite:**
- Go to **Authentication** → **Settings**
- Add redirect URLs:
  - `https://gearshift.co.za/auth/callback`
  - `http://localhost:3000/auth/callback`

**Reference:** [Appwrite OAuth Documentation](https://appwrite.io/docs/products/auth/oauth)

### 3. Environment Variables

**Required Variables:**

```bash
# .env.local (for local development)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=690a39bf0011810ee554
NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor
```

**For Appwrite Cloud Deployment:**
- Set these in **Appwrite Console** → **Your Deployment** → **Settings** → **Environment Variables**
- Variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- After setting variables, **redeploy** your application

**Reference:** [Appwrite Environment Variables](https://appwrite.io/docs/environment-variables)

### 4. Client Initialization Best Practices

**Current Implementation:**
- ✅ Client initialized only on client-side (not server-side)
- ✅ Proper error handling for missing environment variables
- ✅ Singleton pattern to prevent multiple client instances

**Best Practices:**
- Always check if `window` is defined before initializing client
- Never initialize Appwrite client on server-side (Next.js SSR)
- Use environment variables, never hardcode credentials
- Validate configuration before making API calls

### 5. Error Handling

**Common Error Codes:**

- **400 Bad Request**: Invalid request parameters or malformed data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **412 Precondition Failed**: Provider not enabled or configured incorrectly

**Error Handling Pattern:**

```typescript
try {
  await account.createOAuth2Session(...);
} catch (error: any) {
  if (error.code === 412) {
    // Provider not enabled
  } else if (error.code === 400) {
    // Bad request - check parameters
  } else {
    // Other errors
  }
}
```

**Reference:** [Appwrite Error Codes](https://appwrite.io/docs/advanced/platform/response-codes)

### 6. CORS Font Errors (Harmless)

**Issue:** Fonts from `assets.appwrite.io` show CORS errors in console.

**Explanation:**
- These fonts are from Appwrite's console UI, not your application
- Your app uses Google Fonts (PT Sans, Space Grotesk, Source Code Pro)
- These errors are harmless and don't affect functionality
- Already suppressed in `src/app/layout.tsx`

**No Action Required:** These errors are cosmetic and can be ignored.

### 7. OAuth Callback URL Requirements

**Critical Requirements:**

1. **Must match exactly** in both:
   - Appwrite Console → Authentication → Settings → Redirect URLs
   - Google OAuth Console → Authorized redirect URIs

2. **Format:**
   ```typescript
   // In code
   `${window.location.origin}/auth/callback`
   
   // In Appwrite Console
   https://gearshift.co.za/auth/callback
   http://localhost:3000/auth/callback
   ```

3. **Common Mistakes:**
   - ❌ Trailing slashes: `https://gearshift.co.za/auth/callback/`
   - ❌ Missing protocol: `gearshift.co.za/auth/callback`
   - ❌ Wrong path: `/callback` instead of `/auth/callback`

**Reference:** [Appwrite OAuth Setup](https://appwrite.io/docs/products/auth/oauth)

### 8. Database Permissions

**Required Permissions:**

1. Go to **Appwrite Console** → **Databases** → **Your Database** → **Settings**
2. Configure collection permissions:
   - **Users Collection**: 
     - Read: `users` (authenticated users can read)
     - Create: `users` (users can create their own)
     - Update: `users` (users can update their own)
     - Delete: `users` (users can delete their own)

**Permission Format:**
- `users` - All authenticated users
- `user:{userId}` - Specific user
- `any` - Anyone (not recommended for sensitive data)

**Reference:** [Appwrite Permissions](https://appwrite.io/docs/permissions)

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Platform added in Appwrite Console (your domain)
- [ ] OAuth provider configured with correct callback URLs
- [ ] Environment variables set in Appwrite Cloud deployment
- [ ] Database permissions configured correctly
- [ ] OAuth redirect URLs match in both Appwrite and provider console
- [ ] Test OAuth flow in development environment
- [ ] Verify no hardcoded credentials in code
- [ ] Check error handling for all API calls

## Troubleshooting

### CORS Errors

**Symptom:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Verify platform is added in Appwrite Console
2. Check domain matches exactly (including protocol)
3. Clear browser cache and try again
4. Verify environment variables are set correctly

### 400 Errors

**Symptom:** `Failed to load resource: the server responded with a status of 400`

**Solution:**
1. Check request parameters are valid
2. Verify OAuth callback URLs match exactly
3. Check database collection exists
4. Verify user permissions
5. Review error message in browser console for details

### OAuth Callback Fails

**Symptom:** Redirected to login page after OAuth

**Solution:**
1. Verify callback URL matches in Appwrite Console
2. Check callback URL matches in OAuth provider console
3. Verify OAuth provider is enabled in Appwrite
4. Check browser console for specific error codes
5. Verify environment variables are set

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Quick Start for Next.js](https://appwrite.io/docs/quick-starts/nextjs)
- [Appwrite REST API Reference](https://appwrite.io/docs/apis/rest)
- [Appwrite GitHub Repository](https://github.com/appwrite/appwrite)
- [Appwrite Discord Community](https://discord.com/invite/appwrite)

## Code Examples

### Proper Client Initialization

```typescript
// ✅ Correct: Client-side only
'use client';

import { Client } from 'appwrite';

export function getClient(): Client | null {
  if (typeof window === 'undefined') {
    return null; // Server-side: return null
  }
  
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  
  if (!endpoint || !projectId) {
    console.error('Missing Appwrite configuration');
    return null;
  }
  
  return new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
}
```

### Proper OAuth Implementation

```typescript
// ✅ Correct: Dynamic callback URLs
await account.createOAuth2Session(
  OAuthProvider.Google,
  `${window.location.origin}/auth/callback`, // Success URL
  `${window.location.origin}/login`,        // Failure URL
);
```

### Proper Error Handling

```typescript
try {
  await account.createOAuth2Session(...);
} catch (error: any) {
  if (error.code === 412) {
    // Provider not enabled
    throw new Error('OAuth provider not enabled in Appwrite Console');
  } else if (error.code === 400) {
    // Bad request - check callback URLs
    throw new Error('Invalid OAuth configuration. Check callback URLs.');
  }
  throw error;
}
```

## Summary

Following these best practices ensures:
- ✅ No CORS errors (platform configured)
- ✅ No 400 errors (proper configuration)
- ✅ OAuth works correctly (callback URLs match)
- ✅ Proper error handling (user-friendly messages)
- ✅ Secure implementation (no hardcoded credentials)

**Remember:** Always refer to the [official Appwrite documentation](https://appwrite.io/docs) for the most up-to-date information.

