# How to Upload Fonts

## Step 1: Create downloads directory

Create a `downloads` directory in the project root:
```
CAPS-Tutor/
  downloads/
```

## Step 2: Copy font files

Copy your font files (PT Sans, Space Grotesk, Source Code Pro) into the `downloads` directory.

Supported formats:
- `.woff2` (preferred)
- `.woff`
- `.ttf`
- `.otf`

## Step 3: Run upload script

```bash
node scripts/upload-fonts-from-downloads.mjs
```

The script will:
1. ✅ Scan the `downloads` directory for font files
2. ✅ Verify the Appwrite bucket exists and is accessible
3. ✅ Upload each font file to Appwrite Storage bucket `690dafea0021f232399e`
4. ✅ Display the file IDs after upload
5. ✅ Show a summary with all uploaded file IDs

## Step 4: Update font configuration

After uploading, copy the file IDs from the script output and:
1. Update `src/lib/font-config.ts` with the new file IDs
2. Update `src/components/FontLoaderFromAppwrite.tsx` to load these fonts
3. Update `tailwind.config.ts` to use the correct font families

## Required Fonts

For the previous font setup, you need:
- **PT Sans**: Regular (400) and Bold (700)
- **Space Grotesk**: Variable or Regular + Bold
- **Source Code Pro**: Variable or Regular + Bold

