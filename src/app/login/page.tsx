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
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signInWithGoogle, signInWithFacebook } from '@/firebase/auth/social-auth';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
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
import { doc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
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
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<{subjects?: string[]}>(userProfileRef);


  useEffect(() => {
    if (user && firestore && !isUserLoading) {
      if (userProfile && userProfile.subjects && userProfile.subjects.length > 0) {
        router.push('/dashboard');
      } else if (userProfile) {
        // Profile exists but is incomplete
        router.push('/onboarding');
      }
      // if userProfile is loading, the effect will re-run when it's available
    }
  }, [user, firestore, router, userProfile, isUserLoading]);

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setIsSubmitting(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle(auth);
      } else {
        await signInWithFacebook(auth);
      }
      // Successful sign-in will be handled by the useEffect hook
    } catch (error: any) {
      console.error(`${provider} Sign-In Error:`, error);
      
      let description = `Could not sign in with ${provider}. Please try again.`;

      if (error.code === 'auth/popup-closed-by-user') {
          setShowPopupError(true);
          setIsSubmitting(false);
          return;
      } else if (error.code === 'auth/account-exists-with-different-credential') {
          description = 'An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.';
      } else if (error.code === 'auth/operation-not-allowed') {
         description = `Sign-in with ${provider} is not enabled. Please enable it in your Firebase project's Authentication settings under "Sign-in method".`;
      }

      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: description,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      // onAuthStateChanged will handle redirect via useEffect
    } catch (signInError: any) {
      let description = 'An unexpected error occurred during sign-in.';
      if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/invalid-password' || signInError.code === 'auth/user-not-found') {
        description = 'The email or password you entered is incorrect. Please try again.';
      } else if (signInError.code === 'auth/too-many-requests') {
        description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
      }
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isUserLoading || (user && !userProfile)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
        <p className="ml-4 text-lg">Loading...</p>
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
              Please go to your Firebase project's Authentication settings and add this domain to the list of "Authorized domains".
              The correct value to add is the hostname, for example: `my-app-12345.cloudworkstations.dev` (without `https://` or port numbers).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction asChild>
            <a href={auth?.app?.options?.projectId ? `https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/settings` : '#'} target="_blank" rel="noopener noreferrer" onClick={() => setShowPopupError(false)}>
              Go to Firebase Settings
            </a>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
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
