# Fix userprogress Index (2 Column Limit)

## The Problem

Appwrite indexes are limited to **2 attributes** per index. The practice page query needs to filter by:
- `userID`
- `gradeLevel`
- `masteryLevel` (with `lessThan` and `orderAsc`)

But we can only create indexes with 2 columns.

## The Solution

Create an index on `userID, masteryLevel` and filter by `gradeLevel` in the application code (client-side).

## Step 1: Create the Index

1. Go to Appwrite Console → `userProgress` collection
2. Go to **Indexes** tab
3. Click **+ Create Index**
4. Set the following:
   - **Key**: `idx_userId_masteryLevel`
   - **Type**: Key
   - **Attributes**: 
     - `userID` (Ascending)
     - `masteryLevel` (Ascending)
5. Click **Create**

## Step 2: Code Changes

The code has been updated to:
1. Query by `userID` and `masteryLevel` only (using the new index)
2. Filter by `gradeLevel` in JavaScript after fetching
3. Fetch more records (50 instead of 10) to account for client-side filtering

## Why This Works

- **Database Query**: Filters by `userID` (indexed) and `masteryLevel < 70` (indexed), sorted by `masteryLevel`
- **Client-Side Filter**: Filters by `gradeLevel` in JavaScript after fetching
- **Performance**: Still efficient because:
  - Most filtering happens in the database (userID, masteryLevel)
  - Only fetches records with mastery < 70%
  - GradeLevel filtering is fast in JavaScript (small dataset)

## Current Indexes

You should have:
- ✅ `idx_userId` - `userID`
- ✅ `idx_userId_subject` - `userID, subject`
- ✅ `idx_userId_completed` - `userID, completed`
- ✅ `idx_lastAccessed` - `lastAccessed`
- ✅ `idx_userId_topic` - `userID, topic`
- ✅ `idx_userId_gradeLevel` - `userID, gradeLevel`
- ✅ `idx_userId_masteryLevel` - `userID, masteryLevel` (NEW - CREATE THIS)

## Test the Fix

After creating the index:

1. **Wait 30 seconds** - Index needs to build
2. **Refresh browser** - Hard refresh (`Ctrl+Shift+R`)
3. **Go to `/dashboard/practice`** - Should load without errors ✅
4. **Check browser console** - No more collection errors ✅

## Alternative Approach (If Needed)

If you have many records and client-side filtering is too slow, you could:

1. Create two separate queries:
   - One for each grade level
   - Filter by gradeLevel in the query
   - Combine results client-side

2. But the current approach (single query + client-side filter) should work well for most cases.

## Performance Notes

- **Database Query**: Uses index on `userID, masteryLevel` - very fast
- **Client-Side Filter**: Filters by `gradeLevel` - fast for small datasets (< 1000 records)
- **Sorting**: Already sorted by `masteryLevel` in the database query
- **Limit**: Fetches 50 records max, so client-side filtering is always fast

## Summary

**Create this index:**
- `idx_userId_masteryLevel` (userID, masteryLevel)

**The code now:**
- Queries by userID and masteryLevel (uses index)
- Filters by gradeLevel in JavaScript (fast)
- No more collection errors! ✅

