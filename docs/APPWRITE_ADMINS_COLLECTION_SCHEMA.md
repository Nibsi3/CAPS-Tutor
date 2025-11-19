# Admins Collection Schema

## Collection Details

- **Collection ID**: `admins` (exactly, lowercase)
- **Name**: `Admins`
- **Database**: `capstutor`

## Important Notes

- **Admins are stored in a separate collection from students**
- Admins are **NOT** added to the `user` collection (student database)
- Admin authentication is separate from student authentication
- Admins can switch between admin view and student view using the toggle button

## Required Attributes

Add these attributes in the Appwrite Console:

### 1. adminId
- **Type**: String
- **Size**: 36
- **Required**: Yes
- **Pattern**: UUID
- **Array**: No
- **Description**: Unique identifier for the admin (UUID format)
- **Example**: "550e8400-e29b-41d4-a716-446655440000"

### 2. email
- **Type**: String
- **Size**: 254
- **Required**: Yes
- **Array**: No
- **Description**: Admin's email address (must match Appwrite Auth email)
- **Example**: "admin@example.com"

### 3. passwordHash
- **Type**: String
- **Size**: 255
- **Required**: Yes
- **Array**: No
- **Description**: Hashed password (for future use if implementing custom admin auth)
- **Note**: Currently, admins use Appwrite Auth, so this may be optional

### 4. role
- **Type**: String
- **Size**: 50
- **Required**: Yes
- **Array**: No
- **Allowed Values**: `superadmin`, `manager`, `viewer`
- **Description**: Admin role/permission level
- **Example**: "superadmin"

### 5. permissions
- **Type**: String Array
- **Size per entry**: 50
- **Required**: No
- **Array**: Yes
- **Description**: Array of specific permissions
- **Example entries**: `["edit_users", "view_stats", "manage_papers", "delete_content"]`

### 6. status
- **Type**: String
- **Size**: 20
- **Required**: Yes
- **Array**: No
- **Allowed Values**: `active`, `disabled`
- **Default**: `active`
- **Description**: Admin account status

### 7. createdAt
- **Type**: DateTime
- **Required**: Yes
- **Array**: No
- **Description**: When the admin record was created
- **Format**: ISO 8601 datetime string

### 8. updatedAt
- **Type**: DateTime
- **Required**: Yes
- **Array**: No
- **Description**: When the admin record was last updated
- **Format**: ISO 8601 datetime string

### 9. lastLogin
- **Type**: DateTime
- **Required**: No
- **Array**: No
- **Description**: Last login timestamp
- **Format**: ISO 8601 datetime string

### 10. notes
- **Type**: String
- **Size**: 500
- **Required**: No
- **Array**: No
- **Description**: Optional notes about the admin

## Required Indexes

Create these indexes in the Appwrite Console:

### 1. adminId_index (Unique)
- **Fields**: `adminId`
- **Type**: Unique
- **Description**: Ensures adminId is unique

### 2. email_index (Unique)
- **Fields**: `email`
- **Type**: Unique
- **Description**: Ensures email is unique and allows fast lookup

### 3. role_index (Key)
- **Fields**: `role`
- **Type**: Key
- **Description**: Allows filtering by role

### 4. status_index (Key)
- **Fields**: `status`
- **Type**: Key
- **Description**: Allows filtering by status (active/disabled)

### 5. createdAt_index (Key)
- **Fields**: `createdAt`
- **Type**: Key
- **Sort**: Ascending
- **Description**: Allows sorting by creation date

### 6. lastLogin_index (Key)
- **Fields**: `lastLogin`
- **Type**: Key
- **Sort**: Descending
- **Description**: Allows sorting by last login

## Permissions

In the **Settings** tab, under **Permissions**:

### Create Permission
- Select: **"Users"** role (only authenticated users can create admin records)
- **Note**: In practice, admin records should be created manually or by superadmins only

### Read Permission
- Select: **"Users"** role (authenticated users can read admin records to check their own admin status)
- **Note**: Consider restricting this further if needed for security

### Update Permission
- Select: **"Users"** role (admins can update their own records)
- **Note**: Consider adding custom logic to restrict updates to superadmins

### Delete Permission
- Leave empty or set to **None**
- Admins should not be able to delete admin records

## How to Create the Collection

### Step 1: Go to Appwrite Console
1. Navigate to: https://cloud.appwrite.io/console
2. Select your project: **CAPS Tutor**
3. Go to: **Databases** → `capstutor`

### Step 2: Create Admins Collection
1. Click **Create Collection** button
2. **Collection ID**: `admins` (must be exactly this, lowercase)
3. **Name**: `Admins`
4. Click **Create**

### Step 3: Add Attributes
Add each attribute as described above in the "Required Attributes" section.

### Step 4: Create Indexes
Add each index as described above in the "Required Indexes" section.

### Step 5: Set Permissions
Configure permissions as described above.

## Example Admin Document

```json
{
  "$id": "550e8400-e29b-41d4-a716-446655440000",
  "adminId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "passwordHash": "$2b$10$...",
  "role": "superadmin",
  "permissions": ["edit_users", "view_stats", "manage_papers", "delete_content"],
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "notes": "Super administrator account"
}
```

## Admin Mode Toggle

Admins can switch between:
- **Admin Mode**: Access to admin dashboard at `/admin`
- **Student Mode**: Access to student dashboard at `/dashboard`

The toggle button is displayed in the header when a user is identified as an admin.

## Security Considerations

1. **Separate Collections**: Admins are never added to the student (`user`) collection
2. **Email Matching**: Admin email must match the Appwrite Auth email
3. **Status Check**: Only admins with `status: "active"` are considered admins
4. **Role-Based Access**: Different roles (superadmin, manager, viewer) can have different permissions

## Troubleshooting

**Error: "Collection with the requested ID could not be found"**
- Make sure the collection ID is exactly `admins` (lowercase)
- Verify the collection exists in the correct database

**User is not recognized as admin**
- Check that the admin document exists in the `admins` collection
- Verify the email matches the Appwrite Auth email exactly
- Ensure the admin's `status` is set to `"active"`
- Check that the `email_index` exists and is working

**Admin toggle button not showing**
- Verify the user is authenticated
- Check that an admin document exists with matching email
- Verify the admin's status is `"active"`

