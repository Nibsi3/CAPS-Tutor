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
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth/social-auth';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function RegisterPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      // Don't redirect if they need to verify their email
      if (user.emailVerified) {
        router.push('/onboarding');
      }
    }
  }, [user, firestore, router]);


  const handleSocialSignIn = async (provider: 'google') => {
    setIsSubmitting(true);
    try {
      if (provider === 'google' && firestore) {
          const userCredential = await signInWithGoogle(auth, firestore);
          // After a successful sign-in, the profile is created/merged in signInWithGoogle.
          // The user is new, so they should be sent to onboarding.
          if (userCredential?.user) {
            router.push('/onboarding');
          }
      }
    } catch (error: any) {
       let description = `Could not sign in with ${provider}. Please try again.`;

      if (error.code === 'auth/popup-closed-by-user') {
          description = "The sign-in pop-up was closed. If you are in a code editor's browser, make sure the domain is authorized in your Firebase project's Authentication settings.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
          description = 'An account already exists with this email. Please sign in with your original method.';
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
      const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
      
      if(userCredential?.user && firestore) {
          const userProfileRef = doc(firestore, 'users', userCredential.user.uid);
          await setDoc(userProfileRef, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
          }, { merge: true });
          
          await sendEmailVerification(userCredential.user);

          setShowVerificationMessage(true);
      }

    } catch (error: any) {
      let description = "Could not create your account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "An account with this email already exists. Please try logging in.";
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (showVerificationMessage) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
         <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Verify your Email</CardTitle>
            <CardDescription>
              A verification link has been sent to your email address. Please check your inbox and follow the link to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Once verified, you can log in.</p>
            <Button asChild className="mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
       </div>
    )
  }


  return (
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
          <CardDescription>Start your personalized learning journey today</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                Create Account
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
              Sign up with Google
            </Button>
          </div>
           <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
