/**
 * Font file IDs in Appwrite Storage bucket
 * These are the file IDs from when we uploaded the fonts to bucket 690dafea0021f232399e
 * 
 * To update these, check the upload script output or Appwrite Console
 */
export const FONT_BUCKET_ID = '690dafea0021f232399e';

// Font file IDs (from upload output)
// PT Sans and Space Grotesk fonts from Appwrite Storage bucket
export const FONT_FILE_IDS = {
  // PT Sans fonts (body text)
  'PTSans-Regular.woff': '691ede4700201f6ca8e4',
  'PTSans-Bold.woff': '691ede4e000c5db2e14c',
  // Space Grotesk fonts (headlines)
  'SpaceGrotesk-VariableFont_wght.woff': '691ede3e001ae56ac7e3',
} as const;

/**
 * Get the Appwrite Storage URL for a font file
 */
export function getFontUrl(fileName: keyof typeof FONT_FILE_IDS): string {
  const fileId = FONT_FILE_IDS[fileName];
  if (!fileId) {
    console.warn(`Font file ID not found for: ${fileName}`);
    return '';
  }
  
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
  
  if (!projectId) {
    console.warn('NEXT_PUBLIC_APPWRITE_PROJECT_ID not set, cannot generate font URL');
    return '';
  }
  
  return `${endpoint}/storage/buckets/${FONT_BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

