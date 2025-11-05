'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AppwriteProvider } from './provider';
import { getClient, getAccount, getDatabases } from './index';

interface AppwriteClientProviderProps {
  children: ReactNode;
}

export function AppwriteClientProvider({ children }: AppwriteClientProviderProps) {
  const appwriteServices = useMemo(() => {
    // Only initialize Appwrite on the client side
    // On server-side, return null services to prevent blocking
    if (typeof window === 'undefined') {
      return {
        client: null,
        account: null,
        databases: null,
      };
    }
    
    // Initialize Appwrite on the client side, once per component mount.
    return {
      client: getClient(),
      account: getAccount(),
      databases: getDatabases(),
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AppwriteProvider
      client={appwriteServices.client || undefined}
      account={appwriteServices.account || undefined}
      databases={appwriteServices.databases || undefined}
    >
      {children}
    </AppwriteProvider>
  );
}

