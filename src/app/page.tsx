'use client';

import { Suspense } from 'react';
import HomePageContent from "./HomePageContent";

// Force dynamic rendering to prevent SSG issues during preview mode
export const dynamic = "force-dynamic";

export default function HomePage() {
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
