'use client';

import { useEffect } from 'react';

/**
 * FontRequestBlocker prevents Appwrite font requests from being made,
 * eliminating CORS errors at the source rather than just suppressing them.
 * 
 * This component intercepts:
 * - fetch() requests to Appwrite font URLs
 * - XMLHttpRequest to Appwrite font URLs
 * - <link> tag insertions for Appwrite fonts
 * - <style> tag insertions that reference Appwrite fonts
 */

const appwriteFontPatterns = [
  'assets.appwrite.io/fonts',
  'Inter-Regular.woff2',
  'FiraCode-Regular.woff2',
];

const isAppwriteFontRequest = (url: string): boolean => {
  return appwriteFontPatterns.some(pattern => url.includes(pattern));
};

// Set up interceptors immediately when module loads (before React mounts)
if (typeof window !== 'undefined' && !(window as any).__fontBlockerSetup) {
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    
    if (isAppwriteFontRequest(url)) {
      // Block the request by returning a rejected promise
      return Promise.reject(new Error('Blocked Appwrite font request'));
    }
    
    return originalFetch.apply(this, args);
  };

  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlString = typeof url === 'string' ? url : url.toString();
    
    if (isAppwriteFontRequest(urlString)) {
      // Block by throwing an error
      throw new Error('Blocked Appwrite font request');
    }
    
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  // Intercept link tag insertions
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(child: T): T {
    if (child instanceof HTMLLinkElement) {
      const href = child.href || child.getAttribute('href') || '';
      if (isAppwriteFontRequest(href)) {
        // Return the child without actually appending it
        return child;
      }
    }
    return originalAppendChild.call(this, child);
  };

  // Intercept insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (newNode instanceof HTMLLinkElement) {
      const href = newNode.href || newNode.getAttribute('href') || '';
      if (isAppwriteFontRequest(href)) {
        // Return the node without actually inserting it
        return newNode;
      }
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };

  // Intercept style tag insertions that might contain @font-face rules
  const originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function(position: InsertPosition, html: string) {
    if (isAppwriteFontRequest(html)) {
      // Block the insertion
      return;
    }
    return originalInsertAdjacentHTML.call(this, position, html);
  };

  // Intercept innerHTML assignments that might contain font links
  const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.set;
  if (originalSetInnerHTML) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value: string) {
        if (typeof value === 'string' && isAppwriteFontRequest(value)) {
          // Block the assignment
          return;
        }
        originalSetInnerHTML.call(this, value);
      },
      get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.get,
      configurable: true,
      enumerable: true,
    });
  }

  (window as any).__fontBlockerSetup = true;
  (window as any).__fontBlockerOriginals = {
    originalFetch,
    originalXHROpen,
    originalAppendChild,
    originalInsertBefore,
    originalInsertAdjacentHTML,
    originalSetInnerHTML,
  };
}

export function FontRequestBlocker() {
  // The interceptors are already set up at module load time (before React mounts)
  // This component just ensures the module is loaded and interceptors are active
  // No cleanup needed - we want these interceptors to persist for the app lifetime
  return null;
}

