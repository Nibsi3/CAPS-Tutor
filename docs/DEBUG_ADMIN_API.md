# Debug Admin API Issues

## Quick Test

Visit this URL in your browser (while your dev server is running):
```
http://localhost:9002/api/test-admin
```

This will show you a detailed diagnostic of what's working and what's not.

## Common Issues and Solutions

### 1. API Key Not Set

**Symptoms:**
- Error: "APPWRITE_API_KEY environment variable is required"
- Test endpoint shows: "API Key exists: ❌"

**Solution:**
1. Check that `.env.local` exists in your project root
2. Add `APPWRITE_API_KEY=your_api_key_here` to `.env.local`
3. Restart your development server
4. Verify the key is loaded: Check server console for API key validation messages

### 2. API Key Invalid or Wrong Scopes

**Symptoms:**
- Error code: 401 or 403
- Error: "Authorization failed"
- Test endpoint shows: "Query Admin Collection: ❌"

**Solution:**
1. Go to Appwrite Console → Settings → API Keys
2. Verify your API key has `databases.read` scope
3. If not, create a new API key with `databases.read` scope
4. Update `.env.local` with the new key
5. Restart your development server

### 3. Collection Not Found

**Symptoms:**
- Error code: 404
- Error: "Admin collection not found"
- Test endpoint shows: "Admin Collection Exists: ❌"

**Solution:**
1. Go to Appwrite Console → Databases → `capstutor`
2. Check if collection exists:
   - If it's named something else (e.g., `admins`, `adminid`), update the code
   - If it doesn't exist, create it with ID `adminId`
3. Verify collection ID is exactly `adminId` (case-sensitive)

### 4. Admin Document Has Wrong Status

**Symptoms:**
- API returns `isAdmin: false` but `adminExists: true`
- Message: "Admin found but status is 'admin' instead of 'active'"

**Solution:**
1. Go to Appwrite Console → Databases → `capstutor` → `adminId`
2. Edit the admin document
3. Change `status` from `"admin"` to `"active"`
4. Change `role` from `"admin"` to `"superadmin"`
5. Save the document

### 5. Email Mismatch

**Symptoms:**
- API returns `isAdmin: false`
- No error messages
- Test endpoint shows: "Query Admin Collection: ⚠️ No admin document found"

**Solution:**
1. Verify the email in the admin document matches your login email exactly
2. Check for case sensitivity: `cameronfalck03@gmail.com` vs `CameronFalck03@gmail.com`
3. Check for typos or extra spaces

## Step-by-Step Debugging

### Step 1: Test the API Endpoint

Open your browser and go to:
```
http://localhost:9002/api/test-admin
```

This will show you:
- ✅/❌ API Key exists
- ✅/❌ Database ID configured
- ✅/❌ Databases initialized
- ✅/❌ Admin collection exists
- ✅/❌ Can query admin collection
- Admin document details (if found)

### Step 2: Check Server Logs

Look at your terminal where the dev server is running. You should see:
- Error messages with detailed information
- API key validation messages
- Query results

### Step 3: Check Browser Console

Open browser DevTools (F12) → Console tab. Look for:
- Admin check errors
- API response details
- Warning messages about admin status

### Step 4: Check Network Tab

Open browser DevTools (F12) → Network tab:
1. Filter by "check-admin"
2. Click on the request
3. Check the Response tab for error details
4. Check the Headers tab for request/response headers

## Expected Behavior

When everything is working correctly:

1. **Test Endpoint** (`/api/test-admin`) should show all ✅ checks
2. **Browser Console** should show no errors
3. **Admin Toggle Button** should appear in the header
4. **API Response** should return `{ isAdmin: true, adminData: {...} }`

## Still Not Working?

If you've checked everything above and it's still not working:

1. **Check the test endpoint** first: `http://localhost:9002/api/test-admin`
2. **Copy the full error message** from the test endpoint
3. **Check server logs** for detailed error messages
4. **Verify environment variables** are loaded (restart server after changing `.env.local`)
5. **Check Appwrite Console** to verify:
   - Collection exists with correct ID
   - Admin document exists with correct email
   - Document has `status: "active"` and `role: "superadmin"`

## Contact for Help

If you're still having issues, provide:
1. Output from `/api/test-admin` endpoint
2. Server log error messages
3. Browser console errors
4. Network tab response from `/api/check-admin`

