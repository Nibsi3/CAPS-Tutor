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
                if (typeof window === 'undefined') return;
                
                // Block font requests from Appwrite assets CDN - comprehensive patterns
                const patterns = [
                  'assets.appwrite.io/fonts',
                  'assets.appwrite.io/fonts/fira-code',
                  'assets.appwrite.io/fonts/inter',
                  'Inter-Regular.woff2',
                  'FiraCode-Regular.woff2',
                  '/fonts/fira-code/',
                  '/fonts/inter/'
                ];
                const isBlocked = (url) => {
                  if (!url || typeof url !== 'string') return false;
                  return patterns.some(p => url.includes(p));
                };
                
                // Intercept fetch early - must be first
                if (window.fetch && !window.__fontBlockerFetch) {
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || args[0]?.toString() || '');
                    if (isBlocked(url)) {
                      console.debug('[FontBlocker] Blocked fetch request to:', url);
                      return Promise.reject(new Error('Blocked Appwrite font request'));
                    }
                    return originalFetch.apply(this, args);
                  };
                  window.__fontBlockerFetch = true;
                }
                
                // Intercept XHR early
                if (XMLHttpRequest && !window.__fontBlockerXHR) {
                  const originalOpen = XMLHttpRequest.prototype.open;
                  XMLHttpRequest.prototype.open = function(method, url) {
                    const urlString = typeof url === 'string' ? url : (url?.toString() || '');
                    if (isBlocked(urlString)) {
                      console.debug('[FontBlocker] Blocked XHR request to:', urlString);
                      throw new Error('Blocked Appwrite font request');
                    }
                    return originalOpen.apply(this, arguments);
                  };
                  window.__fontBlockerXHR = true;
                }
                
                // Intercept link tag creation and href setting
                if (!window.__fontBlockerLink) {
                  const originalCreateElement = Document.prototype.createElement;
                  Document.prototype.createElement = function(tagName, options) {
                    const element = originalCreateElement.call(this, tagName, options);
                    if (element instanceof HTMLLinkElement) {
                      const originalSetAttribute = element.setAttribute.bind(element);
                      element.setAttribute = function(name, value) {
                        if ((name === 'href' || name === 'rel') && isBlocked(value)) {
                          console.debug('[FontBlocker] Blocked link href:', value);
                          return; // Block setting the attribute
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
                }
                
                // Intercept link/style tag insertions into head
                if (!window.__fontBlockerInsert) {
                  const originalAppendChild = Node.prototype.appendChild;
                  Node.prototype.appendChild = function(child) {
                    if (child instanceof HTMLLinkElement) {
                      const href = child.href || child.getAttribute('href') || '';
                      if (isBlocked(href)) {
                        console.debug('[FontBlocker] Blocked link append:', href);
                        return child; // Return without appending
                      }
                    }
                    if (child instanceof HTMLStyleElement) {
                      const textContent = child.textContent || child.innerHTML || '';
                      if (isBlocked(textContent)) {
                        console.debug('[FontBlocker] Blocked style append');
                        return child; // Return without appending
                      }
                    }
                    return originalAppendChild.call(this, child);
                  };
                  
                  const originalInsertBefore = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function(newNode, referenceNode) {
                    if (newNode instanceof HTMLLinkElement) {
                      const href = newNode.href || newNode.getAttribute('href') || '';
                      if (isBlocked(href)) {
                        console.debug('[FontBlocker] Blocked link insert:', href);
                        return newNode; // Return without inserting
                      }
                    }
                    if (newNode instanceof HTMLStyleElement) {
                      const textContent = newNode.textContent || newNode.innerHTML || '';
                      if (isBlocked(textContent)) {
                        console.debug('[FontBlocker] Blocked style insert');
                        return newNode; // Return without inserting
                      }
                    }
                    return originalInsertBefore.call(this, newNode, referenceNode);
                  };
                  window.__fontBlockerInsert = true;
                }
                
                // Watch for dynamically added link tags via MutationObserver
                if (!window.__fontBlockerObserver && document.head) {
                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLLinkElement) {
                          const href = node.href || node.getAttribute('href') || '';
                          if (isBlocked(href)) {
                            console.debug('[FontBlocker] Blocked dynamically added link:', href);
                            node.remove(); // Remove the link tag
                          }
                        }
                        if (node instanceof HTMLStyleElement) {
                          const textContent = node.textContent || node.innerHTML || '';
                          if (isBlocked(textContent)) {
                            console.debug('[FontBlocker] Blocked dynamically added style');
                            node.remove(); // Remove the style tag
                          }
                        }
                      });
                    });
                  });
                  
                  observer.observe(document.head, {
                    childList: true,
                    subtree: false
                  });
                  
                  window.__fontBlockerObserver = observer;
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

    