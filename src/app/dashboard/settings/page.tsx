'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { grades, subjects as allSubjects } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
    "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

const settingsSchema = z.object({
    gradeLevel: z.string().nonempty({ message: 'Please select your grade.' }),
    province: z.string().optional(),
    school: z.string().optional(),
    subjects: z.array(z.string()).min(1, { message: 'Please select at least one subject.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// This interface represents the data structure in Firestore
interface UserProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
    gradeLevel: number;
    province?: string;
    school?: string;
    subjects: string[];
}

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            gradeLevel: '',
            province: '',
            school: '',
            subjects: [],
        },
    });
    
    useEffect(() => {
        if (userProfile) {
            form.reset({
                gradeLevel: String(userProfile.gradeLevel || ''),
                province: userProfile.province || '',
                school: userProfile.school || '',
                subjects: userProfile.subjects || [],
            });
        }
    }, [userProfile, form.reset]);

    const onSubmit = (data: SettingsFormValues) => {
        if (!user || !userProfileRef) return;
        
        const profileDataToSave: Partial<UserProfile> = {
            ...userProfile, // preserve existing fields
            ...data, 
            gradeLevel: parseInt(data.gradeLevel, 10),
            email: user.email ?? userProfile?.email,
            firstName: user.displayName?.split(' ')[0] ?? userProfile?.firstName,
            lastName: user.displayName?.split(' ').slice(1).join(' ') ?? userProfile?.lastName,
        };

        // Use the standard setDoc function with non-blocking error handling
        setDoc(userProfileRef, profileDataToSave, { merge: true })
            .then(() => {
                toast({
                    title: "Settings Saved",
                    description: "Your profile has been updated successfully.",
                });
                form.reset(data, { keepIsDirty: false });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userProfileRef.path,
                    operation: 'update',
                    requestResourceData: profileDataToSave,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: "Could not update your settings. Please check permissions."
                });
            });
    };

    if (isUserLoading || isProfileLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="h-12 w-12 animate-spin" />
            </div>
        );
    }
  
    return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account, grade, and subject preferences to personalize your learning experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Academic Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Academic Information</h3>
                        <FormField
                        control={form.control}
                        name="gradeLevel"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Grade Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your grade" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {grades.map(grade => (
                                        <SelectItem key={grade.value} value={grade.value}>
                                            {grade.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                This helps us tailor content to your curriculum.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Province</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your province" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                                <FormLabel>School Name (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Springfield High School" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Subjects Section */}
                    <div className="space-y-4">
                         <FormField
                            control={form.control}
                            name="subjects"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium">Your Subjects</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Select the subjects you are currently studying.
                                        </p>
                                    </div>
                                     <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 rounded-lg border p-4">
                                        {allSubjects.map((subject) => (
                                        <FormField
                                            key={subject.value}
                                            control={form.control}
                                            name="subjects"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={subject.value}
                                                className="flex flex-row items-center space-x-3 space-y-0"
                                                >
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value?.includes(subject.value)}
                                                    onCheckedChange={(checked) => {
                                                        const updatedSubjects = checked
                                                        ? [...(field.value || []), subject.value]
                                                        : field.value?.filter(
                                                            (value) => value !== subject.value
                                                            );
                                                        field.onChange(updatedSubjects);
                                                    }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer flex-1">
                                                    {subject.label}
                                                </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                </div>

                <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

    