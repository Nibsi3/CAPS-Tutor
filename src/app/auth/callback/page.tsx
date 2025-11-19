'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAccount, useDatabases } from '@/appwrite';
import { ensureUserProfile } from '@/appwrite/auth/social-auth';
import { appwriteConfig } from '@/appwrite/config';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const { user, isUserLoading } = useUser();
  const account = useAccount();
  const databases = useDatabases();
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [needsSignup, setNeedsSignup] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (isUserLoading) return;
      
      // If user is not authenticated, redirect to login
      if (!user || !account || !databases) {
        router.push('/login');
        return;
      }

      try {
        // Check if user exists in Appwrite database
        let userProfile;
        try {
          userProfile = await databases.getDocument(
            appwriteConfig.databaseId,
            'user',
            user.$id
          );
        } catch (error: any) {
          // Handle 400 errors (Bad Request) - often from OAuth callback issues
          if (error.code === 400) {
            console.error('400 Bad Request error:', error);
            toast({
              variant: 'destructive',
              title: 'Authentication Error',
              description: 'There was an issue with your authentication. Please try signing in again.',
            });
            // Clear session and redirect to login
            try {
              await account.deleteSessions();
            } catch (sessionError) {
              console.error('Error clearing sessions:', sessionError);
            }
            router.push('/login');
            setIsChecking(false);
            return;
          }
          
          // User doesn't exist in database (404) - this is expected for new OAuth users
          if (error.code === 404) {
            // For new OAuth users, always try to create their profile
            // Even if email is missing, we should still try to create the profile
            const userEmail = user.email || `user-${user.$id}@oauth.local`;
            const userName = user.name || 'New User';
            
            // Extract photo URL from user prefs (Google OAuth stores it here)
            // Check multiple possible locations where Appwrite might store the photo
            const prefs = (user as any).prefs || {};
            const photoURL = prefs.avatar || 
                           prefs.picture || 
                           prefs.photoURL ||
                           prefs['https://www.googleapis.com/auth/userinfo.profile']?.picture ||
                           null;
            
            console.log('🔍 Checking for Google photo URL...');
            console.log('User prefs keys:', Object.keys(prefs));
            if (photoURL) {
              console.log('✅ Found photo URL:', photoURL.substring(0, 50) + '...');
            } else {
              console.log('⚠️ No photo URL found in user prefs');
            }
            
            try {
              // Create user profile with basic info from OAuth including photo
              await ensureUserProfile(databases, user.$id, userEmail, userName, photoURL || undefined);
              
              // After creating profile, redirect to onboarding
              router.push('/onboarding');
              return;
            } catch (createError: any) {
              console.error('Error creating user profile:', createError);
              
              // Handle specific errors during profile creation
              if (createError.code === 400) {
                toast({
                  variant: 'destructive',
                  title: 'Profile Creation Error',
                  description: 'Invalid data provided. Please contact support if this persists.',
                });
              } else if (createError.code === 409) {
                // Profile already exists (race condition), try to fetch it
                try {
                  userProfile = await databases.getDocument(
                    appwriteConfig.databaseId,
                    'user',
                    user.$id
                  );
                  // Continue with existing profile flow below
                } catch (fetchError: any) {
                  console.error('Error fetching existing profile:', fetchError);
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to set up your account. Please try signing up again.',
                  });
                  try {
                    await account.deleteSessions();
                  } catch (sessionError) {
                    console.error('Error clearing sessions:', sessionError);
                  }
                  router.push('/register');
                  setIsChecking(false);
                  return;
                }
              } else {
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: 'Failed to create your profile. Please try signing up again.',
                });
                // Log out and redirect to signup
                try {
                  await account.deleteSessions();
                } catch (sessionError) {
                  console.error('Error clearing sessions:', sessionError);
                }
                router.push('/register');
                setIsChecking(false);
                return;
              }
            }
          } else {
            throw error;
          }
        }

        // User exists in database, check if profile is complete
        if (userProfile) {
          // Update photoURL from Google OAuth if available and different
          const prefs = (user as any).prefs || {};
          const photoURL = prefs.avatar || 
                         prefs.picture || 
                         prefs.photoURL ||
                         prefs['https://www.googleapis.com/auth/userinfo.profile']?.picture ||
                         null;
          
          // Update photoURL if we have one from Google and it's different from what's stored
          if (photoURL && (!userProfile.photoURL || userProfile.photoURL !== photoURL)) {
            try {
              const userEmail = user.email || `user-${user.$id}@oauth.local`;
              const userName = user.name || 'User';
              await ensureUserProfile(databases, user.$id, userEmail, userName, photoURL);
              console.log('✅ Updated existing user photoURL from Google OAuth');
            } catch (updateError: any) {
              // Log but don't block the flow if photo update fails
              console.warn('⚠️ Could not update photoURL for existing user:', updateError);
            }
          }
          
          // First check if user is an admin
          if (user.email) {
            try {
              const adminCheckResponse = await fetch(`/api/admin/debug/check-admin?email=${encodeURIComponent(user.email)}`, {
                method: 'GET',
                credentials: 'include',
              });
              const adminCheckData = await adminCheckResponse.json();
              
              if (adminCheckData.isAdmin) {
                // User is an admin, redirect to admin panel
                router.push('/admin');
                setIsChecking(false);
                return;
              }
            } catch (adminError) {
              // If admin check fails, continue with normal flow
              console.error('Error checking admin status:', adminError);
            }
          }
          
          // Check if user has completed onboarding (has subjects)
          if (userProfile.subjects && Array.isArray(userProfile.subjects) && userProfile.subjects.length > 0) {
            // Profile is complete, redirect to dashboard
            router.push('/dashboard');
          } else {
            // Profile exists but incomplete, redirect to onboarding
            router.push('/onboarding');
          }
        } else {
          // Profile doesn't exist (shouldn't happen, but handle it)
          router.push('/onboarding');
        }
      } catch (error: any) {
        console.error('Error checking user profile:', error);
        
        // Handle specific error codes
        let errorMessage = 'An error occurred while checking your account. Please try again.';
        if (error.code === 400) {
          errorMessage = 'Invalid request. Please try signing in again.';
        } else if (error.code === 401) {
          errorMessage = 'Your session has expired. Please sign in again.';
        } else if (error.code === 403) {
          errorMessage = 'Access denied. Please check your account permissions.';
        } else if (error.code === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
        
        // If it's an authentication error, redirect to login
        if (error.code === 401 || error.code === 403) {
          try {
            await account.deleteSessions();
          } catch (sessionError) {
            console.error('Error clearing sessions:', sessionError);
          }
          router.push('/login');
        }
        
        setIsChecking(false);
      }
    };

    checkUserAndRedirect();
  }, [user, isUserLoading, account, databases, router, toast]);

  if (needsSignup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Account Not Found</CardTitle>
            <CardDescription>
              You must sign up first before you can sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              It looks like you don&apos;t have an account yet. Please sign up to continue.
            </p>
            <Button asChild className="w-full">
              <Link href="/register">Go to Sign Up</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="text-center space-y-4">
        <Loader className="h-12 w-12 animate-spin mx-auto" />
        <p className="text-lg">Setting up your account...</p>
      </div>
    </div>
  );
}

