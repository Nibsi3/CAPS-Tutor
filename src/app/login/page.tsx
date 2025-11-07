'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useUser, useAccount, useDatabases, useDoc, useMemoAppwrite } from '@/appwrite';
import { signInWithGoogle, ensureUserProfile } from '@/appwrite/auth/social-auth';
import { initiateEmailSignIn } from '@/appwrite/auth/email-auth';
import { appwriteConfig } from '@/appwrite/config';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const account = useAccount();
  const databases = useDatabases();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopupError, setShowPopupError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{subjects?: string[]}>(userProfileRef);


  useEffect(() => {
    // This effect is now only for users who are ALREADY logged in when they visit the page.
    if (user && !isUserLoading && !isProfileLoading) {
      if (userProfile && userProfile.subjects && userProfile.subjects.length > 0) {
        router.push('/dashboard');
      } else if (userProfile) {
        router.push('/onboarding');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  const handleSocialSignIn = async (provider: 'google') => {
    setIsSubmitting(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle(account, databases);
        // OAuth will redirect, so we don't need to handle the redirect here
        // The redirect will happen automatically
      }
    } catch (error: any) {
      console.error(`${provider} Sign-In Error:`, error);
      
      let description = `Could not sign in with ${provider}. Please try again.`;

      if (error.code === 401 || error.type === 'general_unauthorized_scope') {
        description = 'OAuth sign-in failed. Please try again.';
      }

      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: description,
      });
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await initiateEmailSignIn(account, values.email, values.password);
      
      // After successful sign-in, get the user and check profile
      const currentUser = await account.get();
      if (currentUser && databases) {
        try {
          const profile = await databases.getDocument(
            appwriteConfig.databaseId,
            'user',
            currentUser.$id
          );
          if (profile && (profile as any).subjects?.length > 0) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        } catch (profileError: any) {
          // Profile doesn't exist or error, redirect to onboarding
          router.push('/onboarding');
        }
      }
    } catch (signInError: any) {
      let description = 'An unexpected error occurred during sign-in.';
      if (signInError.code === 401 || signInError.type === 'general_unauthorized_scope') {
        description = 'The email or password you entered is incorrect. Please try again.';
      } else if (signInError.code === 429) {
        description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
      }
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: description,
      });
      setIsSubmitting(false);
    }
  };


  // Use client-side only rendering to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center p-4">
        {/* Top decorative element */}
        <div
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1108/632] w-[72.125rem] bg-gradient-to-r from-primary to-purple-500 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64.3%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>

        {/* Bottom-left decorative element */}
        <div
          className="absolute bottom-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-[#1e40af] to-[#9333ea] opacity-30"
            style={{
              clipPath:
                'polygon(20% 65%, 0% 50%, 10% 20%, 40% 0%, 70% 20%, 90% 50%, 100% 65%, 80% 85%, 50% 100%, 30% 85%)',
            }}
          />
        </div>

        {/* Bottom-right decorative element */}
        <div
          className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] translate-x-1/2 bg-gradient-to-tl from-[#1e40af] to-[#9333ea] opacity-30"
            style={{
              clipPath:
                'polygon(80% 65%, 100% 50%, 90% 20%, 60% 0%, 30% 20%, 10% 50%, 0% 65%, 20% 85%, 50% 100%, 70% 85%)',
            }}
          />
        </div>
        <Loader className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={showPopupError} onOpenChange={setShowPopupError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Configuration Needed</AlertDialogTitle>
            <AlertDialogDescription>
              The sign-in pop-up was closed. This usually happens because your application's domain isn't authorized for sign-in.
              <br /><br />
              Please go to your Appwrite project's settings and add this domain to the list of authorized domains.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction asChild>
            <a href={`${appwriteConfig.endpoint.replace('/v1', '')}/console/project-${appwriteConfig.projectId}/auth`} target="_blank" rel="noopener noreferrer" onClick={() => setShowPopupError(false)}>
              Go to Appwrite Settings
            </a>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center p-4">
        {/* Top decorative element */}
        <div
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1108/632] w-[72.125rem] bg-gradient-to-r from-primary to-purple-500 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64.3%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>

        {/* Bottom-left decorative element */}
        <div
          className="absolute bottom-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-[#1e40af] to-[#9333ea] opacity-30"
            style={{
              clipPath:
                'polygon(20% 65%, 0% 50%, 10% 20%, 40% 0%, 70% 20%, 90% 50%, 100% 65%, 80% 85%, 50% 100%, 30% 85%)',
            }}
          />
        </div>

        {/* Bottom-right decorative element */}
        <div
          className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] translate-x-1/2 bg-gradient-to-tl from-[#1e40af] to-[#9333ea] opacity-30"
            style={{
              clipPath:
                'polygon(80% 65%, 100% 50%, 90% 20%, 60% 0%, 30% 20%, 10% 50%, 0% 65%, 20% 85%, 50% 100%, 70% 85%)',
            }}
          />
        </div>

        <div className="absolute top-4 left-4">
            <Link href="/" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10L16 17L29 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-headline text-2xl font-bold">CAPS Tutor</span>
              </Link>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Continue with Email
                </Button>
              </form>
            </Form>
            <Separator className="my-6" />
            <div className="space-y-4">
              <Button variant="outline" onClick={() => handleSocialSignIn('google')} className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
<path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,34.819,44,29.835,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Sign in with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
