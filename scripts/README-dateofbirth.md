# Adding dateOfBirth Attribute to User Collection

This guide explains how to add the `dateOfBirth` attribute to the `user` collection in Appwrite to fix the error:

```
Invalid document structure: Unknown attribute: "dateOfBirth"
```

## Quick Fix: Run the Script

The easiest way to add the attribute is to run the provided script:

```bash
npm run add-dateofbirth-attribute
```

**Requirements:**
- Make sure you have `APPWRITE_API_KEY` set in your environment variables (or `.env.local` file)
- The script will use your existing Appwrite configuration from environment variables

## Manual Method: Using Appwrite Console

If you prefer to add it manually:

1. Go to your Appwrite Console
2. Navigate to **Databases** → Your Database → **Collections** → **user**
3. Click on **Attributes** tab
4. Click **Create Attribute**
5. Configure the attribute:
   - **Type**: String
   - **Key**: `dateOfBirth`
   - **Size**: 255 (sufficient for ISO date strings)
   - **Required**: No (unchecked, to allow optional/null values)
   - **Array**: No (unchecked)
6. Click **Create**
7. Wait for the attribute to be ready (status will show "available")

## What This Attribute Does

The `dateOfBirth` attribute stores the user's date of birth as an ISO 8601 string (e.g., `"2024-01-15T00:00:00.000Z"`). 

- It's stored as a string in Appwrite (not a datetime type) because the code converts Date objects to ISO strings before saving
- It's optional/nullable, so users can leave it blank
- The attribute is used in the user profile settings page (`/dashboard/settings`)

## Verification

After adding the attribute, you can verify it's working by:

1. Going to `/dashboard/settings` in your app
2. Setting a date of birth
3. Saving the profile
4. The error should no longer appear

## Troubleshooting

### Error: "Attribute already exists"
- The attribute is already in your collection. You can skip this step.

### Error: "Authentication failed"
- Check that `APPWRITE_API_KEY` is set correctly
- Make sure the API key has write permissions for the database

### Error: "Collection or database not found"
- Verify your `NEXT_PUBLIC_APPWRITE_DATABASE_ID` environment variable
- Check that the collection ID is exactly `user` (case-sensitive)

### Attribute Status Stays "Building"
- This is normal - it can take a few seconds for Appwrite to process the attribute
- Wait a minute and refresh the Appwrite Console
- The script will wait up to 30 seconds for the attribute to be ready

