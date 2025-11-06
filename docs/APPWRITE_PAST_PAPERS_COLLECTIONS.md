# Past Papers Collections Setup

This document explains how to create the `pastPapers` and `pastPaperProgress` collections in Appwrite.

## Collection 1: pastPapers

**Collection ID:** `pastPapers`  
**Database:** `capstutor`  
**Purpose:** Stores past exam papers uploaded by teachers/admins

### Attributes:

1. **teacherId** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Description: The Appwrite user ID of the teacher/admin who uploaded the paper

2. **gradeLevel** (Integer)
   - Required: Yes
   - Array: No
   - Min: 1
   - Max: 12
   - Indexed: Yes
   - Description: Grade level (typically 12 for past papers)

3. **subject** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Description: Subject name (e.g., "Mathematics Paper 1", "Physical Sciences")

4. **year** (String)
   - Size: 10
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Description: Year the exam was administered (e.g., "2023")

5. **paperName** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: No
   - Description: Original filename of the paper PDF

6. **memoName** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: No
   - Description: Original filename of the memo PDF

7. **status** (String)
   - Size: 50
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Default: "Processing"
   - Description: Processing status ("Processing", "Processed", "Failed")

8. **questionCount** (Integer)
   - Required: Yes
   - Array: No
   - Default: 0
   - Indexed: No
   - Description: Number of questions extracted from the paper

9. **generatedQuestions** (String Array)
   - Size: 10000 (or large enough for JSON)
   - Required: No
   - Array: Yes
   - Indexed: No
   - Description: Array of generated questions (stored as JSON strings)

### Permissions:

**Role: Users**
- Create: ✅ Yes (for admins/teachers)
- Read: ✅ Yes (all users can view past papers)
- Update: ✅ Yes (for admins/teachers)
- Delete: ✅ Yes (for admins/teachers)

**Note:** You may want to restrict Create/Update/Delete to admin users only. You can do this by checking the user's email in your code.

### Indexes:

1. **idx_gradeLevel** - Key index on `gradeLevel` (Ascending)
2. **idx_subject** - Key index on `subject` (Ascending)
3. **idx_year** - Key index on `year` (Ascending)
4. **idx_status** - Key index on `status` (Ascending)
5. **idx_gradeLevel_subject** - Composite index on `gradeLevel` + `subject` (both Ascending)
6. **idx_teacherId** - Key index on `teacherId` (Ascending)

---

## Collection 2: pastPaperProgress

**Collection ID:** `pastPaperProgress`  
**Database:** `capstutor`  
**Purpose:** Tracks user progress on past papers (which question they're on)

### Attributes:

1. **userId** (String) - **Note: lowercase 'd' (userId), not 'userID'**
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Description: The Appwrite user ID of the student

2. **paperId** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Description: The document ID of the past paper from `pastPapers` collection

3. **currentQuestion** (Integer)
   - Required: Yes
   - Array: No
   - Default: 0
   - Indexed: No
   - Description: The current question number the user is on

4. **lastAccessed** (String)
   - Size: 100
   - Required: Yes
   - Array: No
   - Indexed: Yes
   - Description: ISO date string of when the user last accessed this paper

5. **paperSubject** (String) - Optional
   - Size: 255
   - Required: No
   - Array: No
   - Indexed: No
   - Description: Subject name (for quick reference)

6. **paperYear** (String) - Optional
   - Size: 10
   - Required: No
   - Array: No
   - Indexed: No
   - Description: Year (for quick reference)

7. **paperName** (String) - Optional
   - Size: 255
   - Required: No
   - Array: No
   - Indexed: No
   - Description: Paper name (for quick reference)

### Permissions:

**Role: Users**
- Create: ✅ Yes (users can create their own progress)
- Read: ✅ Yes (users can read their own progress)
- Update: ✅ Yes (users can update their own progress)
- Delete: ❌ No (users cannot delete progress)

### Indexes:

1. **idx_userId** - Key index on `userId` (Ascending)
2. **idx_paperId** - Key index on `paperId` (Ascending)
3. **idx_userId_lastAccessed** - Composite index on `userId` + `lastAccessed` (both Ascending, lastAccessed Descending)
4. **idx_lastAccessed** - Key index on `lastAccessed` (Descending)

---

## Quick Setup Guide

### For pastPapers Collection:

1. Go to Appwrite Console → Databases → `capstutor`
2. Click **+ Create Collection**
3. Collection ID: `pastPapers`
4. Name: `Past Papers`
5. Add all attributes listed above
6. Set permissions (Users: Create, Read, Update, Delete)
7. Create indexes

### For pastPaperProgress Collection:

1. Go to Appwrite Console → Databases → `capstutor`
2. Click **+ Create Collection**
3. Collection ID: `pastPaperProgress`
4. Name: `Past Paper Progress`
5. Add all attributes listed above
6. Set permissions (Users: Create, Read, Update - not Delete)
7. Create indexes

## Important Notes

- **Attribute name difference**: `pastPaperProgress` uses `userId` (lowercase 'd'), while `userprogress` uses `userID` (uppercase 'ID'). This is intentional based on how the collections were created.
- These collections are **optional** - the app will work without them, but past paper features won't function.
- The `pastPapers` collection is mainly used by admins to upload and manage past papers.
- The `pastPaperProgress` collection tracks which question a user is currently on in a past paper.

