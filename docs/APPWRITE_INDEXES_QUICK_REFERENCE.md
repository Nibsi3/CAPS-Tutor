# Quick Reference: Which Indexes to Create

## Understanding Indexes

**Single-Attribute Index**: Indexes one attribute (e.g., just `userId`)
- Use when: You query by that attribute alone

**Composite Index**: Indexes multiple attributes together (e.g., `userId` + `subject`)
- Use when: You query by multiple attributes together (e.g., "get all progress for user X in subject Y")

## For `studentProgress` Collection

### ✅ Required Indexes (Create These)

1. **`idx_userId`** - Single attribute
   - Column: `userId` only
   - Why: Query all progress for a specific user
   - **Does NOT include other attributes**

2. **`idx_userId_subject`** - Composite (2 attributes)
   - Columns: `userId` + `subject`
   - Why: Filter progress by user AND subject
   - **Must include userId because we always filter by user first**

3. **`idx_userId_completed`** - Composite (2 attributes)
   - Columns: `userId` + `completed`
   - Why: Filter completed vs incomplete progress for a user
   - **Must include userId because we always filter by user first**

### ⭐ Recommended Indexes (Optional but Helpful)

4. **`idx_lastAccessed`** - Single attribute
   - Column: `lastAccessed` only
   - Order: Descending
   - Why: Sort by most recent activity
   - **Does NOT need userId - this is for sorting, not filtering**

5. **`idx_userId_topic`** - Composite (2 attributes)
   - Columns: `userId` + `topic`
   - Why: Filter progress by user AND topic
   - **Must include userId**

6. **`idx_userId_gradeLevel`** - Composite (2 attributes)
   - Columns: `userId` + `gradeLevel`
   - Why: Filter progress by user AND grade
   - **Must include userId**

### ❌ Don't Create Indexes For

- `learningObjectiveId` - Not queried directly
- `masteryLevel` - Not queried directly
- `type` - Not queried directly

## Key Rule

**If an attribute says "indexed" in the documentation:**
- It means it SHOULD have an index
- But NOT necessarily with `userId`
- Create the index based on how you'll query it:
  - Query by attribute alone? → Single-attribute index
  - Query by userId + attribute? → Composite index with userId

## Example Queries and Their Indexes

| Query | Index Needed |
|-------|-------------|
| Get all progress for user X | `idx_userId` |
| Get progress for user X in subject Y | `idx_userId_subject` |
| Get completed progress for user X | `idx_userId_completed` |
| Sort all progress by recent activity | `idx_lastAccessed` |
| Get progress for user X on topic Y | `idx_userId_topic` |

## Quick Checklist

For `studentProgress` collection:

- [ ] `idx_userId` (single: `userId`)
- [ ] `idx_userId_subject` (composite: `userId` + `subject`)
- [ ] `idx_userId_completed` (composite: `userId` + `completed`)
- [ ] `idx_lastAccessed` (single: `lastAccessed`, Descending) - Optional
- [ ] `idx_userId_topic` (composite: `userId` + `topic`) - Optional
- [ ] `idx_userId_gradeLevel` (composite: `userId` + `gradeLevel`) - Optional

