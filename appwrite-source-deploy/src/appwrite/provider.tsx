'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { Client, Account, Databases, Models } from 'appwrite';
import { getClient, getAccount, getDatabases } from './index';

interface AppwriteProviderProps {
  children: ReactNode;
  client?: Client;
  account?: Account;
  databases?: Databases;
}

interface UserAuthState {
  user: Models.User<Models.Preferences> | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface AppwriteContextState {
  areServicesAvailable: boolean;
  client: Client | null;
  account: Account | null;
  databases: Databases | null;
  user: Models.User<Models.Preferences> | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface AppwriteServicesAndUser {
  client: Client;
  account: Account;
  databases: Databases;
  user: Models.User<Models.Preferences> | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const AppwriteContext = createContext<AppwriteContextState | undefined>(undefined);

/**
 * AppwriteProvider manages and provides Appwrite services and user authentication state.
 */
export const AppwriteProvider: React.FC<AppwriteProviderProps> = ({
  children,
  client: providedClient,
  account: providedAccount,
  databases: providedDatabases,
}) => {
  const client = providedClient || getClient();
  const account = providedAccount || getAccount();
  const databases = providedDatabases || getDatabases();

  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // Effect to check auth state and set up listener
  useEffect(() => {
    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    // Check current session
    account.get()
      .then((user) => {
        setUserAuthState({ user, isUserLoading: false, userError: null });
      })
      .catch((error) => {
        // If no session exists, that's fine - user is just not logged in
        if (error.code === 401 || error.type === 'general_unauthorized_scope') {
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
        } else {
          console.error("AppwriteProvider: get account error:", error);
          setUserAuthState({ user: null, isUserLoading: false, userError: error });
        }
      });
  }, [account]);

  const contextValue = useMemo((): AppwriteContextState => {
    const servicesAvailable = !!(client && account && databases);
    return {
      areServicesAvailable: servicesAvailable,
      client: servicesAvailable ? client : null,
      account: servicesAvailable ? account : null,
      databases: servicesAvailable ? databases : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [client, account, databases, userAuthState.user, userAuthState.isUserLoading, userAuthState.userError]);

  return (
    <AppwriteContext.Provider value={contextValue}>
      {children}
    </AppwriteContext.Provider>
  );
};

/**
 * Hook to access core Appwrite services and user authentication state.
 */
export const useAppwrite = (): AppwriteServicesAndUser => {
  const context = useContext(AppwriteContext);

  if (context === undefined) {
    throw new Error('useAppwrite must be used within an AppwriteProvider.');
  }

  if (!context.areServicesAvailable || !context.client || !context.account || !context.databases) {
    throw new Error('Appwrite core services not available. Check AppwriteProvider props.');
  }

  return {
    client: context.client,
    account: context.account,
    databases: context.databases,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Appwrite Account instance. */
export const useAccount = (): Account => {
  const { account } = useAppwrite();
  return account;
};

/** Hook to access Appwrite Databases instance. */
export const useDatabases = (): Databases => {
  const { databases } = useAppwrite();
  return databases;
};

/** Hook to access Appwrite Client instance. */
export const useClient = (): Client => {
  const { client } = useAppwrite();
  return client;
};

type MemoAppwrite<T> = T & { __memo?: boolean };

export function useMemoAppwrite<T>(factory: () => T, deps: DependencyList): T | MemoAppwrite<T> {
  const memoized = useMemo(factory, deps);
  
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoAppwrite<T>).__memo = true;
  
  return memoized;
}

