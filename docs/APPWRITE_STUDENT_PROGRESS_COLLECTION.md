# Student Progress Collection Setup

This document explains how to create the `studentProgress` collection in Appwrite for tracking student learning progress.

## Collection Details

- **Collection ID**: `studentProgress`
- **Database**: `capstutor`

## Attributes

Create the following attributes in the `studentProgress` collection:

### 1. `userId` (String)
- **Type**: String
- **Size**: 255
- **Required**: Yes
- **Array**: No
- **Indexed**: Yes (for querying by user)
- **Description**: The Appwrite user ID of the student

### 2. `learningObjectiveId` (String)
- **Type**: String
- **Size**: 255
- **Required**: Yes
- **Array**: No
- **Indexed**: Yes (for querying by learning objective)
- **Description**: Unique identifier for the learning objective or topic

### 3. `masteryLevel` (Integer)
- **Type**: Integer
- **Required**: Yes
- **Array**: No
- **Indexed**: No
- **Min**: 0
- **Max**: 100
- **Default**: 0
- **Description**: Mastery level as a percentage (0-100)

### 4. `completed` (Boolean)
- **Type**: Boolean
- **Required**: Yes
- **Array**: No
- **Indexed**: Yes (for filtering completed items)
- **Default**: false
- **Description**: Whether the learning objective has been completed

### 5. `lastAccessed` (String)
- **Type**: String
- **Size**: 100
- **Required**: Yes
- **Array**: No
- **Indexed**: Yes (for sorting by recent activity)
- **Description**: ISO date string of when the student last accessed this objective

### 6. `topic` (String) - Optional
- **Type**: String
- **Size**: 255
- **Required**: No
- **Array**: No
- **Indexed**: Yes (for filtering by topic)
- **Description**: The topic name (e.g., "Algebra", "Fractions")

### 7. `subject` (String) - Optional
- **Type**: String
- **Size**: 100
- **Required**: No
- **Array**: No
- **Indexed**: Yes (for filtering by subject)
- **Description**: The subject name (e.g., "Mathematics", "Physical Sciences")

### 8. `gradeLevel` (Integer) - Optional
- **Type**: Integer
- **Required**: No
- **Array**: No
- **Indexed**: Yes (for filtering by grade)
- **Min**: 1
- **Max**: 12
- **Description**: The grade level (1-12)

### 9. `type` (String) - Optional
- **Type**: String
- **Size**: 100
- **Required**: No
- **Array**: No
- **Indexed**: No
- **Description**: Type of activity (e.g., "quiz", "practice", "lesson")

### 10. `score` (Integer) - Optional
- **Type**: Integer
- **Required**: No
- **Array**: No
- **Indexed**: No
- **Min**: 0
- **Description**: Score achieved (if applicable)

### 11. `totalQuestions` (Integer) - Optional
- **Type**: Integer
- **Required**: No
- **Array**: No
- **Indexed**: No
- **Min**: 0
- **Description**: Total number of questions (if applicable)

## Permissions

Set the following permissions for the `studentProgress` collection:

### Role: Users
- **Create**: ✅ Checked (Users can create their own progress records)
- **Read**: ✅ Checked (Users can read their own progress records)
- **Update**: ✅ Checked (Users can update their own progress records)
- **Delete**: ❌ Unchecked (Users cannot delete progress records)

**Important**: You may need to add query rules to ensure users can only access their own progress. In Appwrite, you can use collection-level permissions or add a query filter in your code (which is already implemented using `Query.equal('userId', user.$id)`).

## Step-by-Step Setup

1. **Go to Appwrite Console**
   - Navigate to: https://cloud.appwrite.io/console
   - Select your project: **CAPS Tutor**

2. **Navigate to Databases**
   - Click on **Databases** in the left sidebar
   - Select the **capstutor** database

3. **Create Collection**
   - Click **+ Create Collection**
   - **Collection ID**: `studentProgress`
   - **Name**: `Student Progress`
   - Click **Create**

4. **Add Attributes**
   - Click on the **studentProgress** collection
   - Go to the **Attributes** tab
   - Add each attribute listed above using the **+ Create Attribute** button
   - Make sure to set the correct type, size, and required settings for each

5. **Set Permissions**
   - Go to the **Settings** tab
   - Under **Permissions**, add the **Users** role
   - Set Create, Read, and Update permissions as described above

6. **Create Indexes (Optional but Recommended)**
   - Go to the **Indexes** tab
   - See [Indexes Guide](./APPWRITE_INDEXES_GUIDE.md) for detailed step-by-step instructions
   
   **Required Indexes:**
   - `userId` (single attribute - for querying all user progress)
     - Index ID: `idx_userId`
     - Type: Key
     - Column: `userId` (Ascending)
   
   - `userId` + `subject` (composite - for filtering by user and subject)
     - Index ID: `idx_userId_subject`
     - Type: Key
     - Columns: `userId` (Ascending), `subject` (Ascending)
   
   - `userId` + `completed` (composite - for filtering completed items)
     - Index ID: `idx_userId_completed`
     - Type: Key
     - Columns: `userId` (Ascending), `completed` (Ascending)
   
   **Optional but Recommended:**
   - `lastAccessed` (single attribute - for sorting by recent activity)
     - Index ID: `idx_lastAccessed`
     - Type: Key
     - Column: `lastAccessed` (Descending)
   
   - `userId` + `topic` (composite - for filtering by user and topic)
     - Index ID: `idx_userId_topic`
     - Type: Key
     - Columns: `userId` (Ascending), `topic` (Ascending)
   
   **Note:** You don't need to create indexes for `learningObjectiveId`, `masteryLevel`, or `type` unless you plan to query by them directly.

## Usage in Code

The collection is used in several places:

- **Progress Page** (`/dashboard/progress`): Displays student progress by subject
- **Practice Page** (`/dashboard/practice`): Saves progress after completing practice quizzes
- **Achievements Page** (`/dashboard/achievements`): Tracks progress for achievement unlocks

## Example Document Structure

```json
{
  "$id": "unique_document_id",
  "userId": "user_abc123",
  "learningObjectiveId": "math_algebra_fractions_001",
  "masteryLevel": 85,
  "completed": true,
  "lastAccessed": "2024-01-15T10:30:00Z",
  "topic": "Algebraic Fractions",
  "subject": "Mathematics",
  "gradeLevel": 10,
  "type": "quiz",
  "score": 17,
  "totalQuestions": 20
}
```

## Troubleshooting

If you see errors like "Collection 'studentProgress' not found":
1. Verify the collection ID is exactly `studentProgress` (lowercase, no spaces)
2. Check that the collection is in the `capstutor` database
3. Ensure permissions are set correctly
4. Verify all required attributes are created

