/**
 * Storage utilities for past papers v2
 * Handles image conversion (base64 to Appwrite Storage) and file management
 */

import { Storage, ID } from 'node-appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { getServerStorage } from '@/lib/appwrite-server';
import { PopplerImage } from './types';

const QUESTION_IMAGES_BUCKET_ID = '690dafea0021f232399e';

/**
 * Check if an image is a placeholder (1x1 pixel transparent PNG)
 * Returns true if the image appears to be a placeholder
 */
function isPlaceholderImage(buffer: Buffer): boolean {
  try {
    // Check file size - placeholders are typically very small (< 200 bytes)
    if (buffer.length < 200) {
      return true;
    }
    
    // For PNG files, check if it's a 1x1 pixel image
    // PNG signature is: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      // Try to read PNG dimensions from IHDR chunk
      // IHDR chunk starts at offset 16 (after 8-byte signature + 4-byte chunk length)
      // Width is at bytes 16-19, height is at bytes 20-23 (big-endian)
      if (buffer.length >= 24) {
        const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
        const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
        
        // If it's 1x1 pixel, it's definitely a placeholder
        if (width === 1 && height === 1) {
          return true;
        }
        
        // Also check for very small images (likely placeholders)
        if (width < 50 && height < 50) {
          return true;
        }
      }
    }
    
    // Check for common placeholder base64 strings
    const base64String = buffer.toString('base64');
    const placeholderPatterns = [
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 transparent PNG
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==', // Another 1x1 transparent PNG
    ];
    
    if (placeholderPatterns.some(pattern => base64String.includes(pattern))) {
      return true;
    }
    
    return false;
  } catch (error) {
    // If we can't check, assume it's not a placeholder
    return false;
  }
}

/**
 * Convert base64 image data to Appwrite Storage file
 */
export async function uploadBase64Image(
  storage: Storage,
  base64Data: string,
  filename: string,
  mimeType: string = 'image/png'
): Promise<string> {
  try {
    // Convert base64 to buffer
    const base64WithoutPrefix = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    const buffer = Buffer.from(base64WithoutPrefix, 'base64');
    
    // Validate image is not a placeholder
    if (isPlaceholderImage(buffer)) {
      throw new Error(`Image "${filename}" is a placeholder (1x1 pixel or too small). Actual diagram extraction from PDF is required.`);
    }
    
    // Create File object from buffer (Node.js 18+)
    const fileObject = new File([buffer], filename, {
      type: mimeType,
      lastModified: Date.now(),
    });
    
    // Upload to Appwrite Storage
    const fileId = ID.unique();
    const response = await storage.createFile(
      QUESTION_IMAGES_BUCKET_ID,
      fileId,
      fileObject,
      ['read("users")'] // Accessible to authenticated users
    );
    
    return response.$id;
  } catch (error: any) {
    console.error('Error uploading base64 image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Upload multiple images from Poppler JSON
 * Returns a map of image labels to file IDs
 */
export async function uploadPopplerImages(
  storage: Storage,
  images: PopplerImage[]
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  let skippedPlaceholders = 0;
  
  for (const image of images) {
    try {
      // Generate filename from label
      const filename = `${image.label || `image_${image.order}`}.${image.image_format || 'png'}`;
      
      // Check if image_data exists and is not empty
      if (!image.image_data || image.image_data.trim().length === 0) {
        console.warn(`⚠ Skipping image "${filename}" (Q: ${image.question_number || 'none'}): No image_data provided`);
        skippedPlaceholders++;
        continue;
      }
      
      // Upload image (will throw if it's a placeholder)
      const fileId = await uploadBase64Image(
        storage,
        image.image_data,
        filename,
        `image/${image.image_format || 'png'}`
      );
      
      let mapped = false;
      let effectiveQuestionNumber = image.question_number?.trim() || '';
      
      // Map by explicit question number first
      if (effectiveQuestionNumber) {
        imageMap.set(effectiveQuestionNumber, fileId);
        imageMap.set(`q_${effectiveQuestionNumber}`, fileId);
        mapped = true;
        console.log(`  ✓ Mapped by question_number: "${effectiveQuestionNumber}" -> ${fileId}`);
      }
      
      // If no question_number, try to extract from label (patterns like q_1_4_diagram)
      if (!mapped && image.label) {
        const labelMatch = image.label.match(/q[_-](\d+(?:[._]\d+)*)/i);
        if (labelMatch) {
          effectiveQuestionNumber = labelMatch[1].replace(/_/g, '.');
          imageMap.set(effectiveQuestionNumber, fileId);
          imageMap.set(`q_${effectiveQuestionNumber}`, fileId);
          mapped = true;
          console.log(`  ✓ Mapped by label-derived question_number "${effectiveQuestionNumber}" from label "${image.label}" -> ${fileId}`);
        }
      }
      
      if (!mapped) {
        console.warn(`  ⚠️ Image "${image.label || `image_${image.order}`}" has no detectable question_number - will only match if LinkedDiagram filename matches exactly`);
      }
      
      // Map by label only when we know which question it belongs to
      if (mapped && image.label) {
        imageMap.set(image.label, fileId);
        console.log(`  ✓ Mapped by label "${image.label}" -> ${fileId}`);
      }
      
      // CRITICAL: Also map by image_filename (e.g., "diagram_page4_idx0.png")
      // This allows LinkedDiagram fields that contain filenames to match
      if (image.image_filename) {
        imageMap.set(image.image_filename, fileId);
        // Also map without extension for flexibility
        const filenameWithoutExt = image.image_filename.replace(/\.[^.]+$/, '');
        if (filenameWithoutExt !== image.image_filename) {
          imageMap.set(filenameWithoutExt, fileId);
        }
        console.log(`  ✓ Mapped by image_filename "${image.image_filename}" -> ${fileId}`);
      }
      
      console.log(`Uploaded image: ${image.label || `image_${image.order}`} (Q: ${image.question_number || 'none'}) -> ${fileId}`);
    } catch (error: any) {
      // Check if error is about placeholder
      if (error.message && error.message.includes('placeholder')) {
        console.warn(`⚠ Skipping placeholder image "${image.label || `image_${image.order}`}" (Q: ${image.question_number || 'none'}): ${error.message}`);
        skippedPlaceholders++;
      } else {
        console.error(`Failed to upload image ${image.label}:`, error);
      }
      // Continue with other images
    }
  }
  
  if (skippedPlaceholders > 0) {
    console.warn(`⚠ WARNING: Skipped ${skippedPlaceholders} placeholder image(s). The Poppler extraction tool needs to extract actual diagrams from the PDF, not 1x1 pixel placeholders.`);
  }
  
  // DEBUG: Log final image map
  console.log(`[Image Upload] Final image map (${imageMap.size} entries):`);
  const imageMapEntries = Array.from(imageMap.entries()).slice(0, 20); // Log first 20
  imageMapEntries.forEach(([key, fileId]) => {
    console.log(`  "${key}" -> ${fileId}`);
  });
  if (imageMap.size > 20) {
    console.log(`  ... and ${imageMap.size - 20} more entries`);
  }
  
  return imageMap;
}

/**
 * Get file URL from Appwrite Storage file ID
 */
export function getImageUrl(fileId: string): string {
  // Appwrite endpoint already includes /v1, so path should be /storage/buckets/... not /storage/v1/buckets/...
  return `${appwriteConfig.endpoint}/storage/buckets/${QUESTION_IMAGES_BUCKET_ID}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

