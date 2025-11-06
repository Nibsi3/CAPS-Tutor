import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppwriteClientProvider } from '@/appwrite/client-provider';
import { PT_Sans, Space_Grotesk, Source_Code_Pro } from 'next/font/google';
import { LanguageProvider } from '@/components/language-provider';
import { ConditionalPublicLayout } from '@/components/layout/ConditionalPublicLayout';

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
    icon: '/icon.png',
    shortcut: '/icon.png',
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
      <head>
        {/* Prevent Appwrite font loading and suppress network errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // Intercept and block font requests from assets.appwrite.io
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    const url = args[0];
                    if (typeof url === 'string' && url.includes('assets.appwrite.io/fonts')) {
                      // Block font requests - return a rejected promise
                      return Promise.reject(new Error('Blocked: Appwrite font request'));
                    }
                    return originalFetch.apply(this, args);
                  };
                  
                  // Suppress console errors for blocked requests
                  const originalError = console.error;
                  console.error = function(...args) {
                    const message = args.join(' ');
                    // Suppress Appwrite font CORS errors
                    if (message.includes('assets.appwrite.io/fonts') || 
                        message.includes('Blocked: Appwrite font')) {
                      return; // Suppress this error
                    }
                    // Suppress message port errors (usually from browser extensions)
                    if (message.includes('message port closed') || 
                        message.includes('runtime.lastError') ||
                        message.includes('Failed to load resource')) {
                      // Only suppress if it's a font or message port error
                      const isFontError = message.includes('fonts') || 
                                         message.includes('woff2') ||
                                         message.includes('woff');
                      const isMessagePortError = message.includes('message port') ||
                                                message.includes('runtime.lastError');
                      if (isFontError || isMessagePortError) {
                        return; // Suppress this error
                      }
                    }
                    originalError.apply(console, args);
                  };
                  
                  // Also intercept XMLHttpRequest for older code
                  const originalXHROpen = XMLHttpRequest.prototype.open;
                  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                    if (typeof url === 'string' && url.includes('assets.appwrite.io/fonts')) {
                      // Block font requests
                      return;
                    }
                    return originalXHROpen.apply(this, [method, url, ...rest]);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${ptSans.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppwriteClientProvider>
            <LanguageProvider>
              <div className="min-h-screen flex flex-col">
                {/* Public header and footer only on public routes */}
                <ConditionalPublicLayout>
                  {children}
                </ConditionalPublicLayout>
              </div>
              <Toaster />
            </LanguageProvider>
          </AppwriteClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

    