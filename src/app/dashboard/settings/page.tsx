'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
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
import { Loader, Settings as SettingsIcon, AlertTriangle, Globe, Plus, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useScrollRestore } from '@/hooks/use-scroll-restore';
import { Badge } from "@/components/ui/badge"
import { deleteCurrentUser } from '@/appwrite/auth/social-auth';
import { useRouter } from 'next/navigation';
import { LiteratureSelection, literatureSchema } from '@/components/forms/LiteratureSelection';
import { useLanguage, useSetLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';
import { updatePassword } from '@/appwrite/auth/email-auth';
import { Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageCropper } from '@/components/ui/image-cropper';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  photoURL: z.string().optional().or(z.literal('')),
  dateOfBirth: z.date().optional().nullable(),
}).refine(data => {
    return (data.english && data.english !== "none") || 
           (data.afrikaans && data.afrikaans !== "none") || 
           (data.contentSubjects && data.contentSubjects.length > 0);
}, {
    message: "You must select at least one subject.",
    path: ["contentSubjects"], // Point error to the last field in the group
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Date Picker Component with Year Selection
interface DatePickerWithYearProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  disabled?: (date: Date) => boolean;
}

function DatePickerWithYear({ value, onChange, disabled }: DatePickerWithYearProps) {
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [currentYear, setCurrentYear] = useState(
    value?.getFullYear() || new Date().getFullYear()
  );
  const yearListRef = useRef<HTMLDivElement>(null);
  
  // Update currentYear when value changes
  useEffect(() => {
    if (value) {
      setCurrentYear(value.getFullYear());
    }
  }, [value]);
  
  // Scroll to current year when year picker opens
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
      const yearButton = yearListRef.current.querySelector(`[data-year="${currentYear}"]`);
      if (yearButton) {
        yearButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showYearPicker, currentYear]);
  
  // Generate all years from 1900 to current year
  const currentYearValue = new Date().getFullYear();
  const allYears = Array.from({ length: currentYearValue - 1899 }, (_, i) => currentYearValue - i);
  
  // Group years by decade for visual organization
  const groupedYears: { [key: string]: number[] } = {};
  allYears.forEach(year => {
    const decade = Math.floor(year / 10) * 10;
    const decadeKey = `${decade}s`;
    if (!groupedYears[decadeKey]) {
      groupedYears[decadeKey] = [];
    }
    groupedYears[decadeKey].push(year);
  });
  
  const handleYearSelect = (year: number) => {
    const currentDate = value || new Date();
    const newDate = new Date(year, currentDate.getMonth(), currentDate.getDate());
    // Ensure date is not in the future
    if (newDate > new Date()) {
      onChange(new Date());
    } else {
      onChange(newDate);
    }
    setCurrentYear(year);
    setShowYearPicker(false);
  };
  
  const calculateAge = (date: Date | null | undefined): number | null => {
    if (!date) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  };
  
  const age = calculateAge(value);
  
  return (
    <div className="flex flex-col">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal h-10",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              format(value, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {showYearPicker ? (
            <div className="p-3 w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowYearPicker(false)}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm font-semibold">Select Year</span>
                <div className="w-16" /> {/* Spacer for alignment */}
              </div>
              <div 
                ref={yearListRef}
                className="max-h-[320px] overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="space-y-1">
                  {Object.entries(groupedYears).map(([decade, years]) => (
                    <div key={decade} className="space-y-1">
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground sticky top-0 bg-background z-10">
                        {decade.replace('s', '')}s
                      </div>
                      <div className="grid grid-cols-5 gap-1 px-1">
                        {years.map((year) => (
                          <Button
                            key={year}
                            type="button"
                            variant={currentYear === year ? "default" : "ghost"}
                            data-year={year}
                            className={cn(
                              "h-9 text-sm font-medium transition-colors",
                              currentYear === year 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                : "hover:bg-accent"
                            )}
                            onClick={() => handleYearSelect(year)}
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={(date) => {
                if (date) {
                  onChange(date);
                  setCurrentYear(date.getFullYear());
                } else {
                  onChange(null);
                }
              }}
              disabled={disabled}
              initialFocus
              components={{
                CaptionLabel: ({ displayMonth }) => {
                  const year = displayMonth.getFullYear();
                  
                  return (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 px-3 text-sm font-medium hover:bg-accent"
                      onClick={() => {
                        setCurrentYear(year);
                        setShowYearPicker(true);
                      }}
                    >
                      <span className="mr-1">{format(displayMonth, "MMMM")}</span>
                      <span className="font-semibold">{format(displayMonth, "yyyy")}</span>
                    </Button>
                  );
                },
              }}
            />
          )}
        </PopoverContent>
      </Popover>
      {age !== null && (
        <p className="text-xs text-muted-foreground mt-1">
          Age: <span className="font-semibold">{age} years old</span>
        </p>
      )}
    </div>
  );
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  language?: string;
  gradeLevel: number;
  subjects: string[];
  literature?: z.infer<typeof literatureSchema>;
  photoURL?: string;
  dateOfBirth?: string | null; // Stored as ISO string in database
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
  
  // Restore scroll position on reload
  useScrollRestore('settings-page');
  
  const searchParams = useSearchParams();
  const sectionParam = searchParams?.get('section');
  const activeSection = (sectionParam === 'personal' || sectionParam === 'subjects' || sectionParam === 'languages') 
    ? sectionParam 
    : 'personal';
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const prevGradeRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      photoURL: '',
      dateOfBirth: null,
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
      // Convert dateOfBirth from ISO string to Date object if it exists
      const dateOfBirthDate = userProfile.dateOfBirth 
        ? new Date(userProfile.dateOfBirth) 
        : null;
      
      if (currentGrade !== profileGrade || 
          form.getValues('firstName') !== (userProfile.firstName || '') ||
          form.getValues('lastName') !== (userProfile.lastName || '') ||
          form.getValues('photoURL') !== (userProfile.photoURL || '') ||
          form.getValues('dateOfBirth')?.getTime() !== dateOfBirthDate?.getTime() ||
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
          photoURL: userProfile.photoURL || '',
          dateOfBirth: dateOfBirthDate,
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

  // Update prevGradeRef when grade changes
  useEffect(() => {
    if (watchedGrade && watchedGrade !== prevGradeRef.current) {
      prevGradeRef.current = watchedGrade;
    }
  }, [watchedGrade]);

  // Set default section in URL if not present
  useEffect(() => {
    if (!sectionParam) {
      router.replace('/dashboard/settings?section=personal');
    }
  }, [sectionParam, router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview URL for cropping
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setCropImageSrc(imageSrc);
      setShowCropper(true);
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read image file. Please try again.",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user) {
      return;
    }

    setIsUploadingPhoto(true);
    setShowCropper(false);

    try {
      // Convert blob to File for upload
      const croppedFile = new File(
        [croppedImageBlob],
        `profile-photo-${Date.now()}.png`,
        { type: 'image/png' }
      );

      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('userId', user.$id);

      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }

      // Update the form with the new photo URL
      form.setValue('photoURL', result.photoURL, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast({
        title: "Photo Uploaded",
        description: "Your profile picture has been uploaded successfully.",
      });

      // Dispatch event to notify other components (like UserNav) to refetch profile
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: { userId: user?.$id }
        }));
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
      });
    } finally {
      setIsUploadingPhoto(false);
      setCropImageSrc(null);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
    
    // Add photoURL if provided
    if (data.photoURL && data.photoURL.trim() !== '') {
      dataToSave.photoURL = data.photoURL.trim();
      console.log('💾 Saving photoURL:', dataToSave.photoURL.substring(0, 50) + '...');
    } else if (data.photoURL === '') {
      // Empty string means remove photo
      dataToSave.photoURL = null;
      console.log('🗑️ Removing photoURL');
    }
    
    // Add dateOfBirth if provided (convert Date to ISO string)
    if (data.dateOfBirth) {
      dataToSave.dateOfBirth = data.dateOfBirth.toISOString();
    } else if (data.dateOfBirth === null) {
      // Explicitly set to null if user cleared the date
      dataToSave.dateOfBirth = null;
    }
    
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
        // Check if photoURL was saved successfully
        if (dataToSave.hasOwnProperty('photoURL')) {
          console.log('✅ Profile updated successfully including photoURL');
        }
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

          const dateOfBirthDate = (updatedDoc as any).dateOfBirth 
            ? new Date((updatedDoc as any).dateOfBirth) 
            : null;

          const formData = {
            firstName: updatedDoc.firstName || '',
            lastName: updatedDoc.lastName || '',
            language: updatedDoc.language || 'en',
            gradeLevel: updatedDoc.gradeLevel ? updatedDoc.gradeLevel.toString() : '',
            english: englishSelection,
            afrikaans: afrikaansSelection,
            contentSubjects: contentSelection,
            photoURL: (updatedDoc as any).photoURL || '',
            dateOfBirth: dateOfBirthDate,
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

        // Dispatch event to notify other components (like UserNav) to refetch profile
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userProfileUpdated', {
            detail: { userId: user?.$id }
          }));
        }
      })
      .catch((serverError: any) => {
        console.error('Error saving settings:', serverError);
        
        // Check if error is due to photoURL attribute not existing
        if (serverError.code === 400 || serverError.code === 422) {
          const errorMessage = serverError.message || '';
          if (errorMessage.includes('photoURL') || dataToSave.hasOwnProperty('photoURL')) {
            toast({
              variant: "destructive",
              title: "Photo URL Attribute Missing",
              description: "The photoURL attribute doesn't exist in your collection. Please add it in Appwrite Console. See docs/APPWRITE_PHOTOURL_ATTRIBUTE.md for instructions.",
            });
            return;
          }
        }
        
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
  const gradeValue = parseInt(watchedGrade || '10');

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
      
      <div className="max-w-5xl">
        {/* Profile Settings Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative pb-32 space-y-8">
            <div className="space-y-6">
                {activeSection === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Personal Information Section */}
                      <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold">{t.personalInformation}</CardTitle>
                          <CardDescription className="text-sm">{t.personalInformationDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="photoURL"
                            render={({ field }) => {
                              const watchedPhotoURL = useWatch({ control, name: 'photoURL' });
                              const currentPhotoURL = watchedPhotoURL || userProfile?.photoURL || '';
                              const prefsPhotoURL = user ? ((user as any).prefs?.avatar ||
                                (user as any).prefs?.picture ||
                                (user as any).prefs?.photoURL ||
                                (user as any).prefs?.['https://www.googleapis.com/auth/userinfo.profile']?.picture ||
                                null) : null;
                              const displayPhotoURL = currentPhotoURL || prefsPhotoURL || '';
                              return (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Profile Picture</FormLabel>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-20 w-20">
                                        <AvatarImage src={displayPhotoURL || undefined} alt={user?.name || 'User'} />
                                        <AvatarFallback className="text-lg">
                                          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 space-y-2">
                                        <FormDescription className="text-xs mt-1">
                                          Upload a photo from your device (JPEG, PNG, GIF, or WebP, max 5MB). If empty, your Google account photo will be used.
                                        </FormDescription>
                                        <FormControl>
                                          <div className="flex items-center gap-2">
                                            <input
                                              ref={fileInputRef}
                                              type="file"
                                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                              onChange={handleFileSelect}
                                              className="hidden"
                                              id="photo-upload"
                                              disabled={isUploadingPhoto}
                                            />
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => fileInputRef.current?.click()}
                                              disabled={isUploadingPhoto}
                                              className="gap-2"
                                            >
                                              {isUploadingPhoto ? (
                                                <>
                                                  <Loader className="h-4 w-4 animate-spin" />
                                                  Uploading...
                                                </>
                                              ) : (
                                                <>
                                                  <Upload className="h-4 w-4" />
                                                  Upload Photo
                                                </>
                                              )}
                                            </Button>
                                            {currentPhotoURL && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  form.setValue('photoURL', '', {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                  });
                                                }}
                                                className="text-destructive hover:text-destructive"
                                              >
                                                Remove
                                              </Button>
                                            )}
                                          </div>
                                        </FormControl>
                                        <input type="hidden" {...field} />
                                      </div>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
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
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-sm font-medium">Date of Birth</FormLabel>
                                <FormControl>
                                  <DatePickerWithYear
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                  />
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
                                <FormLabel className="text-sm font-medium">
                                  {t.gradeLevel}: <span className="font-bold text-primary">{gradeValue}</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="px-2 py-4">
                                    <Slider
                                      value={[gradeValue]}
                                      onValueChange={(vals) => field.onChange(vals[0].toString())}
                                      min={10}
                                      max={12}
                                      step={1}
                                      className="w-full"
                                    />
                                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                      <span>Grade 10</span>
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
                )}

                {activeSection === 'subjects' && (
                  <div className="space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">My Subjects</CardTitle>
                        <CardDescription className="text-sm">
                          Select all the subjects you are studying
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                                        className="flex items-center justify-between px-3 py-2 text-sm"
                                      >
                                        <span className="truncate">{subject}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentValue = watchedContentSubjects || [];
                                            form.setValue('contentSubjects', currentValue.filter(s => s !== subject), {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                            });
                                          }}
                                          className="flex-shrink-0 hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
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
                                    <div className="grid max-h-[400px] grid-cols-1 gap-3 overflow-y-auto py-4">
                                      {contentSubjects.map((subject) => {
                                        const isSelected = watchedContentSubjects?.includes(subject.value);
                                        return (
                                          <button
                                            key={subject.value}
                                            type="button"
                                            onClick={() => {
                                              const currentValue = watchedContentSubjects || [];
                                              if (isSelected) {
                                                form.setValue('contentSubjects', currentValue.filter(s => s !== subject.value), {
                                                  shouldDirty: true,
                                                  shouldValidate: true,
                                                });
                                              } else {
                                                form.setValue('contentSubjects', [...currentValue, subject.value], {
                                                  shouldDirty: true,
                                                  shouldValidate: true,
                                                });
                                              }
                                            }}
                                            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all duration-200 ${
                                              isSelected
                                                ? 'border-primary bg-primary/10 hover:bg-primary/20'
                                                : 'hover:border-primary/50 hover:bg-accent/30'
                                            }`}
                                          >
                                            <span className="text-sm font-medium">{subject.label}</span>
                                            {isSelected ? (
                                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                                <X className="h-3 w-3 text-primary-foreground" />
                                              </div>
                                            ) : (
                                              <Plus className="h-4 w-4 text-muted-foreground" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <div className="flex justify-end gap-2 border-t pt-4">
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
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'languages' && (
                  <div className="space-y-6">
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

                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">{t.languageSubjects}</CardTitle>
                        <CardDescription className="text-sm">
                          Choose your Home and Additional language streams
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="english"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">English</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    form.setValue('english', value, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                      shouldTouch: true,
                                    });
                                    field.onChange(value);
                                  }}
                                  value={field.value}
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
                                    form.setValue('afrikaans', value, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                      shouldTouch: true,
                                    });
                                    field.onChange(value);
                                  }}
                                  value={field.value}
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
                      </CardContent>
                    </Card>

                    <LiteratureSelection
                      control={control}
                      selectedSubjects={watchedSubjects}
                      selectedGrade={watchedGrade}
                    />
                  </div>
                )}
            </div>

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

        {/* Image Cropper Dialog */}
        {cropImageSrc && (
          <ImageCropper
            image={cropImageSrc}
            open={showCropper}
            onClose={() => {
              setShowCropper(false);
              setCropImageSrc(null);
              // Reset file input
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            onCropComplete={handleCropComplete}
            aspectRatio={1} // Square (1:1) for circular avatars
          />
        )}
      </div>
    </div>
  );
}
