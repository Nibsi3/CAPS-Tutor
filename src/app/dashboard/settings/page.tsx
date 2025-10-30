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
import { Loader, Settings as SettingsIcon, AlertTriangle, Languages } from 'lucide-react';
import { grades, contentSubjects, languageSubjects, appLanguages } from '@/lib/data';
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
import { useLanguage, useSetLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }).optional(),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }).optional(),
  language: z.string().optional(),
  gradeLevel: z.string({
    required_error: 'Please select a grade level.',
  }),
  english: z.string().optional(),
  afrikaans: z.string().optional(),
  contentSubjects: z.array(z.string()).optional(),
  literature: literatureSchema.optional(),
}).refine(data => {
    return (data.english && data.english !== "none") || 
           (data.afrikaans && data.afrikaans !== "none") || 
           (data.contentSubjects && data.contentSubjects.length > 0);
}, {
    message: "You must select at least one subject.",
    path: ["contentSubjects"], // Point error to the last field in the group
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  language?: string;
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
  
  const currentLang = useLanguage();
  const setLanguage = useSetLanguage();
  const t = translations[currentLang];

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
      language: 'en',
      gradeLevel: '',
      contentSubjects: [],
      english: 'none',
      afrikaans: 'none',
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
  
  const watchedEnglish = useWatch({ control, name: 'english' });
  const watchedAfrikaans = useWatch({ control, name: 'afrikaans' });
  const watchedContentSubjects = useWatch({ control, name: 'contentSubjects' });
  const watchedGrade = useWatch({ control, name: 'gradeLevel' });

  const watchedSubjects = [watchedEnglish, watchedAfrikaans, ...(watchedContentSubjects || [])].filter(s => s && s !== 'none') as string[];

  useEffect(() => {
    if (userProfile && !formState.isDirty) {
      const allUserSubjects = userProfile.subjects || [];
      const englishSelection = allUserSubjects.find(s => s.startsWith('English')) || 'none';
      const afrikaansSelection = allUserSubjects.find(s => s.startsWith('Afrikaans')) || 'none';
      const contentSelection = allUserSubjects.filter(s => !s.startsWith('English') && !s.startsWith('Afrikaans'));

      reset({
        ...userProfile,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        language: userProfile.language || 'en',
        gradeLevel: userProfile.gradeLevel ? userProfile.gradeLevel.toString() : '',
        english: englishSelection,
        afrikaans: afrikaansSelection,
        contentSubjects: contentSelection,
        literature: userProfile.literature || {
            'english-hl': { novel: '', drama: '', poems: [] },
            'english-fal': { novel: '', drama: '', poems: [] },
            'afrikaans-ht': { novel: '', drama: '', poems: [] },
            'afrikaans-eat': { novel: '', drama: '', poems: [] },
        },
      });
       if (userProfile.language) {
        setLanguage(userProfile.language as keyof typeof translations);
      }
    } else if (user && !userProfile && !isProfileLoading) {
      // Set defaults from user object if no profile exists
      reset({
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        language: 'en',
        contentSubjects: [],
        gradeLevel: '',
        english: 'none',
        afrikaans: 'none',
      });
    }
  }, [user, userProfile, isProfileLoading, reset, formState.isDirty, setLanguage]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User not logged in.",
        });
        return;
    }

    const finalSubjects = [data.english, data.afrikaans, ...(data.contentSubjects || [])].filter(s => s && s !== 'none') as string[];

    const dataToSave = {
        ...userProfile, // preserve existing data
        firstName: data.firstName,
        lastName: data.lastName,
        email: user?.email,
        language: data.language,
        gradeLevel: parseInt(data.gradeLevel, 10),
        subjects: finalSubjects,
        literature: data.literature,
    };

    setDoc(userProfileRef, dataToSave, { merge: true })
      .then(() => {
        if (data.language) {
          setLanguage(data.language as keyof typeof translations);
        }
        toast({
          title: t.settingsSavedTitle,
          description: t.settingsSavedDescription,
        });
        form.reset(data); // Resets the form's dirty state
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


  if (isUserLoading || isProfileLoading) {
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
            {t.settings}
          </CardTitle>
          <CardDescription>
            {t.settingsDescription}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'><Languages className="h-5 w-5" />{t.appLanguage}</CardTitle>
                <CardDescription>{t.appLanguageDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.language}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectLanguage} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {appLanguages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>


          <Card>
            <CardHeader>
              <CardTitle>{t.personalInformation}</CardTitle>
              <CardDescription>{t.personalInformationDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.firstName}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.firstNamePlaceholder} {...field} />
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
                        <FormLabel>{t.lastName}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.lastNamePlaceholder} {...field} />
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
                  {t.emailDescription}
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t.learningPreferences}</CardTitle>
              <CardDescription>
                {t.learningPreferencesDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.gradeLevel}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.gradeLevelPlaceholder} />
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
              
              <div className="space-y-4">
                <FormLabel className="text-base">{t.languageSubjects}</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="english"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>English</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">{t.notStudying}</SelectItem>
                                {languageSubjects.english.map(sub => <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="afrikaans"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Afrikaans</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">{t.notStudying}</SelectItem>
                                {languageSubjects.afrikaans.map(sub => <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              </div>


              <FormField
                control={form.control}
                name="contentSubjects"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">{t.contentSubjects}</FormLabel>
                      <FormDescription>
                        {t.contentSubjectsDescription}
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {contentSubjects.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="contentSubjects"
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
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, item.value])
                                        : field.onChange(currentValue.filter(value => value !== item.value));
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
               <LiteratureSelection
                    control={control}
                    selectedSubjects={watchedSubjects}
                    selectedGrade={watchedGrade}
                />
            </CardContent>
          </Card>
          
          <Button type="submit" disabled={!formState.isDirty || formState.isSubmitting}>
             {formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {t.saveChanges}
          </Button>
        </form>
      </Form>

       <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> {t.dangerZone}
          </CardTitle>
          <CardDescription>
            {t.dangerZoneDescription}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{t.deleteAccount}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.deleteAccountConfirmationTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.deleteAccountConfirmationDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {t.deleteMyAccount}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
