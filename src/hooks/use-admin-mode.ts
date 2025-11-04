'use client';

import { useState, useEffect } from 'react';

const ADMIN_MODE_KEY = 'admin-mode-enabled';

// Helper function to safely get from localStorage (handles SSR)
function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// Helper function to safely set to localStorage
function setToLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

export function useAdminMode(isAdmin: boolean) {
  // Initialize state from localStorage (defaults to false)
  // Always check localStorage on initial render to preserve state across refreshes
  const [adminModeEnabled, setAdminModeEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = getFromLocalStorage(ADMIN_MODE_KEY);
    // Always return the saved value to preserve state across page refreshes
    return saved === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with localStorage when isAdmin is confirmed or changes
  // This ensures state is restored correctly after page refresh
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Always check localStorage - if isAdmin is true, use it; if false, reset
    const saved = getFromLocalStorage(ADMIN_MODE_KEY);
    
    if (isAdmin) {
      // User is confirmed as admin - restore from localStorage
      // This is critical after page refresh when isAdmin changes from false to true
      if (saved !== null) {
        const savedValue = saved === 'true';
        // Always update state to match localStorage
        // This ensures state persists after refresh
        setAdminModeEnabledState(savedValue);
      } else {
        // No saved value - default to false and save it
        setAdminModeEnabledState(false);
        setToLocalStorage(ADMIN_MODE_KEY, 'false');
      }
    } else {
      // User is not admin - reset to false (but don't overwrite localStorage)
      setAdminModeEnabledState(false);
    }
    
    setIsLoading(false);
  }, [isAdmin]);

  // Save to localStorage when state changes
  const setAdminModeEnabled = (enabled: boolean) => {
    if (isAdmin) {
      setAdminModeEnabledState(enabled);
      setToLocalStorage(ADMIN_MODE_KEY, String(enabled));
    }
  };

  // Toggle admin mode
  const toggleAdminMode = () => {
    if (isAdmin) {
      setAdminModeEnabledState(prev => {
        const newValue = !prev;
        // Immediately save to localStorage
        setToLocalStorage(ADMIN_MODE_KEY, String(newValue));
        return newValue;
      });
    }
  };

  // Return the actual state value - the component using this hook should check isAdmin separately
  // This ensures the state persists even during the loading phase
  return {
    adminModeEnabled: isAdmin ? adminModeEnabled : false,
    setAdminModeEnabled,
    toggleAdminMode,
    isLoading,
  };
}
