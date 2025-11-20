import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppwriteClientProvider } from '@/appwrite/client-provider';
import { LanguageProvider } from '@/components/language-provider';
import { FontLoaderFromAppwrite } from '@/components/FontLoaderFromAppwrite';
import { ConditionalPublicLayout } from '@/components/layout/ConditionalPublicLayout';
import { ErrorSuppressor } from '@/components/ErrorSuppressor';
import { FontRequestBlocker } from '@/components/FontRequestBlocker';
import { GlobalAchievementChecker } from '@/components/achievements/GlobalAchievementChecker';
import { MaintenanceModeGuard } from '@/components/MaintenanceModeGuard';
import { ScrollToTop } from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'CAPS Tutor - Your AI Learning Companion',
  description: 'An AI-powered tutor for the South African CAPS syllabus.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: AppwriteClientProvider handles missing env vars gracefully with safe fallbacks
  // Debug logging removed to reduce console noise - check browser console for one-time warnings
  
  // Always render AppwriteClientProvider - it handles missing env vars gracefully
  // The provider will return safe fallbacks when env vars are not set
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-body antialiased"
      >
        {/* Early blocking script - runs before any other scripts using beforeInteractive strategy */}
        <Script
          id="block-appwrite-fonts-earliest"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                // Block fetch IMMEDIATELY - must be first
                if (typeof window !== 'undefined' && window.fetch) {
                  const origFetch = window.fetch;
                  window.fetch = function(...args) {
                    let url = '';
                    try {
                      if (typeof args[0] === 'string') url = args[0];
                      else if (args[0]?.url) url = args[0].url;
                      else if (args[0] instanceof Request) url = args[0].url;
                      else if (args[0] instanceof URL) url = args[0].toString();
                      else url = String(args[0] || '');
                    } catch(e) {}
                    // Check for Appwrite font URLs - catch all variations
                    const urlLower = url.toLowerCase();
                    if (urlLower && (
                      urlLower.includes('assets.appwrite.io/fonts') ||
                      urlLower.includes('fira-code') ||
                      urlLower.includes('inter') && (urlLower.includes('.woff') || urlLower.includes('.woff2') || urlLower.includes('/fonts/'))
                    )) {
                      console.debug('[FontBlocker-Earliest] Blocked fetch:', url);
                      return Promise.reject(new Error('Blocked Appwrite font request'));
                    }
                    return origFetch.apply(this, args);
                  };
                }
                
                // Block XMLHttpRequest IMMEDIATELY
                if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype && XMLHttpRequest.prototype.open) {
                  const origOpen = XMLHttpRequest.prototype.open;
                  XMLHttpRequest.prototype.open = function(method, url) {
                    const urlStr = typeof url === 'string' ? url : (url?.toString() || '');
                    // Check for Appwrite font URLs - catch all variations
                    const urlStrLower = urlStr.toLowerCase();
                    if (urlStrLower && (
                      urlStrLower.includes('assets.appwrite.io/fonts') ||
                      (urlStrLower.includes('fira-code') && urlStrLower.includes('.woff')) ||
                      (urlStrLower.includes('inter') && urlStrLower.includes('.woff'))
                    )) {
                      console.debug('[FontBlocker-Earliest] Blocked XHR:', urlStr);
                      throw new Error('Blocked Appwrite font request');
                    }
                    return origOpen.apply(this, arguments);
                  };
                }
                
                // Block link tag creation IMMEDIATELY
                if (typeof document !== 'undefined' && document.createElement) {
                  const origCreateElement = document.createElement;
                  document.createElement = function(tagName) {
                    const el = origCreateElement.call(this, tagName);
                    if (tagName === 'LINK' && el.setAttribute) {
                      const origSetAttr = el.setAttribute.bind(el);
                      el.setAttribute = function(name, value) {
                        // Block Appwrite font URLs - check case-insensitively
                        if (name === 'href' && value) {
                          const valueLower = value.toLowerCase();
                          if (valueLower.includes('assets.appwrite.io/fonts') ||
                              (valueLower.includes('fira-code') && valueLower.includes('.woff')) ||
                              (valueLower.includes('inter') && valueLower.includes('.woff'))) {
                            console.debug('[FontBlocker-Earliest] Blocked link href:', value);
                            return; // Block setting href
                          }
                        }
                        if (name === 'rel' && value === 'preload') {
                          el.__isPreload = true;
                        }
                        if (name === 'as' && el.__isPreload && value === 'font') {
                          const href = el.getAttribute('href') || '';
                          if (href && (
                            href.includes('assets.appwrite.io/fonts') ||
                            href.includes('.woff') ||
                            href.includes('.woff2')
                          )) {
                            return; // Block font preload
                          }
                        }
                        return origSetAttr(name, value);
                      };
                    }
                    return el;
                  };
                }
                
                // Remove any existing Appwrite font links IMMEDIATELY
                if (typeof document !== 'undefined') {
                  const removeFontLinks = function() {
                    try {
                      if (document.head) {
                        const links = document.head.querySelectorAll('link[href*="assets.appwrite.io"]');
                        links.forEach(link => link.remove());
                      }
                    } catch(e) {}
                  };
                  // Try immediately, and also on DOM ready
                  removeFontLinks();
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', removeFontLinks);
                  }
                }
                
                // Inject CSS overrides IMMEDIATELY - run when document is ready
                if (typeof document !== 'undefined') {
                  const injectCSS = function() {
                    try {
                      if (document.head || document.documentElement) {
                        const existingStyle = document.getElementById('block-appwrite-fonts-inline-css');
                        if (!existingStyle) {
                          const style = document.createElement('style');
                          style.id = 'block-appwrite-fonts-inline-css';
                          style.textContent = '@font-face{font-family:"Inter";src:local("Arial"),local("Helvetica"),local("sans-serif");font-weight:100 900;font-style:normal italic}@font-face{font-family:"Fira Code";src:local("Monaco"),local("Menlo"),local("Courier New"),local("monospace");font-weight:100 900;font-style:normal italic}@font-face{font-family:"Fira Code VF";src:local("Monaco"),local("Menlo"),local("Courier New"),local("monospace");font-weight:100 900;font-style:normal italic}';
                          const target = document.head || document.documentElement;
                          if (target) {
                            target.insertBefore(style, target.firstChild);
                          }
                        }
                      }
                    } catch(e) {}
                  };
                  // Try immediately, and also on DOM ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', injectCSS);
                  } else {
                    injectCSS();
                  }
                  // Also try after a short delay to catch late-added links
                  setTimeout(injectCSS, 0);
                }
              })();
            `,
          }}
        />
        <Script
          id="block-appwrite-fonts-inline-enhanced"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                // Enhanced pattern matching - catch all variations
                const fontPatterns = [
                  'assets.appwrite.io/fonts',
                  'assets.appwrite.io/fonts/fira-code',
                  'assets.appwrite.io/fonts/inter',
                  '/fonts/fira-code/',
                  '/fonts/inter/',
                  'fonts/fira-code/',
                  'fonts/inter/',
                  'FiraCode-Regular.woff2',
                  'FiraCode-Regular.woff',
                  'Inter-Regular.woff2',
                  'Inter-Regular.woff2',
                  'FiraCode-',
                  'Inter-'
                ];
                const isFontRequest = function(url) {
                  if (!url || typeof url !== 'string') return false;
                  const urlLower = url.toLowerCase();
                  return fontPatterns.some(p => urlLower.includes(p.toLowerCase()));
                };
                
                // Block fetch with enhanced patterns
                if (window.fetch) {
                  const origFetch = window.fetch;
                  window.fetch = function(...args) {
                    let url = '';
                    try {
                      if (typeof args[0] === 'string') url = args[0];
                      else if (args[0]?.url) url = args[0].url;
                      else if (args[0] instanceof Request) url = args[0].url;
                      else if (args[0] instanceof URL) url = args[0].toString();
                      else url = String(args[0] || '');
                    } catch(e) {}
                    if (isFontRequest(url)) {
                      return Promise.reject(new Error('Blocked Appwrite font request'));
                    }
                    return origFetch.apply(this, args);
                  };
                }
                
                // Block XMLHttpRequest with enhanced patterns
                if (XMLHttpRequest && XMLHttpRequest.prototype && XMLHttpRequest.prototype.open) {
                  const origOpen = XMLHttpRequest.prototype.open;
                  XMLHttpRequest.prototype.open = function(method, url) {
                    const urlStr = typeof url === 'string' ? url : (url?.toString() || '');
                    if (isFontRequest(urlStr)) {
                      throw new Error('Blocked Appwrite font request');
                    }
                    return origOpen.apply(this, arguments);
                  };
                }
              })();
            `,
          }}
        />
        <Script
          id="block-appwrite-fonts"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window === 'undefined' || typeof document === 'undefined') return;

                  // Add CSS to block font loading immediately
                  const style = document.createElement('style');
                  style.id = 'block-appwrite-fonts-css';
                  style.textContent = \`
                    /* Override Appwrite font definitions */
                    @font-face {
                      font-family: 'Inter';
                      src: local('Arial'), local('Helvetica'), local('sans-serif');
                      font-weight: 100 900;
                      font-style: normal italic;
                    }
                    @font-face {
                      font-family: 'Fira Code';
                      src: local('Monaco'), local('Menlo'), local('Courier New'), local('monospace');
                      font-weight: 100 900;
                      font-style: normal italic;
                    }
                    @font-face {
                      font-family: 'Fira Code VF';
                      src: local('Monaco'), local('Menlo'), local('Courier New'), local('monospace');
                      font-weight: 100 900;
                      font-style: normal italic;
                    }
                    /* Block any @import attempts to Appwrite fonts */
                    @import url('data:text/css;base64,');
                  \`;
                  if (document.head) {
                    document.head.insertBefore(style, document.head.firstChild);
                  }

                  // Remove any existing Appwrite font links immediately
                  const existingLinks = document.querySelectorAll('link[href*="assets.appwrite.io"]');
                  existingLinks.forEach(link => link.remove());

                  // Set up a MutationObserver to catch dynamically added font links
                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                          const element = node as Element;
                          if (element.tagName === 'LINK') {
                            const linkElement = element as HTMLLinkElement;
                            const href = linkElement.href || linkElement.getAttribute('href') || '';
                            const rel = linkElement.getAttribute('rel') || '';
                            const hrefLower = href.toLowerCase();
                            
                            // Check for Appwrite font URLs - more comprehensive
                            const isAppwriteFont = hrefLower.includes('assets.appwrite.io/fonts') ||
                                                 (hrefLower.includes('fira-code') && (hrefLower.includes('.woff') || hrefLower.includes('.woff2'))) ||
                                                 (hrefLower.includes('inter') && (hrefLower.includes('.woff') || hrefLower.includes('.woff2')));
                            
                            if ((rel === 'preload' || rel === 'stylesheet') && (isAppwriteFont || href.includes('.woff') || href.includes('.woff2'))) {
                              console.debug('[FontBlocker] Removed dynamically added font link:', href);
                              linkElement.remove();
                            }
                          } else if (element.tagName === 'STYLE') {
                            const styleElement = element as HTMLStyleElement;
                            const content = styleElement.textContent || styleElement.innerHTML || '';
                            const contentLower = content.toLowerCase();
                            const isAppwriteFontInContent = contentLower.includes('assets.appwrite.io/fonts') ||
                                                          (contentLower.includes('fira-code') && (contentLower.includes('.woff') || contentLower.includes('.woff2'))) ||
                                                          (contentLower.includes('inter') && (contentLower.includes('.woff') || contentLower.includes('.woff2')));
                            
                            if (isAppwriteFontInContent || (content.includes('@font-face') && (content.includes('.woff') || content.includes('.woff2')))) {
                              console.debug('[FontBlocker] Removed dynamically added font style');
                              styleElement.remove();
                            }
                          }
                        }
                      });
                    });
                  });

                  // Start observing - observe documentElement to catch everything
                  if (document.documentElement) {
                    observer.observe(document.documentElement, { childList: true, subtree: true });
                  }
                  if (document.head) {
                    observer.observe(document.head, { childList: true, subtree: true });
                  }
                  if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                  }
                  
                  // Block font requests from Appwrite assets CDN - enhanced comprehensive patterns
                  const patterns = [
                    'assets.appwrite.io/fonts',
                    'assets.appwrite.io/fonts/fira-code',
                    'assets.appwrite.io/fonts/inter',
                    'https://assets.appwrite.io/fonts/inter',
                    'https://assets.appwrite.io/fonts/fira-code',
                    'http://assets.appwrite.io/fonts/inter',
                    'http://assets.appwrite.io/fonts/fira-code',
                    'https://assets.appwrite.io/fonts/fira-code/',
                    'https://assets.appwrite.io/fonts/inter/',
                    'Inter-Regular.woff2',
                    'Inter-Regular.woff',
                    'Inter-Medium.woff2',
                    'Inter-SemiBold.woff2',
                    'Inter-Bold.woff2',
                    'FiraCode-Regular.woff2',
                    'FiraCode-Regular.woff',
                    'FiraCode-Medium.woff2',
                    'FiraCode-SemiBold.woff2',
                    'FiraCode-Bold.woff2',
                    '/fonts/fira-code/',
                    '/fonts/inter/',
                    'fonts/fira-code/',
                    'fonts/inter/',
                    'FiraCode-',
                    'Inter-',
                    '.woff2',
                    '.woff'
                  ];
                  const isBlocked = (url) => {
                    try {
                      if (!url || typeof url !== 'string') return false;
                      const urlLower = url.toLowerCase();
                      return patterns.some(p => urlLower.includes(p.toLowerCase()));
                    } catch (e) {
                      return false; // Fail open - don't block if we can't check
                    }
                  };
                  
                  // Block ALL font loading through CSS @font-face rules
                  const blockFontFace = () => {
                    try {
                      if (!document.styleSheets) return;
                      
                      // Intercept @font-face rules in all stylesheets
                      const processStyleSheet = (sheet) => {
                        try {
                          if (!sheet.cssRules && !sheet.rules) return;
                          const rules = sheet.cssRules || sheet.rules || [];
                          for (let i = rules.length - 1; i >= 0; i--) {
                            const rule = rules[i];
                            if (rule.type === CSSRule.FONT_FACE_RULE) {
                              const src = rule.style.src || '';
                              if (isBlocked(src)) {
                                try {
                                  sheet.deleteRule ? sheet.deleteRule(i) : sheet.removeRule(i);
                                  console.debug('[FontBlocker] Removed @font-face rule:', src);
                                } catch (e) {
                                  // Ignore deletion errors
                                }
                              }
                            }
                          }
                        } catch (e) {
                          // Cross-origin stylesheets throw errors, ignore
                        }
                      };
                      
                      // Process existing stylesheets
                      for (let i = 0; i < document.styleSheets.length; i++) {
                        processStyleSheet(document.styleSheets[i]);
                      }
                      
                      // Monitor for new stylesheets
                      const originalInsertRule = CSSStyleSheet.prototype.insertRule;
                      CSSStyleSheet.prototype.insertRule = function(rule, index) {
                        if (typeof rule === 'string' && rule.toLowerCase().includes('@font-face')) {
                          const srcMatch = rule.match(/src:\s*url\\(['"]?([^'"]+)['"]?\\)/i);
                          if (srcMatch && isBlocked(srcMatch[1])) {
                            console.debug('[FontBlocker] Blocked @font-face rule insertion:', srcMatch[1]);
                            return 0; // Return success but don't insert
                          }
                        }
                        return originalInsertRule.call(this, rule, index);
                      };
                      
                      // Also intercept CSS.supports if used for font detection
                      if (typeof CSS !== 'undefined' && CSS.supports) {
                        const originalSupports = CSS.supports;
                        CSS.supports = function(...args) {
                          const prop = args[0];
                          if (typeof prop === 'string' && prop.toLowerCase().includes('font')) {
                            // Allow but don't fail on font detection
                          }
                          return originalSupports.apply(this, args);
                        };
                      }
                    } catch (e) {
                      // Ignore errors
                    }
                  };
                  
                  // Run font-face blocking immediately
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', blockFontFace);
                  } else {
                    blockFontFace();
                  }
                  
                  // Remove existing font link tags immediately (synchronous)
                  const removeExistingFontLinks = () => {
                    try {
                      if (!document.head) return;
                      const links = document.head.querySelectorAll('link');
                      links.forEach((link) => {
                        const href = link.href || link.getAttribute('href') || '';
                        const rel = link.getAttribute('rel') || '';
                        const as = link.getAttribute('as') || '';
                        
                        // Block if it's a font preload or references Appwrite fonts
                        if ((rel === 'preload' && as === 'font') || isBlocked(href)) {
                          console.debug('[FontBlocker] Removed existing font link:', href);
                          link.remove();
                        }
                      });
                    } catch (e) {
                      // Ignore errors
                    }
                  };
                  
                  // Run immediately if head exists, otherwise wait for it
                  if (document.head) {
                    removeExistingFontLinks();
                  } else {
                    // If head doesn't exist yet, check immediately when it's created
                    const checkHead = setInterval(() => {
                      if (document.head) {
                        removeExistingFontLinks();
                        clearInterval(checkHead);
                      }
                    }, 10);
                    // Clear after 1 second to avoid infinite loop
                    setTimeout(() => clearInterval(checkHead), 1000);
                  }
                  
                  // Also run continuously to catch any late-added links (Appwrite SDK might add them after page load)
                  // Use a more frequent interval to catch Appwrite SDK font loading
                  setInterval(removeExistingFontLinks, 50); // Check every 50ms for aggressive blocking
                  
                  // Also monitor for font link additions via MutationObserver with better detection
                  const linkObserver = new MutationObserver(() => {
                    removeExistingFontLinks();
                  });
                  
                  if (document.head) {
                    linkObserver.observe(document.head, { 
                      childList: true, 
                      subtree: false, 
                      attributes: true, 
                      attributeFilter: ['href', 'rel', 'as'] 
                    });
                  } else {
                    // Wait for head to exist
                    const waitForHead = setInterval(() => {
                      if (document.head) {
                        linkObserver.observe(document.head, { 
                          childList: true, 
                          subtree: false, 
                          attributes: true, 
                          attributeFilter: ['href', 'rel', 'as'] 
                        });
                        clearInterval(waitForHead);
                      }
                    }, 10);
                    setTimeout(() => clearInterval(waitForHead), 2000);
                  }
                  
                  // Intercept fetch IMMEDIATELY - must be FIRST, before anything else
                  if (window.fetch && !window.__fontBlockerFetch) {
                    try {
                      const originalFetch = window.fetch;
                      // Block fetch at the earliest possible moment
                      window.fetch = function(...args) {
                        try {
                          let url = '';
                          if (typeof args[0] === 'string') {
                            url = args[0];
                          } else if (args[0] instanceof Request) {
                            url = args[0].url;
                          } else if (args[0] instanceof URL) {
                            url = args[0].toString();
                          } else if (args[0] && typeof args[0] === 'object') {
                            url = args[0].url || args[0].toString() || '';
                          }
                          
                          if (url && isBlocked(url)) {
                            console.debug('[FontBlocker] Blocked fetch request to:', url);
                            return Promise.reject(new Error('Blocked Appwrite font request'));
                          }
                          return originalFetch.apply(this, args);
                        } catch (e) {
                          // If it's our blocking error, re-throw it
                          if (e.message === 'Blocked Appwrite font request') throw e;
                          // For other errors, try to proceed
                          try {
                            return originalFetch.apply(this, args);
                          } catch {
                            return Promise.reject(e);
                          }
                        }
                      };
                      // Mark as done immediately
                      window.__fontBlockerFetch = true;
                      // Also set a flag to prevent re-initialization
                      Object.defineProperty(window, '__fontBlockerFetch', {
                        value: true,
                        writable: false,
                        configurable: false
                      });
                    } catch (e) {
                      console.warn('[FontBlocker] Failed to intercept fetch:', e);
                    }
                  }
                  
                  // Intercept XHR IMMEDIATELY - must be early
                  if (typeof XMLHttpRequest !== 'undefined' && !window.__fontBlockerXHR) {
                    try {
                      const originalOpen = XMLHttpRequest.prototype.open;
                      XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
                        try {
                          const urlString = typeof url === 'string' ? url : (url?.toString() || '');
                          if (urlString && isBlocked(urlString)) {
                            console.debug('[FontBlocker] Blocked XHR request to:', urlString);
                            throw new Error('Blocked Appwrite font request');
                          }
                          return originalOpen.call(this, method, url, async ?? true, username, password);
                        } catch (e) {
                          // If it's our blocking error, re-throw; otherwise allow the request
                          if (e.message === 'Blocked Appwrite font request') throw e;
                          return originalOpen.call(this, method, url, async ?? true, username, password);
                        }
                      };
                      window.__fontBlockerXHR = true;
                      Object.defineProperty(window, '__fontBlockerXHR', {
                        value: true,
                        writable: false,
                        configurable: false
                      });
                    } catch (e) {
                      console.warn('[FontBlocker] Failed to intercept XHR:', e);
                    }
                  }
                  
                  // Also intercept before the script finishes - run interceptors synchronously
                  (function setupInterceptorsImmediately() {
                    // This runs immediately, not waiting for anything
                    if (window.fetch && !window.__fontBlockerFetchSet) {
                      const originalFetch = window.fetch;
                      window.fetch = function(...args) {
                        try {
                          let url = typeof args[0] === 'string' ? args[0] : 
                                   (args[0]?.url || args[0]?.toString() || '');
                          if (url && (
                            url.includes('assets.appwrite.io/fonts') ||
                            url.includes('FiraCode-Regular.woff2') ||
                            url.includes('Inter-Regular.woff2') ||
                            url.includes('fonts/fira-code/') ||
                            url.includes('fonts/inter/')
                          )) {
                            console.debug('[FontBlocker-Early] Blocked early fetch:', url);
                            return Promise.reject(new Error('Blocked Appwrite font request'));
                          }
                          return originalFetch.apply(this, args);
                        } catch (e) {
                          if (e.message === 'Blocked Appwrite font request') throw e;
                          return originalFetch.apply(this, args);
                        }
                      };
                      window.__fontBlockerFetchSet = true;
                    }
                  })();
                  
                  // Intercept link tag creation to block preloads and font links
                  if (!window.__fontBlockerLink) {
                    try {
                      const originalCreateElement = Document.prototype.createElement;
                      Document.prototype.createElement = function(tagName, options) {
                        const element = originalCreateElement.call(this, tagName, options);
                        if (element instanceof HTMLLinkElement) {
                          const originalSetAttribute = element.setAttribute.bind(element);
                          element.setAttribute = function(name, value) {
                            // Block font preloads and Appwrite font links
                            if (name === 'href' && isBlocked(value)) {
                              console.debug('[FontBlocker] Blocked link href:', value);
                              return;
                            }
                            if (name === 'rel' && value === 'preload') {
                              // Store that it's a preload to check as attribute
                              element.__isPreload = true;
                            }
                            if (name === 'as' && element.__isPreload && value === 'font') {
                              // Block font preloads
                              const href = element.getAttribute('href') || '';
                              if (isBlocked(href) || href.includes('.woff') || href.includes('.woff2')) {
                                console.debug('[FontBlocker] Blocked font preload:', href);
                                return;
                              }
                            }
                            return originalSetAttribute(name, value);
                          };
                          
                          // Also intercept href property
                          const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
                          if (originalHrefDescriptor) {
                            Object.defineProperty(element, 'href', {
                              set: function(value) {
                                if (isBlocked(value)) {
                                  console.debug('[FontBlocker] Blocked link href property:', value);
                                  return;
                                }
                                if (originalHrefDescriptor.set) {
                                  originalHrefDescriptor.set.call(this, value);
                                }
                              },
                              get: function() {
                                return originalHrefDescriptor.get ? originalHrefDescriptor.get.call(this) : (this.getAttribute('href') || '');
                              },
                              configurable: true,
                              enumerable: true
                            });
                          }
                        }
                        return element;
                      };
                      window.__fontBlockerLink = true;
                    } catch (e) {
                      console.warn('[FontBlocker] Failed to intercept link creation:', e);
                    }
                  }
                  
                  // Watch for dynamically added link tags via MutationObserver
                  // Start immediately - don't wait for DOM ready
                  if (!window.__fontBlockerObserver && typeof MutationObserver !== 'undefined') {
                    const setupObserver = () => {
                      try {
                        if (!document.head && document.documentElement) {
                          // Observe documentElement if head doesn't exist yet
                          const observer = new MutationObserver((mutations) => {
                            try {
                              mutations.forEach((mutation) => {
                                mutation.addedNodes.forEach((node) => {
                                  if (node instanceof HTMLLinkElement) {
                                    const href = node.href || node.getAttribute('href') || '';
                                    const rel = node.getAttribute('rel') || '';
                                    const as = node.getAttribute('as') || '';
                                    
                                    // Block font preloads and Appwrite font links
                                    if ((rel === 'preload' && as === 'font') || isBlocked(href)) {
                                      console.debug('[FontBlocker] Blocked dynamically added link:', href);
                                      node.remove();
                                    }
                                  }
                                  if (node instanceof HTMLStyleElement) {
                                    const textContent = node.textContent || node.innerHTML || '';
                                    if (isBlocked(textContent)) {
                                      console.debug('[FontBlocker] Blocked dynamically added style');
                                      node.remove();
                                    }
                                  }
                                  // Also check if head was added
                                  if (node.nodeName === 'HEAD' && !window.__fontBlockerObserverHead) {
                                    setTimeout(() => {
                                      if (document.head) {
                                        observer.observe(document.head, {
                                          childList: true,
                                          subtree: false
                                        });
                                        window.__fontBlockerObserverHead = true;
                                      }
                                    }, 0);
                                  }
                                });
                              });
                            } catch (e) {
                              // Ignore observer errors
                            }
                          });
                          
                          observer.observe(document.documentElement, {
                            childList: true,
                            subtree: true
                          });
                          
                          window.__fontBlockerObserver = observer;
                          
                          // If head exists, also observe it
                          if (document.head) {
                            observer.observe(document.head, {
                              childList: true,
                              subtree: false
                            });
                            window.__fontBlockerObserverHead = true;
                          }
                        } else if (document.head) {
                          const observer = new MutationObserver((mutations) => {
                            try {
                              mutations.forEach((mutation) => {
                                mutation.addedNodes.forEach((node) => {
                                  if (node instanceof HTMLLinkElement) {
                                    const href = node.href || node.getAttribute('href') || '';
                                    const rel = node.getAttribute('rel') || '';
                                    const as = node.getAttribute('as') || '';
                                    
                                    // Block font preloads and Appwrite font links
                                    if ((rel === 'preload' && as === 'font') || isBlocked(href)) {
                                      console.debug('[FontBlocker] Blocked dynamically added link:', href);
                                      node.remove();
                                    }
                                  }
                                  if (node instanceof HTMLStyleElement) {
                                    const textContent = node.textContent || node.innerHTML || '';
                                    if (isBlocked(textContent)) {
                                      console.debug('[FontBlocker] Blocked dynamically added style');
                                      node.remove();
                                    }
                                  }
                                });
                              });
                            } catch (e) {
                              // Ignore observer errors
                            }
                          });
                          
                          observer.observe(document.head, {
                            childList: true,
                            subtree: false
                          });
                          
                          window.__fontBlockerObserver = observer;
                          window.__fontBlockerObserverHead = true;
                        } else {
                          // Retry after a short delay
                          setTimeout(setupObserver, 10);
                        }
                      } catch (e) {
                        console.warn('[FontBlocker] Failed to setup observer:', e);
                      }
                    };
                    
                    // Start immediately
                    setupObserver();
                  }
                } catch (e) {
                  console.warn('[FontBlocker] Initialization error:', e);
                  // Fail open - don't block app initialization
                }
              })();
            `,
          }}
        />
        <FontRequestBlocker />
        <FontLoaderFromAppwrite />
        <ErrorSuppressor />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppwriteClientProvider>
            <LanguageProvider>
              <MaintenanceModeGuard>
              <GlobalAchievementChecker />
              <ScrollToTop />
              <div className="min-h-screen flex flex-col">
                {/* Public header and footer only on public routes */}
                <ConditionalPublicLayout>
                  {children}
                </ConditionalPublicLayout>
              </div>
              <Toaster />
              </MaintenanceModeGuard>
            </LanguageProvider>
          </AppwriteClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

    