"use client";

import { usePathname } from 'next/navigation';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';

export function ConditionalPublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Only show PublicHeader and Footer on specific public marketing pages
  // Home (/), News (/news), Blog (/blog), Contact (/contact), CAPS Syllabus (/caps-syllabus), How It Works (/how-it-works), Privacy (/privacy), Terms (/terms), All Subjects (/all-subjects)
  const publicMarketingRoutes = ['/', '/news', '/blog', '/contact', '/caps-syllabus', '/how-it-works', '/privacy', '/terms', '/all-subjects'];
  const isPublicMarketingRoute = pathname && (
    publicMarketingRoutes.includes(pathname) || 
    pathname.startsWith('/blog/') // Blog post detail pages
  );
  
  // Hide PublicHeader and Footer on dashboard, admin, login, register, onboarding routes
  const isExcludedRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/admin') ||
                          pathname === '/login' ||
                          pathname === '/register' ||
                          pathname === '/onboarding';
  
  if (isPublicMarketingRoute && !isExcludedRoute) {
    return (
      <>
        <PublicHeader />
        <div className="flex-1">{children}</div>
        <Footer />
      </>
    );
  }
  
  // For other routes (dashboard/admin/login/register/onboarding), just render children
  return <>{children}</>;
}

