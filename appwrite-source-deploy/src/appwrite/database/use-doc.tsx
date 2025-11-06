'use client';

import { useState, useEffect } from 'react';
import { Databases, Models } from 'appwrite';
import { useDatabases } from '../provider';
import { appwriteConfig } from '../config';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

export interface DocRef {
  databaseId: string;
  collectionId: string;
  documentId: string;
}

export function useDoc<T = any>(
  memoizedDocRef: DocRef | null | undefined,
): UseDocResult<T> {
  const databases = useDatabases();
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedDocRef && !!databases);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef || !databases) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { databaseId, collectionId, documentId } = memoizedDocRef;

    // Fetch document
    databases.getDocument<Models.Document & T>(databaseId, collectionId, documentId)
      .then((document) => {
        setData({ ...(document as T), id: document.$id });
        setError(null);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if ((err as any).code === 404) {
          // Document doesn't exist
          setData(null);
          setError(null);
        } else {
          setError(err);
          setData(null);
        }
        setIsLoading(false);
      });

    // Note: Appwrite doesn't have real-time subscriptions by default in the web SDK
    // You would need to use Appwrite Realtime or poll for updates
    // For now, we'll just fetch once
  }, [memoizedDocRef, databases]);

  return { data, isLoading, error };
}

