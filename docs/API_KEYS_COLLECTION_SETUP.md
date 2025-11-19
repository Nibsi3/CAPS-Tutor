# API Keys Collection Setup Guide

## Collection Details

**Collection ID:** `apiKeys` (lowercase, exactly as shown)

## Required Attributes

Create the following attributes in your Appwrite `apiKeys` collection:

### 1. serviceName
- **Type:** String
- **Size:** 255 characters
- **Required:** Yes
- **Array:** No
- **Description:** Name of the service (e.g., "Google Analytics", "OpenAI", "News API")

### 2. encryptedKey
- **Type:** String
- **Size:** 2000 characters (or larger if needed for encrypted keys)
- **Required:** Yes
- **Array:** No
- **Description:** The encrypted API key (keys are encrypted before storage for security)
- **Note:** The application automatically encrypts API keys before storing them

### 3. description
- **Type:** String
- **Size:** 1000 characters
- **Required:** No (optional)
- **Array:** No
- **Default Value:** (empty string)
- **Description:** Description or notes about this API key

### 4. active
- **Type:** Boolean
- **Required:** No (optional)
- **Array:** No
- **Default Value:** `true`
- **Description:** Whether this API key is currently active/enabled

### 5. createdBy
- **Type:** String
- **Size:** 255 characters
- **Required:** Yes
- **Array:** No
- **Description:** The user ID of the admin who created this API key

### 6. createdAt
- **Type:** String (or DateTime if Appwrite supports it)
- **Size:** 255 characters
- **Required:** No (optional)
- **Array:** No
- **Description:** ISO timestamp of when the API key was created
- **Note:** Can use Appwrite's built-in `$createdAt` timestamp instead

### 7. lastUsed
- **Type:** String (or DateTime if Appwrite supports it)
- **Size:** 255 characters
- **Required:** No (optional)
- **Array:** No
- **Default Value:** `null`
- **Description:** ISO timestamp of when the API key was last used
- **Note:** Can be null if never used

## Permissions

Set the following permissions for the `apiKeys` collection:

### Read Permissions
- **Admins only:** Only administrators should be able to read API keys (for security)
- **Note:** The API only returns metadata (not the actual encrypted keys) to admins

### Create Permissions
- **Admins only:** Only administrators should be able to create API keys

### Update Permissions
- **Admins only:** Only administrators should be able to update API keys

### Delete Permissions
- **Admins only:** Only administrators should be able to delete API keys

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Encryption:** API keys are encrypted before storage using AES-256-CBC encryption
2. **Environment Variable:** Make sure to set `ENCRYPTION_KEY` in your `.env.local` file:
   ```
   ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
   ```
   - Use a strong, random 32-character key
   - Never commit this key to version control
   - Change the default key in production

3. **Access Control:** Only admins should have access to this collection
4. **API Response:** The GET endpoint does NOT return the actual encrypted keys, only metadata

## Step-by-Step Creation in Appwrite Console

1. **Go to Appwrite Console**
   - Navigate to your project
   - Click on "Databases" in the left sidebar
   - Select your database

2. **Create Collection**
   - Click "Create Collection"
   - Enter Collection ID: `apiKeys` (lowercase, exactly)
   - Click "Create"

3. **Add Attributes**
   - Click on the "Attributes" tab
   - Add each attribute listed above using "Create Attribute"
   - Make sure to set the correct type, size, and required status
   - For `lastUsed`, make sure it's optional and can be null

4. **Set Permissions**
   - Click on the "Permissions" tab
   - **Read:** Admins only
   - **Create:** Admins only
   - **Update:** Admins only
   - **Delete:** Admins only

5. **Create Indexes (Optional but Recommended)**
   - Click on the "Indexes" tab
   - Create an index on `createdAt` (or `$createdAt`) for sorting
   - Create an index on `active` if you want to filter by active status
   - Create an index on `serviceName` if you want to search by service

## Example Document Structure

```json
{
  "$id": "unique-document-id",
  "serviceName": "Google Analytics",
  "encryptedKey": "iv:encrypted_key_data_here",
  "description": "GA4 Measurement API key",
  "active": true,
  "createdBy": "admin-user-id",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastUsed": "2024-01-20T14:22:00.000Z"
}
```

## Environment Variable Setup

Make sure to set the encryption key in your `.env.local` file:

```env
ENCRYPTION_KEY=your-32-character-encryption-key-change-this
```

**Important:** 
- Use a strong, random 32-character key
- Never use the default key in production
- Keep this key secret and secure
- If you change the encryption key, all existing encrypted keys will need to be re-encrypted

## Verification

After creating the collection:

1. Try creating an API key through the admin panel
2. Verify it appears in the API keys list
3. Check that the encrypted key is stored (not the plain text)
4. Test updating and deleting API keys

## Troubleshooting

If you still get errors:

1. **Check Collection ID:** Must be exactly `apiKeys` (lowercase, no spaces)
2. **Verify Attributes:** All required attributes must exist with correct types
3. **Check Permissions:** Ensure your API key has the necessary permissions
4. **Check Encryption Key:** Make sure `ENCRYPTION_KEY` is set in `.env.local`
5. **Restart Server:** After creating the collection, restart your Next.js dev server

## Security Best Practices

1. **Rotate Encryption Keys:** Periodically rotate your encryption key
2. **Audit Access:** Regularly review who has access to API keys
3. **Monitor Usage:** Track when API keys are used via the `lastUsed` field
4. **Disable Unused Keys:** Set `active: false` for keys that are no longer needed
5. **Secure Storage:** Consider using a proper key management system in production (AWS KMS, HashiCorp Vault, etc.)

