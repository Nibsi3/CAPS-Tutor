# Fix userprogress Collection Indexes

## The Problem

Your query uses `masteryLevel` for filtering and sorting, but there's no index on `masteryLevel`. This causes the query to fail.

## Current Indexes ✅

You have these indexes:
- ✅ `idx_userId` - `userID`
- ✅ `idx_userId_subject` - `userID, subject`
- ✅ `idx_userId_completed` - `userID, completed`
- ✅ `idx_lastAccessed` - `lastAccessed`
- ✅ `idx_userId_topic` - `userID, topic`
- ✅ `idx_userId_gradeLevel` - `userID, gradeLevel`

## Missing Index ❌

The practice page query uses:
```typescript
Query.equal('userID', user.$id),
Query.equal('gradeLevel', userProfile.gradeLevel),
Query.lessThan('masteryLevel', 70),  // ❌ No index on masteryLevel
Query.orderAsc('masteryLevel'),      // ❌ No index on masteryLevel
```

**You need an index that includes `masteryLevel`!**

## Solution: Create Composite Index

### Create `idx_userId_gradeLevel_masteryLevel` Index

1. Go to Appwrite Console → `userProgress` collection
2. Go to **Indexes** tab
3. Click **+ Create Index**
4. Set the following:
   - **Key**: `idx_userId_gradeLevel_masteryLevel`
   - **Type**: Key
   - **Attributes**: 
     - `userID` (Ascending)
     - `gradeLevel` (Ascending)
     - `masteryLevel` (Ascending)
5. Click **Create**

### Why This Index?

This composite index supports the exact query pattern used in the practice page:
- Filter by `userID` ✅
- Filter by `gradeLevel` ✅
- Filter by `masteryLevel` with `lessThan` ✅
- Sort by `masteryLevel` ✅

## Optional: Additional Indexes

If you want to optimize other queries, you can also create:

### `idx_userId_masteryLevel` (Optional)

- **Key**: `idx_userId_masteryLevel`
- **Type**: Key
- **Attributes**: 
  - `userID` (Ascending)
  - `masteryLevel` (Ascending)
- **Purpose**: For queries that filter by userID and masteryLevel without gradeLevel

## Test the Fix

After creating the index:

1. **Wait 30 seconds** - Indexes can take a moment to build
2. **Run diagnostic**: `http://localhost:9002/api/debug-userprogress?test=all`
3. **Check complexQuery test** - Should pass ✅
4. **Go to `/dashboard/practice`** - Should load without errors ✅

## Why Indexes Matter

In Appwrite, queries that use:
- **Filtering** (`Query.equal`, `Query.lessThan`, etc.)
- **Sorting** (`Query.orderAsc`, `Query.orderDesc`)

...require indexes on those attributes. Without indexes, the query will fail with an error (which might appear as "Collection not found" in some cases).

## Index Best Practices

1. **Composite indexes** should include attributes in the order they're used in queries
2. **Start with the most selective attribute** (usually `userID` in user-scoped collections)
3. **Include all filtered attributes** before sorted attributes
4. **Don't create too many indexes** - Each index uses storage and slows down writes

## Current Query Pattern

```typescript
// Practice Page Query
Query.equal('userID', user.$id),           // Filter 1
Query.equal('gradeLevel', userProfile.gradeLevel), // Filter 2
Query.lessThan('masteryLevel', 70),        // Filter 3
Query.orderAsc('masteryLevel'),            // Sort
Query.limit(10)

// Required Index: userID, gradeLevel, masteryLevel (all ascending)
```

This matches the composite index: `idx_userId_gradeLevel_masteryLevel`

