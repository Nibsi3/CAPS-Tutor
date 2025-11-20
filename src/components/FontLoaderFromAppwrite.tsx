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
      // Fira Code Regular
      FONT_FILE_IDS['FiraCode-Regular.woff2'] && `
        @font-face {
          font-family: 'Fira Code';
          src: url('${getFontUrl(FONT_FILE_IDS['FiraCode-Regular.woff2'])}') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Fira Code Medium
      FONT_FILE_IDS['FiraCode-Medium.woff2'] && `
        @font-face {
          font-family: 'Fira Code';
          src: url('${getFontUrl(FONT_FILE_IDS['FiraCode-Medium.woff2'])}') format('woff2');
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Fira Code SemiBold
      FONT_FILE_IDS['FiraCode-SemiBold.woff2'] && `
        @font-face {
          font-family: 'Fira Code';
          src: url('${getFontUrl(FONT_FILE_IDS['FiraCode-SemiBold.woff2'])}') format('woff2');
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Fira Code Bold
      FONT_FILE_IDS['FiraCode-Bold.woff2'] && `
        @font-face {
          font-family: 'Fira Code';
          src: url('${getFontUrl(FONT_FILE_IDS['FiraCode-Bold.woff2'])}') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Inter Regular - only load if file ID is provided
      (FONT_FILE_IDS['Inter-Regular.woff2'] && FONT_FILE_IDS['Inter-Regular.woff2'].trim() !== '') && `
        @font-face {
          font-family: 'Inter';
          src: url('${getFontUrl(FONT_FILE_IDS['Inter-Regular.woff2'])}') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Inter Medium - only load if file ID is provided
      (FONT_FILE_IDS['Inter-Medium.woff2'] && FONT_FILE_IDS['Inter-Medium.woff2'].trim() !== '') && `
        @font-face {
          font-family: 'Inter';
          src: url('${getFontUrl(FONT_FILE_IDS['Inter-Medium.woff2'])}') format('woff2');
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Inter SemiBold - only load if file ID is provided
      (FONT_FILE_IDS['Inter-SemiBold.woff2'] && FONT_FILE_IDS['Inter-SemiBold.woff2'].trim() !== '') && `
        @font-face {
          font-family: 'Inter';
          src: url('${getFontUrl(FONT_FILE_IDS['Inter-SemiBold.woff2'])}') format('woff2');
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
      `,
      // Inter Bold - only load if file ID is provided
      (FONT_FILE_IDS['Inter-Bold.woff2'] && FONT_FILE_IDS['Inter-Bold.woff2'].trim() !== '') && `
        @font-face {
          font-family: 'Inter';
          src: url('${getFontUrl(FONT_FILE_IDS['Inter-Bold.woff2'])}') format('woff2');
          font-weight: 700;
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

