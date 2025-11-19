"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccount, useUser, useDoc, useMemoAppwrite } from "@/appwrite"
import { logOut } from "@/appwrite/auth/social-auth"
import { appwriteConfig } from "@/appwrite/config"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"
import { useEffect, useState } from "react"
import { useIsAdmin } from "@/hooks/use-is-admin"

interface UserProfile {
  photoURL?: string;
}

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const account = useAccount();
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang] || translations.en; // Fallback to English if lang is invalid
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const { isAdmin } = useIsAdmin();

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile, refetch: refetchProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // Get photo URL from user profile, or from Appwrite user prefs (Google OAuth)
    let photo: string | null = null;
    
    if (userProfile?.photoURL) {
      photo = userProfile.photoURL;
      console.log('📸 Using photoURL from user profile:', photo.substring(0, 50) + '...');
    } else if (user) {
      // Check user prefs for Google OAuth photo
      const prefs = (user as any).prefs || {};
      photo = prefs.avatar || 
              prefs.picture || 
              prefs.photoURL ||
              prefs['https://www.googleapis.com/auth/userinfo.profile']?.picture ||
              null;
      
      if (photo) {
        console.log('📸 Using photoURL from user prefs:', photo.substring(0, 50) + '...');
      }
    }
    
    setPhotoURL(photo);
  }, [user, userProfile]);

  // Listen for profile update events and refetch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleProfileUpdate = (event: CustomEvent) => {
      // Only refetch if it's for this user
      if (user && event.detail?.userId === user.$id) {
        console.log('🔄 Refetching user profile after update...');
        refetchProfile();
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, [user, refetchProfile]);

  const handleLogout = async () => {
    await logOut(account);
    router.push('/login');
  };

  if (isUserLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">{t.signIn}</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={photoURL || undefined} 
              alt={user.name || user.email || 'User'}
              onError={(e) => {
                console.error('❌ Failed to load avatar image:', photoURL);
                // Hide the image element on error so fallback shows
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log('✅ Avatar image loaded successfully');
              }}
            />
            <AvatarFallback>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className={`text-xs font-semibold tracking-wide ${isAdmin ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {(isAdmin ? t.admin || 'admin' : t.student || 'student')?.toLowerCase()}
            </p>
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">{t.settings}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          {t.logOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
