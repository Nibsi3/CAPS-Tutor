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
          
          // User doesn't exist in database
          if (error.code === 404) {
            // Check if this is a new OAuth user (has email but no database record)
            // For OAuth users, we want to create their profile and send to onboarding
            if (user.email) {
              try {
                // Create user profile with basic info from OAuth
                await ensureUserProfile(databases, user.$id, user.email, user.name || undefined);
                
                // After creating profile, redirect to onboarding
                router.push('/onboarding');
                return;
              } catch (createError: any) {
                console.error('Error creating user profile:', createError);
                
                // Handle 400 errors during profile creation
                if (createError.code === 400) {
                  toast({
                    variant: 'destructive',
                    title: 'Profile Creation Error',
                    description: 'Invalid data provided. Please contact support if this persists.',
                  });
                } else {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to create your profile. Please try signing up again.',
                  });
                }
                // Log out and redirect to signup
                try {
                  await account.deleteSessions();
                } catch (sessionError) {
                  console.error('Error clearing sessions:', sessionError);
                }
                setNeedsSignup(true);
                setIsChecking(false);
                return;
              }
            } else {
              // User doesn't have email (shouldn't happen with OAuth, but handle it)
              setNeedsSignup(true);
              setIsChecking(false);
              return;
            }
          } else {
            throw error;
          }
        }

        // User exists in database, check if profile is complete
        if (userProfile) {
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

