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
  'assets.appwrite.io',
  'assets.appwrite.io/fonts/fira-code',
  'assets.appwrite.io/fonts/inter',
  'https://assets.appwrite.io/fonts/inter',
  'https://assets.appwrite.io/fonts/fira-code',
  'fonts/inter/',
  'fonts/fira-code/',
  'Inter-Regular.woff2',
  'FiraCode-Regular.woff2',
  'Inter-',
  'FiraCode-',
  '/fonts/inter/',
  '/fonts/fira-code/',
  '.woff',
  '.woff2',
  '.ttf',
  'font-display',
  'font-face',
];

const isAppwriteFontRequest = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return appwriteFontPatterns.some(pattern => url.includes(pattern));
};

// Set up interceptors immediately when module loads (before React mounts)
// This must run before any other scripts that might load fonts
if (typeof window !== 'undefined' && !(window as any).__fontBlockerSetup) {
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(...args: Parameters<typeof fetch>): Promise<Response> {
    let url = '';
    try {
      if (typeof args[0] === 'string') {
        url = args[0];
      } else if (args[0] instanceof Request) {
        url = args[0].url;
      } else if (args[0] instanceof URL) {
        url = args[0].toString();
      }
    } catch (error) {
      // If URL extraction fails, allow the request to proceed
      return originalFetch(...args);
    }
    
    if (isAppwriteFontRequest(url)) {
      // Block the request by returning a rejected promise
      return Promise.reject(new Error('Blocked Appwrite font request'));
    }
    
    // Call original fetch directly (fetch doesn't use 'this' context)
    return originalFetch(...args);
  };

  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    const urlString = typeof url === 'string' ? url : url.toString();
    
    if (isAppwriteFontRequest(urlString)) {
      // Block by throwing an error
      throw new Error('Blocked Appwrite font request');
    }
    
    return originalXHROpen.call(this, method, url, async ?? true, username, password);
  };

  // Intercept createElement to prevent font link/style tags from being created
  const originalCreateElement = Document.prototype.createElement;
  Document.prototype.createElement = function(tagName: string, options?: ElementCreationOptions): HTMLElement {
    const element = originalCreateElement.call(this, tagName, options);
    
    // If it's a link or style tag, intercept attribute setting
    if (element instanceof HTMLLinkElement || element instanceof HTMLStyleElement) {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        // Block font preloads and Appwrite font links
        if (name === 'href' && isAppwriteFontRequest(value)) {
          // Block setting the attribute
          return;
        }
        if (name === 'rel' && value === 'preload') {
          // Store that it's a preload to check as attribute
          (element as any).__isPreload = true;
        }
        if (name === 'as' && (element as any).__isPreload && value === 'font') {
          // Block font preloads that reference Appwrite fonts
          const href = element.getAttribute('href') || '';
          if (isAppwriteFontRequest(href) || href.includes('.woff') || href.includes('.woff2')) {
            return; // Block setting the attribute
          }
        }
        return originalSetAttribute(name, value);
      };
      
      // Also intercept href property directly for link elements
      if (element instanceof HTMLLinkElement) {
        const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
        if (originalHrefDescriptor) {
          Object.defineProperty(element, 'href', {
            set: function(value: string) {
              if (isAppwriteFontRequest(value)) {
                return;
              }
              if (originalHrefDescriptor.set) {
                originalHrefDescriptor.set.call(this, value);
              }
            },
            get: function() {
              if (originalHrefDescriptor.get) {
                return originalHrefDescriptor.get.call(this);
              }
              return this.getAttribute('href') || '';
            },
            configurable: true,
            enumerable: true,
          });
        }
      }
    }
    
    return element;
  };

  // Intercept link tag insertions
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(child: T): T {
    if (child instanceof HTMLLinkElement) {
      const href = child.href || child.getAttribute('href') || '';
      const rel = child.getAttribute('rel') || '';
      const as = child.getAttribute('as') || '';
      
      // Block font preloads and Appwrite font links
      if ((rel === 'preload' && as === 'font') || isAppwriteFontRequest(href)) {
        // Return the child without actually appending it
        return child;
      }
    }
    if (child instanceof HTMLStyleElement) {
      const textContent = child.textContent || child.innerHTML || '';
      if (isAppwriteFontRequest(textContent)) {
        // Return the child without actually appending it
        return child;
      }
    }
    return originalAppendChild.call(this, child) as T;
  };

  // Intercept insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (newNode instanceof HTMLLinkElement) {
      const href = newNode.href || newNode.getAttribute('href') || '';
      const rel = newNode.getAttribute('rel') || '';
      const as = newNode.getAttribute('as') || '';
      
      // Block font preloads and Appwrite font links
      if ((rel === 'preload' && as === 'font') || isAppwriteFontRequest(href)) {
        // Return the node without actually inserting it
        return newNode;
      }
    }
    if (newNode instanceof HTMLStyleElement) {
      const textContent = newNode.textContent || newNode.innerHTML || '';
      if (isAppwriteFontRequest(textContent)) {
        // Return the node without actually inserting it
        return newNode;
      }
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
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

  // Also intercept style element textContent and innerHTML
  const originalStyleTextContent = Object.getOwnPropertyDescriptor(HTMLStyleElement.prototype, 'textContent')?.set;
  if (originalStyleTextContent) {
    Object.defineProperty(HTMLStyleElement.prototype, 'textContent', {
      set: function(value: string | null) {
        if (typeof value === 'string' && isAppwriteFontRequest(value)) {
          return;
        }
        originalStyleTextContent.call(this, value);
      },
      get: Object.getOwnPropertyDescriptor(HTMLStyleElement.prototype, 'textContent')?.get,
      configurable: true,
      enumerable: true,
    });
  }

  (window as any).__fontBlockerSetup = true;
  (window as any).__fontBlockerOriginals = {
    originalFetch,
    originalXHROpen,
    originalCreateElement,
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

