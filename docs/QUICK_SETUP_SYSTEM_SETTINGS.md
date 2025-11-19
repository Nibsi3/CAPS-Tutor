# Quick Setup: System Settings Collection

## Quick Steps

1. **Go to Appwrite Console**
   - https://cloud.appwrite.io/console
   - Select project: **CAPS Tutor**
   - Go to: **Databases** → `capstutor`

2. **Create Collection**
   - Click **Create Collection**
   - Collection ID: `systemSettings`
   - Name: `System Settings`
   - Click **Create**

3. **Add Attributes** (Click + Create Attribute for each)

   **Boolean:**
   - `maintenanceMode` (Boolean, Default: false)

   **Strings:**
   - `maintenanceMessage` (String, 1000)
   - `maintenanceDuration` (String, 100)
   - `emailProvider` (String, 100)
   - `smtpServer` (String, 255)
   - `fromEmail` (String, 255)
   - `smtpPassword` (String, 500)
   - `smsProvider` (String, 100)
   - `smsApiKey` (String, 500)
   - `updatedBy` (String, 255)
   - `updatedAt` (String, 100)

   **Integer:**
   - `smtpPort` (Integer, Min: 1, Max: 65535, Default: 587)

   **JSON:**
   - `features` (JSON)
   - `aiConfig` (JSON)
   - `cacheSettings` (JSON)
   - `retentionPolicies` (JSON)
   - `availability` (JSON)

4. **Set Permissions**
   - **Create**: Leave empty (server-only)
   - **Read**: Leave empty (server-only)
   - **Update**: Leave empty (server-only)
   - **Delete**: Leave empty (server-only)

5. **Done!** The application will create documents automatically when needed.

## Or Use the Script

Run the automated setup script:

```bash
node scripts/create-system-settings-collection.mjs
```

Make sure you have these environment variables set in `.env.local`:
- `APPWRITE_PROJECT_ID` (or `NEXT_PUBLIC_APPWRITE_PROJECT_ID`)
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID` (optional, defaults to `capstutor`)

## Full Documentation

For complete setup instructions with examples, see:
[APPWRITE_SYSTEM_SETTINGS_COLLECTION.md](./APPWRITE_SYSTEM_SETTINGS_COLLECTION.md)

