import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppwriteClientProvider } from '@/appwrite/client-provider';
import { PT_Sans, Space_Grotesk, Source_Code_Pro } from 'next/font/google';
import { LanguageProvider } from '@/components/language-provider';
import { ConditionalPublicLayout } from '@/components/layout/ConditionalPublicLayout';
import { ErrorSuppressor } from '@/components/ErrorSuppressor';
import { FontRequestBlocker } from '@/components/FontRequestBlocker';
import { GlobalAchievementChecker } from '@/components/achievements/GlobalAchievementChecker';
import { MaintenanceModeGuard } from '@/components/MaintenanceModeGuard';
import { ScrollToTop } from '@/components/ScrollToTop';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
});

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
        className={`${ptSans.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-body antialiased`}
      >
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
                    @font-face {
                      font-family: 'Inter';
                      src: local('Arial'), local('Helvetica'), local('sans-serif');
                    }
                    @font-face {
                      font-family: 'Fira Code';
                      src: local('Monaco'), local('Menlo'), local('Courier New'), local('monospace');
                    }
                    /* Block any attempts to load fonts from assets.appwrite.io */
                    @import url('data:text/css,');
                  \`;
                  if (document.head) {
                    document.head.appendChild(style);
                  }
                  
                  // Block font requests from Appwrite assets CDN - comprehensive patterns
                  const patterns = [
                    'assets.appwrite.io/fonts',
                    'assets.appwrite.io/fonts/fira-code',
                    'assets.appwrite.io/fonts/inter',
                    'https://assets.appwrite.io/fonts/inter',
                    'https://assets.appwrite.io/fonts/fira-code',
                    'http://assets.appwrite.io/fonts/inter',
                    'http://assets.appwrite.io/fonts/fira-code',
                    'Inter-Regular.woff2',
                    'Inter-Regular.woff',
                    'FiraCode-Regular.woff2',
                    'FiraCode-Regular.woff',
                    '/fonts/fira-code/',
                    '/fonts/inter/',
                    'fonts/fira-code/',
                    'fonts/inter/'
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
                  
                  // Intercept fetch early - must be first
                  if (window.fetch && !window.__fontBlockerFetch) {
                    try {
                      const originalFetch = window.fetch;
                      window.fetch = function(...args) {
                        try {
                          const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || args[0]?.toString() || '');
                          if (isBlocked(url)) {
                            console.debug('[FontBlocker] Blocked fetch request to:', url);
                            return Promise.reject(new Error('Blocked Appwrite font request'));
                          }
                          return originalFetch.apply(this, args);
                        } catch (e) {
                          // If anything fails, just call original fetch
                          return originalFetch.apply(this, args);
                        }
                      };
                      window.__fontBlockerFetch = true;
                    } catch (e) {
                      console.warn('[FontBlocker] Failed to intercept fetch:', e);
                    }
                  }
                  
                  // Intercept XHR early
                  if (typeof XMLHttpRequest !== 'undefined' && !window.__fontBlockerXHR) {
                    try {
                      const originalOpen = XMLHttpRequest.prototype.open;
                      XMLHttpRequest.prototype.open = function(method, url) {
                        try {
                          const urlString = typeof url === 'string' ? url : (url?.toString() || '');
                          if (isBlocked(urlString)) {
                            console.debug('[FontBlocker] Blocked XHR request to:', urlString);
                            throw new Error('Blocked Appwrite font request');
                          }
                          return originalOpen.apply(this, arguments);
                        } catch (e) {
                          // If it's our blocking error, re-throw; otherwise allow the request
                          if (e.message === 'Blocked Appwrite font request') throw e;
                          return originalOpen.apply(this, arguments);
                        }
                      };
                      window.__fontBlockerXHR = true;
                    } catch (e) {
                      console.warn('[FontBlocker] Failed to intercept XHR:', e);
                    }
                  }
                  
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

    