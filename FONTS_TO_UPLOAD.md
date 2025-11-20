# Fonts to Upload to Appwrite Storage for Reverting to Previous Fonts

Based on the previous configuration, you need to upload these fonts to Appwrite Storage bucket `690dafea0021f232399e`:

## Required Fonts (from Google Fonts)

### 1. **PT Sans** (Body font - weights 400, 700)
Upload these files:
- `PT_Sans-Regular.woff2` (weight 400)
- `PT_Sans-Bold.woff2` (weight 700)

Or if you have these filenames:
- `pt-sans-regular.woff2`
- `pt-sans-bold.woff2`
- `PT_Sans-Regular.woff2`
- `PT_Sans-Bold.woff2`

### 2. **Space Grotesk** (Headline font - variable or regular)
Upload these files:
- `SpaceGrotesk-Variable.woff2` (preferred - variable font)
- OR `SpaceGrotesk-Regular.woff2` and `SpaceGrotesk-Bold.woff2`

Or if you have these filenames:
- `space-grotesk-variable.woff2`
- `Space_Grotesk-Regular.woff2`
- `Space_Grotesk-Bold.woff2`

### 3. **Source Code Pro** (Code font - variable or regular)
Upload these files:
- `SourceCodePro-Variable.woff2` (preferred - variable font)
- OR `SourceCodePro-Regular.woff2` and `SourceCodePro-Bold.woff2`

Or if you have these filenames:
- `source-code-pro-variable.woff2`
- `Source_Code_Pro-Regular.woff2`
- `Source_Code_Pro-Bold.woff2`

## What to Look For in Your Downloads Folder

Look for folders/files containing:
- **PT Sans** or **PT_Sans** or **pt-sans**
- **Space Grotesk** or **Space_Grotesk** or **space-grotesk**
- **Source Code Pro** or **Source_Code_Pro** or **source-code-pro**

## After Upload

Once uploaded, I'll need:
1. The file IDs from Appwrite Storage (the long alphanumeric IDs)
2. The exact filenames you uploaded

Then I can update:
- `src/lib/font-config.ts` with the new file IDs
- `src/components/FontLoaderFromAppwrite.tsx` to load these fonts
- `tailwind.config.ts` to use these fonts
- `src/app/layout.tsx` to remove Fira Code references

## Minimum Files Needed

**Minimum (if using variable fonts):**
- 1x PT Sans Regular
- 1x PT Sans Bold
- 1x Space Grotesk Variable
- 1x Source Code Pro Variable

**Or (if using regular fonts):**
- 1x PT Sans Regular
- 1x PT Sans Bold
- 1x Space Grotesk Regular
- 1x Space Grotesk Bold (or SemiBold)
- 1x Source Code Pro Regular
- 1x Source Code Pro Bold (or SemiBold)

