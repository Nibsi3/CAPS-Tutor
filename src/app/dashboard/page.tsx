'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCards } from "@/components/dashboard/StatCards";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { useDoc, useUser, useMemoAppwrite } from "@/appwrite";
import { appwriteConfig } from "@/appwrite/config";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAdminMode } from '@/hooks/use-admin-mode';


export default function DashboardPage() {
    const { user } = useUser();
    const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
    const { adminModeEnabled } = useAdminMode(isAdmin || false);
    const router = useRouter();
    const lang = useLanguage();
    const t = translations[lang] || translations.en; // Fallback to English if lang is invalid

    // Redirect admins to admin dashboard only when they're in admin mode
    useEffect(() => {
        if (!isAdminLoading && isAdmin && adminModeEnabled) {
            router.push('/admin');
        }
    }, [isAdmin, isAdminLoading, adminModeEnabled, router]);

    const userProfileRef = useMemoAppwrite(() => {
        if (!user) return null;
        return {
            databaseId: appwriteConfig.databaseId,
            collectionId: 'user',
            documentId: user.$id,
        };
    }, [user]);

    const { data: userProfile } = useDoc<{gradeLevel: number, subjects: string[]}>(userProfileRef);

    const hasCompletedSetup = !!(userProfile && userProfile.subjects && userProfile.subjects.length > 0);

  return (
    <div className="flex-1 h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-xl font-bold tracking-tight">{t.welcomeBack}, {user?.name?.split(' ')[0] || 'Student'}!</h1>
      </div>

      <StatCards hasActivity={hasCompletedSetup} />

      {hasCompletedSetup && userProfile.subjects && (
        <div>
            <h2 className="font-headline text-base font-bold">{t.yourSubjects}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
                {userProfile.subjects.map((subject: string) => (
                    <Button key={subject} variant="outline" size="sm" asChild className="h-8">
                        <Link href={`/dashboard/lessons`}>
                            <BookOpen className="mr-1 h-3 w-3" />
                            <span className="font-medium text-sm">{subject}</span>
                        </Link>
                    </Button>
                ))}
            </div>
        </div>
      )}
      
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
        <div className="lg:col-span-4 h-full min-h-0">
          <ProgressChart hasActivity={hasCompletedSetup} />
        </div>
        <div className="lg:col-span-3 h-full min-h-0">
          <RecentActivity hasActivity={hasCompletedSetup} />
        </div>
      </div>
    </div>
  )
}
