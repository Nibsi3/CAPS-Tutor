'use client';

import { useEffect } from 'react';

/**
 * Suppresses harmless console errors that don't affect functionality:
 * - Appwrite font CORS errors (from Appwrite SDK, not our app)
 * - Chrome extension runtime.lastError (from browser extensions)
 * 
 * These errors are cosmetic and don't impact the application's functionality.
 */
export function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Suppress Appwrite font CORS errors and Chrome extension errors
    const shouldSuppressError = (message: string): boolean => {
      // Appwrite font CORS errors
      if (
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode-Regular.woff2') ||
        message.includes('Inter-Regular.woff2') ||
        (message.includes('Access to font') && message.includes('appwrite.io')) ||
        (message.includes('CORS policy') && message.includes('appwrite.io'))
      ) {
        return true;
      }
      
      // Chrome extension errors
      if (
        message.includes('runtime.lastError') ||
        message.includes('message port closed')
      ) {
        return true;
      }
      
      return false;
    };

    // Override console.error to filter Appwrite font errors
    console.error = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : 
        arg instanceof Error ? arg.message : 
        String(arg)
      ).join(' ');
      
      if (shouldSuppressError(message)) {
        // Suppress this error - it's harmless
        return;
      }
      
      // Call original error handler for all other errors
      originalError.apply(console, args);
    };

    // Override console.warn to filter Chrome extension warnings
    console.warn = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : 
        arg instanceof Error ? arg.message : 
        String(arg)
      ).join(' ');
      
      if (shouldSuppressError(message)) {
        // Suppress this warning - it's harmless
        return;
      }
      
      // Call original warn handler for all other warnings
      originalWarn.apply(console, args);
    };

    // Suppress network errors for Appwrite fonts
    const errorHandler = (event: ErrorEvent) => {
      const target = event.target;
      if (
        target &&
        (target instanceof HTMLLinkElement || target instanceof HTMLStyleElement) &&
        (event.message?.includes('assets.appwrite.io/fonts') ||
         event.message?.includes('FiraCode') ||
         event.message?.includes('Inter-Regular') ||
         (event.filename?.includes('appwrite.io') && event.message?.includes('font')))
      ) {
        // Suppress Appwrite font loading errors
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }
    };

    window.addEventListener('error', errorHandler, true);

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', errorHandler, true);
    };
  }, []);

  return null;
}

