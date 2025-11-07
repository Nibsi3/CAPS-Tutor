'use client';

import { useState, useEffect } from 'react';
import { Databases, Models } from 'appwrite';
import { useDatabases } from '../provider';
import { appwriteConfig } from '../config';
import { appwriteLogger } from '../logger';

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
  // Check if databases is a valid Appwrite Databases instance (has listDocuments method)
  const isValidDatabases = databases && typeof databases.listDocuments === 'function';
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedCollectionRef && isValidDatabases);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only run on client-side and if we have valid databases instance
    if (typeof window === 'undefined' || !memoizedCollectionRef || !isValidDatabases) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const { databaseId, collectionId, queries } = memoizedCollectionRef;

    // Validate that all required IDs are present
    if (!databaseId || !collectionId) {
      const missingFields = [];
      if (!databaseId) missingFields.push('databaseId');
      if (!collectionId) missingFields.push('collectionId');
      
      // Check if it's a configuration issue (databaseId from config is missing)
      const isConfigIssue = !databaseId && !appwriteConfig.databaseId;
      
      const errorMsg = isConfigIssue
        ? `Appwrite database ID is not configured. Please set NEXT_PUBLIC_APPWRITE_DATABASE_ID in your environment variables. ` +
          `See docs/APPWRITE_ENVIRONMENT_VARIABLES.md for setup instructions.`
        : `Missing required fields for useCollection: ${missingFields.join(', ')}. ` +
          `databaseId: ${databaseId || 'MISSING'}, ` +
          `collectionId: ${collectionId || 'MISSING'}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ useCollection: Skipping fetch due to missing IDs:', {
          databaseId: databaseId || 'MISSING',
          collectionId: collectionId || 'MISSING',
          configDatabaseId: appwriteConfig.databaseId || 'MISSING',
          configProjectId: appwriteConfig.projectId || 'MISSING',
        });
      }
      
      setData(null);
      setIsLoading(false);
      setError(new Error(errorMsg));
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build query array
    const queryArray = queries || [];
    const startTime = Date.now();

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
        
        appwriteLogger.logApiCall(
          'database',
          `listDocuments(${collectionId})`,
          startTime,
          true,
          {
            collectionId,
            documentCount: response.documents.length,
            total: response.total,
          }
        );
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

        // Check if collection doesn't exist
        const isCollectionNotFound = 
          errorCode === 404 && 
          (errorMessage.includes('collection') || errorMessage.includes('could not be found'));
        
        if (isCollectionNotFound) {
          const helpfulMessage = `Collection "${collectionId}" not found in database "${databaseId}". ` +
            `Please create it in Appwrite Console. ` +
            `See docs/APPWRITE_COLLECTIONS_SETUP.md for instructions.`;
          
          console.error(`❌ ${helpfulMessage}`);
          console.error('Collection details:', {
            collectionId: collectionId || 'MISSING',
            databaseId: databaseId || 'MISSING',
            errorCode: errorCode || 'MISSING',
            errorMessage: (err as any).message || 'MISSING',
            config: {
              databaseId: appwriteConfig.databaseId || 'MISSING',
              projectId: appwriteConfig.projectId || 'MISSING',
            }
          });
          
          appwriteLogger.error(
            'database',
            `Collection "${collectionId}" not found`,
            err,
            { collectionId, databaseId }
          );
          
          // Return empty array instead of null to prevent app crashes
          // The error is still set so components can show a message if needed
          setError(new Error(helpfulMessage));
          setData([]);
        } else if (isPermissionError) {
          // Return empty array for permission errors to prevent app crashes
          appwriteLogger.warn(
            'database',
            `Permission error on collection: ${collectionId}`,
            { collectionId, databaseId },
            err
          );
          setData([]);
          setError(null);
        } else {
          appwriteLogger.error(
            'database',
            `Failed to list documents from collection: ${collectionId}`,
            err,
            { collectionId, databaseId }
          );
          setError(err);
          setData(null);
        }
        setIsLoading(false);
        
        appwriteLogger.logApiCall(
          'database',
          `listDocuments(${collectionId})`,
          startTime,
          false,
          { collectionId },
          err
        );
      });

    // Note: Appwrite doesn't have real-time subscriptions by default in the web SDK
    // You would need to use Appwrite Realtime or poll for updates
    // For now, we'll just fetch once
  }, [memoizedCollectionRef, databases, isValidDatabases]);

  return { data, isLoading, error };
}

