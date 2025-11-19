# System Settings Collection Setup Guide

## Collection Details

**Collection ID:** `systemSettings` (lowercase, exactly as shown)

**Document ID:** `systemSettings` (the collection will contain a single document with this ID)

## Required Attributes

Create the following attributes in your Appwrite `systemSettings` collection:

### 1. maintenanceMode
- **Type:** Boolean
- **Required:** No (optional)
- **Array:** No
- **Default Value:** `false`
- **Description:** Whether the system is in maintenance mode

### 2. maintenanceMessage
- **Type:** String
- **Size:** 1000 characters
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty string)
- **Description:** Message to display during maintenance mode

### 3. maintenanceDuration
- **Type:** String
- **Size:** 255 characters
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty string)
- **Description:** Expected duration of maintenance (e.g., "2 hours")

### 4. features
- **Type:** JSON (or String if JSON not available)
- **Size:** 2000 characters (if String type)
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty or JSON object)
- **Description:** Feature flags object with boolean values
- **Structure:**
  ```json
  {
    "aiTutor": true,
    "pastPapers": true,
    "practiceQuestions": true,
    "weeklyTasks": false,
    "achievements": true,
    "progressTracking": true
  }
  ```

### 5. aiConfig
- **Type:** JSON (or String if JSON not available)
- **Size:** 1000 characters (if String type)
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty or JSON object)
- **Description:** AI configuration settings
- **Structure:**
  ```json
  {
    "responseLimit": 100,
    "safetyFilters": true,
    "difficultyLevel": "medium"
  }
  ```

### 6. cacheSettings
- **Type:** JSON (or String if JSON not available)
- **Size:** 500 characters (if String type)
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty or JSON object)
- **Description:** Cache configuration settings
- **Structure:**
  ```json
  {
    "autoUpdate": true,
    "updateFrequency": "daily"
  }
  ```

### 7. retentionPolicies
- **Type:** JSON (or String if JSON not available)
- **Size:** 500 characters (if String type)
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty or JSON object)
- **Description:** Data retention policy settings
- **Structure:**
  ```json
  {
    "userData": "7years",
    "activityLogs": "2years"
  }
  ```

### 8. customSubjects
- **Type:** String Array
- **Required:** No (optional)
- **Array:** Yes
- **Default Value:** (empty array)
- **Description:** Array of custom subjects added by admins globally

## Permissions

Set the following permissions for the `systemSettings` collection:

### Read Permissions
- **Users:** Read access (so users can see maintenance mode status, etc.)
- **Admins:** Full read access

### Create Permissions
- **Admins only:** Only administrators should be able to create the initial settings document

### Update Permissions
- **Admins only:** Only administrators should be able to update system settings

### Delete Permissions
- **Admins only:** Only administrators should be able to delete system settings (though this is rarely needed)

## Step-by-Step Creation in Appwrite Console

1. **Go to Appwrite Console**
   - Navigate to your project
   - Click on "Databases" in the left sidebar
   - Select your database

2. **Create Collection**
   - Click "Create Collection"
   - Enter Collection ID: `systemSettings` (lowercase, exactly)
   - Click "Create"

3. **Add Attributes**
   - Click on the "Attributes" tab
   - Add each attribute listed above using "Create Attribute"
   - For JSON attributes, if Appwrite doesn't support JSON type, use String type with appropriate size
   - Make sure to set the correct type, size, and required status

4. **Set Permissions**
   - Click on the "Permissions" tab
   - Configure read/write/delete permissions as described above

5. **Create Initial Document (Optional)**
   - After creating the collection, you can create the initial document with ID `systemSettings`
   - Or let the application create it automatically when settings are first saved

## Initial Document Structure

When creating the initial document, use this structure:

```json
{
  "$id": "systemSettings",
  "maintenanceMode": false,
  "maintenanceMessage": "",
  "maintenanceDuration": "",
  "features": {
    "aiTutor": true,
    "pastPapers": true,
    "practiceQuestions": true,
    "weeklyTasks": false,
    "achievements": true,
    "progressTracking": true
  },
  "aiConfig": {
    "responseLimit": 100,
    "safetyFilters": true,
    "difficultyLevel": "medium"
  },
  "cacheSettings": {
    "autoUpdate": true,
    "updateFrequency": "daily"
  },
  "retentionPolicies": {
    "userData": "7years",
    "activityLogs": "2years"
  },
  "customSubjects": []
}
```

## Important Notes

1. **Document ID:** The system expects a single document with ID `systemSettings` in this collection
2. **JSON Attributes:** If Appwrite doesn't support JSON type, use String type and store JSON as a string. The application will parse it.
3. **Auto-Creation:** The application will automatically create the document if it doesn't exist when settings are first saved
4. **Case Sensitivity:** Collection ID must be exactly `systemSettings` (lowercase 's' in Settings)

## Verification

After creating the collection:

1. Try accessing the admin panel's Content Control page
2. The error should disappear
3. You should be able to save system settings
4. Settings should persist after page refresh

## Troubleshooting

If you still get errors:

1. **Check Collection ID:** Must be exactly `systemSettings` (lowercase, no spaces)
2. **Verify Attributes:** All attributes should exist (even if optional)
3. **Check Permissions:** Ensure your API key has the necessary permissions
4. **Restart Server:** After creating the collection, restart your Next.js dev server
5. **Check Document ID:** The document ID should be `systemSettings` (same as collection ID)

