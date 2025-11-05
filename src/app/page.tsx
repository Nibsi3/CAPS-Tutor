import { Suspense } from 'react';
import HomePageContent from "./HomePageContent";

// Force dynamic rendering to prevent SSG issues during preview mode
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Check for preview mode server-side
  const params = await searchParams;
  const isPreview = params?.appwrite-preview === '1' || params?.['appwrite-preview'] === '1';
  
  // If preview mode, return minimal HTML immediately (no client hooks)
  if (isPreview) {
    return (
      <main className="flex-1">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">CAPS Tutor</h1>
            <p className="text-muted-foreground mt-2">AI-Powered Learning Platform</p>
          </div>
        </div>
      </main>
    );
  }
  
  // Normal mode: render full homepage with Suspense for client components
  return (
    <Suspense fallback={
      <main className="flex-1">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">CAPS Tutor</h1>
          </div>
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
