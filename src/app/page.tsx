'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}
