'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';
import { grades, subjects } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteCurrentUser } from '@/firebase/auth/social-auth';
import { useRouter } from 'next/navigation';
import { LiteratureSelection, literatureSchema } from '@/components/forms/LiteratureSelection';

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }).optional(),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }).optional(),
  gradeLevel: z.string({
    required_error: 'Please select a grade level.',
  }),
  subjects: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one subject.',
  }),
  literature: literatureSchema.optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: number;
  subjects: string[];
  literature?: z.infer<typeof literatureSchema>;
}

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gradeLevel: '',
      subjects: [],
      literature: {
        'english-hl': { novel: '', drama: '', poems: [] },
        'english-fal': { novel: '', drama: '', poems: [] },
        'afrikaans-ht': { novel: '', drama: '', poems: [] },
        'afrikaans-eat': { novel: '', drama: '', poems: [] },
      },
    },
    mode: 'onChange',
  });
  
  const { control, formState, reset } = form;
  const watchedSubjects = useWatch({ control, name: 'subjects' });
  const watchedGrade = useWatch({ control, name: 'gradeLevel' });

  useEffect(() => {
    if (userProfile && !formState.isDirty) {
      reset({
        ...userProfile,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        gradeLevel: userProfile.gradeLevel ? userProfile.gradeLevel.toString() : '',
        subjects: userProfile.subjects || [],
        literature: userProfile.literature || {
            'english-hl': { novel: '', drama: '', poems: [] },
            'english-fal': { novel: '', drama: '', poems: [] },
            'afrikaans-ht': { novel: '', drama: '', poems: [] },
            'afrikaans-eat': { novel: '', drama: '', poems: [] },
        },
      });
    } else if (user && !userProfile && !isProfileLoading) {
      // Set defaults from user object if no profile exists
      reset({
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        subjects: [],
        gradeLevel: '',
      });
    }
  }, [user, userProfile, isProfileLoading, reset, formState.isDirty]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User not logged in.",
        });
        return;
    }

    const dataToSave = {
        ...userProfile, // preserve existing data
        ...data,
        email: user?.email, // ensure email is preserved
        gradeLevel: parseInt(data.gradeLevel, 10), // Convert grade back to number
    };

    setDoc(userProfileRef, dataToSave, { merge: true })
      .then(() => {
        toast({
          title: 'Settings Saved',
          description: 'Your profile has been updated successfully.',
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'update',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem saving your settings. Please try again.",
        });
      });
  }

  const handleDeleteAccount = async () => {
    if (!user || !userProfileRef) return;
    setIsDeleting(true);
    try {
      // First, delete the Firestore document.
      await deleteDoc(userProfileRef);
      
      // Then, delete the user from Authentication
      await deleteCurrentUser(auth);

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Redirect to login after successful deletion
      router.push('/login');

    } catch (error: any) {
      let description = "There was a problem deleting your account. Please try again.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This action requires you to have logged in recently. Please log out and log back in to delete your account.";
      }
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: description,
      });
    } finally {
      setIsDeleting(false);
    }
  };


  if (isUserLoading || (isProfileLoading && !userProfile)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-3xl">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </CardTitle>
          <CardDescription>
            Manage your account and learning preferences.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your first name" {...field} />
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
                          <Input placeholder="Your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={user?.email || 'No email associated'} disabled />
                </FormControl>
                 <FormDescription>
                  Your email address cannot be changed.
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Tailor your learning experience by selecting your grade and subjects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjects"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Your Subjects</FormLabel>
                      <FormDescription>
                        Select the subjects you are currently studying.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {subjects.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="subjects"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            item.value,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <LiteratureSelection
            control={control}
            selectedSubjects={watchedSubjects || []}
            selectedGrade={watchedGrade}
          />
          
          <Button type="submit" disabled={!formState.isDirty || formState.isSubmitting}>
             {formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>

       <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>
            This action cannot be undone. This will permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account, remove your data from our servers, and log you out.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
