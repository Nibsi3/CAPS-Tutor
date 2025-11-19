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
import { Input } from '@/components/ui/input';
import { useUser, useDoc, useDatabases, useMemoAppwrite, useAccount } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { useToast } from '@/hooks/use-toast';
import { Loader, Settings as SettingsIcon, AlertTriangle, Globe, Shield } from 'lucide-react';
import { appLanguages } from '@/lib/data';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { deleteCurrentUser } from '@/appwrite/auth/social-auth';
import { useRouter } from 'next/navigation';
import { useLanguage, useSetLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';
import { updatePassword } from '@/appwrite/auth/email-auth';
import { Lock } from 'lucide-react';

const adminProfileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }).optional(),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }).optional(),
  language: z.string().optional(),
});

type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  language?: string;
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

export default function AdminSettingsPage() {
  const { user, isUserLoading } = useUser();
  const account = useAccount();
  const databases = useDatabases();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const currentLang = useLanguage();
  const setLanguage = useSetLanguage();
  const t = translations[currentLang] || translations.en;

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AdminProfile>(userProfileRef);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(0);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const form = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      language: 'en',
    },
    mode: 'onChange',
  });
  
  const { formState, reset } = form;

  useEffect(() => {
    const timeSinceLastSave = Date.now() - lastSavedTimestamp;
    const justSaved = timeSinceLastSave < 2000;
    
    if (userProfile && !formState.isDirty && !formState.isSubmitting && !justSaved) {
      const currentFirstName = form.getValues('firstName');
      const currentLastName = form.getValues('lastName');
      const currentLanguage = form.getValues('language');
      
      if (currentFirstName !== (userProfile.firstName || '') ||
          currentLastName !== (userProfile.lastName || '') ||
          currentLanguage !== (userProfile.language || 'en')) {
        reset({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          language: userProfile.language || 'en',
        });
        if (userProfile.language) {
          setLanguage(userProfile.language as keyof typeof translations);
        }
      }
    } else if (user && !userProfile && !isProfileLoading) {
      reset({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        language: 'en',
      });
    }
  }, [user, userProfile, isProfileLoading, reset, formState.isDirty, formState.isSubmitting, form, setLanguage, lastSavedTimestamp]);

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

  async function onSubmit(data: AdminProfileFormValues) {
    if (!userProfileRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User not logged in.",
        });
        return;
    }

    const userProfileData = userProfile ? {
      ...userProfile,
      id: undefined,
      $id: undefined,
      $createdAt: undefined,
      $updatedAt: undefined,
    } : {};
    
    Object.keys(userProfileData).forEach(key => {
      if (userProfileData[key as keyof typeof userProfileData] === undefined) {
        delete userProfileData[key as keyof typeof userProfileData];
      }
    });
    
    const dataToSave: any = {
        ...userProfileData,
        firstName: data.firstName,
        lastName: data.lastName,
        email: user?.email,
        language: data.language,
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
      .then(async () => {
        try {
          const updatedDoc = await databases.getDocument(
            userProfileRef.databaseId,
            userProfileRef.collectionId,
            userProfileRef.documentId
          );

          const formData = {
            firstName: updatedDoc.firstName || '',
            lastName: updatedDoc.lastName || '',
            language: updatedDoc.language || 'en',
          };
          
          form.reset(formData, { keepValues: false });
          setLastSavedTimestamp(Date.now());
        } catch (refetchError) {
          console.error('Error refetching document:', refetchError);
          form.reset(data, { keepValues: false });
          setLastSavedTimestamp(Date.now());
        }
        
        if (data.language) {
          setLanguage(data.language as keyof typeof translations);
        }
        toast({
          title: t.settingsSavedTitle || "Settings Saved",
          description: t.settingsSavedDescription || "Your settings have been saved successfully.",
        });
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
      await databases.deleteDocument(
        userProfileRef.databaseId,
        userProfileRef.collectionId,
        userProfileRef.documentId
      );
      
      await deleteCurrentUser(account);

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

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

  const currentLanguageLabel = appLanguages.find(l => l.value === currentLang)?.label || 'English';

  return (
    <div className="flex-1 pb-8">
      {/* Header Section with Language Selector */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-headline text-3xl font-bold mb-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground text-base">
            Manage your admin account settings and preferences
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
                  <p className="text-sm font-semibold mb-3">{t.language || "Language"}</p>
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
              {/* Personal Information Section - Left */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                  <CardDescription className="text-sm">
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t.firstName || "First Name"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.firstNamePlaceholder || "Enter your first name"} {...field} className="h-10" />
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
                          <FormLabel className="text-sm font-medium">{t.lastName || "Last Name"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.lastNamePlaceholder || "Enter your last name"} {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input value={user?.email || 'No email associated'} disabled className="h-10 bg-muted" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t.emailDescription || "Your email address cannot be changed."}
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
                    <div 
                      className="space-y-4"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                          e.preventDefault();
                          e.stopPropagation();
                          passwordForm.handleSubmit(onPasswordSubmit)();
                        }
                      }}
                    >
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
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          passwordForm.handleSubmit(onPasswordSubmit)();
                        }}
                        disabled={isChangingPassword || !passwordForm.formState.isDirty}
                        className="w-full"
                      >
                        {isChangingPassword && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Admin Information Card */}
            <Card className="shadow-sm border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-700 dark:text-blue-400">
                  <Shield className="h-5 w-5" />
                  Admin Account
                </CardTitle>
                <CardDescription className="text-sm">
                  You are logged in as an administrator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">Administrator</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm text-muted-foreground">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User ID:</span>
                    <span className="text-sm text-muted-foreground font-mono text-xs">{user?.$id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone - At the bottom */}
            <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {t.dangerZone || "Danger Zone"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t.dangerZoneDescription || "Irreversible and destructive actions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        {t.deleteAccount || "Delete Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.deleteAccountConfirmationTitle || "Are you sure?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.deleteAccountConfirmationDescription || "This action cannot be undone. This will permanently delete your account and remove all associated data."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                          {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                          {t.deleteMyAccount || "Delete My Account"}
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
                    {t.saveChanges || "Save Changes"}
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

