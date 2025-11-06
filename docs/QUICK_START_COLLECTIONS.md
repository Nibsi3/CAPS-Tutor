# Quick Start: Create Appwrite Collections

## The Error You're Seeing

```
Collection with the requested ID could not be found.
```

This means the `users` collection doesn't exist in your Appwrite database.

## Quick Fix (5 minutes)

### Step 1: Open Appwrite Console
Go to: **https://cloud.appwrite.io/console**

### Step 2: Select Your Project
Click on: **CAPS Tutor**

### Step 3: Go to Databases
1. Click **Databases** in the left sidebar
2. Click on your database: **capstutor**

### Step 4: Create Users Collection
1. Click **Create Collection** button
2. **Collection ID**: `users` (must be exactly this, lowercase)
3. **Name**: `Users`
4. Click **Create**

### Step 5: Add Minimum Required Attributes

Click **Add Attribute** for each:

#### Text Attributes:
1. **firstName**
   - Type: String
   - Size: 255
   - Required: No

2. **lastName**
   - Type: String
   - Size: 255
   - Required: No

3. **email**
   - Type: String
   - Size: 255
   - Required: No

#### Integer Attributes:
4. **gradeLevel**
   - Type: Integer
   - Required: No
   - Min: 1
   - Max: 12

#### String Array Attributes:
5. **subjects**
   - Type: String Array
   - Required: No

6. **loginDates**
   - Type: String Array
   - Required: No

7. **unlockedAchievements**
   - Type: String Array
   - Required: No

#### Integer Attributes:
8. **totalStudyTimeMinutes**
   - Type: Integer
   - Required: No
   - Default: 0

#### String Attributes (Optional but Recommended):
9. **language**
   - Type: String
   - Size: 10
   - Required: No
   - Default: "en"

10. **lastLoginDate**
    - Type: String
    - Size: 50
    - Required: No

11. **lastLoginTimestamp**
    - Type: String
    - Size: 100
    - Required: No

### Step 6: Set Permissions

1. Go to the **Settings** tab
2. Under **Permissions**, click **Add Role**
3. Add these permissions:
   - **Create**: Select "Users" role
   - **Read**: Select "Users" role  
   - **Update**: Select "Users" role
   - **Delete**: Leave empty (users can't delete their profile)

### Step 7: Save and Test

1. Click **Save** or the collection will auto-save
2. Go back to your app
3. Refresh the page
4. Try signing in again

## That's It!

Once the collection is created, the app will automatically:
- Create user profile documents when users sign in
- Store user preferences
- Track login dates and study time
- Save achievements

## Need More Help?

See `docs/APPWRITE_COLLECTIONS_SETUP.md` for:
- Complete attribute list
- Advanced permissions
- Index creation
- Troubleshooting

## Common Issues

**"Collection ID already exists"**
- The collection might already exist with a different name
- Check your collections list
- Make sure the ID is exactly `users` (lowercase)

**"Permission denied" after creating collection**
- Make sure you set permissions (Step 6)
- Users need Create, Read, and Update permissions

**Still getting errors?**
- Check the browser console for the exact error message
- Verify the database ID in `.env.local` matches your Appwrite database
- Make sure you're logged into the correct Appwrite project

