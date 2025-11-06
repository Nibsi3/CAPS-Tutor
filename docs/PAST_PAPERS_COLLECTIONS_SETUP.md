# Past Papers Collections - Complete Setup Guide

This guide will help you create both `pastPapers` and `pastPaperProgress` collections in Appwrite.

---

## Collection 1: pastPapers

**Collection ID:** `pastPapers` (exact, lowercase 'p', capital 'P')  
**Collection Name:** `Past Papers`  
**Database:** `capstutor`

### Step 1: Create the Collection

1. Go to: https://cloud.appwrite.io/console
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor**
4. Click **+ Create Collection**
5. **Collection ID**: `pastPapers` (exact spelling)
6. **Name**: `Past Papers`
7. Click **Create**

### Step 2: Add Attributes

Go to the **Attributes** tab and add these attributes:

#### 1. teacherId (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty

#### 2. gradeLevel (Integer)
- **Type**: Integer
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Min**: 1
- **Max**: 12
- **Default**: 12
- **Indexed**: ✅ Yes

#### 3. subject (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty

#### 4. year (String)
- **Type**: String
- **Size**: 10
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty

#### 5. paperName (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty

#### 6. memoName (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty

#### 7. status (String)
- **Type**: String
- **Size**: 50
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: `Processing`
- **Description**: Status values: "Processing", "Processed", "Failed"

#### 8. questionCount (Integer)
- **Type**: Integer
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Min**: 0
- **Default**: 0
- **Indexed**: ❌ No

#### 9. generatedQuestions (String Array)
- **Type**: String
- **Size**: 10000 (or as large as possible)
- **Required**: ❌ No
- **Array**: ✅ Yes
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Stores generated questions as JSON strings in an array

### Step 3: Set Permissions

Go to the **Settings** tab:

- **Role: Users**
  - **Create**: ✅ Yes
  - **Read**: ✅ Yes
  - **Update**: ✅ Yes
  - **Delete**: ✅ Yes

**Note:** In production, you might want to restrict Create/Update/Delete to admin users only.

### Step 4: Create Indexes (Optional but Recommended)

Go to the **Indexes** tab:

1. **idx_gradeLevel**
   - Type: Key
   - Column: `gradeLevel` (Ascending)

2. **idx_subject**
   - Type: Key
   - Column: `subject` (Ascending)

3. **idx_year**
   - Type: Key
   - Column: `year` (Ascending)

4. **idx_status**
   - Type: Key
   - Column: `status` (Ascending)

5. **idx_teacherId**
   - Type: Key
   - Column: `teacherId` (Ascending)

6. **idx_gradeLevel_subject** (Composite)
   - Type: Key
   - Columns: `gradeLevel` (Ascending), `subject` (Ascending)

---

## Collection 2: pastPaperProgress

**Collection ID:** `pastPaperProgress` (exact, lowercase 'p', capital 'P')  
**Collection Name:** `Past Paper Progress`  
**Database:** `capstutor`

### Step 1: Create the Collection

1. Go to: https://cloud.appwrite.io/console
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor**
4. Click **+ Create Collection**
5. **Collection ID**: `pastPaperProgress` (exact spelling)
6. **Name**: `Past Paper Progress`
7. Click **Create**

### Step 2: Add Attributes

Go to the **Attributes** tab and add these attributes:

#### 1. userId (String) - **Important: lowercase 'd'**
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Note**: Must be `userId` (lowercase 'd'), NOT `userID`

#### 2. paperId (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Description**: The document ID from the `pastPapers` collection

#### 3. currentQuestion (Integer)
- **Type**: Integer
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Min**: 0
- **Default**: 0
- **Indexed**: ❌ No
- **Description**: The question number the user is currently on

#### 4. lastAccessed (String)
- **Type**: String
- **Size**: 100
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Description**: ISO date string (e.g., "2024-01-15T10:30:00Z")

#### 5. paperSubject (String) - Optional
- **Type**: String
- **Size**: 255
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty

#### 6. paperYear (String) - Optional
- **Type**: String
- **Size**: 10
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty

#### 7. paperName (String) - Optional
- **Type**: String
- **Size**: 255
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty

### Step 3: Set Permissions

Go to the **Settings** tab:

- **Role: Users**
  - **Create**: ✅ Yes
  - **Read**: ✅ Yes
  - **Update**: ✅ Yes
  - **Delete**: ❌ No

### Step 4: Create Indexes (Optional but Recommended)

Go to the **Indexes** tab:

1. **idx_userId**
   - Type: Key
   - Column: `userId` (Ascending)

2. **idx_paperId**
   - Type: Key
   - Column: `paperId` (Ascending)

3. **idx_lastAccessed**
   - Type: Key
   - Column: `lastAccessed` (Descending)

4. **idx_userId_lastAccessed** (Composite)
   - Type: Key
   - Columns: `userId` (Ascending), `lastAccessed` (Descending)

---

## Quick Checklist

### pastPapers Collection:
- [ ] Collection created with ID: `pastPapers`
- [ ] All 9 attributes added
- [ ] Permissions set (Users: CRUD)
- [ ] Indexes created (optional)

### pastPaperProgress Collection:
- [ ] Collection created with ID: `pastPaperProgress`
- [ ] All 7 attributes added
- [ ] **Important**: `userId` attribute uses lowercase 'd' (not `userID`)
- [ ] Permissions set (Users: CRU, not Delete)
- [ ] Indexes created (optional)

## After Creating Collections

1. **Refresh your browser** (`Ctrl+Shift+R`)
2. **Test the Past Papers page** - Go to `/dashboard/past-papers`
3. The errors should be gone!

## Troubleshooting

### "Collection not found" error persists:
- Verify collection IDs are exactly: `pastPapers` and `pastPaperProgress` (case-sensitive)
- Check they're in the `capstutor` database
- Make sure permissions are set

### "Unknown attribute" error:
- Verify all required attributes are created
- Check attribute names match exactly (case-sensitive)
- Make sure `userId` in `pastPaperProgress` uses lowercase 'd'

