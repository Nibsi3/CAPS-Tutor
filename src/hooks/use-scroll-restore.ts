'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to restore scroll position on page reload (not on navigation)
 * Note: Navigation scroll-to-top is handled by ScrollToTop component
 * @param key - Unique key for this page/component to store scroll position
 * @param enabled - Whether scroll restoration is enabled (default: true)
 */
export function useScrollRestore(key: string, enabled: boolean = true) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !isMounted) return;

    // Check if this is a full page reload (refresh) vs navigation
    // Navigation is handled by ScrollToTop component, so we only restore on refresh
    const isRefresh = (() => {
      if (typeof window !== 'undefined' && window.performance) {
        const navEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length > 0) {
          const navType = navEntries[0].type;
          // 'reload' means user refreshed the page
          // 'navigate' or other types mean it's a navigation (handled by ScrollToTop)
          return navType === 'reload';
        }
      }
      // Fallback: if we can't determine, don't restore (let ScrollToTop handle it)
      return false;
    })();

    // Only restore scroll position on actual page refresh
    if (isRefresh) {
      const savedScroll = sessionStorage.getItem(`scroll-${key}`);
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10);
        if (!isNaN(scrollY) && scrollY > 0) {
          // Use requestAnimationFrame and multiple attempts to ensure DOM is ready
          const restoreScroll = () => {
            // Check both window scroll and main element scroll (for dashboard)
            const mainElement = document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement;
            const currentScroll = mainElement 
              ? mainElement.scrollTop 
              : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop);
            
            // Only restore if we're not already at the saved position (within 10px)
            if (Math.abs(currentScroll - scrollY) > 10) {
              if (mainElement) {
                mainElement.scrollTo({ top: scrollY, behavior: 'auto' });
              } else {
                window.scrollTo({ top: scrollY, behavior: 'auto' });
              }
            }
          };
          
          // Try multiple times with increasing delays to handle async content loading
          requestAnimationFrame(() => {
            restoreScroll();
            setTimeout(restoreScroll, 100);
            setTimeout(restoreScroll, 300);
            setTimeout(restoreScroll, 500);
          });
        }
      }
    }

    // Helper to get current scroll position (handles both window and main element)
    const getScrollPosition = () => {
      const mainElement = document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement;
      if (mainElement) {
        return mainElement.scrollTop;
      }
      return window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    };

    // Save scroll position before unload (only on refresh scenarios)
    const handleBeforeUnload = () => {
      const scrollY = getScrollPosition();
      if (scrollY > 0) {
        try {
          sessionStorage.setItem(`scroll-${key}`, String(scrollY));
        } catch (error) {
          // Ignore storage errors (e.g., quota exceeded)
        }
      }
    };

    // Save scroll position periodically (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollY = getScrollPosition();
        if (scrollY > 0) {
          try {
            sessionStorage.setItem(`scroll-${key}`, String(scrollY));
          } catch (error) {
            // Ignore storage errors
          }
        }
      }, 150);
    };

    // Listen to scroll events on both window and main element
    const mainElement = document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Also save on pagehide (more reliable than beforeunload in some browsers)
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearTimeout(scrollTimeout);
    };
  }, [key, enabled, isMounted]);
}

