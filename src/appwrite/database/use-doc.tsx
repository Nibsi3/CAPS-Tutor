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
  // Check if databases is a valid Appwrite Databases instance (has getDocument method)
  const isValidDatabases = databases && typeof databases.getDocument === 'function';
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedDocRef && isValidDatabases);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only run on client-side and if we have valid databases instance
    if (typeof window === 'undefined' || !memoizedDocRef || !isValidDatabases) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { databaseId, collectionId, documentId } = memoizedDocRef;

    // Debug: Log what we're trying to access
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 useDoc: Attempting to fetch document:', {
        databaseId: databaseId || 'MISSING',
        collectionId: collectionId || 'MISSING',
        documentId: documentId || 'MISSING',
        configDatabaseId: appwriteConfig.databaseId || 'MISSING',
      });
    }

    // Fetch document
    databases.getDocument<Models.Document & T>(databaseId, collectionId, documentId)
      .then((document) => {
        setData({ ...(document as T), id: document.$id });
        setError(null);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        const errorCode = (err as any).code;
        const errorMessage = (err as any).message?.toLowerCase() || '';
        const errorType = (err as any).type;
        const errorName = (err as any).name || '';
        
        // Check for network errors (Failed to fetch, CORS, etc.)
        const isNetworkError = 
          errorMessage.includes('failed to fetch') ||
          errorMessage.includes('network error') ||
          errorMessage.includes('networkerror') ||
          errorName === 'TypeError' && errorMessage.includes('fetch') ||
          errorMessage === '';
        
        // Check if collection doesn't exist - must specifically mention collection
        // A document 404 will say "Document with the requested ID could not be found"
        // A collection 404 will say something like "Collection not found" or "Collection does not exist"
        const isCollectionNotFound = 
          errorCode === 404 && 
          (errorMessage.includes('collection') && 
           (errorMessage.includes('not found') || 
            errorMessage.includes('does not exist') ||
            errorMessage.includes('could not be found'))) &&
          !errorMessage.includes('document');
        
        if (isCollectionNotFound) {
          const helpfulError = new Error(
            `Collection "${collectionId}" not found in database "${databaseId}".\n\n` +
            `To fix this:\n` +
            `1. Go to: https://cloud.appwrite.io/console\n` +
            `2. Select project: CAPS Tutor\n` +
            `3. Go to: Databases → ${databaseId}\n` +
            `4. Click: Create Collection\n` +
            `5. Collection ID: ${collectionId}\n` +
            `6. See: docs/APPWRITE_COLLECTIONS_SETUP.md for details`
          );
          
          // Log detailed error information
          const errorDetails = {
            collectionId: collectionId || 'MISSING',
            databaseId: databaseId || 'MISSING',
            errorCode: errorCode || 'MISSING',
            errorMessage: (err as any).message || 'MISSING',
            errorType: errorType || 'MISSING',
            config: {
              databaseId: appwriteConfig.databaseId || 'MISSING',
              projectId: appwriteConfig.projectId || 'MISSING',
              endpoint: appwriteConfig.endpoint || 'MISSING',
            },
            errorString: String(err),
            errorStack: err.stack || 'No stack trace',
          };
          
          console.error('❌ Collection Missing:', errorDetails);
          console.error('Full error object:', err);
          setError(helpfulError);
          setData(null);
        } else if (errorCode === 404) {
          // Document doesn't exist (but collection does) - this is normal, not an error
          // Log for debugging but don't set error state
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️ Document not found (404):', {
              collectionId,
              databaseId,
              documentId,
              message: 'This is normal if the document does not exist yet.',
            });
          }
          setData(null);
          setError(null);
        } else if (isNetworkError) {
          // Handle network errors gracefully - often temporary issues
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Network error accessing document:', {
              collectionId,
              databaseId,
              documentId,
              message: 'This may be a temporary network issue or CORS problem.',
            });
          }
          // Don't set error - network errors are often temporary
          setData(null);
          setError(null);
        } else {
          // Log other errors for debugging
          console.error('❌ useDoc Error:', {
            collectionId: collectionId || 'MISSING',
            databaseId: databaseId || 'MISSING',
            documentId: documentId || 'MISSING',
            errorCode: errorCode || 'MISSING',
            errorMessage: (err as any).message || 'MISSING',
            errorType: errorType || 'MISSING',
            error: err,
          });
          setError(err);
          setData(null);
        }
        setIsLoading(false);
      });

    // Note: Appwrite doesn't have real-time subscriptions by default in the web SDK
    // You would need to use Appwrite Realtime or poll for updates
    // For now, we'll just fetch once
  }, [memoizedDocRef, databases, isValidDatabases]);

  return { data, isLoading, error };
}

