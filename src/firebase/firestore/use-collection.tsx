'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedTargetRefOrQuery);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Directly use memoizedTargetRefOrQuery as it's assumed to be the final query
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // This logic extracts the path from either a ref or a query
        let path: string;
        try {
          path = memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();
        } catch (e) {
          // Fallback: try to extract from error message if path extraction fails
          path = error.message || '';
        }

        // Check path with or without database prefix - be very permissive
        const normalizedPath = path.replace(/^\/databases\/\(default\)\/documents\//, '');
        const fullPath = path;
        
        // Try to extract path from error message JSON if it contains the full error details
        let errorMessagePath = '';
        try {
          const errorMsg = error.message || '';
          if (errorMsg.includes('"path"')) {
            const pathMatch = errorMsg.match(/"path"\s*:\s*"([^"]+)"/);
            if (pathMatch && pathMatch[1]) {
              errorMessagePath = pathMatch[1];
            }
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
        
        const allPaths = [path, normalizedPath, fullPath, error.message || '', errorMessagePath];
        
        // Check if this is a user-owned subcollection - check all possible path variations
        const isUserOwnedSubcollection = allPaths.some(p => 
          p && (
            (p.includes('/users/') || p.includes('users/')) && 
            (p.includes('/pastPaperProgress') ||
             p.includes('/studentProgress') ||
             p.includes('pastPaperProgress') ||
             p.includes('studentProgress'))
          )
        );

        // For user-owned subcollections, handle ANY error gracefully (not just permission errors)
        // This prevents crashes while rules are being deployed or if there are other issues
        if (isUserOwnedSubcollection) {
          // Check if this is a permission error (check both code and message)
          const errorCode = error.code?.toLowerCase() || '';
          const errorMessage = error.message?.toLowerCase() || '';
          const isPermissionError = 
            errorCode === 'permission-denied' || 
            errorCode === 'unauthenticated' ||
            errorMessage.includes('permission') ||
            errorMessage.includes('insufficient permissions') ||
            errorMessage.includes('missing or insufficient');

          if (isPermissionError) {
            // Gracefully handle permission errors on user-owned collections
            // Return empty array instead of error to prevent app crash
            console.warn(`[useCollection] Permission error on user-owned collection. Path: ${path}. Treating as empty collection.`);
          } else {
            // Log other errors but still handle gracefully
            console.warn(`[useCollection] Error on user-owned collection. Path: ${path}, Error:`, error.message || error.code);
          }
          setData([]);
          setError(null);
          setIsLoading(false);
          return;
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // Only trigger global error propagation for non-user-owned collections
        // This prevents app crashes while rules are being deployed
        if (!isUserOwnedSubcollection) {
          errorEmitter.emit('permission-error', contextualError);
        }
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); // Re-run if the target query/reference changes.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }
  return { data, isLoading, error };
}