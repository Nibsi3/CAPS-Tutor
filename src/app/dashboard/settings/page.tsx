'use client';

import { useEffect, useState, useRef } from 'react';
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
import { useUser, useDoc, useDatabases, useMemoAppwrite, useAccount } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { useToast } from '@/hooks/use-toast';
import { Loader, Settings as SettingsIcon, AlertTriangle, Languages, Globe, Plus, X } from 'lucide-react';
import { grades, contentSubjects, languageSubjects, appLanguages, compulsorySubjectsByGrade } from '@/lib/data';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { deleteCurrentUser } from '@/appwrite/auth/social-auth';
import { useRouter } from 'next/navigation';
import { LiteratureSelection, literatureSchema } from '@/components/forms/LiteratureSelection';
import { useLanguage, useSetLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';
import { updatePassword } from '@/appwrite/auth/email-auth';
import { Lock } from 'lucide-react';

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

const passwordFormSchema = z.object({
  newPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const account = useAccount();
  const databases = useDatabases();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const prevGradeRef = useRef<string>('');
  
  const currentLang = useLanguage();
  const setLanguage = useSetLanguage();
  const t = translations[currentLang] || translations.en; // Fallback to English if lang is invalid

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(0);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

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
    // Only reset form from userProfile if:
    // 1. userProfile exists
    // 2. Form is not dirty (user hasn't made changes)
    // 3. Form is not currently submitting
    // 4. We haven't just saved (prevent resetting with stale data after save)
    // This prevents overwriting user's unsaved changes or resetting during save
    const timeSinceLastSave = Date.now() - lastSavedTimestamp;
    const justSaved = timeSinceLastSave < 2000; // Don't reset if we saved in the last 2 seconds
    
    if (userProfile && !formState.isDirty && !formState.isSubmitting && !justSaved) {
      const allUserSubjects = userProfile.subjects || [];
      const englishSelection = allUserSubjects.find(s => s.startsWith('English')) || 'none';
      const afrikaansSelection = allUserSubjects.find(s => s.startsWith('Afrikaans')) || 'none';
      const contentSelection = allUserSubjects.filter(s => !s.startsWith('English') && !s.startsWith('Afrikaans'));

      // Only reset if the form values are different from userProfile to avoid unnecessary resets
      const currentGrade = form.getValues('gradeLevel');
      const profileGrade = userProfile.gradeLevel ? userProfile.gradeLevel.toString() : '';
      const currentEnglish = form.getValues('english');
      const currentAfrikaans = form.getValues('afrikaans');
      
      // Check if we actually need to reset (values are different)
      // Also check language subjects to ensure they're always synced
      if (currentGrade !== profileGrade || 
          form.getValues('firstName') !== (userProfile.firstName || '') ||
          form.getValues('lastName') !== (userProfile.lastName || '') ||
          currentEnglish !== englishSelection ||
          currentAfrikaans !== afrikaansSelection) {
        reset({
          ...userProfile,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          language: userProfile.language || 'en',
          gradeLevel: profileGrade,
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
        // Set the previous grade reference
        prevGradeRef.current = profileGrade;
      }
    } else if (user && !userProfile && !isProfileLoading) {
      // Set defaults from user object if no profile exists
      reset({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        language: 'en',
        contentSubjects: [],
        gradeLevel: '',
        english: 'none',
        afrikaans: 'none',
      });
    }
  }, [user, userProfile, isProfileLoading, reset, formState.isDirty, formState.isSubmitting, form, setLanguage, lastSavedTimestamp]);

  // Auto-select compulsory subjects when grade is selected (Grades 1-9) - only when grade changes
  useEffect(() => {
    if (watchedGrade && watchedGrade !== prevGradeRef.current && parseInt(watchedGrade) >= 1 && parseInt(watchedGrade) <= 9) {
      const compulsorySubjects = compulsorySubjectsByGrade[watchedGrade];
      if (compulsorySubjects) {
        // Auto-set language subject (default to English, user can change)
        if (compulsorySubjects.languageSubjects.length > 0) {
          form.setValue('english', compulsorySubjects.languageSubjects[0], {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        // Auto-set content subjects
        form.setValue('contentSubjects', compulsorySubjects.contentSubjects, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      prevGradeRef.current = watchedGrade;
    }
  }, [watchedGrade, form]);

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!account) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Account not available.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(account, data.newPassword);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

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

    // Exclude Appwrite system fields and frontend-added fields when saving
    const userProfileData = userProfile ? {
      ...userProfile,
      id: undefined,
      $id: undefined,
      $createdAt: undefined,
      $updatedAt: undefined,
    } : {};
    
    // Remove undefined values
    Object.keys(userProfileData).forEach(key => {
      if (userProfileData[key as keyof typeof userProfileData] === undefined) {
        delete userProfileData[key as keyof typeof userProfileData];
      }
    });
    
    const dataToSave: any = {
        ...userProfileData, // preserve existing data (without system fields)
        firstName: data.firstName,
        lastName: data.lastName,
        email: user?.email,
        language: data.language,
        gradeLevel: parseInt(data.gradeLevel, 10),
        subjects: finalSubjects,
    };
    
    // Only include literature if it's provided and not empty
    // Note: You need to add a 'literature' attribute (JSON type) to the 'user' collection in Appwrite
    // if you want to save literature selections
    if (data.literature && Object.keys(data.literature).length > 0) {
      // Check if literature attribute exists by checking if it was in the original profile
      // If the attribute doesn't exist in Appwrite, this will cause an error
      // For now, we'll skip it to avoid errors
      // TODO: Add 'literature' attribute (JSON type) to 'user' collection in Appwrite
      // dataToSave.literature = data.literature;
    }

    if (!userProfileRef || !databases) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not logged in.",
      });
      return;
    }

    databases.updateDocument(
      userProfileRef.databaseId,
      userProfileRef.collectionId,
      userProfileRef.documentId,
      dataToSave
    )
      .then(async () => {
        // Refetch the updated document to get the latest data from server
        try {
          const updatedDoc = await databases.getDocument(
            userProfileRef.databaseId,
            userProfileRef.collectionId,
            userProfileRef.documentId
          );
          
          // Update form with the fresh data from server
          const allUserSubjects = (updatedDoc.subjects || []) as string[];
          const englishSelection = allUserSubjects.find(s => s.startsWith('English')) || 'none';
          const afrikaansSelection = allUserSubjects.find(s => s.startsWith('Afrikaans')) || 'none';
          const contentSelection = allUserSubjects.filter(s => !s.startsWith('English') && !s.startsWith('Afrikaans'));

          const formData = {
            firstName: updatedDoc.firstName || '',
            lastName: updatedDoc.lastName || '',
            language: updatedDoc.language || 'en',
            gradeLevel: updatedDoc.gradeLevel ? updatedDoc.gradeLevel.toString() : '',
            english: englishSelection,
            afrikaans: afrikaansSelection,
            contentSubjects: contentSelection,
            literature: (updatedDoc as any).literature || {
              'english-hl': { novel: '', drama: '', poems: [] },
              'english-fal': { novel: '', drama: '', poems: [] },
              'afrikaans-ht': { novel: '', drama: '', poems: [] },
              'afrikaans-eat': { novel: '', drama: '', poems: [] },
            },
          };
          
          form.reset(formData, { keepValues: false }); // Reset form with fresh server data
          // Update prevGradeRef to match the saved grade
          prevGradeRef.current = formData.gradeLevel;
          setLastSavedTimestamp(Date.now()); // Prevent useEffect from resetting with stale data
        } catch (refetchError) {
          console.error('Error refetching document:', refetchError);
          // If refetch fails, just reset with form data
          form.reset(data, { keepValues: false });
          prevGradeRef.current = data.gradeLevel;
          setLastSavedTimestamp(Date.now());
        }
        
        if (data.language) {
          setLanguage(data.language as keyof typeof translations);
        }
        toast({
          title: t.settingsSavedTitle,
          description: t.settingsSavedDescription,
        });
        
        // Reload the page to show updated settings
        router.refresh();
        window.location.reload();
      })
      .catch((serverError) => {
        console.error('Error saving settings:', serverError);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem saving your settings. Please try again.",
        });
      });
  }

  const handleDeleteAccount = async () => {
    if (!user || !userProfileRef || !databases || !account) return;
    setIsDeleting(true);
    try {
      // First, delete the user document from Appwrite.
      await databases.deleteDocument(
        userProfileRef.databaseId,
        userProfileRef.collectionId,
        userProfileRef.documentId
      );
      
      // Then, delete the user from Authentication
      await deleteCurrentUser(account);

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

  // Get language label in current language
  const currentLanguageLabel = appLanguages.find(l => l.value === currentLang)?.label || 'English';
  const gradeValue = parseInt(watchedGrade || '8');

  return (
    <div className="flex-1 pb-8">
      {/* Header Section with Language Selector */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-headline text-3xl font-bold mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            {t.settings}
          </h1>
          <p className="text-muted-foreground text-base">
            {t.settingsDescription}
          </p>
        </div>
        
        {/* Language Selector in Top Right */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{currentLanguageLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <div className="space-y-2">
                  <p className="text-sm font-semibold mb-3">{t.language}</p>
                  {appLanguages.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => {
                        field.onChange(lang.value);
                        setLanguage(lang.value as keyof typeof translations);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        field.value === lang.value
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="max-w-5xl space-y-6">
        {/* Profile Settings Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative pb-32">
            <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Section with Grade Slider - Left */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">{t.personalInformation}</CardTitle>
                  <CardDescription className="text-sm">{t.personalInformationDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t.firstName}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.firstNamePlaceholder} {...field} className="h-10" />
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
                          <FormLabel className="text-sm font-medium">{t.lastName}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.lastNamePlaceholder} {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Grade Level Slider */}
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t.gradeLevel}: <span className="font-bold text-primary">{gradeValue}</span></FormLabel>
                        <FormControl>
                          <div className="px-2 py-4">
                            <Slider
                              value={[gradeValue]}
                              onValueChange={(vals) => field.onChange(vals[0].toString())}
                              min={1}
                              max={12}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>Grade 1</span>
                              <span>Grade 12</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input value={user?.email || 'No email associated'} disabled className="h-10 bg-muted" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t.emailDescription}
                    </FormDescription>
                  </FormItem>
                </CardContent>
              </Card>

              {/* Change Password Section - Right */}
              <Card className="shadow-sm border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter new password" {...field} className="h-10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm new password" {...field} className="h-10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isChangingPassword || !passwordForm.formState.isDirty}
                        className="w-full"
                      >
                        {isChangingPassword && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Selected Language Subjects Display - Below the cards, side by side */}
            {(watchedEnglish && watchedEnglish !== 'none') || (watchedAfrikaans && watchedAfrikaans !== 'none') ? (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Selected Language Subjects</CardTitle>
                  <CardDescription className="text-sm">
                    Your selected language subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {watchedEnglish && watchedEnglish !== 'none' && (
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        {watchedEnglish}
                      </Badge>
                    )}
                    {watchedAfrikaans && watchedAfrikaans !== 'none' && (
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        {watchedAfrikaans}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* All Subjects Section - Moved down */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">My Subjects</CardTitle>
                <CardDescription className="text-sm">
                  Select all the subjects you are studying
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Subjects */}
                <FormField
                  control={form.control}
                  name="contentSubjects"
                  render={() => (
                    <FormItem>
                      <div className="space-y-4">
                        <div>
                          <FormLabel className="text-sm font-semibold">{t.contentSubjects}</FormLabel>
                          <FormDescription className="text-xs">
                            {t.contentSubjectsDescription}
                          </FormDescription>
                        </div>
                        
                        {watchedContentSubjects && watchedContentSubjects.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {watchedContentSubjects.map((subject) => (
                              <Badge 
                                key={subject} 
                                variant="secondary" 
                                className="px-3 py-2 text-sm flex items-center justify-between"
                              >
                                <span className="truncate">{subject}</span>
                                {gradeValue >= 10 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentValue = watchedContentSubjects || [];
                                      form.setValue('contentSubjects', currentValue.filter(s => s !== subject), {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      });
                                    }}
                                    className="hover:text-destructive flex-shrink-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Subject Button - Only for Grade 10-12 */}
                        {gradeValue >= 10 && (
                          <Dialog open={showAddSubjectDialog} onOpenChange={setShowAddSubjectDialog}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" className="w-full gap-2">
                                <Plus className="h-4 w-4" />
                                Add Subject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Select Subjects</DialogTitle>
                                <DialogDescription>
                                  Choose all the subjects you are studying. You can select multiple.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto py-4">
                                {contentSubjects.map((subject) => {
                                  const isSelected = watchedContentSubjects?.includes(subject.value);
                                  return (
                                    <button
                                      key={subject.value}
                                      type="button"
                                      onClick={() => {
                                        const currentValue = watchedContentSubjects || [];
                                        if (isSelected) {
                                          // Remove if already selected
                                          form.setValue('contentSubjects', currentValue.filter(s => s !== subject.value), {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          });
                                        } else {
                                          // Add if not selected
                                          form.setValue('contentSubjects', [...currentValue, subject.value], {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          });
                                        }
                                      }}
                                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
                                        isSelected
                                          ? 'border-primary bg-primary/10 hover:bg-primary/20'
                                          : 'hover:border-primary/50 hover:bg-accent/30'
                                      }`}
                                    >
                                      <span className="text-sm font-medium">{subject.label}</span>
                                      {isSelected ? (
                                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                          <X className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                      ) : (
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowAddSubjectDialog(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => setShowAddSubjectDialog(false)}
                                >
                                  Done
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {gradeValue < 10 && (
                          <p className="text-xs text-muted-foreground italic">
                            Subjects are automatically set for Grades 1-9 based on CAPS curriculum
                          </p>
                        )}
                      </div>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language Subjects */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-semibold">{t.languageSubjects}</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Additional language support will be added soon.",
                        });
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Add Language
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="english"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">English</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              // Use form.setValue to ensure form state is properly updated and marked as dirty
                              form.setValue('english', value, {
                                shouldDirty: true,
                                shouldValidate: true,
                                shouldTouch: true,
                              });
                              // Also call field.onChange to keep the field in sync
                              field.onChange(value);
                            }} 
                            value={field.value} 
                            disabled={gradeValue >= 1 && gradeValue <= 9}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t.notStudying}</SelectItem>
                              {languageSubjects.english.map(sub => (
                                <SelectItem key={sub.value} value={sub.value}>
                                  {sub.label}
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
                      name="afrikaans"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Afrikaans</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              // Use form.setValue to ensure form state is properly updated and marked as dirty
                              form.setValue('afrikaans', value, {
                                shouldDirty: true,
                                shouldValidate: true,
                                shouldTouch: true,
                              });
                              // Also call field.onChange to keep the field in sync
                              field.onChange(value);
                            }} 
                            value={field.value} 
                            disabled={gradeValue >= 1 && gradeValue <= 9}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t.notStudying}</SelectItem>
                              {languageSubjects.afrikaans.map(sub => (
                                <SelectItem key={sub.value} value={sub.value}>
                                  {sub.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Literature Selection - Full Width */}
            <LiteratureSelection
              control={control}
              selectedSubjects={watchedSubjects}
              selectedGrade={watchedGrade}
            />

            {/* Danger Zone - At the bottom */}
            <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {t.dangerZone}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t.dangerZoneDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        {t.deleteAccount}
                      </Button>
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
                </CardContent>
              </Card>

            {/* Fixed Save Button at bottom right */}
            <div className="fixed bottom-6 right-6 z-10">
              <Card className="shadow-lg border-2">
                <CardContent className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={!formState.isDirty || formState.isSubmitting}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {t.saveChanges}
                  </Button>
                  {formState.isDirty && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      You have unsaved changes
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
