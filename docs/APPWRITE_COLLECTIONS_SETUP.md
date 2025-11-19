# Appwrite Collections Setup Guide

## Required Collections

Your CAPS Tutor app needs the following collections in Appwrite:

### 1. User Collection

**Collection ID:** `user` (singular, not plural)

**Note:** The collection ID must be exactly `user` (lowercase, singular). The code has been updated to use `user` instead of `users`.

See [User Collection Schema](./APPWRITE_USERS_COLLECTION_SCHEMA.md) for detailed setup instructions.

### 2. Student Progress Collection

**Collection ID:** `studentProgress`

**Note:** This collection is required for tracking student learning progress.

See [Student Progress Collection Setup](./APPWRITE_STUDENT_PROGRESS_COLLECTION.md) for detailed setup instructions.

### 3. System Settings Collection

**Collection ID:** `systemSettings`

**Note:** This collection is required for admin panel functionality, subject availability configuration, and system-wide settings.

See [System Settings Collection Setup](./APPWRITE_SYSTEM_SETTINGS_COLLECTION.md) for detailed setup instructions.

---

## Quick Reference

### 1. Users Collection (Legacy - Updated to `user`)

**Collection ID:** `user` (updated from `users`)

**Purpose:** Stores user profiles and preferences

**Attributes:**
- `firstName` (String, 255 chars)
- `lastName` (String, 255 chars)
- `email` (String, 255 chars)
- `gradeLevel` (Integer, 1-12)
- `subjects` (String array) - Selected subjects
- `language` (String, default: "en")
- `loginDates` (String array) - Array of login dates
- `lastLoginDate` (String)
- `lastLoginTimestamp` (String)
- `totalStudyTimeMinutes` (Integer)
- `unlockedAchievements` (String array)
- `preferences` (JSON object, optional)

**Permissions:**
- **Create:** Users (can create their own document)
- **Read:** Users (can read their own document)
- **Update:** Users (can update their own document)
- **Delete:** None (users cannot delete their own profile)

**Indexes:**
- `email` (unique)

### 2. Past Papers Collection (if needed)

**Collection ID:** `pastPapers`

**Purpose:** Stores past paper metadata and questions

**Note:** This may already exist if you migrated from Firestore.

## How to Create Collections in Appwrite

### Step 1: Go to Appwrite Console

1. Navigate to: https://cloud.appwrite.io/console
2. Select your project: **CAPS Tutor**

### Step 2: Create Users Collection

1. Go to **Databases** → Select your database (`capstutor`)
2. Click **Create Collection**
3. Collection ID: `users`
4. Name: `Users`
5. Click **Create**

### Step 3: Add Attributes

Click **Add Attribute** for each attribute:

#### Text Attributes:
- `firstName` - String, 255 chars, Required: No
- `lastName` - String, 255 chars, Required: No
- `email` - String, 255 chars, Required: No
- `language` - String, 100 chars, Required: No, Default: "en"
- `lastLoginDate` - String, 50 chars, Required: No
- `lastLoginTimestamp` - String, 100 chars, Required: No

#### Integer Attributes:
- `gradeLevel` - Integer, Required: No, Min: 1, Max: 12

#### String Array Attributes:
- `subjects` - String array, Required: No
- `loginDates` - String array, Required: No
- `unlockedAchievements` - String array, Required: No

#### Integer Attributes:
- `totalStudyTimeMinutes` - Integer, Required: No, Default: 0

#### JSON Attributes (Optional):
- `preferences` - JSON object, Required: No

### Step 4: Set Permissions

1. Go to the **Settings** tab of the collection
2. Under **Permissions**, add:
   - **Create**: `users` (Users can create)
   - **Read**: `users` (Users can read)
   - **Update**: `users` (Users can update)

### Step 5: Create Index (Optional but Recommended)

1. Go to **Indexes** tab
2. Click **Create Index**
3. Index Key: `email`
4. Index Type: Unique
5. Attributes: `email`
6. Click **Create**

## Quick Setup Script

Alternatively, you can use the Appwrite CLI or create collections programmatically. However, the easiest way is through the console as described above.

## Verify Setup

After creating the collection:

1. Try signing in again
2. The app should automatically create a user document on first login
3. Check the Appwrite Console → Databases → Collections → users to see your profile

## Troubleshooting

**Error: "Collection with the requested ID could not be found"**
- Make sure the collection ID is exactly `users` (lowercase)
- Verify you're using the correct database ID
- Check that the collection exists in Appwrite Console

**Error: "Permission denied"**
- Make sure permissions are set correctly (users can create/read/update)
- Verify you're logged in

**Error: "Attribute not found"**
- Make sure all required attributes are created
- Check attribute names match exactly (case-sensitive)


