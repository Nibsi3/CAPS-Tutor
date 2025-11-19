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

// Set up error suppression immediately when module loads (before React mounts)
if (typeof window !== 'undefined' && !(window as any).__errorSuppressorSetup) {
  const handleChromeExtensionError = (message: string): boolean => {
    return (
      message.includes('runtime.lastError') ||
      message.includes('message port closed') ||
      message.includes('Unchecked runtime.lastError') ||
      message.includes('The message port closed before a response was received')
    );
  };

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error immediately
  console.error = (...args: unknown[]) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      String(arg)
    ).join(' ');
    
    if (handleChromeExtensionError(message)) {
      return; // Suppress the error
    }
    
    // Suppress Appwrite permission errors for collections handled gracefully
    if (
      (message.includes('not authorized') || message.includes('unauthorized')) &&
      (message.includes('userprogress') || 
       message.includes('pastPaperProgress') ||
       message.includes('listDocuments'))
    ) {
      return; // Suppress the error
    }
    
    originalError.apply(console, args);
  };

  // Override console.warn immediately
  console.warn = (...args: unknown[]) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      String(arg)
    ).join(' ');
    
    if (handleChromeExtensionError(message)) {
      return; // Suppress the warning
    }
    
    originalWarn.apply(console, args);
  };

  // Set up unhandled promise rejection handler immediately
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason) || '';
    if (handleChromeExtensionError(message)) {
      event.preventDefault();
    }
  });

  (window as any).__errorSuppressorSetup = true;
  (window as any).__errorSuppressorOriginals = { originalError, originalWarn };
}

export function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get original console methods (either from module-level setup or current)
    const originalError = (window as any).__errorSuppressorOriginals?.originalError || console.error;
    const originalWarn = (window as any).__errorSuppressorOriginals?.originalWarn || console.warn;
    const originalLog = console.log;

    // Suppress Appwrite font CORS errors, Chrome extension errors, localization errors, and handled permission errors
    const shouldSuppressError = (message: string): boolean => {
      // Appwrite font CORS errors and blocked font request errors
      if (
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode-Regular.woff2') ||
        message.includes('FiraCode-Regular') ||
        message.includes('Inter-Regular.woff2') ||
        message.includes('Inter-Regular') ||
        (message.includes('Access to font') && message.includes('appwrite.io')) ||
        (message.includes('CORS policy') && message.includes('appwrite.io')) ||
        (message.includes('Access-Control-Allow-Origin') && message.includes('appwrite.io')) ||
        (message.includes('Failed to load resource') && message.includes('appwrite.io')) ||
        message.includes('Blocked Appwrite font request')
      ) {
        return true;
      }
      
      // Appwrite localization errors (non-critical)
      if (
        message.includes('RegisterClientLocalizationsError') ||
        (message.includes('translations') && message.includes('Cannot read properties of undefined')) ||
        (message.includes('translations') && message.includes('undefined'))
      ) {
        return true;
      }
      
      // Appwrite permission errors for collections that are handled gracefully
      // These errors are caught and handled by use-collection.tsx, returning empty arrays
      // They're logged as warnings but still show up in console.error, so we suppress them
      if (
        (message.includes('not authorized') || message.includes('unauthorized')) &&
        (message.includes('userprogress') || 
         message.includes('pastPaperProgress') ||
         message.includes('listDocuments'))
      ) {
        return true;
      }
      
      // Chrome extension errors
      if (
        message.includes('runtime.lastError') ||
        message.includes('message port closed') ||
        message.includes('Unchecked runtime.lastError') ||
        message.includes('The message port closed before a response was received')
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

    // Suppress network errors for Appwrite fonts and Chrome extension errors - comprehensive handler
    const errorHandler = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      const target = event.target;
      
      // Check if this is an Appwrite font-related error
      const isAppwriteFontError = 
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode') ||
        message.includes('Inter-Regular') ||
        message.includes('Blocked Appwrite font request') ||
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
      
      // Check for Chrome extension errors
      const isChromeExtensionError =
        message.includes('runtime.lastError') ||
        message.includes('message port closed') ||
        message.includes('Unchecked runtime.lastError') ||
        message.includes('The message port closed before a response was received');
      
      if (isChromeExtensionError) {
        // Suppress Chrome extension errors - they're harmless
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Suppress unhandled promise rejections related to fonts, localization, and Chrome extensions
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason) || '';
      const errorName = reason?.name || '';
      
      // Check for Appwrite font errors
      if (
        message.includes('assets.appwrite.io/fonts') ||
        message.includes('FiraCode') ||
        message.includes('Inter-Regular') ||
        message.includes('Blocked Appwrite font request') ||
        (message.includes('CORS') && message.includes('appwrite.io'))
      ) {
        event.preventDefault();
        return false;
      }
      
      // Check for Appwrite localization errors
      if (
        errorName === 'RegisterClientLocalizationsError' ||
        message.includes('RegisterClientLocalizationsError') ||
        (message.includes('translations') && message.includes('Cannot read properties of undefined')) ||
        (message.includes('translations') && message.includes('undefined'))
      ) {
        event.preventDefault();
        return false;
      }
      
      // Check for Chrome extension errors (runtime.lastError, message port closed)
      if (
        message.includes('runtime.lastError') ||
        message.includes('message port closed') ||
        message.includes('Unchecked runtime.lastError') ||
        message.includes('The message port closed before a response was received')
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

