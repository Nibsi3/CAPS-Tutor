'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/appwrite';

export interface AdminDoc {
  adminId: string;
  email: string;
  role: string;
  status: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  notes?: string;
}

/**
 * Hook to check if the current user is an admin
 * Uses a server-side API route to check admin status (more secure than direct database access)
 * Admins are stored in a separate 'adminid' collection, not in the user collection
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean; adminData: AdminDoc | null } {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminData, setAdminData] = useState<AdminDoc | null>(null);

  useEffect(() => {
    // Wait for user to load
    if (isUserLoading) {
      return;
    }

    if (!user || !user.email) {
      setIsAdmin(false);
      setIsLoading(false);
      setAdminData(null);
      return;
    }

    setIsLoading(true);

    // Use API route to check admin status (server-side, uses API key)
    fetch(`/api/admin/debug/check-admin?email=${encodeURIComponent(user.email)}`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session
    })
      .then(async (response) => {
        const data = await response.json();
        
        if (response.ok) {
          setIsAdmin(data.isAdmin || false);
          setAdminData(data.adminData || null);
          
          // Log helpful messages in development
          if (process.env.NODE_ENV === 'development') {
            if (data.adminExists && !data.isAdmin) {
              console.warn('⚠️ Admin found but status is incorrect:', data.message);
            } else if (data.error) {
              console.warn('⚠️ Admin check warning:', data.message || data.error);
            }
          }
        } else {
          // Log error details in development
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Admin check failed:', {
              status: response.status,
              error: data.error,
              message: data.message,
              hint: data.hint
            });
          }
          
          setIsAdmin(false);
          setAdminData(null);
        }
        setIsLoading(false);
      })
      .catch((error: any) => {
        // Network error or other issue
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error checking admin status:', error);
        }
        setIsAdmin(false);
        setAdminData(null);
        setIsLoading(false);
      });
  }, [user, isUserLoading]);

  return { isAdmin, isLoading, adminData };
}

