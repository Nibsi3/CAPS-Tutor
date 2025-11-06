'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AppwriteProvider } from './provider';
import { getClient, getAccount, getDatabases } from './index';

interface AppwriteClientProviderProps {
  children: ReactNode;
}

export function AppwriteClientProvider({ children }: AppwriteClientProviderProps) {
  const appwriteServices = useMemo(() => {
    // Initialize Appwrite on the client side, once per component mount.
    return {
      client: getClient(),
      account: getAccount(),
      databases: getDatabases(),
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AppwriteProvider
      client={appwriteServices.client}
      account={appwriteServices.account}
      databases={appwriteServices.databases}
    >
      {children}
    </AppwriteProvider>
  );
}

