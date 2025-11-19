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
                    try {
                      if (!url || typeof url !== 'string') return false;
                      return patterns.some(p => url.includes && url.includes(p));
                    } catch (e) {
                      return false; // Fail open - don't block if we can't check
                    }
                  };
                  
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
                  
                  // Watch for dynamically added link tags via MutationObserver
                  // Delay this until DOM is ready to avoid blocking initialization
                  if (!window.__fontBlockerObserver && typeof MutationObserver !== 'undefined') {
                    const setupObserver = () => {
                      try {
                        if (!document.head) {
                          setTimeout(setupObserver, 100);
                          return;
                        }
                        
                        const observer = new MutationObserver((mutations) => {
                          try {
                            mutations.forEach((mutation) => {
                              mutation.addedNodes.forEach((node) => {
                                if (node instanceof HTMLLinkElement) {
                                  const href = node.href || node.getAttribute('href') || '';
                                  if (isBlocked(href)) {
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
                      } catch (e) {
                        console.warn('[FontBlocker] Failed to setup observer:', e);
                      }
                    };
                    
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', setupObserver);
                    } else {
                      setTimeout(setupObserver, 0);
                    }
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

    