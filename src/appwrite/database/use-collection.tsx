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

    setIsLoading(true);
    setError(null);

    const { databaseId, collectionId, queries } = memoizedCollectionRef;

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
        const errorName = (err as any).name || '';
        
        // Check for network errors (Failed to fetch, CORS, etc.)
        const isNetworkError = 
          errorMessage.includes('failed to fetch') ||
          errorMessage.includes('network error') ||
          errorMessage.includes('networkerror') ||
          errorName === 'TypeError' && errorMessage.includes('fetch') ||
          errorMessage === '';
        
        const isPermissionError = 
          errorCode === 401 || 
          errorCode === 403 ||
          errorMessage.includes('permission') ||
          errorMessage.includes('unauthorized');

        // Check if collection doesn't exist
        // Note: Appwrite sometimes returns 404 for query errors too, so we need to be more specific
        const isCollectionNotFound = 
          errorCode === 404 && 
          (errorMessage.includes('collection') || errorMessage.includes('could not be found')) &&
          !errorMessage.includes('attribute') &&
          !errorMessage.includes('index') &&
          !errorMessage.includes('query');
        
        if (isCollectionNotFound) {
          // Import diagnostic utilities (dynamic import to avoid circular dependencies)
          import('@/lib/collection-diagnostics').then(({ getCollectionNotFoundMessage, generateDiagnosticCode }) => {
            const helpfulMessage = getCollectionNotFoundMessage(collectionId, databaseId, err);
            
            console.error(`❌ Collection "${collectionId}" not found in database "${databaseId}"`);
            console.error('\n' + '='.repeat(80));
            console.error('DIAGNOSTIC INFORMATION');
            console.error('='.repeat(80));
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
            
            console.error('\n' + '='.repeat(80));
            console.error('QUICK FIX - Run this diagnostic code:');
            console.error('='.repeat(80));
            console.log(generateDiagnosticCode());
            console.error('\n' + '='.repeat(80));
            console.error('Or visit: http://localhost:9002/api/admin/debug/check-all-collections');
            console.error('Or run: node scripts/check-collections.js');
            console.error('='.repeat(80) + '\n');
            
            // Also log the full helpful message
            console.error(helpfulMessage);
          }).catch(() => {
            // Fallback if diagnostic import fails
            const helpfulMessage = `Collection "${collectionId}" not found in database "${databaseId}". ` +
              `Please create it in Appwrite Console. ` +
              `See docs/APPWRITE_COLLECTIONS_SETUP.md for instructions. ` +
              `Run diagnostics: Visit /api/admin/debug/check-collections or run: node scripts/check-collections.js`;
            
            console.error(`❌ ${helpfulMessage}`);
            console.error('Collection details:', {
              collectionId: collectionId || 'MISSING',
              databaseId: databaseId || 'MISSING',
              errorCode: errorCode || 'MISSING',
              errorMessage: (err as any).message || 'MISSING',
            });
          });
          
          appwriteLogger.error(
            'database',
            `Collection "${collectionId}" not found`,
            err,
            { collectionId, databaseId }
          );
          
          // Return empty array instead of null to prevent app crashes
          // The error is still set so components can show a message if needed
          const errorMessage = `Collection "${collectionId}" not found. See console for diagnostic instructions.`;
          setError(new Error(errorMessage));
          setData([]);
        } else if (isNetworkError) {
          // Handle network errors gracefully - often temporary issues
          appwriteLogger.warn(
            'database',
            `Network error accessing collection: ${collectionId}`,
            { collectionId, databaseId },
            err
          );
          // Return empty array and don't set error to prevent app crashes
          // Network errors are often temporary and shouldn't block the UI
          setData([]);
          setError(null);
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
          // Log detailed error information for debugging
          const errorDetails = {
            collectionId,
            databaseId,
            errorCode,
            errorMessage: (err as any).message,
            errorType: (err as any).type,
            queries: queries?.map(q => String(q)) || 'none'
          };
          
          // Check for common query errors that might be misreported as collection not found
          if (errorMessage.includes('attribute') || errorMessage.includes('index')) {
            console.error('❌ Query Error (not collection error):', {
              ...errorDetails,
              hint: 'This might be a missing attribute or index issue, not a collection not found error',
              suggestion: 'Visit /api/admin/debug/debug-userprogress to diagnose the issue'
            });
          }
          
          appwriteLogger.error(
            'database',
            `Failed to list documents from collection: ${collectionId}`,
            err,
            errorDetails
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

