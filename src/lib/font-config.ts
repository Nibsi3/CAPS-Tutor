/**
 * Font file IDs in Appwrite Storage bucket
 * These are the file IDs from when we uploaded the fonts to bucket 690dafea0021f232399e
 * 
 * To update these, check the upload script output or Appwrite Console
 */
export const FONT_BUCKET_ID = '690dafea0021f232399e';

// Font file IDs (from upload output)
// Update these with actual file IDs from Appwrite Console Storage bucket
export const FONT_FILE_IDS = {
  // Fira Code fonts
  'FiraCode-Light.woff2': '690dccc40023721b7db4',
  'FiraCode-Light.woff': '690dccc4002375a118c4',
  'FiraCode-Regular.woff2': '690dccc60002a57c716b',
  'FiraCode-Regular.woff': '690dccc60002a47b4614',
  'FiraCode-Medium.woff2': '690dccc60002ab9ef88c',
  'FiraCode-Medium.woff': '690dccc40023783bc6d1',
  'FiraCode-SemiBold.woff2': '690dccc60002ac198ad6',
  'FiraCode-SemiBold.woff': '690dccc60002a5ebb163',
  'FiraCode-Bold.woff2': '690dccc400237a66f085',
  'FiraCode-Bold.woff': '690dccc40023382cb28f',
  'FiraCode-VF.woff2': '690dccc7000f16a19098',
  'FiraCode-VF.woff': '690dccc7000f14650fa7',
  'fira_code.css': '690dccc7000f1fe4ab82',
  // Inter fonts - TODO: Get actual file IDs from Appwrite Console
  // These will be populated once you check the bucket and get the file IDs
  'Inter-Regular.woff2': '', // Update with actual file ID
  'Inter-Medium.woff2': '', // Update with actual file ID
  'Inter-SemiBold.woff2': '', // Update with actual file ID
  'Inter-Bold.woff2': '', // Update with actual file ID
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

