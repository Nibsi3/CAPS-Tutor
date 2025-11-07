'use client';

import { useEffect } from 'react';

/**
 * Suppresses harmless console errors that don't affect functionality:
 * - Appwrite font CORS errors (from Appwrite SDK, not our app)
 * - Chrome extension runtime.lastError (from browser extensions)
 * - Network resource loading errors for Appwrite fonts
 * 
 * These errors are cosmetic and don't impact the application's functionality.
 */
export function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Suppress Appwrite font CORS errors and Chrome extension errors
    const shouldSuppressError = (message: string): boolean => {
      // Appwrite font CORS errors
      if (
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode-Regular.woff2') ||
        message.includes('FiraCode-Regular') ||
        message.includes('Inter-Regular.woff2') ||
        message.includes('Inter-Regular') ||
        (message.includes('Access to font') && message.includes('appwrite.io')) ||
        (message.includes('CORS policy') && message.includes('appwrite.io')) ||
        (message.includes('Access-Control-Allow-Origin') && message.includes('appwrite.io')) ||
        (message.includes('Failed to load resource') && message.includes('appwrite.io'))
      ) {
        return true;
      }
      
      // Chrome extension errors
      if (
        message.includes('runtime.lastError') ||
        message.includes('message port closed') ||
        message.includes('Unchecked runtime.lastError')
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

    // Override console.warn to filter Chrome extension warnings and font errors
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

    // Also intercept console.log for network errors that might be logged
    console.log = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : 
        arg instanceof Error ? arg.message : 
        String(arg)
      ).join(' ');
      
      if (shouldSuppressError(message)) {
        // Suppress this log - it's harmless
        return;
      }
      
      // Call original log handler for all other logs
      originalLog.apply(console, args);
    };

    // Suppress network errors for Appwrite fonts - comprehensive handler
    const errorHandler = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      const target = event.target;
      
      // Check if this is an Appwrite font-related error
      const isAppwriteFontError = 
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode') ||
        message.includes('Inter-Regular') ||
        filename.includes('appwrite.io/fonts') ||
        (target instanceof HTMLLinkElement && target.href?.includes('appwrite.io/fonts')) ||
        (target instanceof HTMLStyleElement && message.includes('font')) ||
        message.includes('CORS policy') && (message.includes('appwrite.io') || filename.includes('appwrite.io')) ||
        message.includes('Access-Control-Allow-Origin') && (message.includes('appwrite.io') || filename.includes('appwrite.io'));
      
      if (isAppwriteFontError) {
        // Suppress Appwrite font loading errors
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Suppress unhandled promise rejections related to fonts
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason) || '';
      
      if (
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode') ||
        message.includes('Inter-Regular') ||
        message.includes('CORS') && message.includes('appwrite.io')
      ) {
        event.preventDefault();
        return false;
      }
    };

    // Intercept network errors at the resource level
    const resourceErrorHandler = (event: Event) => {
      const target = event.target;
      
      if (target instanceof HTMLLinkElement) {
        const href = target.href || '';
        if (href.includes('assets.appwrite.io/fonts')) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      }
    };

    window.addEventListener('error', errorHandler, true);
    window.addEventListener('unhandledrejection', rejectionHandler);
    window.addEventListener('error', resourceErrorHandler, true);

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('error', resourceErrorHandler, true);
    };
  }, []);

  return null;
}

