'use client';

import { useState, useEffect } from 'react';
import { Databases, Models } from 'appwrite';
import { useDatabases } from '../provider';
import { appwriteConfig } from '../config';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface CollectionRef {
  databaseId: string;
  collectionId: string;
  queries?: string[]; // Array of Query strings from appwrite Query builder
}

export function useCollection<T = any>(
  memoizedCollectionRef: CollectionRef | null | undefined,
): UseCollectionResult<T> {
  const databases = useDatabases();
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedCollectionRef && !!databases);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedCollectionRef || !databases) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { databaseId, collectionId, queries } = memoizedCollectionRef;

    // Build query array
    const queryArray = queries || [];

    // Fetch documents
    databases.listDocuments<Models.Document & T>(databaseId, collectionId, queryArray)
      .then((response) => {
        const results: ResultItemType[] = response.documents.map((doc) => ({
          ...(doc as T),
          id: doc.$id,
        }));
        setData(results);
        setError(null);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        // Handle permission errors gracefully
        const errorCode = (err as any).code;
        const errorMessage = (err as any).message?.toLowerCase() || '';
        
        const isPermissionError = 
          errorCode === 401 || 
          errorCode === 403 ||
          errorMessage.includes('permission') ||
          errorMessage.includes('unauthorized');

        if (isPermissionError) {
          // Return empty array for permission errors to prevent app crashes
          console.warn(`[useCollection] Permission error on collection. Collection: ${collectionId}. Treating as empty collection.`);
          setData([]);
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
  }, [memoizedCollectionRef, databases]);

  return { data, isLoading, error };
}

