# Debug userprogress Collection Error

## The Issue

You're getting "Collection with the requested ID could not be found" error, but:
- ✅ Collection exists (`userprogress`)
- ✅ Permissions are set correctly (Users: Create, Read, Update)
- ✅ Server-side queries work

## Real Cause

The error message is **misleading**. It's likely a **query error**, not a collection error. Common causes:

1. **Missing Indexes** - Queries on non-indexed attributes fail
2. **Missing Attributes** - Query references attributes that don't exist
3. **Wrong Attribute Names** - Case sensitivity issues (e.g., `userID` vs `userId`)

## Diagnostic Steps

### Step 1: Run Diagnostic Endpoint

Visit this URL in your browser:
```
http://localhost:9002/api/debug-userprogress?test=all
```

This will show you:
- ✅ Which queries work
- ❌ Which queries fail
- 📋 All attributes in the collection
- 📋 All indexes in the collection

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/dashboard/practice` or `/dashboard/progress`
4. Look for detailed error messages

The improved error handling will now show:
- Actual error code
- Error message
- Which query failed
- Whether it's an attribute/index issue

### Step 3: Common Issues and Fixes

#### Issue 1: Missing Index on `userID`

**Symptoms:**
- Query by `userID` fails
- Error mentions "index" or "attribute"

**Fix:**
1. Go to Appwrite Console → `userProgress` collection
2. Go to **Indexes** tab
3. Create index:
   - **Key**: `userID_index`
   - **Type**: Key
   - **Attributes**: `userID` (Ascending)

#### Issue 2: Missing Index on `gradeLevel`

**Symptoms:**
- Query with `Query.equal('gradeLevel', ...)` fails
- Practice page doesn't load

**Fix:**
1. Go to **Indexes** tab
2. Create index:
   - **Key**: `userID_gradeLevel_index`
   - **Type**: Key
   - **Attributes**: `userID` (Ascending), `gradeLevel` (Ascending)

#### Issue 3: Missing Index on `masteryLevel`

**Symptoms:**
- Query with `Query.lessThan('masteryLevel', ...)` or `Query.orderAsc('masteryLevel')` fails
- Practice page doesn't load

**Fix:**
1. Go to **Indexes** tab
2. Create index:
   - **Key**: `userID_masteryLevel_index`
   - **Type**: Key
   - **Attributes**: `userID` (Ascending), `masteryLevel` (Ascending)

#### Issue 4: Attribute Name Mismatch

**Symptoms:**
- Query uses `userID` (capital ID) but attribute is `userId` (lowercase d)
- Or vice versa

**Fix:**
- Check the actual attribute name in Appwrite Console
- Update code to match exactly (case-sensitive)

## Required Indexes for userprogress Collection

Based on the queries used in the code, you need these indexes:

### 1. userID_index (Required)
- **Key**: `userID_index`
- **Type**: Key
- **Attributes**: `userID` (Ascending)
- **Purpose**: Query by user ID

### 2. userID_gradeLevel_index (Required for Practice Page)
- **Key**: `userID_gradeLevel_index`
- **Type**: Key
- **Attributes**: `userID` (Ascending), `gradeLevel` (Ascending)
- **Purpose**: Query by user ID and grade level

### 3. userID_masteryLevel_index (Required for Practice Page)
- **Key**: `userID_masteryLevel_index`
- **Type**: Key
- **Attributes**: `userID` (Ascending), `masteryLevel` (Ascending)
- **Purpose**: Query by user ID with mastery level filtering and sorting

### 4. userID_subject_index (Optional but Recommended)
- **Key**: `userID_subject_index`
- **Type**: Key
- **Attributes**: `userID` (Ascending), `subject` (Ascending)
- **Purpose**: Query by user ID and subject

## Quick Fix Checklist

1. ✅ Run diagnostic: `http://localhost:9002/api/debug-userprogress?test=all`
2. ✅ Check which queries fail
3. ✅ Verify attributes exist (userID, gradeLevel, masteryLevel, etc.)
4. ✅ Create missing indexes
5. ✅ Test again

## Still Not Working?

If the diagnostic endpoint shows all tests pass but you still get errors:

1. **Check Browser Console** - Look for the detailed error message
2. **Check Network Tab** - See the actual API response
3. **Check Query Parameters** - Make sure user ID and other parameters are correct
4. **Clear Browser Cache** - Try incognito mode
5. **Restart Dev Server** - After creating indexes, restart your Next.js server

## Test the Fix

After creating indexes:

1. Visit: `http://localhost:9002/api/debug-userprogress?test=all`
2. All tests should pass ✅
3. Go to `/dashboard/practice` - should load without errors
4. Go to `/dashboard/progress` - should load without errors

