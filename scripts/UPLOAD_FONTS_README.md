# Upload Fonts to Appwrite Storage

This guide explains how to upload fonts from `public/fonts` to your Appwrite Storage bucket.

## Prerequisites

1. **Update Bucket Configuration** (REQUIRED - Do this first!)
   
   The bucket needs to allow font file extensions. Update it manually in Appwrite Console:
   
   - Go to [Appwrite Console](https://cloud.appwrite.io) → Storage → Buckets
   - Click on bucket `690dafea0021f232399e` (pastpaperbucket)
   - Go to **Settings** tab
   - Under **"File Security"**:
     - ✅ Enable "File Security" (if not already enabled)
     - Add these font extensions: `ttf`, `woff`, `woff2`, `otf`, `eot`, `css`
     - Also ensure these extensions are included (for past papers): `pdf`, `jpg`, `jpeg`, `png`, `doc`, `docx`, `txt`

2. **Create an Appwrite API Key**
   - Go to Appwrite Console → Settings → API Keys
   - Click **Create API Key**
   - Give it a name (e.g., "Font Uploader")
   - Select scopes:
     - ✅ `storage.read`
     - ✅ `storage.write`
   - Click **Create**
   - **Copy the API key** (you won't be able to see it again!)

3. **Add API Key to Environment Variables**
   - Open your `.env.local` file in the project root
   - Add:
     ```
     APPWRITE_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with the API key you copied
   - Save the file

## Running the Upload Script

After configuring the bucket and API key:

```powershell
node scripts/upload-fonts-to-appwrite.mjs
```

## What the Script Does

1. ✅ Scans the `public/fonts` directory for all font files
2. ✅ Verifies the Appwrite bucket exists and is accessible
3. ✅ Uploads files in batches (5 at a time) to avoid rate limits
4. ✅ Shows progress and a summary at the end

## Output

The script will display:
- ✅ Files successfully uploaded
- ⏭️ Files skipped (already exist)
- ❌ Files that failed to upload
- 📊 Final summary with counts

## Font Files

The script uploads all files from `public/fonts`, including:
- Fira Code fonts (TTF, WOFF, WOFF2)
- Inter fonts (TTF, WOFF, WOFF2)
- CSS font files

## File IDs

- Each font file gets a unique 36-character file ID
- The original filename is preserved in the file metadata
- Files are uploaded with public read access (`read("any")`)

## Troubleshooting

### "File extension not allowed"
- Make sure you've updated the bucket configuration in Appwrite Console
- Verify that font extensions (`ttf`, `woff`, `woff2`, `otf`, `eot`, `css`) are in the allowed list

### "API_KEY is not set"
- Make sure you've added `APPWRITE_API_KEY` to your `.env.local` file
- Restart your terminal after adding the variable

### "Bucket not found"
- Verify the bucket ID `690dafea0021f232399e` exists in your Appwrite project
- Check that your API key has the correct permissions

### "Permission denied"
- Ensure your API key has both `storage.read` and `storage.write` scopes
- Verify the bucket permissions allow file uploads

