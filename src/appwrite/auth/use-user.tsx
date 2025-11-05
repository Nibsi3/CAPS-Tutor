'use client';

import { useAppwrite } from '../provider';

export interface UserHookResult {
  user: ReturnType<typeof useAppwrite>['user'];
  isUserLoading: ReturnType<typeof useAppwrite>['isUserLoading'];
  userError: ReturnType<typeof useAppwrite>['userError'];
}

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useAppwrite();
  return { user, isUserLoading, userError };
};

