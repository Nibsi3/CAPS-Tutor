'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { Client, Account, Databases, Models } from 'appwrite';
import { getClient, getAccount, getDatabases } from './index';
import { appwriteLogger } from './logger';

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
  // Use provided services or get new ones, but only on client-side
  // On server-side, use provided services or null to prevent initialization
  const isClient = typeof window !== 'undefined';
  const client = providedClient || (isClient ? getClient() : null);
  const account = providedAccount || (isClient ? getAccount() : null);
  const databases = providedDatabases || (isClient ? getDatabases() : null);

  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // Effect to check auth state and set up listener
  useEffect(() => {
    // Only run on client-side and if account is available
    if (typeof window === 'undefined' || !account) {
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    const startTime = Date.now();

    // Create a timeout to prevent indefinite hanging
    const timeout = setTimeout(() => {
      const timeoutError = new Error('Appwrite authentication check timed out');
      appwriteLogger.warn('auth', 'Account.get() timed out after 5 seconds', {}, timeoutError);
      setUserAuthState({ 
        user: null, 
        isUserLoading: false, 
        userError: timeoutError
      });
    }, 5000); // 5 second timeout

    // Check current session with timeout protection
    Promise.race([
      account.get(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ])
      .then((user) => {
        clearTimeout(timeout);
        const userData = user as any;
        appwriteLogger.logApiCall(
          'auth',
          'account.get()',
          startTime,
          true,
          {
            userId: userData?.$id,
            email: userData?.email,
          }
        );
        setUserAuthState({ user: userData, isUserLoading: false, userError: null });
        appwriteLogger.info('auth', 'User authenticated', { userId: userData?.$id });
      })
      .catch((error) => {
        clearTimeout(timeout);
        const errorCode = (error as any)?.code;
        const errorType = (error as any)?.type;
        const errorMessage = (error as any)?.message || '';
        
        // Handle invalid sessionId errors - clear invalid session cookies
        if (errorMessage.includes('Invalid `sessionId` param') || 
            errorMessage.includes('UID must contain at most 36 chars')) {
          appwriteLogger.warn('auth', 'Invalid session ID detected - clearing cookies', {
            errorMessage
          });
          
          // Clear invalid session cookies
          if (typeof document !== 'undefined') {
            document.cookie.split(";").forEach((c) => {
              const cookieName = c.split("=")[0].trim();
              if (cookieName.includes('appwrite') || cookieName.includes('session')) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              }
            });
          }
          
          // Treat as no session (user not logged in)
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
          return;
        }
        
        // If no session exists, that's fine - user is just not logged in
        if (errorCode === 401 || errorType === 'general_unauthorized_scope' || errorMessage === 'Timeout') {
          appwriteLogger.debug('auth', 'No active session found (user not logged in)');
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
        } else {
          appwriteLogger.error('auth', 'Failed to get account', error);
          appwriteLogger.logApiCall(
            'auth',
            'account.get()',
            startTime,
            false,
            {},
            error
          );
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
 * Returns safe fallbacks during SSR or when services aren't available.
 */
export const useAppwrite = (): AppwriteServicesAndUser => {
  const context = useContext(AppwriteContext);

  // If context is undefined (AppwriteProvider not rendered), return safe fallbacks
  // This happens during SSR/preview mode when env vars are missing
  if (context === undefined) {
    // During SSR or when AppwriteProvider is missing, return safe fallbacks
    if (typeof window === 'undefined') {
      // Return mock objects for SSR to prevent build errors
      return {
        client: {} as Client,
        account: {} as Account,
        databases: {} as Databases,
        user: null,
        isUserLoading: false,
        userError: null,
      };
    }
    // On client-side, if AppwriteProvider doesn't exist, return safe fallbacks
    // This allows components to render without crashing
    console.warn('useAppwrite: AppwriteProvider not found. Returning safe fallbacks.');
    return {
      client: {} as Client,
      account: {} as Account,
      databases: {} as Databases,
      user: null,
      isUserLoading: false,
      userError: null,
    };
  }

  // During SSR or when services aren't available, return safe fallbacks
  // This allows static pages to render without Appwrite services
  if (!context.areServicesAvailable || !context.client || !context.account || !context.databases) {
    // Check if we're on the server-side
    if (typeof window === 'undefined') {
      // Return mock objects for SSR to prevent build errors
      return {
        client: {} as Client,
        account: {} as Account,
        databases: {} as Databases,
        user: null,
        isUserLoading: false,
        userError: null,
      };
    }
    // On client-side, if services aren't available after mount, return fallbacks
    // Don't throw - just return safe fallbacks to allow rendering
    console.warn('useAppwrite: Appwrite services not available. Returning safe fallbacks.');
    return {
      client: {} as Client,
      account: {} as Account,
      databases: {} as Databases,
      user: null,
      isUserLoading: false,
      userError: null,
    };
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
  // Return mock account during SSR if services aren't available
  if (!account || typeof account.get !== 'function') {
    return {} as Account;
  }
  return account;
};

/** Hook to access Appwrite Databases instance. */
export const useDatabases = (): Databases => {
  const { databases } = useAppwrite();
  // Return mock databases during SSR if services aren't available
  if (!databases || typeof databases.listDocuments !== 'function') {
    return {} as Databases;
  }
  return databases;
};

/** Hook to access Appwrite Client instance. */
export const useClient = (): Client => {
  const { client } = useAppwrite();
  // Return mock client during SSR if services aren't available
  if (!client || typeof client.setEndpoint !== 'function') {
    return {} as Client;
  }
  return client;
};

type MemoAppwrite<T> = T & { __memo?: boolean };

export function useMemoAppwrite<T>(factory: () => T, deps: DependencyList): T | MemoAppwrite<T> {
  const memoized = useMemo(factory, deps);
  
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  
  // Validate DocRef or CollectionRef objects to ensure databaseId is not empty
  if ('databaseId' in memoized && 'collectionId' in memoized) {
    const dbId = (memoized as any).databaseId;
    const collId = (memoized as any).collectionId;
    
    // If databaseId or collectionId is empty/undefined, return null to prevent invalid API calls
    // Check if they're strings and if so, ensure they're not empty after trimming
    const isDbIdEmpty = !dbId || (typeof dbId === 'string' && dbId.trim() === '');
    const isCollIdEmpty = !collId || (typeof collId === 'string' && collId.trim() === '');
    
    if (isDbIdEmpty || isCollIdEmpty) {
      return null as T;
    }
  }
  
  (memoized as MemoAppwrite<T>).__memo = true;
  
  return memoized;
}

