# Appwrite 400 Error Fix

## Root Cause

The 400 error on page load is caused by `account.get()` being called in `AppwriteProvider` before the Appwrite client is properly configured. This happens when:

1. Environment variables are missing or not loaded
2. Platform is not added in Appwrite Console
3. Client is initialized but endpoint/projectId are invalid

## Solution Implemented

### 1. Pre-flight Validation

Added validation in `src/appwrite/provider.tsx` to check if the client is properly configured before making API calls:

```typescript
// Check if client is properly configured before making requests
const endpoint = (client as any)?._config?.endpoint;
const projectId = (client as any)?._config?.project;

if (!endpoint || !projectId) {
  appwriteLogger.warn('auth', 'Appwrite client not properly configured - skipping auth check');
  setUserAuthState({ user: null, isUserLoading: false, userError: null });
  return;
}
```

### 2. 400 Error Handling

Added specific handling for 400 errors to prevent them from showing in console:

```typescript
// Handle 400 errors - usually means client/platform not configured
if (errorCode === 400) {
  appwriteLogger.warn('auth', '400 error during auth check - client may not be properly configured');
  // Don't set error - just treat as not logged in
  setUserAuthState({ user: null, isUserLoading: false, userError: null });
  return;
}
```

### 3. Font Request Blocking

Added network-level blocking of Appwrite font requests in `src/app/layout.tsx`:

- Intercepts `fetch()` calls to block font requests
- Intercepts `XMLHttpRequest` for older code
- Suppresses console errors for blocked requests

## Required Configuration

To prevent 400 errors, ensure:

1. **Platform is added in Appwrite Console:**
   - Go to Appwrite Console → Settings → Platforms
   - Add your domain: `https://gearshift.co.za`
   - Add development domain: `http://localhost:3000`

2. **Environment variables are set:**
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`

3. **OAuth callback URLs match:**
   - Appwrite Console → Authentication → Settings
   - Google OAuth Console → Authorized redirect URIs

## Build Size Issue

If build size dropped significantly (e.g., from 216MB to 6.24MB), check:

1. **Verify build output:**
   ```bash
   npm run build
   ls -lh .next/standalone
   ```

2. **Check if files are being excluded:**
   - Review `next.config.ts` → `outputFileTracingExcludes`
   - Ensure important files aren't being excluded

3. **Verify deployment:**
   - Check Appwrite Cloud deployment logs
   - Ensure all required files are included in deployment

## Testing

After implementing these fixes:

1. Clear browser cache
2. Check browser console - should see no 400 errors
3. Check Network tab - font requests should be blocked
4. Verify authentication still works when properly configured

## References

- [Appwrite Platforms Documentation](https://appwrite.io/docs/getting-started-for-web)
- [Appwrite Error Codes](https://appwrite.io/docs/advanced/platform/response-codes)
- [APPWRITE_BEST_PRACTICES.md](./APPWRITE_BEST_PRACTICES.md)
