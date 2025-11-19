# Self-Hosted Fonts

This directory contains self-hosted fonts to replace Appwrite CDN fonts and avoid CORS errors.

## Required Font Files

Download the following font files and place them in this directory:

### Fira Code
- **Source**: https://github.com/tonsky/FiraCode/releases
- **Files needed**:
  - `FiraCode-Regular.woff2`
  - `FiraCode-Medium.woff2`
  - `FiraCode-SemiBold.woff2`
  - `FiraCode-Bold.woff2`

**Quick download**:
1. Go to https://github.com/tonsky/FiraCode/releases
2. Download the latest release (e.g., `FiraCode-6.2.zip`)
3. Extract the zip file
4. Navigate to `distr/woff2/` folder
5. Copy the required `.woff2` files to this directory

### Inter
- **Source**: https://github.com/rsms/inter/releases
- **Files needed**:
  - `Inter-Regular.woff2`
  - `Inter-Medium.woff2`
  - `Inter-SemiBold.woff2`
  - `Inter-Bold.woff2`

**Quick download**:
1. Go to https://github.com/rsms/inter/releases
2. Download the latest release (e.g., `Inter-4.0.zip`)
3. Extract the zip file
4. Navigate to `Inter Desktop/` folder
5. Copy the required `.woff2` files to this directory

## Alternative: Manual Download

If the automated script doesn't work, download manually:

### Fira Code - Manual Download
1. Visit: https://github.com/tonsky/FiraCode/releases
2. Download the latest release (e.g., `FiraCode-6.2.zip`)
3. Extract the zip file
4. Navigate to `distr/woff2/` folder inside the extracted files
5. Copy these files to `public/fonts/`:
   - `FiraCode-Regular.woff2`
   - `FiraCode-Medium.woff2`
   - `FiraCode-SemiBold.woff2`
   - `FiraCode-Bold.woff2`

### Inter - Manual Download
1. Visit: https://github.com/rsms/inter/releases
2. Download the latest release (e.g., `Inter-4.0.zip`)
3. Extract the zip file
4. Navigate to `Inter Desktop/` folder
5. Copy these files to `public/fonts/`:
   - `Inter-Regular.woff2`
   - `Inter-Medium.woff2`
   - `Inter-SemiBold.woff2`
   - `Inter-Bold.woff2`

**Note**: The Inter fonts have already been downloaded successfully. You only need to download Fira Code manually.

## After Downloading

Once you've placed the `.woff2` files in this directory, the fonts will automatically be loaded by the application. The CSS definitions are in `fonts.css` and are imported in `src/app/globals.css`.

## Verification

After adding the fonts, check:
1. The fonts load without CORS errors
2. The application uses the self-hosted fonts instead of Appwrite CDN fonts
3. No console errors about missing fonts

