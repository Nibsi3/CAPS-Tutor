# System Settings Collection Setup Guide

## Collection Details

- **Collection ID**: `systemSettings` (exactly, lowercase)
- **Name**: `System Settings`

## Purpose

This collection stores system-wide configuration settings for the CAPS Tutor application, including:
- Maintenance mode settings
- Feature flags
- AI configuration
- Subject availability by grade
- Email/SMS integration settings
- Cache settings
- Data retention policies

## Step-by-Step Setup

### Step 1: Go to Appwrite Console

1. Navigate to: https://cloud.appwrite.io/console
2. Select your project: **CAPS Tutor**
3. Go to: **Databases** → Select your database (usually `capstutor`)

### Step 2: Create the Collection

1. Click **Create Collection**
2. **Collection ID**: `systemSettings` (must be exactly this, lowercase)
3. **Name**: `System Settings`
4. Click **Create**

### Step 3: Add Attributes

Click **+ Create Attribute** for each attribute below:

#### Boolean Attributes

**1. maintenanceMode**
- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Array**: ❌ Unchecked

#### String Attributes

**2. maintenanceMessage**
- **Type**: String
- **Size**: 1000
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**3. maintenanceDuration**
- **Type**: String
- **Size**: 100
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**4. emailProvider**
- **Type**: String
- **Size**: 100
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**5. smtpServer**
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**6. fromEmail**
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**7. smtpPassword**
- **Type**: String
- **Size**: 500
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Note**: This stores encrypted passwords (encrypt in production)

**8. smsProvider**
- **Type**: String
- **Size**: 100
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**9. smsApiKey**
- **Type**: String
- **Size**: 500
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Note**: This stores API keys (encrypt in production)

**10. updatedBy**
- **Type**: String
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

**11. updatedAt**
- **Type**: String
- **Size**: 100
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked

#### Integer Attributes

**12. smtpPort**
- **Type**: Integer
- **Required**: No
- **Min**: 1
- **Max**: 65535
- **Default**: `587`
- **Array**: ❌ Unchecked

#### JSON Attributes

**13. features**
- **Type**: JSON
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Structure**:
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

**14. aiConfig**
- **Type**: JSON
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Structure**:
  ```json
  {
    "responseLimit": 100,
    "safetyFilters": true,
    "difficultyLevel": "medium"
  }
  ```

**15. cacheSettings**
- **Type**: JSON
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Structure**:
  ```json
  {
    "autoUpdate": true,
    "updateFrequency": "daily"
  }
  ```

**16. retentionPolicies**
- **Type**: JSON
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Structure**:
  ```json
  {
    "userData": "7years",
    "activityLogs": "2years"
  }
  ```

**17. availability**
- **Type**: JSON
- **Required**: No
- **Default**: (leave empty)
- **Array**: ❌ Unchecked
- **Structure**: Record of grade (string) to array of subject names
  ```json
  {
    "10": ["Mathematics", "Physical Sciences", ...],
    "11": ["Mathematics", "Physical Sciences", ...],
    "12": ["Mathematics", "Physical Sciences", ...]
  }
  ```

### Step 4: Set Permissions

1. Go to the **Settings** tab of the collection
2. Under **Permissions**, set:
   - **Create**: Leave empty (only server-side API can create)
   - **Read**: Leave empty (only server-side API can read)
   - **Update**: Leave empty (only server-side API can update)
   - **Delete**: Leave empty (only server-side API can delete)

**Note**: This collection should only be accessible via server-side API calls (using API key), not by client-side users.

### Step 5: Create Initial Documents (Optional)

After creating the collection, you can create initial documents with these document IDs:

#### Document 1: General System Settings
- **Document ID**: `systemSettings`
- **Data**:
  ```json
  {
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
    }
  }
  ```

#### Document 2: Subject Availability
- **Document ID**: `subjectAvailability`
- **Data**:
  ```json
  {
    "availability": {
      "10": [
        "Mathematics",
        "Mathematical Literacy",
        "Physical Sciences",
        "Life Sciences",
        "Accounting",
        "Business Studies",
        "Economics",
        "Geography",
        "History",
        "Information Technology",
        "Computer Applications Technology (CAT)",
        "Tourism",
        "Consumer Studies",
        "Hospitality Studies",
        "Engineering Graphics & Design",
        "English Home Language",
        "English First Additional Language",
        "Afrikaans Huistaal",
        "Afrikaans Eerste Addisionele Taal"
      ],
      "11": [
        "Mathematics",
        "Mathematical Literacy",
        "Physical Sciences",
        "Life Sciences",
        "Accounting",
        "Business Studies",
        "Economics",
        "Geography",
        "History",
        "Information Technology",
        "Computer Applications Technology (CAT)",
        "Tourism",
        "Consumer Studies",
        "Hospitality Studies",
        "Engineering Graphics & Design",
        "English Home Language",
        "English First Additional Language",
        "Afrikaans Huistaal",
        "Afrikaans Eerste Addisionele Taal"
      ],
      "12": [
        "Mathematics",
        "Mathematical Literacy",
        "Physical Sciences",
        "Life Sciences",
        "Accounting",
        "Business Studies",
        "Economics",
        "Geography",
        "History",
        "Information Technology",
        "Computer Applications Technology (CAT)",
        "Tourism",
        "Consumer Studies",
        "Hospitality Studies",
        "Engineering Graphics & Design",
        "English Home Language",
        "English First Additional Language",
        "Afrikaans Huistaal",
        "Afrikaans Eerste Addisionele Taal"
      ]
    }
  }
  ```

#### Document 3: Email/SMS Configuration
- **Document ID**: `emailSmsConfig`
- **Data**:
  ```json
  {
    "emailProvider": "",
    "smtpServer": "",
    "smtpPort": 587,
    "fromEmail": "",
    "smsProvider": ""
  }
  ```

**Note**: You don't need to create these documents immediately. The application will create them automatically when needed, or return default values if they don't exist.

## Verification

After creating the collection:

1. The error "System settings collection does not exist" should disappear
2. The admin panel should be able to load and save settings
3. Subject availability should be configurable
4. System settings should be accessible

## Troubleshooting

**Error: "Collection with the requested ID could not be found"**
- Make sure the collection ID is exactly `systemSettings` (lowercase, no spaces)
- Verify you're using the correct database ID
- Check that the collection exists in Appwrite Console

**Error: "Permission denied"**
- Make sure permissions are set correctly (should be empty for client access, server uses API key)
- Verify your API key has the correct permissions

**Error: "Attribute not found"**
- Make sure all required attributes are created
- Check attribute names match exactly (case-sensitive)
- Verify attribute types are correct (especially JSON attributes)

**JSON Attributes Not Working**
- Make sure you're using the JSON attribute type, not String
- Verify the JSON structure matches the expected format
- Check that JSON is valid when creating/updating documents

## Important Notes

1. **Security**: The `smtpPassword` and `smsApiKey` attributes store sensitive data. In production, these should be encrypted before storing.

2. **Document IDs**: The application uses specific document IDs:
   - `systemSettings` - General system settings
   - `subjectAvailability` - Subject availability configuration
   - `emailSmsConfig` - Email/SMS integration settings

3. **Permissions**: This collection should only be accessible via server-side API calls. Client-side users should not have direct access.

4. **Defaults**: If documents don't exist, the application will return default values. You don't need to create all documents immediately.

