'use client';

import { useEffect, useState } from 'react';
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
import { useUser, useDoc, useDatabases, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { grades, subjects } from '@/lib/data';
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


// Create a schema that validates subjects based on grade level dynamically
const profileFormSchema = z.object({
  age: z.coerce.number().min(5, { message: "Please enter a valid age."}).max(99, { message: "Please enter a valid age."}),
  province: z.string({ required_error: 'Please select a province.' }),
  school: z.string().min(2, { message: 'School name is required.'}),
  gradeLevel: z.string({
    required_error: 'Please select a grade level.',
  }),
  subjects: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  // Only require subjects for grades 10, 11, and 12
  const isSeniorGrade = data.gradeLevel === "10" || data.gradeLevel === "11" || data.gradeLevel === "12";
  
  if (isSeniorGrade) {
    if (!data.subjects || data.subjects.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You have to select at least one subject for your grade level.',
        path: ['subjects'],
      });
    }
  }
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
  const databases = useDatabases();
  const { toast } = useToast();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure consistent rendering between server and client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

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

  const { formState, reset, watch } = form;
  const selectedGrade = watch('gradeLevel');

  // Check if selected grade is 10, 11, or 12
  const isSeniorGrade = selectedGrade === "10" || selectedGrade === "11" || selectedGrade === "12";

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

  // Clear subjects when grade changes to below 10
  useEffect(() => {
    if (selectedGrade && !isSeniorGrade) {
      form.setValue('subjects', []);
    }
  }, [selectedGrade, isSeniorGrade, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User not logged in.",
        });
        return;
    }

    // Validate required fields before saving
    if (!data.age || data.age < 5 || data.age > 99) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please enter a valid age between 5 and 99.",
        });
        return;
    }

    if (!data.province || data.province.trim() === '') {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please select a province.",
        });
        return;
    }

    if (!data.school || data.school.trim() === '') {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please enter a school name.",
        });
        return;
    }

    // Validate subjects for senior grades (10, 11, 12)
    const isSeniorGrade = data.gradeLevel === "10" || data.gradeLevel === "11" || data.gradeLevel === "12";
    if (isSeniorGrade && (!data.subjects || data.subjects.length === 0)) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please select at least one subject for your grade level.",
        });
        return;
    }

    // Only include actual data fields that exist in the Appwrite schema
    // Exclude Appwrite metadata ($id, $createdAt, etc.) and the 'id' field
    // Get user info from profile if it exists, otherwise from user object
    const firstName = userProfile?.firstName || user?.name?.split(' ')[0] || 'New';
    const lastName = userProfile?.lastName || user?.name?.split(' ').slice(1).join(' ') || 'User';
    const email = userProfile?.email || user?.email || '';

    const dataToSave = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        age: Number(data.age), // Ensure it's a number, required field
        province: data.province.trim(), // Required field
        school: data.school.trim(), // Required field
        gradeLevel: parseInt(data.gradeLevel, 10), // Convert grade back to number
        subjects: data.subjects || [],
    };

    // Debug: Log what we're sending
    console.log('Saving profile data:', dataToSave);
    console.log('Age value:', dataToSave.age, 'Type:', typeof dataToSave.age);
    console.log('User profile exists:', !!userProfile);

    if (!userProfileRef || !databases || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not logged in.",
      });
      return;
    }

    // Check if profile exists - if not, create it; if yes, update it
    const profileExists = !!userProfile;
    
    const savePromise = profileExists
      ? databases.updateDocument(
          userProfileRef.databaseId,
          userProfileRef.collectionId,
          userProfileRef.documentId,
          dataToSave
        )
      : databases.createDocument(
          userProfileRef.databaseId,
          userProfileRef.collectionId,
          userProfileRef.documentId,
          dataToSave
        );

    savePromise
      .then(() => {
        toast({
          title: 'Profile Saved!',
          description: 'Your learning preferences have been set up.',
        });
        router.push('/dashboard');
      })
      .catch((serverError: any) => {
        console.error('Error saving profile:', serverError);
        
        // If update failed with 404, try creating instead
        if (profileExists && serverError.code === 404) {
          console.log('Profile not found during update, trying to create...');
          databases.createDocument(
            userProfileRef.databaseId,
            userProfileRef.collectionId,
            userProfileRef.documentId,
            dataToSave
          )
            .then(() => {
              toast({
                title: 'Profile Saved!',
                description: 'Your learning preferences have been set up.',
              });
              router.push('/dashboard');
            })
            .catch((createError: any) => {
              console.error('Error creating profile:', createError);
              let errorMessage = "There was a problem saving your preferences. Please try again.";
              if (createError.code === 409) {
                errorMessage = "Profile already exists. Please refresh the page and try again.";
              }
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: errorMessage,
              });
            });
        } else {
          // Handle other errors
          let errorMessage = "There was a problem saving your preferences. Please try again.";
          if (serverError.code === 409) {
            errorMessage = "This profile already exists. Please refresh the page.";
          } else if (serverError.code === 400) {
            errorMessage = "Invalid data provided. Please check your inputs and try again.";
          }
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: errorMessage,
          });
        }
      });
  }

  // Show loading state only after mount to prevent hydration mismatch
  if (!isMounted || isUserLoading || (isProfileLoading && !userProfile)) {
    return (
      <div className="relative isolate overflow-hidden min-h-screen flex items-center justify-center">
        {/* Top-left decorative element */}
        <div
          className="absolute left-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] -translate-x-1/3 -translate-y-1/3 bg-gradient-to-br from-violet-400 via-purple-600 to-fuchsia-500 opacity-30"
            style={{
              clipPath:
                'polygon(0% 0%, 40% 0%, 60% 20%, 80% 0%, 100% 0%, 100% 40%, 90% 60%, 70% 80%, 50% 100%, 30% 80%, 10% 60%, 0% 40%)',
            }}
          />
        </div>

        {/* Center decorative element */}
        <div
          className="absolute left-1/2 top-1/2 -z-10 transform-gpu overflow-hidden blur-3xl -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[60rem] bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 opacity-20 rotate-45"
            style={{
              clipPath:
                'polygon(25% 25%, 75% 25%, 100% 50%, 75% 75%, 25% 75%, 0% 50%)',
            }}
          />
        </div>

        {/* Bottom-right decorative element */}
        <div
          className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] translate-x-1/3 translate-y-1/3 bg-gradient-to-tl from-indigo-500 via-purple-500 to-pink-400 opacity-25"
            style={{
              clipPath:
                'polygon(100% 100%, 60% 100%, 40% 80%, 20% 100%, 0% 100%, 0% 60%, 10% 40%, 30% 20%, 50% 0%, 70% 20%, 90% 40%, 100% 60%)',
            }}
          />
        </div>
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
     <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center p-4">
        {/* Top-left decorative element */}
        <div
          className="absolute left-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] -translate-x-1/3 -translate-y-1/3 bg-gradient-to-br from-violet-400 via-purple-600 to-fuchsia-500 opacity-30"
            style={{
              clipPath:
                'polygon(0% 0%, 40% 0%, 60% 20%, 80% 0%, 100% 0%, 100% 40%, 90% 60%, 70% 80%, 50% 100%, 30% 80%, 10% 60%, 0% 40%)',
            }}
          />
        </div>

        {/* Center decorative element */}
        <div
          className="absolute left-1/2 top-1/2 -z-10 transform-gpu overflow-hidden blur-3xl -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[60rem] bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 opacity-20 rotate-45"
            style={{
              clipPath:
                'polygon(25% 25%, 75% 25%, 100% 50%, 75% 75%, 25% 75%, 0% 50%)',
            }}
          />
        </div>

        {/* Bottom-right decorative element */}
        <div
          className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] translate-x-1/3 translate-y-1/3 bg-gradient-to-tl from-indigo-500 via-purple-500 to-pink-400 opacity-25"
            style={{
              clipPath:
                'polygon(100% 100%, 60% 100%, 40% 80%, 20% 100%, 0% 100%, 0% 60%, 10% 40%, 30% 20%, 50% 0%, 70% 20%, 90% 40%, 100% 60%)',
            }}
          />
        </div>
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
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // Clear subjects if switching to a grade below 10
                                    if (value !== "10" && value !== "11" && value !== "12") {
                                      form.setValue('subjects', []);
                                    }
                                  }} 
                                  value={field.value}
                                >
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
                    
                    {/* Only show subjects selection for grades 10, 11, and 12 */}
                    {isSeniorGrade && (
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
                    )}
                    
                    {/* Show informational message for grades below 10 */}
                    {selectedGrade && !isSeniorGrade && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> Subject selection is available for Grade 10, 11, and 12 students. 
                                For lower grades, you'll have access to general learning content.
                            </p>
                        </div>
                    )}
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
