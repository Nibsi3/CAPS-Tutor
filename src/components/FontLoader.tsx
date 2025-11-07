'use client';

import { useEffect } from 'react';
import { getFontUrl } from '@/lib/font-config';

/**
 * FontLoader component that loads fonts from Appwrite Storage
 * This replaces the Appwrite SDK's font loading which causes CORS errors
 */
export function FontLoader() {
  useEffect(() => {
    // Only load fonts on client side
    if (typeof window === 'undefined') return;

    // Create a style element with @font-face rules using Appwrite Storage URLs
    const styleId = 'appwrite-storage-fonts';
    
    // Check if we've already added the styles
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: 'Fira Code';
        src: url('${getFontUrl('FiraCode-Light.woff2')}') format('woff2'),
             url('${getFontUrl('FiraCode-Light.woff')}') format('woff');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fira Code';
        src: url('${getFontUrl('FiraCode-Regular.woff2')}') format('woff2'),
             url('${getFontUrl('FiraCode-Regular.woff')}') format('woff');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fira Code';
        src: url('${getFontUrl('FiraCode-Medium.woff2')}') format('woff2'),
             url('${getFontUrl('FiraCode-Medium.woff')}') format('woff');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fira Code';
        src: url('${getFontUrl('FiraCode-SemiBold.woff2')}') format('woff2'),
             url('${getFontUrl('FiraCode-SemiBold.woff')}') format('woff');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fira Code';
        src: url('${getFontUrl('FiraCode-Bold.woff2')}') format('woff2'),
             url('${getFontUrl('FiraCode-Bold.woff')}') format('woff');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Fira Code VF';
        src: url('${getFontUrl('FiraCode-VF.woff2')}') format('woff2-variations'),
             url('${getFontUrl('FiraCode-VF.woff')}') format('woff-variations');
        font-weight: 300 700;
        font-style: normal;
        font-display: swap;
      }
    `;

    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
}

