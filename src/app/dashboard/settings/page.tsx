'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { grades, subjects as allSubjects } from '@/lib/data';

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

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<SettingsFormValues>(userProfileRef);

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
                gradeLevel: userProfile.gradeLevel || '',
                province: userProfile.province || '',
                school: userProfile.school || '',
                subjects: userProfile.subjects || [],
            });
        }
    }, [userProfile, form]);

    const onSubmit = (data: SettingsFormValues) => {
        if (!user) return;
        
        const profileData = {
            ...data,
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        };

        setDocumentNonBlocking(userProfileRef!, profileData, { merge: true });

        toast({
            title: "Settings Saved",
            description: "Your profile has been updated successfully.",
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
            Manage your account, grade, and subject preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Grade and School Section */}
                    <div className="space-y-6">
                        <FormField
                        control={form.control}
                        name="gradeLevel"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Grade Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        <FormLabel className="text-base">Your Subjects</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Select the subjects you are currently studying.
                                        </p>
                                    </div>
                                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2 rounded-md border p-4">
                                        {allSubjects.map((subject) => (
                                        <FormField
                                            key={subject.value}
                                            control={form.control}
                                            name="subjects"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={subject.value}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value?.includes(subject.value)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), subject.value])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== subject.value
                                                            )
                                                            )
                                                    }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
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

                <Button type="submit" disabled={form.formState.isSubmitting}>
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
