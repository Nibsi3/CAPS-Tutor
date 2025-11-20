'use client';

import { useEffect } from 'react';
import { FONT_BUCKET_ID, FONT_FILE_IDS } from '@/lib/font-config';
import { appwriteConfig } from '@/appwrite/config';

/**
 * FontLoaderFromAppwrite - Loads fonts from Appwrite Storage
 * 
 * This component injects @font-face CSS rules that reference fonts
 * stored in Appwrite Storage bucket 690dafea0021f232399e (pastpaperbucket).
 * 
 * Font file IDs are defined in src/lib/font-config.ts
 */
export function FontLoaderFromAppwrite() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if we already injected the fonts
    if (document.getElementById('appwrite-fonts-css')) return;

    const endpoint = appwriteConfig.endpoint;
    const projectId = appwriteConfig.projectId;
    const bucketId = FONT_BUCKET_ID;

    if (!endpoint || !projectId) {
      console.warn('[FontLoader] Appwrite config not available, cannot load fonts from Storage');
      return;
    }

    // Build font URL helper
    const getFontUrl = (fileId: string): string => {
      if (!fileId) return '';
      return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    };

    // Build CSS @font-face rules using file IDs from config
    // Only include fonts that have valid file IDs (non-empty)
    const fontFaceRules = [
      // PT Sans Regular (body font)
      FONT_FILE_IDS['PTSans-Regular.woff'] && `
        @font-face {
          font-family: 'PT Sans';
          src: url('${getFontUrl(FONT_FILE_IDS['PTSans-Regular.woff'])}') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `,
      // PT Sans Bold (body font)
      FONT_FILE_IDS['PTSans-Bold.woff'] && `
        @font-face {
          font-family: 'PT Sans';
          src: url('${getFontUrl(FONT_FILE_IDS['PTSans-Bold.woff'])}') format('woff');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Space Grotesk Variable (headline font)
      FONT_FILE_IDS['SpaceGrotesk-VariableFont_wght.woff'] && `
        @font-face {
          font-family: 'Space Grotesk';
          src: url('${getFontUrl(FONT_FILE_IDS['SpaceGrotesk-VariableFont_wght.woff'])}') format('woff');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
      `,
    ].filter(Boolean).join('\n');

    // Create and inject style element
    const style = document.createElement('style');
    style.id = 'appwrite-fonts-css';
    style.textContent = fontFaceRules;
    document.head.appendChild(style);

    console.log('[FontLoader] Loaded fonts from Appwrite Storage');
  }, []);

  return null;
}

