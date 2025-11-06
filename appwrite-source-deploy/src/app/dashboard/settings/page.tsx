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
  const account = useAccount();
  const databases = useDatabases();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const prevGradeRef = useRef<string>('');
  
  const currentLang = useLanguage();
  const setLanguage = useSetLanguage();
  const t = translations[currentLang];

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'users',
      documentId: user.$id,
    };
  }, [user]);

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
      // Set the previous grade reference
      prevGradeRef.current = userProfile.gradeLevel ? userProfile.gradeLevel.toString() : '';
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
  }, [user, userProfile, isProfileLoading, reset, formState.isDirty, setLanguage]);

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
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative pb-32">
          <div className="max-w-5xl space-y-6">
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

              {/* All Subjects Section - Right */}
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={gradeValue >= 1 && gradeValue <= 9}>
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={gradeValue >= 1 && gradeValue <= 9}>
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
          </div>

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
  );
}
