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

    const { databaseId, collectionId, documentId } = memoizedDocRef;

    // Validate that all required IDs are present
    if (!databaseId || !collectionId || !documentId) {
      const missingFields = [];
      if (!databaseId) missingFields.push('databaseId');
      if (!collectionId) missingFields.push('collectionId');
      if (!documentId) missingFields.push('documentId');
      
      // Check if it's a configuration issue (databaseId from config is missing)
      const isConfigIssue = !databaseId && !appwriteConfig.databaseId;
      
      const errorMsg = isConfigIssue
        ? `Appwrite database ID is not configured. Please set NEXT_PUBLIC_APPWRITE_DATABASE_ID in your environment variables. ` +
          `See docs/APPWRITE_ENVIRONMENT_VARIABLES.md for setup instructions.`
        : `Missing required fields for useDoc: ${missingFields.join(', ')}. ` +
          `databaseId: ${databaseId || 'MISSING'}, ` +
          `collectionId: ${collectionId || 'MISSING'}, ` +
          `documentId: ${documentId || 'MISSING'}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ useDoc: Skipping fetch due to missing IDs:', {
          databaseId: databaseId || 'MISSING',
          collectionId: collectionId || 'MISSING',
          documentId: documentId || 'MISSING',
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

    // Debug: Log what we're trying to access
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 useDoc: Attempting to fetch document:', {
        databaseId,
        collectionId,
        documentId,
        configDatabaseId: appwriteConfig.databaseId,
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
        
        // Handle 404 errors - could be document or collection not found
        if (errorCode === 404) {
          // Check if it's a collection not found error
          const isCollectionNotFound = 
            errorMessage.includes('collection') || 
            errorMessage.includes('could not be found') ||
            (errorType === 'document_not_found' && errorMessage.includes('collection')) ||
            errorMessage.includes('document with the requested id could not be found');
          
          if (isCollectionNotFound) {
            const helpfulError = new Error(
              `Collection "${collectionId}" not found in database "${databaseId}".\n\n` +
              `To fix this:\n` +
              `1. Go to: https://cloud.appwrite.io/console\n` +
              `2. Select project: ${appwriteConfig.projectId || 'CAPS Tutor'}\n` +
              `3. Go to: Databases → ${databaseId}\n` +
              `4. Click: Create Collection\n` +
              `5. Collection ID: ${collectionId}\n` +
              `6. See: docs/APPWRITE_COLLECTIONS_SETUP.md for details`
            );
            
            // Log detailed error information (only log once to avoid spam)
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Collection Missing:', {
                collectionId,
                databaseId,
                documentId,
                errorCode,
                errorMessage: (err as any).message,
                errorType,
                config: {
                  databaseId: appwriteConfig.databaseId || 'MISSING',
                  projectId: appwriteConfig.projectId || 'MISSING',
                  endpoint: appwriteConfig.endpoint || 'MISSING',
                },
              });
            }
            
            setError(helpfulError);
            setData(null);
          } else {
            // Document doesn't exist (but collection does) - this is fine, just return null
            // This is expected when checking if a document exists
            setData(null);
            setError(null);
          }
        } else {
          // Log other errors for debugging
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ useDoc Error:', {
              collectionId,
              databaseId,
              documentId,
              errorCode: errorCode || 'MISSING',
              errorMessage: (err as any).message || 'MISSING',
              errorType: errorType || 'MISSING',
              error: err,
            });
          }
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

