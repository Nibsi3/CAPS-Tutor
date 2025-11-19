'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component that scrolls to top on route changes
 * This ensures pages always start at the top when navigating
 */
export function ScrollToTop() {
  const pathname = usePathname();

  // Disable scroll restoration on mount (runs once)
  useEffect(() => {
    // Disable browser's default scroll restoration globally
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Disable browser's default scroll restoration (redundant but ensures it's set)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Clear any saved scroll positions from sessionStorage on navigation
    // This prevents pages from loading at their last scroll position
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('scroll-')) {
        sessionStorage.removeItem(key);
      }
    });

    // Scroll to top immediately and multiple times to ensure it works
    const scrollToTop = () => {
      // Try to find the scrollable main element (dashboard layout)
      const mainElement = document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement;
      if (mainElement) {
        mainElement.scrollTop = 0;
        mainElement.scrollTo({ top: 0, behavior: 'auto' });
      }
      // Also scroll window for pages without scrollable main
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Scroll immediately
    scrollToTop();

    // Use requestAnimationFrame to ensure the page has rendered
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Also try after multiple delays to catch async content and layout shifts
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 100);
    setTimeout(scrollToTop, 200);
  }, [pathname]);

  return null;
}

