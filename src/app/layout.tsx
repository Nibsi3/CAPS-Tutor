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
  console.log("layout-start");
  
  try {
    // Log environment variables status
    const envData = {
      NEXT_PUBLIC_APPWRITE_ENDPOINT: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_ENDPOINT : 'N/A',
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_PROJECT_ID : 'N/A',
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_DATABASE_ID : 'N/A',
      NODE_ENV: typeof process !== 'undefined' ? process.env?.NODE_ENV : 'N/A',
    };
    console.log("layout-data", envData);
    
    return (
      <html lang="en" suppressHydrationWarning>
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
  } catch (e: any) {
    // Log error for debugging in Appwrite Console
    console.error("layout-error", e);
    console.error("Error stack:", e?.stack);
    console.error("Error details:", {
      message: e?.message,
      name: e?.name,
      env: {
        NEXT_PUBLIC_APPWRITE_ENDPOINT: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_ENDPOINT : 'N/A',
        NEXT_PUBLIC_APPWRITE_PROJECT_ID: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_PROJECT_ID : 'N/A',
        NEXT_PUBLIC_APPWRITE_DATABASE_ID: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_DATABASE_ID : 'N/A',
      }
    });
    
    // Return a minimal error layout
    return (
      <html lang="en">
        <body className="font-body antialiased">
          <div className="flex items-center justify-center min-h-screen p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Error loading layout</h1>
              <p className="text-muted-foreground">
                {process.env.NODE_ENV === 'development' ? e?.message : 'An error occurred while loading the layout.'}
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }
}

    