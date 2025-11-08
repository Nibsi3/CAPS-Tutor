'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useAccount } from '@/appwrite';
import { updatePasswordRecovery } from '@/appwrite/auth/email-auth';
import { Loader, Lock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const account = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Extract userId and secret from URL parameters
    // Appwrite recovery links use query parameters: ?userId=...&secret=...
    const userIdParam = searchParams.get('userId');
    const secretParam = searchParams.get('secret');
    
    // Also check hash parameters (some Appwrite setups use hash fragments)
    if (!userIdParam || !secretParam) {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const hashUserId = hashParams.get('userId');
        const hashSecret = hashParams.get('secret');
        
        if (hashUserId && hashSecret) {
          setUserId(hashUserId);
          setSecret(hashSecret);
          return;
        }
      }
    }
    
    if (userIdParam && secretParam) {
      setUserId(userIdParam);
      setSecret(secretParam);
    } else {
      // If no parameters, show error and redirect to login
      toast({
        variant: 'destructive',
        title: 'Invalid Reset Link',
        description: 'This password reset link is invalid or has expired.',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [searchParams, router, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!account || !userId || !secret) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing reset parameters. Please request a new password reset link.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePasswordRecovery(account, userId, secret, values.password, values.confirmPassword);
      setIsSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset. You can now sign in with your new password.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      let description = 'Failed to reset password. Please try again.';
      
      if (error.code === 401 || error.message?.includes('invalid')) {
        description = 'This reset link is invalid or has expired. Please request a new one.';
      } else if (error.message?.includes('expired')) {
        description = 'This reset link has expired. Please request a new one.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Password Reset
            </CardTitle>
            <CardDescription>
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => router.push('/login')}
              >
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userId || !secret) {
    return (
      <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.push('/login')}
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

