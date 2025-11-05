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
  // Guard: Check env vars during SSR - if missing (preview mode), skip Appwrite initialization
  const globalProcess = (typeof globalThis !== 'undefined' && (globalThis as any).process) || 
                        (typeof window !== 'undefined' && (window as any).process) ||
                        undefined;
  const processEnv = globalProcess?.env;
  
  // Get env vars with guards - handle false/undefined values
  const endpoint = processEnv?.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = processEnv?.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const db = processEnv?.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  
  // Convert to strings and check if they're valid (not false, undefined, or empty)
  const hasEndpoint = endpoint && endpoint !== false && String(endpoint).trim() !== '';
  const hasProject = project && project !== false && String(project).trim() !== '';
  const hasDb = db && db !== false && String(db).trim() !== '';
  
  // If missing env vars (preview mode), render without Appwrite
  const hasAppwriteConfig = hasEndpoint && hasProject && hasDb;
  
  console.log("layout-start", { hasAppwriteConfig, hasEndpoint, hasProject, hasDb });
  
  // Base layout content without Appwrite during SSR/preview
  const baseContent = (
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
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">
              {/* Public header and footer only on public routes */}
              <ConditionalPublicLayout>
                {children}
              </ConditionalPublicLayout>
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
  
  // If env vars are missing, return layout without Appwrite (preview mode)
  if (!hasAppwriteConfig) {
    return baseContent;
  }
  
  // Normal branch: env vars exist, wrap with AppwriteClientProvider
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
}

    