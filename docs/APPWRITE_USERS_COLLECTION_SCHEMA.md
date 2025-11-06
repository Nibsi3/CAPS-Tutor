# Users Collection Schema

## Collection Details

- **Collection ID**: `users` (exactly, lowercase)
- **Name**: `Users`

## Required Attributes

Add these attributes in the Appwrite Console:

### 1. firstName
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)

### 2. lastName
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)

### 3. email
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)

### 4. gradeLevel
- **Type**: Integer
- **Required**: No
- **Min**: 1
- **Max**: 12
- **Default**: (leave empty)

### 5. subjects
- **Type**: String Array
- **Required**: No
- **Default**: (leave empty)

### 6. language
- **Type**: String
- **Size**: 10
- **Required**: No
- **Default**: `en`

### 7. loginDates
- **Type**: String Array
- **Required**: No
- **Default**: (leave empty)

### 8. lastLoginDate
- **Type**: String
- **Size**: 50
- **Required**: No
- **Default**: (leave empty)

### 9. lastLoginTimestamp
- **Type**: String
- **Size**: 100
- **Required**: No
- **Default**: (leave empty)

### 10. totalStudyTimeMinutes
- **Type**: Integer
- **Required**: No
- **Min**: 0
- **Default**: 0

### 11. unlockedAchievements
- **Type**: String Array
- **Required**: No
- **Default**: (leave empty)

## Permissions

In the **Settings** tab, under **Permissions**:

### Create Permission
- Select: **"All users"**
- This allows authenticated users to create their own profile

### Read Permission
- Select: **"All users"**
- This allows users to read their own profile

### Update Permission
- Select: **"All users"**
- This allows users to update their own profile

### Delete Permission
- Leave empty or set to **None**
- Users should not be able to delete their profiles

## Important Notes

- **DO NOT** add attributes like `userId`, `username`, `passwordHash` - these are handled by Appwrite Authentication
- The document ID will be the user's ID from Appwrite Auth (automatically set)
- You only need the profile data attributes listed above
- The `$id`, `$createdAt`, `$updatedAt` are automatically added by Appwrite

## Quick Setup Checklist

- [ ] Collection ID is exactly `users` (lowercase)
- [ ] Added `firstName` (String, 255)
- [ ] Added `lastName` (String, 255)
- [ ] Added `email` (String, 255)
- [ ] Added `gradeLevel` (Integer, 1-12)
- [ ] Added `subjects` (String Array)
- [ ] Added `language` (String, default: "en")
- [ ] Added `loginDates` (String Array)
- [ ] Added `lastLoginDate` (String)
- [ ] Added `lastLoginTimestamp` (String)
- [ ] Added `totalStudyTimeMinutes` (Integer, default: 0)
- [ ] Added `unlockedAchievements` (String Array)
- [ ] Set Create permission to "All users"
- [ ] Set Read permission to "All users"
- [ ] Set Update permission to "All users"
- [ ] Save the collection

