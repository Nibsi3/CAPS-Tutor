# How to Add an Admin User

## Quick Method: Add via Appwrite Console (Recommended)

Since the `adminId` collection is already created, the easiest way is to add the admin directly in the Appwrite Console:

### Step 1: Go to Appwrite Console
1. Navigate to: https://cloud.appwrite.io/console
2. Select your project: **CAPS Tutor**
3. Go to: **Databases** → `capstutor` → `adminId` collection

### Step 2: Create New Document
1. Click **"Create Document"** button
2. Fill in the following fields:

#### Required Fields:
- **adminId**: Generate a UUID (you can use an online UUID generator or use: `550e8400-e29b-41d4-a716-446655440000`)
- **email**: `cameronfalck03@gmail.com`
- **passwordHash**: Leave empty (we use Appwrite Auth, not custom passwords)
- **role**: `superadmin` (or `manager` or `viewer`)
- **status**: `active`
- **createdAt**: Current date/time (ISO format, e.g., `2024-01-15T10:30:00.000Z`)
- **updatedAt**: Same as createdAt

#### Optional Fields:
- **permissions**: Array of strings, e.g., `["edit_users", "view_stats", "manage_papers", "delete_content", "manage_admins"]`
- **lastLogin**: Leave empty (will be updated on first login)
- **notes**: `"Super administrator account"`

### Step 3: Save
Click **"Create"** to save the document.

### Example Document:
```json
{
  "adminId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "cameronfalck03@gmail.com",
  "passwordHash": "",
  "role": "superadmin",
  "permissions": ["edit_users", "view_stats", "manage_papers", "delete_content", "manage_admins"],
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "notes": "Super administrator account"
}
```

## Alternative Method: Use API Route

You can also use the API route to create an admin programmatically:

### Option 1: Browser Console
1. Open your browser's developer console (F12)
2. Make sure you're logged in to the app
3. Run this code:

```javascript
fetch('/api/create-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'cameronfalck03@gmail.com',
    role: 'superadmin',
    permissions: ['edit_users', 'view_stats', 'manage_papers', 'delete_content', 'manage_admins']
  })
})
.then(res => res.json())
.then(data => console.log('Admin created:', data))
.catch(err => console.error('Error:', err));
```

### Option 2: Use Script (Requires API Key)
If you have an Appwrite API key with write permissions, you can use the script:

```bash
node scripts/add-admin.mjs cameronfalck03@gmail.com superadmin
```

**Note**: The script requires server-side authentication. You'll need to set `APPWRITE_API_KEY` in your environment variables.

## Verify Admin Access

After adding the admin:

1. **Log out** and **log back in** with `cameronfalck03@gmail.com`
2. You should see the **Admin Mode toggle button** in the header
3. Click the toggle to switch between Admin Mode and Student Mode
4. In Admin Mode, you'll have access to `/admin` routes
5. In Student Mode, you'll see the regular student dashboard

## Troubleshooting

**Admin toggle button not showing:**
- Verify the admin document exists in the `adminId` collection
- Check that `email` matches exactly (case-sensitive)
- Ensure `status` is set to `"active"`
- Make sure you're logged in with the correct email
- Refresh the page after adding the admin

**Collection not found error:**
- Verify the collection ID is exactly `adminId` (case-sensitive)
- Check that the collection exists in the correct database (`capstutor`)
- Ensure all required attributes are created in the collection

**Permission errors:**
- Check collection permissions in Appwrite Console
- Ensure "Users" role has Create/Read/Update permissions
- Verify your Appwrite Auth session is valid

