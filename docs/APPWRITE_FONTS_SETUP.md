# Appwrite Fonts Setup Guide

This guide explains how to configure your Appwrite Storage bucket to serve fonts to your application.

## Overview

Fonts have been uploaded to Appwrite Storage bucket `690dafea0021f232399e` (pastpaperbucket). The app now loads these fonts from Appwrite Storage instead of from Appwrite's CDN, which eliminates CORS errors.

## Font Files Uploaded

The following Fira Code fonts are available in Appwrite Storage:
- FiraCode-Light (woff2, woff)
- FiraCode-Regular (woff2, woff)
- FiraCode-Medium (woff2, woff)
- FiraCode-SemiBold (woff2, woff)
- FiraCode-Bold (woff2, woff)
- FiraCode-VF (woff2, woff) - Variable font

## Required Configuration

### Step 1: Verify File Permissions

**Important**: Appwrite Storage buckets don't have a CORS setting in the UI. CORS is handled automatically for files with public read access, or configured at the project level.

The most important thing is to ensure your font files have `read("any")` permission:

1. **Check file permissions**:
   - In the bucket, go to **Files** tab
   - Click on each font file to view its details
   - Check that it shows `read("any")` in the permissions
   - If not, you'll need to update the file permissions

2. **Update file permissions if needed**:
   - Click on a font file
   - Look for "Permissions" or "Update permissions"
   - Add `read("any")` permission
   - Save

3. **Or use the script to check permissions**:
   ```bash
   node scripts/check-font-permissions.mjs
   ```
   This will show you which files have public read access.

### Step 2: Project-Level CORS (if needed)

If you still get CORS errors after verifying file permissions:

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Navigate to **Settings** → **General**
3. Look for **CORS** or **Allowed Origins** settings
4. Add your domain(s):
   - Production: `https://gearshift.co.za`
   - Development: `http://localhost:3000`
5. Save changes

**Note**: In many Appwrite setups, CORS is automatically handled for public files (`read("any")`), so you might not need to configure this manually.

## How It Works

1. **FontLoader Component**: The `FontLoader` component in `src/components/FontLoader.tsx` dynamically loads `@font-face` rules that reference fonts from Appwrite Storage.

2. **Font URLs**: Font URLs are generated using the `getFontUrl()` function from `src/lib/font-config.ts`, which constructs Appwrite Storage file URLs.

3. **FontRequestBlocker**: The `FontRequestBlocker` component prevents the Appwrite SDK from trying to load fonts from Appwrite's CDN, which would cause CORS errors.

## File IDs

The font file IDs are stored in `src/lib/font-config.ts`. If you need to update these (e.g., after re-uploading fonts), you can find the file IDs in:
- The upload script output
- Appwrite Console → Storage → Buckets → Files

## Troubleshooting

### CORS Errors Still Occurring

1. **Check CORS Configuration**: Verify that your domain is added to the bucket's CORS allowed origins
2. **Check File Permissions**: Ensure fonts have `read("any")` permission
3. **Clear Browser Cache**: Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Console**: Look for specific CORS error messages in the browser console

### Fonts Not Loading

1. **Check Environment Variables**: Ensure `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID` are set
2. **Check File IDs**: Verify the file IDs in `src/lib/font-config.ts` match the actual file IDs in Appwrite Storage
3. **Check Network Tab**: In browser DevTools, check if font requests are being made and what status they return

### Fonts Loading but Not Displaying

1. **Check Font Family**: The fonts are loaded as 'Fira Code' and 'Fira Code VF'
2. **Check CSS**: Ensure your CSS is using the correct font-family name
3. **Check Font Weights**: Verify you're using supported font weights (300, 400, 500, 600, 700)

## Testing

To test if fonts are loading correctly:

1. Open browser DevTools → Network tab
2. Filter by "Font" or "woff2"
3. Reload the page
4. You should see requests to Appwrite Storage URLs like:
   ```
   https://fra.cloud.appwrite.io/v1/storage/buckets/690dafea0021f232399e/files/{fileId}/view?project={projectId}
   ```
5. These requests should return status 200 (OK)

## Notes

- The app currently uses Google Fonts (PT_Sans, Space_Grotesk, Source_Code_Pro) for the main UI
- The Fira Code fonts from Appwrite Storage are available for use but not currently applied to the UI
- If you want to use Fira Code instead of Source Code Pro, update `tailwind.config.ts` to use 'Fira Code' as the code font

