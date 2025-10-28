'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { grades, subjects } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

const provinces = [
    { value: 'EC', label: 'Eastern Cape' },
    { value: 'FS', label: 'Free State' },
    { value: 'GP', label: 'Gauteng' },
    { value: 'KZN', label: 'KwaZulu-Natal' },
    { value: 'LP', label: 'Limpopo' },
    { value: 'MP', label: 'Mpumalanga' },
    { value: 'NC', label: 'Northern Cape' },
    { value: 'NW', label: 'North West' },
    { value: 'WC', label: 'Western Cape' },
    { value: 'Other', label: 'Other/Homeschool' },
];


const profileFormSchema = z.object({
  age: z.coerce.number().min(5, { message: "Please enter a valid age."}).max(99, { message: "Please enter a valid age."}),
  province: z.string({ required_error: 'Please select a province.' }),
  school: z.string().min(2, { message: 'School name is required.'}),
  gradeLevel: z.string({
    required_error: 'Please select a grade level.',
  }),
  subjects: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one subject.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: number;
  subjects: string[];
  province: string;
  school: string;
  age: number;
}

export default function OnboardingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: 0,
      province: '',
      school: '',
      gradeLevel: '',
      subjects: [],
    },
    mode: 'onChange',
  });

  const { formState, reset } = form;

  useEffect(() => {
    if (userProfile && !formState.isDirty) {
      reset({
        ...userProfile,
        age: userProfile.age || 0,
        province: userProfile.province || '',
        school: userProfile.school || '',
        subjects: userProfile.subjects || [],
        gradeLevel: userProfile.gradeLevel ? userProfile.gradeLevel.toString() : '',
      });
    }
  }, [userProfile, reset, formState.isDirty]);

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
        ...userProfile, // preserve existing data like name/email
        ...data,
        gradeLevel: parseInt(data.gradeLevel, 10), // Convert grade back to number
    };

    setDoc(userProfileRef, dataToSave, { merge: true })
      .then(() => {
        toast({
          title: 'Profile Saved!',
          description: 'Your learning preferences have been set up.',
        });
        router.push('/dashboard');
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
            description: "There was a problem saving your preferences. Please try again.",
        });
      });
  }

  if (isUserLoading || (isProfileLoading && !userProfile)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">One Last Step!</CardTitle>
            <CardDescription>
              Let's personalize your learning experience. Tell us a bit about yourself.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>What is your age?</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 16" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="gradeLevel"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>What grade are you in?</FormLabel>
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
                            name="province"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Which province are you in?</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select your province" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {provinces.map((province) => (
                                    <SelectItem key={province.value} value={province.value}>
                                        {province.label}
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
                            name="school"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>What is the name of your school?</FormLabel>
                                 <FormControl>
                                    <Input placeholder="e.g., Cape Town High School" {...field} />
                                </FormControl>
                                <FormDescription>
                                    If you are homeschooled, just type "Homeschool".
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    
                    <FormField
                        control={form.control}
                        name="subjects"
                        render={() => (
                        <FormItem>
                            <div className="mb-4">
                            <FormLabel className="text-base">Which subjects do you want to study?</FormLabel>
                            <FormDescription>
                                Select all the subjects you are currently taking.
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
                    <Button type="submit" disabled={formState.isSubmitting} className="w-full">
                        {formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Save and Go to Dashboard
                    </Button>
                </form>
            </Form>
          </CardContent>
        </Card>
    </div>
  );
}
