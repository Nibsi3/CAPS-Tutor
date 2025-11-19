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
                
                // Block font requests from Appwrite assets CDN
                const patterns = ['assets.appwrite.io/fonts', 'Inter-Regular.woff2', 'FiraCode-Regular.woff2'];
                const isBlocked = (url) => patterns.some(p => url && url.includes && url.includes(p));
                
                // Intercept fetch early
                if (window.fetch && !window.__fontBlockerFetch) {
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
                    if (isBlocked(url)) {
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
                    if (isBlocked(url)) {
                      throw new Error('Blocked Appwrite font request');
                    }
                    return originalOpen.apply(this, arguments);
                  };
                  window.__fontBlockerXHR = true;
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

    