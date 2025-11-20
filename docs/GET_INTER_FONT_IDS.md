# How to Get Inter Font File IDs from Appwrite Storage

Since the fonts are uploaded to Appwrite Storage bucket `690dafea0021f232399e` (pastpaperbucket), you need to get the file IDs for the Inter fonts and update `src/lib/font-config.ts`.

## Method 1: Using Appwrite Console (Recommended)

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Navigate to **Storage** → **Buckets**
3. Click on bucket **pastpaperbucket** (ID: `690dafea0021f232399e`)
4. Go to the **Files** tab
5. Search for files containing "Inter" in the name
6. For each Inter font file, copy its **File ID** (the long alphanumeric ID, not the filename)
7. Update `src/lib/font-config.ts` with the file IDs:

```typescript
export const FONT_FILE_IDS = {
  // ... existing Fira Code fonts ...
  
  // Inter fonts - Update with actual file IDs from Appwrite Console
  'Inter-Regular.woff2': 'YOUR_FILE_ID_HERE',
  'Inter-Medium.woff2': 'YOUR_FILE_ID_HERE',
  'Inter-SemiBold.woff2': 'YOUR_FILE_ID_HERE',
  'Inter-Bold.woff2': 'YOUR_FILE_ID_HERE',
} as const;
```

## Method 2: Using the List Script

If your API key has proper permissions, you can run:

```bash
node scripts/list-font-files.mjs
```

This will list all font files in the bucket with their file IDs.

## Required Inter Font Files

You need to find these Inter font files:
- `Inter-Regular.woff2` - Regular weight (400)
- `Inter-Medium.woff2` - Medium weight (500)
- `Inter-SemiBold.woff2` - SemiBold weight (600)
- `Inter-Bold.woff2` - Bold weight (700)

**Note**: The code is set up to gracefully handle missing Inter font IDs. Fira Code fonts will work immediately since their file IDs are already configured. Inter fonts will only load once you add the file IDs to `font-config.ts`.

