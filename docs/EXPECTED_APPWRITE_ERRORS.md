# Expected Appwrite Errors

## "User (role: guests) missing scopes (["account"])"

### Status: ✅ **EXPECTED BEHAVIOR - NOT A REAL ERROR**

This error message appears in the browser console when a user is **not logged in** (guest user). This is **completely normal** and indicates that:

1. The user is not authenticated
2. The app is correctly checking for authentication
3. Guest users don't have the "account" scope (which is expected)

### Why This Happens

When the app loads, it tries to check if there's an active user session by calling `account.get()`. If no session exists (user is not logged in), Appwrite returns this error because:

- Guest users have limited permissions
- They don't have the "account" scope required to access account information
- This is Appwrite's way of saying "no active session"

### Is This a Problem?

**No, this is not a problem.** The app handles this error gracefully:

1. The error is caught and handled
2. The user state is set to `null` (not logged in)
3. The app continues to work normally
4. Users can still browse public content
5. Users can log in when they're ready

### How It's Handled

The error is handled in `src/appwrite/provider.tsx`:

```typescript
// Check for missing scope errors (guests don't have account scope - this is normal)
const isMissingScopeError = 
  errorMessage.includes('missing scope') ||
  errorMessage.includes('guests') && errorMessage.includes('account');

if (isMissingScopeError) {
  // This is expected - user is not logged in
  // Set user to null and continue
  setUserAuthState({ user: null, isUserLoading: false, userError: null });
}
```

### When to Worry

You should only be concerned if:

1. **Logged-in users** see this error (they shouldn't)
2. The error persists **after** successful login
3. The app **fails to function** because of this error

### Suppressing the Console Error

If you want to suppress this error in the console (it's just noise), you can:

1. **Filter it in browser DevTools**:
   - Open DevTools → Console
   - Click the filter icon
   - Add a negative filter: `-missing scopes`

2. **Or ignore it** - It doesn't affect functionality

### Related Errors

Similar expected errors:
- `401 Unauthorized` - User not logged in
- `general_unauthorized_scope` - Guest user permissions
- `Timeout` - Network delay (temporary)

All of these are handled the same way - they indicate the user is not authenticated, which is normal for public pages.

### Summary

✅ **This error is EXPECTED for logged-out users**  
✅ **The app handles it correctly**  
✅ **No action needed**  
❌ **Not a bug or issue**

If you see this error when a user **is** logged in, then it's a real issue that needs investigation.

